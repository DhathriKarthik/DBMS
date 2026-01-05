import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ setQuery, user }) {
  const [text, setText] = useState("");

  return (
    <div className="sidebar" style={{ padding: 16, borderRight: "1px solid #eee", width: 220 }}>
      <h3>Filters</h3>

      <button onClick={() => setQuery("")}>All Mobiles</button>
      <br />
      <button onClick={() => setQuery("available mobiles")}>Available</button>
      <br />
      <button onClick={() => setQuery("out of stock mobiles")}>Out of Stock</button>
      <br />
      <button onClick={() => setQuery("samsung mobiles")}>Samsung</button>
      <br />
      <button onClick={() => setQuery("apple mobiles")}>Apple</button>

      <div style={{ marginTop: 12 }}>
        <input value={text} onChange={e => setText(e.target.value)} style={{ width: "100%", padding: 6 }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setQuery(text || "")}>Search</button>
        </div>
      </div>

      {user && user.role === "admin" && (
        <div style={{ marginTop: 20 }}>
          <h4>Admin</h4>
          <Link to="/add-mobile">
            <button style={{ backgroundColor: "#388e3c" }}>Add Mobile</button>
          </Link>
        </div>
      )}
    </div>
  );
} 
