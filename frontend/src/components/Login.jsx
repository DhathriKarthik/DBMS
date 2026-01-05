import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await loginUser(username, password, role);
      setUser(user);
      navigate("/");
    } catch (err) {
      alert(err.message || "Invalid login");
    }
  };

  return (
    <div className="login-card">
      <div className="login-logo">📱 MobileStore</div>
      <h2 className="login-title">Welcome back</h2>
      <p className="login-sub">Sign in to manage or buy mobiles</p>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <div className="form-row" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: 'center' }}>
        <label style={{ minWidth: 40, textAlign: 'left' }}>Role</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} />
          <span>User</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
          <span>Admin</span>
        </label>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={handleLogin}>Login</button>
        {role === 'user' && (
          <button onClick={() => navigate('/signup')} style={{ background: '#4caf50' }}>Sign Up</button>
        )}
      </div>
    </div>
  );
}
