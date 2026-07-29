import { db } from "@/lib/db";

// Remaining budget is always calculated from order history, rather than
// stored as a separate number, so it can never drift out of sync.
export async function getRemainingBudget(user) {
  const result = await db.order.aggregate({
    where: { userId: user.id },
    _sum: { total: true },
  });

  const amountSpent = result._sum.total ?? 0;
  return user.budget - amountSpent;
}
