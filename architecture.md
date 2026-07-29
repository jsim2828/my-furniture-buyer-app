# Architecture

## Stack summary
| Layer | Choice | Why (short version) |
|---|---|---|
| Framework | Next.js (App Router) | One tool for both pages and behind-the-scenes logic |
| Database | SQLite | Just a file — nothing to install or run separately |
| Database access | Prisma | Describe data in plain terms; avoids hand-written DB code |
| Login/sessions | bcryptjs + iron-session | Password hashing + encrypted-cookie sessions. Swapped in for NextAuth once it turned out the version compatible with our Next.js release was still in beta — too unstable to build a hackathon project on |
| Styling | Tailwind CSS | Fast, clean styling without separate CSS files |
| Language | JavaScript | Simpler to read than TypeScript for this project |

Note: the Next.js version installed (16) turned out to be newer than typical
reference material, and Prisma (7) also shipped major changes (a required
"driver adapter" for SQLite, and a new CLI config file). Both are accounted
for below — mentioned here since it's a deviation from what's commonly
documented online.

## How a request flows
Mutations (sign up, log in, log out, place an order) use **Server Actions**
instead of separate API route files — a Next.js feature that lets a page's
`<form>` call a server-side function directly, without you having to write
and wire up a matching `/api/...` endpoint by hand. Less code, same result.

Sign up / log in / log out still work exactly as before, entirely against
the local SQLite database (via Prisma). But the catalogue, orders, and
budget are now backed by a **live external API** — the hackathon's
"Product Search API" — instead of local data:

```
Browser (user clicks "Place order")
   │  submits the <form> on src/app/products/page.js
   ▼
Server Action (src/lib/actions/orders.js: placeOrderAction)
   │  1. checks who's logged in (via the local session cookie)
   │  2. POSTs the cart to the shop API (src/lib/shopApi.js: placeOrder)
   ▼
Shop API (POST https://.../orders, authenticated with SHOP_API_KEY)
   │  computes the total, checks it against the account's live balance,
   │  and either saves the order or returns an error message
```

The shop API is the source of truth for prices, stock, order history, and
account balance — this app's own `Order`/`OrderItem`/`Product` tables (see
below) are no longer read from or written to by the live pages.

## Data model
Four tables (defined in `prisma/schema.prisma`). Only **User** is used by
the live app today — it backs this app's own login/session system, which
is separate from the shop API's own account. The other three tables
(`Product`, `Order`, `OrderItem`) are left over from the Day 1 scaffold and
are no longer read from or written to; they're harmless to leave in place,
but could be dropped in a later cleanup pass.

**User**
| field | type | notes |
|---|---|---|
| id | id | auto-generated |
| email | string | unique, used to log in |
| password | string | hashed, never stored as plain text |
| budget | number | total budget assigned to this user |

**Product**
| field | type | notes |
|---|---|---|
| id | id | auto-generated |
| name | string | |
| price | number | |
| category | string | |
| image | string | local path under `/public/products`, e.g. `/products/00368814.jpg` |

### Catalog data source
The catalogue page (`src/app/products/page.js`) now reads products live
from the hackathon's shop API (`src/lib/shopApi.js`), not from the local
database:
- `GET /catalogue/search-index` — name, category, and price for every item.
  This is the *fast* endpoint (no images), which is why it's used for
  browsing. There's also a slower plain `/catalogue/:id` endpoint that
  embeds a full base64 image per item — deliberately not used here.
- `GET /catalogue/categories` — the list of categories, used to populate
  the category filter dropdown.

The catalogue page paginates client-visible results 30 at a time and lets
the buyer filter by category (both via the `?category=` and `?page=`
URL query params), then renders quantity inputs for the current page's
items in `src/components/CatalogueCard.js`.

`prisma/seed.js` and the `MONGODB_URI` connection still exist from the Day 1
scaffold (a one-time bulk import of the same 762-item catalog into local
SQLite, including downloaded images under `public/products/`), but the live
pages no longer read from that local copy.

**Order**
| field | type | notes |
|---|---|---|
| id | id | auto-generated |
| userId | relation → User | who placed it |
| total | number | sum of item line totals at time of order |
| createdAt | datetime | auto-set |

**OrderItem** (join table — an order can contain many products)
| field | type | notes |
|---|---|---|
| id | id | auto-generated |
| orderId | relation → Order | |
| productId | relation → Product | |
| quantity | number | how many of that product |
| priceAtPurchase | number | price per unit, locked in at order time |

An Order doesn't store products directly, because one order can contain
several products, and a product can appear in many orders — `OrderItem` is
the table in between that links them, with a `quantity` per product.

## Budget check logic (in plain terms)
The buyer's remaining budget is now a live **account balance**, fetched
straight from the shop API (`GET /users/:user_id`, via
`src/lib/shopApi.js: getAccount`) — not calculated locally. The shop API is
also the one that checks a new order against that balance and rejects it
(with an error message we display) if it would go over. This app no longer
computes or stores a remaining-budget figure itself.

Note: the "Starting budget ($)" field on the sign-up form is still saved
to the local `User.budget` column, but nothing reads it anymore — the
number shown throughout the app is always the live balance from the shop
API's single shared account, regardless of which local user is logged in.

## Folder responsibilities
- `src/app/*/page.js` — what the user sees (one folder per page/URL).
- `src/lib/actions/` — Server Actions: the mutation logic forms submit to
  (register, login, logout, place an order).
- `src/lib/` — shared setup code: local database connection (`db.js`),
  session/auth helpers (`auth.js`), and the shop API client (`shopApi.js`)
  that talks to the live catalogue/orders/balance endpoints.
- `src/components/` — reusable UI pieces (Navbar, CatalogueCard, BudgetBar,
  CategoryFilter, and the client-side forms that need interactivity).
- `prisma/schema.prisma` — single source of truth for the database structure.
- `prisma/seed.js` — fills the catalogue with sample furniture products.

## Auth flow (plain English)
1. User submits the sign-up form → `registerAction` hashes their password
   (via bcryptjs) and saves a new User row.
2. User submits the login form → `loginAction` checks the email/password
   against the User table.
3. On success, an encrypted session cookie is set (via iron-session)
   containing just the user's id, so the user stays logged in across pages
   without re-entering credentials.
4. Any page or Server Action that needs to know "who is this?" calls
   `getCurrentUser()`, which reads the cookie and looks up the User row.
