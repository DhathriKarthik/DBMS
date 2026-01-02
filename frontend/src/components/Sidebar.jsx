import React from "react";

export default function Sidebar({ setQuery }) {
  return (
    <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc" }}>
      <h3>Filters</h3>

      <button onClick={() => setQuery("show all mobiles")}>All Mobiles</button>
      <br />
      <button onClick={() => setQuery("available mobiles")}>Available</button>
      <br />
      <button onClick={() => setQuery("out of stock mobiles")}>Out of Stock</button>
      <br />
      <button onClick={() => setQuery("samsung mobiles")}>Samsung</button>
      <br />
      <button onClick={() => setQuery("apple mobiles")}>Apple</button>
    </div>
  );
}
