// Plush Points: a loyalty currency layered on top of the live shop API.
// The shop API has no concept of points or partial payment, so points only
// ever pay for an order that they fully cover — that purchase is recorded
// locally (PointsOrder) instead of going through the real order API at all.
// Anything points don't fully cover goes through the real API at full
// price, untouched by points.

import { db } from "@/lib/db";

export const WHEEL_VALUES = [500, 600, 700, 800, 900, 1000];

export function spinWheel() {
  return WHEEL_VALUES[Math.floor(Math.random() * WHEEL_VALUES.length)];
}

export async function addPoints(userId, amount) {
  return db.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
  });
}

export async function deductPoints(userId, amount) {
  return db.user.update({
    where: { id: userId },
    data: { points: { decrement: amount } },
  });
}

// items: [{ item_id, name, quantity, unit_price }]
export async function recordPointsOrder(userId, items, totalPoints) {
  return db.pointsOrder.create({
    data: { userId, items: JSON.stringify(items), totalPoints },
  });
}

export async function getPointsOrders(userId) {
  const rows = await db.pointsOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({ ...row, items: JSON.parse(row.items) }));
}
