"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrderAction } from "@/lib/actions/orders";

const initialState = { error: null };

function BuyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-3 py-1.5 text-sm hover:bg-tangerine-400 disabled:opacity-50"
    >
      {pending ? "Buying..." : "Buy"}
    </button>
  );
}

export function CatalogueCard({ item }) {
  const [state, formAction] = useActionState(placeOrderAction, initialState);

  return (
    <div className="rounded-lg border border-chrome-600/30 bg-aubergine-800 overflow-hidden flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/product-image/${item.item_id}`}
        alt={item.product_name}
        loading="lazy"
        className="w-full h-40 object-cover bg-aubergine-900"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs uppercase tracking-wide text-marigold-400">
          {item.category}
        </span>
        <h3 className="font-medium text-oyster-100">{item.product_name}</h3>
        <p className="text-marigold-300">${item.price.toFixed(2)}</p>

        <form
          action={formAction}
          className="mt-auto flex items-center gap-2 text-sm text-oyster-400"
        >
          <label className="flex items-center gap-2">
            Qty
            <input
              type="number"
              name={`qty-${item.item_id}`}
              min="1"
              defaultValue="1"
              className="w-16 rounded-md border border-chrome-500/50 bg-aubergine-900 text-oyster-100 px-2 py-1 focus:outline-none focus:border-tangerine-400"
            />
          </label>
          <BuyButton />
        </form>

        {state?.error && (
          <p className="text-tangerine-400 text-xs">{state.error}</p>
        )}
      </div>
    </div>
  );
}
