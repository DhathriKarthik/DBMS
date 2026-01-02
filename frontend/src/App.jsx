import React, { useState } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import MobileList from "./components/MobileList";

export default function App() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar setQuery={setQuery} />

      {/* Main Content */}
      <div style={{ padding: "20px", flex: 1 }}>
        {!user ? (
          <Login setUser={setUser} />
        ) : (
          <MobileList query={query} user={user} />
        )}
      </div>
    </div>
  );
}
