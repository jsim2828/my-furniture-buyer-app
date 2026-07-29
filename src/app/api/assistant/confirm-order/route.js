// The only place that actually executes a purchase proposed by the
// assistant — called when the user clicks the Confirm button in the chat
// UI, never by the model itself (see src/lib/assistant.js: place_order
// only stages a proposal).

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { placeOrder } from "@/lib/shopApi";
import { describeOrderFailure, ensureSignoff } from "@/lib/assistant";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { items } = await request.json();
  if (!Array.isArray(items) || items.length === 0) {
    return new Response("Missing items", { status: 400 });
  }

  const { ok, status, data } = await placeOrder(
    items.map(({ item_id, quantity }) => ({ item_id, quantity }))
  );

  if (!ok) {
    return Response.json({
      ok: false,
      message: describeOrderFailure(status, data.detail),
    });
  }

  revalidatePath("/orders");
  revalidatePath("/products");

  return Response.json({
    ok: true,
    message: ensureSignoff(
      `Order placed! Total $${data.total_price.toFixed(2)}, remaining balance $${data.remaining_balance.toFixed(2)}.`
    ),
  });
}
