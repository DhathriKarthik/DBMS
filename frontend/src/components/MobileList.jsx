import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMobilesByQuery, placeOrder, getAllMobiles, addStock, addToCart } from "../api";

export default function MobileList({ query, user, onCartChanged, refreshKey, onOrderPlaced }) {
  const navigate = useNavigate();
  const [mobiles, setMobiles] = useState([]);

  useEffect(() => {
    if (query) {
      getMobilesByQuery(query).then(setMobiles);
    } else {
      getAllMobiles().then(setMobiles);
    }
  }, [query, refreshKey]);

  const order = async (id) => {
    const res = await placeOrder(user.user_id, id);
    alert(res);
    // refresh
    const refreshed = query ? await getMobilesByQuery(query) : await getAllMobiles();
    setMobiles(refreshed);
    if (onOrderPlaced) onOrderPlaced();
  };

  const handleAddToCart = async (mobile) => {
    if (!user) return alert('Please login to add to cart');

    try {
      await addToCart(user.user_id, mobile.mobile_id, 1);
      // notify parent to refresh cart
      if (onCartChanged) onCartChanged();
      alert('Added to cart');
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  const handleAddStock = async (id) => {
    const val = prompt("Enter number of items to add:");
    const amt = parseInt(val, 10);
    if (Number.isNaN(amt) || amt <= 0) return alert("Invalid amount");

    try {
      await addStock(id, amt);
      const refreshed = query ? await getMobilesByQuery(query) : await getAllMobiles();
      setMobiles(refreshed);
      alert("Stock updated");
    } catch (err) {
      alert(err.message || "Failed to update stock");
    }
  };

  return (
    <div>
      <br></br>
      <h2>Mobiles</h2>
      <br></br>

      {mobiles.length === 0 && <p>No data</p>}

      {mobiles.map(m => (
        <div key={m.mobile_id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h4>{m.company} {m.model}</h4>
          <p>RAM: {m.ram}</p>
          <p>Storage: {m.storage}</p>
          <p>Price: ₹{m.price}</p>
          <p>Stock: {m.stock}</p>
          <p>Status: {m.stock === 0 ? 'Out of stock' : 'Available'}</p>
          {m.sold !== undefined && <p>Sold: {m.sold}</p>}

          {user && user.role === "admin" ? (
            <div>
              <button onClick={() => handleAddStock(m.mobile_id)}>Add Stock</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              {m.stock > 0 && (
                <button onClick={() => handleAddToCart(m)}>
                  Add to cart
                </button>
              )}
              <button disabled={m.stock === 0} onClick={() => order(m.mobile_id)}>
                {m.stock === 0 ? "Not Available" : "Buy"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
