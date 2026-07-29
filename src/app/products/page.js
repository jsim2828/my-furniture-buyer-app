import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRemainingBudget } from "@/lib/budget";
import { BudgetBar } from "@/components/BudgetBar";
import { OrderForm } from "@/components/OrderForm";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [products, remainingBudget] = await Promise.all([
    db.product.findMany({ orderBy: { category: "asc" } }),
    getRemainingBudget(user),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Catalogue</h1>
        <BudgetBar budget={user.budget} remaining={remainingBudget} />
      </div>

      <OrderForm products={products} />
    </div>
  );
}
