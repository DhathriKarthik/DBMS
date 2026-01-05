import React, { useState } from "react";
import { addMobile } from "../api";

export default function AddMobiles({ onAdded }) {
  const [form, setForm] = useState({
    company: "",
    model: "",
    ram: "",
    storage: "",
    price: "",
    stock: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [mergeExisting, setMergeExisting] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (!form.company || !form.model || form.price === "" || form.stock === "") {
      setMessage({ type: "error", text: "Please fill company, model, price and stock" });
      return;
    }

    const payload = {
      company: form.company,
      model: form.model,
      ram: form.ram || "",
      storage: form.storage || "",
      price: parseInt(form.price, 10) || 0,
      stock: parseInt(form.stock, 10) || 0,
      mergeExisting
    };

    setLoading(true);
    setMessage(null);
    try {
      const res = await addMobile(payload);
      if (res) {
        if (res.action === "merged") {
          setMessage({ type: "success", text: `Product existed. Stock updated from ${res.previous_stock} to ${res.new_stock}.` });
        } else if (res.action === "created") {
          setMessage({ type: "success", text: `New product added (id: ${res.mobile_id}).` });
        } else {
          setMessage({ type: "success", text: "Mobile added/updated successfully" });
        }

        setForm({ company: "", model: "", ram: "", storage: "", price: "", stock: "" });
        if (onAdded) onAdded();
      } else {
        setMessage({ type: "error", text: "Failed to add mobile" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Error adding mobile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="page-header">Add New Mobile</h2>

      {message && (
        <div style={{ marginBottom: 12, color: message.type === "success" ? "#2e7d32" : "#c62828" }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Company</label>
          <input name="company" value={form.company} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Model</label>
          <input name="model" value={form.model} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>RAM</label>
          <input name="ram" value={form.ram} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Storage</label>
          <input name="storage" value={form.storage} onChange={handleChange}/>
        </div>

        <div className="form-row">
          <label>Price (₹)</label>
          <input name="price" value={form.price} onChange={handleChange}/>
        </div>

        <div className="form-row">
          <label>Stock</label>
          <input name="stock" value={form.stock} onChange={handleChange}/>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Mobile"}</button>
        </div>
      </form>
    </div>
  );
} 
