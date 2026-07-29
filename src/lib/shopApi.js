// Client for the hackathon's "Product Search API" — the real backend for
// the catalogue, orders, and account balance (see SHOP_API_URL in .env).

const SHOP_API_URL = process.env.SHOP_API_URL;
const SHOP_API_KEY = process.env.SHOP_API_KEY;
const SHOP_API_USER_ID = process.env.SHOP_API_USER_ID;

function authHeaders() {
  return { "X-Api-Key": SHOP_API_KEY };
}

// Catalogue browsing is open (no API key needed).

export async function getCategories() {
  const res = await fetch(`${SHOP_API_URL}/catalogue/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

// The search-index endpoint is the fast one (name/category/price, no
// images) — the plain /catalogue/:id endpoint embeds base64 images and is
// much slower, so it's only used to look up a single item's image.
export async function searchCatalogue({ category } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const qs = params.toString();

  const res = await fetch(
    `${SHOP_API_URL}/catalogue/search-index${qs ? `?${qs}` : ""}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error("Failed to load catalogue");
  return res.json();
}

// Account balance and orders require the participant API key.

// Balance and order history are shown on every page (via the navbar), so a
// short cache avoids paying a live network round-trip on every navigation.
// placeOrderAction revalidates both paths immediately after an order, so
// the balance/history still update right away once you actually order.
export async function getAccount() {
  const res = await fetch(
    `${SHOP_API_URL}/users/${encodeURIComponent(SHOP_API_USER_ID)}`,
    { headers: authHeaders(), next: { revalidate: 5 } }
  );
  if (!res.ok) throw new Error("Failed to load account balance");
  return res.json();
}

export async function getOrderHistory() {
  const res = await fetch(
    `${SHOP_API_URL}/orders/${encodeURIComponent(SHOP_API_USER_ID)}`,
    { headers: authHeaders(), next: { revalidate: 5 } }
  );
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

// items: [{ item_id, quantity }]
export async function placeOrder(items) {
  const res = await fetch(`${SHOP_API_URL}/orders`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: SHOP_API_USER_ID, items }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
