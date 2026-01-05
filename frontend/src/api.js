// frontend/src/api.js

const BASE_URL = "http://localhost:5000";

/* ---------------- AUTH ---------------- */

export async function loginUser(username, password, role = "user") {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed (${res.status})`);
    }

    return res.json();
}

export async function signUpUser(username, password) {
    const res = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const err = await res.json();
            throw new Error(err.error || JSON.stringify(err));
        }
        const text = await res.text();
        throw new Error(text || res.statusText);
    }

    return res.json();
}

/* ---------------- ADMIN: STOCK ---------------- */
export async function addStock(mobileId, amount) {
    const res = await fetch(`${BASE_URL}/mobiles/${mobileId}/addStock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const err = await res.json();
            throw new Error(err.error || JSON.stringify(err));
        }
        const text = await res.text();
        throw new Error(text || res.statusText);
    }

    return res.json();
}

/* ---------------- CART ---------------- */
export async function addToCart(userId, mobileId) {
    const res = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, mobile_id: mobileId })
    });

    if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const err = await res.json();
            throw new Error(err.error || JSON.stringify(err));
        }
        const text = await res.text();
        throw new Error(text || res.statusText);
    }

    return res.json();
}

export async function getCart(userId) {
    const res = await fetch(`${BASE_URL}/cart?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to load cart");
    return res.json();
}

export async function removeCart(userId, mobileId) {
    const res = await fetch(`${BASE_URL}/cart?user_id=${userId}&mobile_id=${mobileId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete cart item');
    return res.json();
}

export async function clearCartForUser(userId) {
    const res = await fetch(`${BASE_URL}/cart/user/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear cart');
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

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
}

/* ---------------- ADMIN: ADD MOBILE ---------------- */
export async function addMobile(mobile) {
    const res = await fetch(`${BASE_URL}/mobiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mobile)
    });

    if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const err = await res.json();
            throw new Error(err.error || JSON.stringify(err));
        }
        const text = await res.text();
        throw new Error(text || res.statusText);
    }

    return res.json();
}
