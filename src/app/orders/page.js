import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAccount, getOrderHistory } from "@/lib/shopApi";
import { BudgetBar } from "@/components/BudgetBar";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, account] = await Promise.all([
    getOrderHistory(),
    getAccount(),
  ]);
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
        <BudgetBar balance={account.balance} />
      </div>

      {sortedOrders.length === 0 ? (
        <p className="text-oyster-400">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {sortedOrders.map((order) => (
            <li
              key={order.order_id}
              className="rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4"
            >
              <div className="flex justify-between text-sm text-oyster-400 mb-2">
                <span>{new Date(order.timestamp).toLocaleString()}</span>
                <span className="font-medium text-marigold-300">
                  Total: ${order.total_amount.toFixed(2)}
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-oyster-200">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/product-image/${item.product_id}`}
                      alt=""
                      loading="lazy"
                      className="w-12 h-12 rounded-md object-cover bg-aubergine-900 shrink-0"
                    />
                    <span className="flex-1">
                      {item.product_name || item.product_id} × {item.quantity}
                    </span>
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
