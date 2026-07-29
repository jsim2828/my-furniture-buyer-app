# Furniture Buyer App

## What this is
A web app built for Day 1 of a hackathon. It's a **buyer's app** for a furniture shop.

## Core features
1. **Login** — a user logs into an account.
2. **Product catalogue** — the user browses furniture products (with details like name, price, image, category).
3. **Orders against a budget** — the user places orders, and the app tracks spending against a budget they're given (e.g. warns or blocks them if an order would put them over budget).

## Who's building this
The user has **no coding background**. Claude Code is responsible for choosing the technology and writing all the code. Explanations should be given in plain English — assume no prior programming knowledge unless the user demonstrates otherwise over the course of the project.

## Status
Day 1: project scaffolded (Next.js + Tailwind + Prisma/SQLite + NextAuth).
See `requirements.md` for scope and `architecture.md` for the technical design.

## Note for Claude
See `AGENTS.md` — the installed Next.js version may differ from training data;
check `node_modules/next/dist/docs/` for anything unfamiliar before assuming
an API doesn't exist.
