import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  db.query(
    "SELECT * FROM USER WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (err) return res.status(500).send("DB error");
      if (result.length === 0)
        return res.status(401).send("Invalid login");

      const user = result[0];

      // If the users table contains a role column, respect it
      if (user.role) {
        if (role && role !== user.role) return res.status(403).send("Role mismatch");
        return res.json(user);
      }

      // Otherwise, fall back to simple heuristic: 'admin' username is admin
      const inferredRole = username === "admin" ? "admin" : "user";
      if (role && role !== inferredRole) return res.status(403).send("Role mismatch");

      user.role = inferredRole;
      res.json(user);
    }
  );
});

// SIGN UP - create a new user (role forced to 'user')
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  db.query("SELECT * FROM USER WHERE username=?", [username], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    if (existing && existing.length > 0) return res.status(409).json({ error: "Username already exists" });

    db.query("INSERT INTO USER (username,password,role) VALUES (?,?,?)", [username, password, 2], (iErr, iRes) => {
      if (iErr) return res.status(500).json({ error: iErr.message || String(iErr) });

      db.query("SELECT * FROM USER WHERE user_id=?", [iRes.insertId], (qErr, r) => {
        if (qErr) return res.status(500).json({ error: qErr.message || String(qErr) });
        res.json(r[0]);
      });
    });
  });
});

// Admin: add stock to an existing mobile
app.post("/mobiles/:id/addStock", (req, res) => {
  const mobileId = req.params.id;
  const { amount } = req.body;
  const amt = Number(amount);

  if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });

  db.query(
    "UPDATE MOBILE SET stock = stock + ? WHERE mobile_id = ?",
    [amt, mobileId],
    (err) => {
      if (err) return res.status(500).send(err);

      db.query("SELECT * FROM MOBILE WHERE mobile_id=?", [mobileId], (err2, r) => {
        if (err2) return res.status(500).send(err2);
        res.json({ action: "stock_updated", mobile: r[0] });
      });
    }
  );
});


/* NATURAL LANGUAGE QUERY FILTER */
app.post("/query", (req, res) => {
  const qRaw = (req.body.query || "").toLowerCase();
  let sql = "SELECT * FROM MOBILE WHERE 1=1";
  const params = [];

  // Availability
  if (qRaw.includes("available")) sql += " AND stock>0";
  if (qRaw.includes("out of stock")) sql += " AND stock=0";

  // Explicit company keywords (common examples)
  if (qRaw.includes("samsung")) { sql += " AND LOWER(company) LIKE ?"; params.push("%samsung%"); }
  if (qRaw.includes("apple")) { sql += " AND LOWER(company) LIKE ?"; params.push("%apple%"); }

  // Price queries like "under 20000"
  if (qRaw.includes("under")) {
    const price = qRaw.match(/\d+/);
    if (price) {
      sql += " AND price < ?";
      params.push(Number(price[0]));
    }
  }

  // RAM / storage matches
  if (/\b8\s?gb\b/.test(qRaw)) { sql += " AND LOWER(ram) LIKE ?"; params.push("%8gb%"); }
  if (/\b128\s?gb\b/.test(qRaw)) { sql += " AND LOWER(storage) LIKE ?"; params.push("%128gb%"); }

  // If asking for sold items explicitly, return sold counts per mobile (admin view)
  if (qRaw.includes("sold")) {
    const soldSql = `SELECT m.*, IFNULL(s.sold,0) AS sold FROM MOBILE m LEFT JOIN (SELECT mobile_id, COUNT(*) AS sold FROM ORDERS GROUP BY mobile_id) s ON m.mobile_id = s.mobile_id WHERE IFNULL(s.sold,0) > 0`;
    return db.query(soldSql, [], (err, result) => {
      if (err) return res.status(500).json({ error: "Query failed" });
      return res.json(result);
    });
  }

  // Generic token matching: match company/model/ram/storage for other words (e.g., "redmi")
  const stopWords = new Set(["show","all","mobile","mobiles","available","out","of","stock","under","and","or","with"]);
  const tokens = (qRaw.match(/[a-z0-9]+/g) || []).filter(t => !stopWords.has(t));

  tokens.forEach(token => {
    // skip pure numbers (already handled via 'under')
    if (/^\d+$/.test(token)) return;
    // skip tokens we've already explicitly handled
    if (["samsung","apple","available","out","stock","under"].includes(token)) return;

    sql += " AND (LOWER(company) LIKE ? OR LOWER(model) LIKE ? OR LOWER(ram) LIKE ? OR LOWER(storage) LIKE ?)";
    const pat = `%${token}%`;
    params.push(pat, pat, pat, pat);
  });

  // For debugging: console.log(sql, params);
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Query failed" });
    }
    res.json(result);
  });
});

/* PLACE ORDER */
app.post("/order",(req,res)=>{
  const { user_id, mobile_id } = req.body;

  db.query(
    "SELECT stock FROM MOBILE WHERE mobile_id=?",
    [mobile_id],
    (err,r)=>{
      if(r[0].stock===0) return res.send("Not available");

      db.query(
        "UPDATE MOBILE SET stock=stock-1 WHERE mobile_id=?",
        [mobile_id]
      );

      db.query(
        "INSERT INTO ORDERS(user_id,mobile_id,order_date) VALUES(?,?,CURDATE())",
        [user_id,mobile_id]
      );

      res.send("Order placed");
    }
  );
});

/* ADD MOBILE */
app.post("/mobiles", (req, res) => {
  console.log("POST /mobiles body:", req.body);
  const { company, model, ram = '', storage = '', price, stock, mergeExisting = true } = req.body;

  const priceNum = Number(price);
  const stockNum = Number(stock);

  if (!company || !model || Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
    return res.status(400).json({ error: "Missing or invalid fields (company, model, price, stock required and price/stock must be numbers)" });
  }

  // Check for existing product with same identifiers
  db.query(
    "SELECT mobile_id, stock, price FROM MOBILE WHERE company=? AND model=? AND ram=? AND storage=? LIMIT 1",
    [company, model, ram, storage],
    (err, result) => {
      if (err) {
        console.error("DB select error:", err);
        return res.status(500).json({ error: err.message || String(err) });
      }

      if (result && result.length > 0) {
        const existing = result[0];
        if (mergeExisting) {
          const newStock = Number(existing.stock) + stockNum;
          const newPrice = priceNum; // choose to overwrite with provided price

          db.query(
            "UPDATE MOBILE SET stock=?, price=? WHERE mobile_id=?",
            [newStock, newPrice, existing.mobile_id],
            (uErr) => {
              if (uErr) {
                console.error("DB update error:", uErr);
                return res.status(500).json({ error: uErr.message || String(uErr) });
              }

              return res.json({
                action: "merged",
                mobile_id: existing.mobile_id,
                previous_stock: Number(existing.stock),
                new_stock: newStock,
                price: newPrice
              });
            }
          );
          return;
        }
        // If not merging, insert a new record as a distinct item
      }

      // No existing product found or merge not requested -> insert new
      db.query(
        "INSERT INTO MOBILE (company, model, ram, storage, price, stock) VALUES (?,?,?,?,?,?)",
        [company, model, ram, storage, priceNum, stockNum],
        (iErr, iResult) => {
          if (iErr) {
            console.error("DB insert error:", iErr);
            return res.status(500).json({ error: iErr.message || String(iErr) });
          }

          return res.json({ action: "created", mobile_id: iResult.insertId, company, model, ram, storage, price: priceNum, stock: stockNum });
        }
      );
    }
  );
});

app.get("/mobiles", (req, res) => {
  db.query("SELECT * FROM MOBILE", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Admin: view all orders with user and mobile info
app.get("/orders", (req, res) => {
  const sql = `SELECT o.order_id, o.order_date, u.user_id, u.username, m.mobile_id, m.company, m.model, m.price
               FROM ORDERS o
               JOIN USER u ON o.user_id = u.user_id
               JOIN MOBILE m ON o.mobile_id = m.mobile_id
               ORDER BY o.order_date DESC`;
  db.query(sql, [], (err, result) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    res.json(result);
  });
});

/* ---------------- CART ---------------- */
// Add item to cart (no qty - table contains only user_id,mobile_id)
app.post("/cart", (req, res) => {
  const { user_id, mobile_id } = req.body;
  if (!user_id || !mobile_id) return res.status(400).json({ error: "user_id and mobile_id required" });

  // Check mobile exists
  db.query("SELECT * FROM MOBILE WHERE mobile_id=?", [mobile_id], (err, mres) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    if (!mres || mres.length === 0) return res.status(404).json({ error: "Mobile not found" });

    // Insert if not exists
    db.query("SELECT 1 FROM addToCart WHERE user_id=? AND mobile_id=? LIMIT 1", [user_id, mobile_id], (cerr, cres) => {
      if (cerr) return res.status(500).json({ error: cerr.message || String(cerr) });
      if (cres && cres.length > 0) {
        return res.json({ action: "exists" });
      }

      db.query("INSERT INTO addToCart (user_id,mobile_id) VALUES(?,?)", [user_id, mobile_id], (ierr) => {
        if (ierr) return res.status(500).json({ error: ierr.message || String(ierr) });
        return res.json({ action: "inserted" });
      });
    });
  });
});

// Get cart for a user with mobile details
app.get("/cart", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "user_id query param required" });

  const sql = `SELECT m.* FROM addToCart c JOIN MOBILE m ON c.mobile_id = m.mobile_id WHERE c.user_id = ?`;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    res.json(result);
  });
});

// NOTE: No qty update endpoint because addToCart holds only (user_id,mobile_id) pairs (no qty)

// Delete cart item by user & mobile
app.delete("/cart", (req, res) => {
  const userId = req.query.user_id || req.body.user_id;
  const mobileId = req.query.mobile_id || req.body.mobile_id;
  if (!userId || !mobileId) return res.status(400).json({ error: "user_id and mobile_id required" });

  db.query("DELETE FROM addToCart WHERE user_id=? AND mobile_id=?", [userId, mobileId], (err) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    res.json({ action: "deleted", user_id: userId, mobile_id: mobileId });
  });
});

// Clear cart for a user
app.delete("/cart/user/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM addToCart WHERE user_id=?", [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    res.json({ action: "cleared", user_id: userId });
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.listen(5000,()=>console.log("Backend running"));
