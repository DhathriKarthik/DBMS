import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeCart } from "../api";
import { getMobilesByQuery, placeOrder, getAllMobiles, addStock, addToCart } from "../api";

export default function CartPage({ user, onCheckout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const load = async () => {
    if (!user) return navigate('/login');
    try {
      const data = await getCart(user.user_id);
      setCart(data);
    } catch (err) {
      console.error(err);
      setCart([]);
    }
  };

  useEffect(() => { load(); }, [user]);

  const removeItem = async (mobileId) => {
    await removeCart(user.user_id, mobileId);
    await load();
  };

  const doCheckout = async () => {
    await onCheckout();
    await load();
  };

  const order = async (id) => {
      const res = await placeOrder(user.user_id, id);
      alert(res);
      // refresh
      removeItem(id);
      const refreshed = query ? await getMobilesByQuery(query) : await getAllMobiles();
      setMobiles(refreshed);
    };

  return (
    <div>
      <h2>My Cart</h2>

      {cart.length === 0 ? (
        <div>
          <p>Cart is empty.</p>
          <button onClick={() => navigate('/')}>Back to store</button>
        </div>
      ) : (
        <div>
          {cart.map(it => (
            <div key={it.mobile_id} className="mobile-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.company} {it.model} <span style={{ color: '#666', fontSize: 12 }}></span></div>
                <br></br>
                <div style={{ fontSize: 13, color: '#444' }}>RAM: {it.ram || '-'} | Storage: {it.storage || '-'} | Stock: {it.stock}</div>
                <div style={{ marginTop: 6 }}>Price: ₹{it.price}</div>
              </div>
              <div>
                <button onClick={() => removeItem(it.mobile_id)} style={{ background: '#e53935', marginRight: 8 }}>Remove</button>
                <button disabled={it.stock === 0} onClick={() => order(it.mobile_id)}>
                {it.stock === 0 ? "Not Available" : "Buy"}
              </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <div style={{ marginTop: 8 }}>
              <button onClick={doCheckout}>Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
