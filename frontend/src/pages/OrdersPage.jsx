import React, { useEffect, useState } from "react";

export default function OrdersPage({ refreshKey }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/orders")
      .then(r => r.json())
      .then(setOrders)
      .catch(err => console.error(err));
  }, [refreshKey]);

  return (
    <div>
      <h2>Orders</h2>
      <br></br>
      {orders.length === 0 && <p>No orders yet</p>}
      {orders.map(o => (
        <div key={o.order_id} className="mobile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{o.company} {o.model}</div>
              <div style={{ fontSize: 13 }}>Ordered by: {o.username}</div>
              <div style={{ fontSize: 13 }}>Date: {o.order_date}</div>
            </div>
            <div style={{ fontWeight: 700 }}>₹{o.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
