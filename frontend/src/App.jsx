import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TopBar from "./components/TopBar";
import MobileList from "./components/MobileList";
import AddMobilePage from "./pages/AddMobilePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import SignUp from "./components/SignUp";

export default function App() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const isLogin = window.location.pathname === "/login";

  const refreshCart = async (u = null) => {
    const userToUse = u || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user'))?.user_id) || (user && user.user_id);
    if (!userToUse) return;
    try {
      // use API helper so errors are handled consistently
      const { getCart } = await import('./api');
      const data = await getCart(userToUse);
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cart', err);
      setCart([]);
    }
  };

  const removeFromCart = async (mobileId) => {
    if (!user) return alert('Please login');
    try {
      const { removeCart } = await import('./api');
      await removeCart(user.user_id, mobileId);
      await refreshCart();
    } catch (err) {
      console.error(err);
      alert('Failed to remove from cart');
    }
  };

  const clearCart = () => setCart([]);

  const triggerRefresh = () => setRefreshKey(k => k + 1);

  const checkout = async () => {
    if (!user) return alert("Please login to checkout");
    try {
      // fetch current cart
      const res = await fetch(`http://localhost:5000/cart?user_id=${user.user_id}`);
      const current = await res.json();
      if (!current || current.length === 0) return alert('Cart is empty');

      for (const item of current) {
        // each cart row represents one unit in this simplified model
        const r = await fetch("http://localhost:5000/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id, mobile_id: item.mobile_id })
        });
        const txt = await r.text();
        if (txt.includes("Not available")) throw new Error(`Failed to order ${item.company} ${item.model}: Not available`);
      }

      // clear cart for user
      await fetch(`http://localhost:5000/cart/user/${user.user_id}`, { method: 'DELETE' });

      alert("Checkout complete");
      await refreshCart();
      triggerRefresh();
    } catch (err) {
      alert(err.message || "Checkout failed");
      await refreshCart();
      triggerRefresh();
    }
  };

  React.useEffect(() => {
    // Save user in local storage (simple persistence) and refresh cart when user logs in
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      refreshCart(user.user_id);
    } else {
      localStorage.removeItem('user');
      setCart([]);
    }
  }, [user]);

  return (
    <Router>
      <div>
        {!isLogin && (
          <TopBar setQuery={setQuery} user={user} onLogout={() => setUser(null)} cart={cart} removeFromCart={removeFromCart} onCheckout={checkout} />
        )}

        <div style={{ padding: "20px", paddingTop: isLogin ? 20 : 92 }}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<SignUp setUser={setUser} />} />

            <Route
              path="/"
              element={
                user ? (
                  <MobileList query={query} user={user} onCartChanged={() => refreshCart()} refreshKey={refreshKey} onOrderPlaced={() => triggerRefresh()} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/add-mobile"
              element={
                user ? (
                  user.role === "admin" ? (
                    <AddMobilePage onAdded={() => setQuery("")} />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route path="/cart" element={<CartPage user={user} onCheckout={checkout} />} />

            <Route
              path="/orders"
              element={
                user ? (
                  user.role === "admin" ? (
                    <OrdersPage refreshKey={refreshKey} />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
} 
