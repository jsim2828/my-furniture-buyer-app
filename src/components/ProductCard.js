export function ProductCard({ product }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs uppercase tracking-wide text-stone-500">
          {product.category}
        </span>
        <h3 className="font-medium text-stone-900">{product.name}</h3>
        <p className="text-stone-700">${product.price.toFixed(2)}</p>

        <label className="mt-auto flex items-center gap-2 text-sm text-stone-600">
          Quantity
          <input
            type="number"
            name={`qty-${product.id}`}
            min="0"
            defaultValue="0"
            className="w-16 rounded-md border border-stone-300 px-2 py-1"
          />
        </label>
      </div>
    </div>
  );
}
