import React from "react";
import { Link } from "react-router-dom";
import AddMobiles from "../components/AddMobiles";

export default function AddMobilePage({ onAdded }) {
  return (
    <div>
      <Link to="/" className="back-link">← Back to list</Link>
      <div className="center-wrap">
        <AddMobiles onAdded={onAdded} />
      </div>
    </div>
  );
}
