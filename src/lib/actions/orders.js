"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, placeOrder } from "@/lib/shopApi";
import {
  addPoints,
  deductPoints,
  recordPointsOrder,
  spinWheel,
} from "@/lib/loyalty";

export async function placeOrderAction(prevState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Form fields are named "qty-<item_id>". Only keep ones the buyer
  // actually entered a quantity for.
  const requested = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty-")) continue;
    const quantity = parseInt(value, 10);
    if (Number.isFinite(quantity) && quantity > 0) {
      requested.push({ item_id: key.replace("qty-", ""), quantity });
    }
  }

  if (requested.length === 0) {
    return { error: "Choose a quantity for at least one product." };
  }

  // Resolve authoritative name/price for each item (never trust the form).
  const resolved = [];
  for (const { item_id, quantity } of requested) {
    const product = await getProduct(item_id);
    if (!product) {
      return { error: "One of those items could not be found." };
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

  // Points only ever pay for an order they fully cover — the shop API has
  // no concept of partial payment, so a points/balance split isn't possible.
  if (user.points >= orderTotal) {
    await deductPoints(user.id, orderTotal);
    await recordPointsOrder(user.id, resolved, orderTotal);
  } else {
    const { ok, data } = await placeOrder(
      resolved.map(({ item_id, quantity }) => ({ item_id, quantity }))
    );
    if (!ok) {
      return { error: data.detail || "Order failed." };
    }
  }

  const pointsAwarded = spinWheel();
  await addPoints(user.id, pointsAwarded);

  revalidatePath("/orders");
  revalidatePath("/products");
  redirect(`/orders?purchased=1&points=${pointsAwarded}`);
}
