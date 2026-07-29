# Requirements

## Overview
A web app for a furniture shop buyer. A user logs in, browses a catalogue of
furniture products, places orders against a live account balance, and can
ask an AI shopping assistant for recommendations. Built on Day 1 of a
hackathon, so scope is intentionally small.

## User roles
- **Buyer** — the only role for Day 1. No admin/staff role yet (see Out of
  scope).

## Functional requirements

### Account & login
- A visitor can create an account (email + password).
- A user can log in and log out.
- A logged-in user stays logged in across page visits (session).
- Login/sessions are local to this app (Prisma/SQLite) and separate from the
  shop API's own account below.

### Product catalogue
- A logged-in user can view furniture products, sourced live from the
  hackathon's shop API (not a local copy).
- Each product shows: name, image, price, category.
- Catalogue browsing uses the API's fast `search-index` endpoint (no
  per-item network cost); a separate, slower per-item endpoint is used only
  to fetch one product's image on demand.
- Results are paginated at 30 items per page (Prev/Next).
- A user can filter the catalogue by an exact category, chosen from a
  dropdown populated from the API's own category list.
- The catalogue endpoint only supports exact-category filtering — there is
  no server-side price, colour, or free-text search.
- Results are personalized using order history: within whatever's currently
  displayed, items in a category the buyer has purchased from before are
  ranked first, ordered by how close their price is to what was actually
  paid for that past purchase (e.g. bought a $100 table before → tables
  near $100 float to the top). Categories with no purchase history keep
  their original order at the end. This re-ranks before pagination, so
  relevant items land on page 1, not buried further in.

### Orders & budget
- The "budget" is a **live account balance** fetched from the shop API, not
  a locally stored number — it's shown in the navbar and on the
  catalogue/orders pages.
- Each catalogue card has its own quantity field and **Buy** button right
  next to it, so a user can buy that one item immediately without scrolling
  to a page-level checkout button. This submits directly to the shop API,
  which checks the order total against the live balance and either accepts
  or rejects it (with an
  error message shown to the user).
- A user can view their order history, fetched live from the shop API.
- The local database's `Product`/`Order`/`OrderItem` tables and the
  sign-up "starting budget" field are left over from the original local
  design and are no longer read from or written to.
- Any successful purchase — from a catalogue Buy button or the assistant's
  Confirm & buy — triggers a single bright full-screen flash (a one-off
  pulse, not a repeated strobe), like winning a prize.

### AI shopping assistant
- A logged-in user can type a plain-English request into a chat box (the
  `/assistant` page) and get a response from an AI agent.
- The agent has four tools, mirroring the shop API's own actions:
  - **search_catalogue** — browse/filter by exact category only; no native
    price/colour/free-text search.
  - **get_product_details** — full detail (incl. dimensions/colours) for
    one known item; much slower per call, so used for a single item, not
    for searching.
  - **check_balance** — the live account balance.
  - **place_order** — stages a proposed order (items, quantities, resolved
    prices, total) for the user to confirm; it does not execute a purchase
    itself.
- For requests the API can't natively answer (e.g. "cheap", a colour), the
  agent fetches the plain results itself and applies that judgement, rather
  than expecting the API to filter for it.
- Before any real purchase, the app shows the user exactly what's about to
  be bought and for how much, with a **Confirm & buy** button (and a
  cheeky "YOLO be comfy, be lucky" line next to it) and a **Cancel**
  option. The purchase only actually happens when the user clicks Confirm
  — a dedicated endpoint the model itself cannot call — not as a side
  effect of the model deciding to. The chat input is disabled until the
  pending order is confirmed or cancelled.
- Every assistant reply ends with the sign-off "Very comfy."
- The chat has no memory across page reloads (conversation only persists in
  the browser tab while it's open).
- Order failures are explained in plain language with a concrete suggestion,
  never as a raw API error: an item that can't be found suggests searching
  again; an order that exceeds the balance says how much is available vs.
  needed, suggests a smaller quantity or cheaper item, and always adds the
  callout "Front up buddy, this ain't a charity." These messages are
  generated deterministically (not left to the model), so the exact wording
  is reliable.

### About us
- A public "About us" page (no login required), linked from the navbar for
  both logged-in and logged-out visitors.
- States that all furniture has featured at the Milan International
  Furniture Show, and that only the finest and rarest materials are used.

## Non-functional requirements
- **Simple to build and demo** — working end-to-end beats feature-complete.
- **Passwords are never stored in plain text** — always hashed.
- **Reasonably fast** for page loads (well under a second on a laptop,
  helped by caching live-API responses briefly). The AI assistant is the
  exception: replies can take 5–15+ seconds, since they may involve one or
  more live tool calls plus a reasoning-model round trip — the chat UI
  shows a visible "thinking" indicator to set that expectation.
- Secrets (shop API key, Azure OpenAI key, session secret, etc.) live in
  `.env`, which is gitignored; `.env.example` documents the required
  variables without real values.

## Out of scope (Day 1)
- Admin/staff accounts or inventory management.
- Cancelling or refunding an order (no such endpoint is known to exist).
- Multiple currencies.
- Email verification or password reset.
- Product reviews, wishlists, or non-AI-driven recommendations.
- Mobile app (responsive web only).

## Success criteria for Day 1 demo
1. A new user can sign up and log in.
2. The catalogue shows real furniture products live from the shop API, with
   working pagination and category filtering.
3. A user can place an order that fits their live balance → it succeeds.
4. A user can attempt an order that exceeds their balance → it's blocked
   with a clear message from the shop API.
5. The account balance shown in the app always matches the shop API's own
   number.
6. A user can ask the AI assistant for a recommendation (including fuzzy
   asks like "cheap" or a colour) and get a grounded, real-product answer,
   signed off with "Very comfy."
7. When the assistant proposes an order, no purchase happens until the user
   clicks Confirm — the proposal alone never spends any balance.
8. An order that's rejected (insufficient balance or item not found) shows a
   plain-language explanation and a suggestion, not a raw error.
9. Anyone (logged in or not) can view the About us page from the navbar.
