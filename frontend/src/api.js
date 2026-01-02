// frontend/src/api.js

const BASE_URL = "http://localhost:5000";

/* ---------------- AUTH ---------------- */

export async function loginUser(username, password) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    return res.json();
}

/* ---------------- MOBILES ---------------- */

// Get all mobiles
export async function getAllMobiles() {
    const res = await fetch(`${BASE_URL}/mobiles`);
    return res.json();
}

// Get mobiles using natural language query
export async function getMobilesByQuery(query) {
    const res = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    return res.json();
}

/* ---------------- ORDERS ---------------- */

export async function placeOrder(userId, mobileId) {
    const res = await fetch(`${BASE_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, mobile_id: mobileId })
    });

    return res.json();
}
