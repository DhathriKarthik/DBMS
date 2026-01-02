import React, { useEffect, useState } from "react";
import { getMobilesByQuery, placeOrder } from "../api";

export default function MobileList({ query, user }) {
  const [mobiles, setMobiles] = useState([]);

  useEffect(() => {
    if (query) {
      getMobilesByQuery(query).then(setMobiles);
    }
  }, [query]);

  const order = async (id) => {
    const res = await placeOrder(user.user_id, id);
    alert(res);
  };

  return (
    <div>
      <h2>Mobiles</h2>

      {mobiles.length === 0 && <p>No data</p>}

      {mobiles.map(m => (
        <div key={m.mobile_id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h4>{m.company} {m.model}</h4>
          <p>RAM: {m.ram}</p>
          <p>Storage: {m.storage}</p>
          <p>Price: ₹{m.price}</p>
          <p>Stock: {m.stock}</p>
          <button disabled={m.stock === 0} onClick={() => order(m.mobile_id)}>
            {m.stock === 0 ? "Not Available" : "Buy"}
          </button>
        </div>
      ))}
    </div>
  );
}
