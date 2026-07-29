export function BudgetBar({ balance, points }) {
  const isLow = balance < 100;

  return (
    <div className="rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4 flex justify-between items-center text-sm">
      <div>
        <span className="text-oyster-400">Account balance</span>{" "}
        <span
          className={`text-lg font-medium ${
            isLow ? "text-tangerine-400" : "text-marigold-300"
          }`}
        >
          ${balance.toFixed(2)}
        </span>
      </div>
      {typeof points === "number" && (
        <div>
          <span className="text-oyster-400">Plush Points</span>{" "}
          <span className="text-lg font-medium text-marigold-300">
            {points.toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
}
