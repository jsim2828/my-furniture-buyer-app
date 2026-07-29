# Lucky Sofa 88

## What this is
A web app built for Day 1 of a hackathon. It's a **buyer's app** for a furniture shop, branded "Lucky Sofa 88".

## Theme
1971 Palm Springs glamour — chrome, smoked glass, curved modular seating.
Warm, dim, lamplit; a room at 11pm, not a showroom at noon. Palette: deep
aubergine base, burnt marigold and hot tangerine for warmth, chrome silver
for hardware, soft oyster cream for text/breathing room. Defined as custom
Tailwind color tokens in `src/app/globals.css` (`aubergine-*`, `marigold-*`,
`tangerine-*`, `chrome-*`, `oyster-*`) — reuse these rather than introducing
new colors.

## Core features
1. **Login** — a user logs into an account.
2. **Product catalogue** — the user browses furniture products (with details like name, price, image, category).
3. **Orders against a budget** — the user places orders, and the app tracks spending against a budget they're given (e.g. warns or blocks them if an order would put them over budget).

## Who's building this
The user has **no coding background**. Claude Code is responsible for choosing the technology and writing all the code. Explanations should be given in plain English — assume no prior programming knowledge unless the user demonstrates otherwise over the course of the project.

## Status
Day 1: project scaffolded (Next.js + Tailwind + Prisma/SQLite + bcryptjs/iron-session for auth).
Login/sessions are still local (Prisma/SQLite). The catalogue, orders, and
budget/balance are now live against the hackathon's "Product Search API"
(see `SHOP_API_URL` in `.env` and `architecture.md`) rather than local data.
See `requirements.md` for scope and `architecture.md` for the technical design.

## Note for Claude
See `AGENTS.md` — the installed Next.js version may differ from training data;
check `node_modules/next/dist/docs/` for anything unfamiliar before assuming
an API doesn't exist.

**Always update `requirements.md` after every change** — after implementing
a feature, fix, or scope change, update `requirements.md` in the same turn
so it stays an accurate description of what the app actually does. Don't
wait to be asked separately.
