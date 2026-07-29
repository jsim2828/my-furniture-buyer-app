export function BudgetBar({ budget, remaining }) {
  const spent = budget - remaining;
  const percentSpent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isLow = remaining < budget * 0.1;

  return (
    <div className="rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-oyster-400">
          Spent ${spent.toFixed(2)} of ${budget.toFixed(2)}
        </span>
        <span className={isLow ? "text-tangerine-400 font-medium" : "text-marigold-300 font-medium"}>
          ${remaining.toFixed(2)} remaining
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-aubergine-900 overflow-hidden">
        <div
          className={`h-full rounded-full ${isLow ? "bg-tangerine-500" : "bg-marigold-500"}`}
          style={{ width: `${percentSpent}%` }}
        />
      </div>
    </div>
  );
}
