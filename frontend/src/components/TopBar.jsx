import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TopBar({ setQuery, user, onLogout, cart = [], removeFromCart = () => {}, onCheckout = () => {} }) {
  const [text, setText] = useState("");
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const doSearch = () => setQuery(text.trim());
  const quick = (q) => setQuery(q);

  // close cart when clicking outside
  React.useEffect(() => {
    const h = () => setShowCart(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo" onClick={() => navigate('/')}>QuickMobile</div>
        <div className="filters">
          <button onClick={() => quick("")}>All</button>
          <button onClick={() => quick("available mobiles")}>Available</button>
          {user && user.role === "admin" && (
            <button onClick={() => quick("out of stock mobiles")}>Out of Stock</button>
          )}
        </div>
      </div>

      <div className="topbar-center">
        <input
          className="top-search"
          placeholder='Search (e.g. "8gb", "under 20000")'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
        />
        <button onClick={doSearch}>Search</button>
      </div>

      <div className="topbar-right">
        {user && user.role === "admin" && (
          <>
            <Link to="/add-mobile"><button className="secondary">Add Mobile</button></Link>
            <Link to="/orders"><button className="secondary">Orders</button></Link>
            <button onClick={() => quick("sold")} className="secondary">Sold</button>
          </>
        )}

        {user && user.role !== "admin" && (
          <div className="cart-wrap">
              <button className="secondary" onClick={() => navigate('/cart')}>My Cart</button>
          </div>
        )}
        {user ? (
          <button onClick={() => { onLogout(); navigate('/login'); }} className="danger">Logout</button>
        ) : (
          <button onClick={() => navigate('/login')} className="secondary">Login</button>
        )}
      </div>
    </div>
  );
}
