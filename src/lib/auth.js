import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const sessionOptions = {
  cookieName: "furniture_buyer_session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// A session just stores which user id is logged in.
export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}

export async function hashPassword(plainTextPassword) {
  return bcrypt.hash(plainTextPassword, 10);
}

export async function verifyPassword(plainTextPassword, hashedPassword) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

// Looks up the currently logged-in user from the session cookie.
// Returns null if nobody is logged in.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;

  return db.user.findUnique({ where: { id: session.userId } });
}
