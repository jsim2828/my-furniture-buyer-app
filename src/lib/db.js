import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Reused across hot reloads in development so we don't open a new
// database connection on every file save.
const globalForPrisma = globalThis;

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
