"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function registerAction(prevState, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const budget = Number(formData.get("budget"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "Budget must be a positive number." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const user = await db.user.create({
    data: { email, password: await hashPassword(password), budget },
  });

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  redirect("/products");
}

export async function loginAction(prevState, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Incorrect email or password." };
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  redirect("/products");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
