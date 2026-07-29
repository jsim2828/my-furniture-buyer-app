export function BudgetBar({ budget, remaining }) {
  const spent = budget - remaining;
  const percentSpent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isLow = remaining < budget * 0.1;

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-stone-600">
          Spent ${spent.toFixed(2)} of ${budget.toFixed(2)}
        </span>
        <span className={isLow ? "text-red-600 font-medium" : "text-stone-900 font-medium"}>
          ${remaining.toFixed(2)} remaining
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-stone-900"}`}
          style={{ width: `${percentSpent}%` }}
        />
      </div>
    </div>
  );
}
