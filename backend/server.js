import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM USER WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (err) return res.status(500).send("DB error");
      if (result.length === 0)
        return res.status(401).send("Invalid login");

      res.json(result[0]);
    }
  );
});


/* NATURAL LANGUAGE QUERY FILTER */
app.post("/query", (req,res)=>{
  const q = req.body.query.toLowerCase();
  let sql = "SELECT * FROM MOBILE WHERE 1=1";

  if(q.includes("available")) sql += " AND stock>0";
  if(q.includes("out of stock")) sql += " AND stock=0";
  if(q.includes("samsung")) sql += " AND company='Samsung'";
  if(q.includes("apple")) sql += " AND company='Apple'";
  if(q.includes("under")){
    const price = q.match(/\d+/);
    if(price) sql += ` AND price < ${price[0]}`;
  }
  if(q.includes("8gb")) sql += " AND ram='8GB'";
  if(q.includes("128gb")) sql += " AND storage='128GB'";

  db.query(sql,(err,result)=> res.json(result));
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

app.get("/mobiles", (req, res) => {
  db.query("SELECT * FROM MOBILE", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.listen(5000,()=>console.log("Backend running"));
