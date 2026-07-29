# Requirements

## Overview
A web app for a furniture shop buyer. A user logs in, browses a catalogue of
furniture products, and places orders — the app keeps track of their budget
and stops them from overspending. Built on Day 1 of a hackathon, so scope is
intentionally small.

## User roles
- **Buyer** — the only role for Day 1. No admin/staff role yet (see Out of
  scope).

## Functional requirements

### Account & login
- A visitor can create an account (email + password).
- A user can log in and log out.
- Each account has a **budget** — a set amount of money they're allowed to
  spend.
- A logged-in user stays logged in across page visits (session).

### Product catalogue
- A logged-in user can view a list of furniture products.
- Each product shows: name, image, price, category.
- (Stretch, not required Day 1) Filter/search by category or price.

### Orders & budget
- A user can select one or more products and place an order.
- Before the order is placed, the app checks: does `order total <= remaining
  budget`?
  - If yes → order is saved, and the user's remaining budget goes down by the
    order total.
  - If no → order is rejected with a clear message (e.g. "This order exceeds
    your remaining budget by $X").
- A user can view their past orders and current remaining budget.

## Non-functional requirements
- **Simple to build and demo** — working end-to-end beats feature-complete.
- **Runs locally with no external services to configure** — no cloud
  database, no paid APIs, so setup takes minutes, not hours.
- **Passwords are never stored in plain text** — always hashed.
- **Reasonably fast** — pages load in well under a second on a laptop; this
  is a small demo app, not a production system under load.

## Out of scope (Day 1)
- Admin/staff accounts or inventory management.
- Payments/checkout integration (orders are recorded, not actually paid for).
- Multiple currencies.
- Email verification or password reset.
- Product reviews, wishlists, or recommendations.
- Mobile app (responsive web only).

## Success criteria for Day 1 demo
1. A new user can sign up and log in.
2. The catalogue shows real (seeded) sample products.
3. A user can place an order that fits their budget → it succeeds.
4. A user can attempt an order that exceeds their budget → it's blocked with
   a clear message.
5. Remaining budget updates correctly and persists after logging out and back
   in.
