import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRemainingBudget } from "@/lib/budget";
import { BudgetBar } from "@/components/BudgetBar";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, remainingBudget] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    getRemainingBudget(user),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
        <BudgetBar budget={user.budget} remaining={remainingBudget} />
      </div>

      {orders.length === 0 ? (
        <p className="text-stone-600">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex justify-between text-sm text-stone-500 mb-2">
                <span>{new Date(order.createdAt).toLocaleString()}</span>
                <span className="font-medium text-stone-900">
                  Total: ${order.total.toFixed(2)}
                </span>
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
