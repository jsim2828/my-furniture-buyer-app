import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAccount, getOrderHistory } from "@/lib/shopApi";
import { getPointsOrders } from "@/lib/loyalty";
import { BudgetBar } from "@/components/BudgetBar";
import { OrdersPurchaseCelebration } from "@/components/OrdersPurchaseCelebration";

export default async function OrdersPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const pointsAwarded =
    params.purchased === "1" && params.points
      ? parseInt(params.points, 10)
      : null;

  const [orders, account, pointsOrders] = await Promise.all([
    getOrderHistory(),
    getAccount(),
    getPointsOrders(user.id),
  ]);

  const combinedOrders = [
    ...orders.map((order) => ({
      key: order.order_id,
      timestamp: order.timestamp,
      totalLabel: `$${order.total_amount.toFixed(2)}`,
      paidWithPoints: false,
      items: order.items.map((item) => ({
        id: item.product_id,
        name: item.product_name || item.product_id,
        quantity: item.quantity,
      })),
    })),
    ...pointsOrders.map((order) => ({
      key: `points-${order.id}`,
      timestamp: order.createdAt,
      totalLabel: `${order.totalPoints.toFixed(0)} Plush Points`,
      paidWithPoints: true,
      items: order.items.map((item) => ({
        id: item.item_id,
        name: item.name,
        quantity: item.quantity,
      })),
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="flex flex-col gap-6">
      <OrdersPurchaseCelebration pointsAwarded={pointsAwarded} />
      <div>
        <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
        <BudgetBar balance={account.balance} points={user.points} />
      </div>

      {combinedOrders.length === 0 ? (
        <p className="text-oyster-400">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {combinedOrders.map((order) => (
            <li
              key={order.key}
              className="rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4"
            >
              <div className="flex justify-between text-sm text-oyster-400 mb-2">
                <span>{new Date(order.timestamp).toLocaleString()}</span>
                <span className="flex items-center gap-2">
                  {order.paidWithPoints && (
                    <span className="text-xs uppercase tracking-wide text-marigold-400 border border-marigold-500/50 rounded px-1.5 py-0.5">
                      Plush Points
                    </span>
                  )}
                  <span className="font-medium text-marigold-300">
                    Total: {order.totalLabel}
                  </span>
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-oyster-200">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/product-image/${item.id}`}
                      alt=""
                      loading="lazy"
                      className="w-12 h-12 rounded-md object-cover bg-aubergine-900 shrink-0"
                    />
                    <span className="flex-1">
                      {item.name} × {item.quantity}
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
