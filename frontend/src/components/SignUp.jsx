import React, { useState } from "react";
import { signUpUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function SignUp({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e && e.preventDefault();
    setMessage(null);
    if (!username || !password) {
      setMessage({ type: 'error', text: 'Please provide username and password' });
      return;
    }
    setLoading(true);
    try {
      const user = await signUpUser(username, password);
      // Auto-login user after signup
      if (setUser) setUser(user);
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-logo">📱 MobileStore</div>
      <h2 className="login-title">Create an account</h2>
      <p className="login-sub">Sign up as a user to start buying</p>

      {message && (
        <div style={{ color: message.type === 'error' ? '#c62828' : '#2e7d32', marginBottom: 8 }}>{message.text}</div>
      )}

      <form onSubmit={handleSignUp}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate('/login')} className="back-link" style={{ background: 'transparent', color: '#1e88e5', border: 'none', padding: 0 }}>← Back to Login</button>
      </div>
    </div>
  );
}
