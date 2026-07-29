"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrderAction } from "@/lib/actions/orders";
import { ProductCard } from "@/components/ProductCard";

const initialState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-4 py-2 hover:bg-tangerine-400 disabled:opacity-50"
    >
      {pending ? "Placing order..." : "Place order"}
    </button>
  );
}

export function OrderForm({ products }) {
  const [state, formAction] = useActionState(placeOrderAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p className="rounded-md bg-aubergine-800 border border-tangerine-600 text-oyster-100 px-4 py-2 text-sm">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
