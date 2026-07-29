export function BudgetBar({ balance }) {
  const isLow = balance < 100;

  return (
    <div className="rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-oyster-400">Account balance</span>
        <span
          className={`text-lg font-medium ${
            isLow ? "text-tangerine-400" : "text-marigold-300"
          }`}
        >
          ${balance.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
