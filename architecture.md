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

```
Browser (user clicks "Place order")
   │  submits the <form> on src/app/products/page.js
   ▼
Server Action (src/lib/actions/orders.js: placeOrderAction)
   │  1. checks who's logged in (via the session cookie)
   │  2. looks up their remaining budget (via Prisma)
   │  3. compares order total vs. budget
   │  4. saves the order (via Prisma) OR returns an error message
   ▼
SQLite database file (dev.db)
```

## Data model
Four tables (defined in `prisma/schema.prisma`):

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
Products are real furniture data (762 items) imported from a shared MongoDB
database provided for the hackathon, rather than hand-written placeholders.
`prisma/seed.js` connects using the `MONGODB_URI` environment variable
(kept out of source control, in `.env`), reads the `catalog` collection, and
for each item:
- maps `product_name` → `name`, `price` → `price`, `category` → `category`
- decodes the embedded base64 image data to a real `.jpg` file under
  `public/products/` and stores that file's path as `image`

Images are written to disk rather than kept as base64 in the database so
product listing pages stay small and fast — the database only stores a short
path string, and the browser loads each image as a normal cached file
instead of a large inline blob.

Re-run `node prisma/seed.js` any time to refresh the catalog from the source
database (this replaces all existing products).

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
1. User is logged in → we know their `budget`.
2. We look at all their past orders → sum up the totals → that's
   `amountSpent`.
3. `remainingBudget = budget - amountSpent`.
4. New order is allowed only if `newOrderTotal <= remainingBudget`.

This is recalculated from order history each time (`src/lib/budget.js`),
rather than storing a separate "remaining budget" number — that way it can
never drift out of sync with reality.

## Folder responsibilities
- `src/app/*/page.js` — what the user sees (one folder per page/URL).
- `src/lib/actions/` — Server Actions: the mutation logic forms submit to
  (register, login, logout, place an order).
- `src/lib/` — shared setup code: database connection (`db.js`), session/auth
  helpers (`auth.js`), budget math (`budget.js`).
- `src/components/` — reusable UI pieces (Navbar, ProductCard, BudgetBar,
  and the client-side forms that need interactivity).
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
