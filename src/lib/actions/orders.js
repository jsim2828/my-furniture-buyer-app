"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { placeOrder } from "@/lib/shopApi";

export async function placeOrderAction(prevState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Form fields are named "qty-<item_id>". Only keep ones the buyer
  // actually entered a quantity for.
  const items = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty-")) continue;
    const quantity = parseInt(value, 10);
    if (Number.isFinite(quantity) && quantity > 0) {
      items.push({ item_id: key.replace("qty-", ""), quantity });
    }
  }

  if (items.length === 0) {
    return { error: "Choose a quantity for at least one product." };
  }

  const { ok, data } = await placeOrder(items);
  if (!ok) {
    return { error: data.detail || "Order failed." };
  }

  revalidatePath("/orders");
  revalidatePath("/products");
  redirect("/orders");
}
