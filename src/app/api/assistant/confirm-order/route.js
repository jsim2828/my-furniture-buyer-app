// The only place that actually executes a purchase proposed by the
// assistant — called when the user clicks the Confirm button in the chat
// UI, never by the model itself (see src/lib/assistant.js: place_order
// only stages a proposal).

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, placeOrder } from "@/lib/shopApi";
import { describeOrderFailure, ensureSignoff } from "@/lib/assistant";
import {
  addPoints,
  deductPoints,
  recordPointsOrder,
  spinWheel,
} from "@/lib/loyalty";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { items: requested } = await request.json();
  if (!Array.isArray(requested) || requested.length === 0) {
    return new Response("Missing items", { status: 400 });
  }

  // Resolve authoritative name/price for each item (never trust the client).
  const resolved = [];
  for (const { item_id, quantity } of requested) {
    const product = await getProduct(item_id);
    if (!product) {
      return Response.json({
        ok: false,
        message: ensureSignoff(
          "One of those items could not be found — try asking me to search again."
        ),
      });
    }
    resolved.push({
      item_id,
      name: product.product_name,
      quantity,
      unit_price: product.price,
    });
  }
  const orderTotal = resolved.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  let confirmationText;

  // Points only ever pay for an order they fully cover — the shop API has
  // no concept of partial payment, so a points/balance split isn't possible.
  if (user.points >= orderTotal) {
    await deductPoints(user.id, orderTotal);
    await recordPointsOrder(user.id, resolved, orderTotal);
    confirmationText = `Order placed using ${orderTotal.toFixed(0)} Plush Points!`;
  } else {
    const { ok, status, data } = await placeOrder(
      resolved.map(({ item_id, quantity }) => ({ item_id, quantity }))
    );
    if (!ok) {
      return Response.json({
        ok: false,
        message: describeOrderFailure(status, data.detail),
      });
    }
    confirmationText = `Order placed! Total $${data.total_price.toFixed(2)}, remaining balance $${data.remaining_balance.toFixed(2)}.`;
  }

  const pointsAwarded = spinWheel();
  await addPoints(user.id, pointsAwarded);

  revalidatePath("/orders");
  revalidatePath("/products");

  return Response.json({
    ok: true,
    message: ensureSignoff(
      `${confirmationText} You earned ${pointsAwarded} Plush Points!`
    ),
    pointsAwarded,
  });
}
