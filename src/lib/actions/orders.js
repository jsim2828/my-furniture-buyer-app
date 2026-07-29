"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRemainingBudget } from "@/lib/budget";

export async function placeOrderAction(prevState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Form fields are named "qty-<productId>". Only keep ones the buyer
  // actually entered a quantity for.
  const requestedQuantities = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty-")) continue;
    const quantity = parseInt(value, 10);
    if (Number.isFinite(quantity) && quantity > 0) {
      requestedQuantities.push({
        productId: Number(key.replace("qty-", "")),
        quantity,
      });
    }
  }

  if (requestedQuantities.length === 0) {
    return { error: "Choose a quantity for at least one product." };
  }

  const products = await db.product.findMany({
    where: { id: { in: requestedQuantities.map((r) => r.productId) } },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const items = requestedQuantities.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    return {
      productId,
      quantity,
      priceAtPurchase: product.price,
      lineTotal: product.price * quantity,
    };
  });
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const remainingBudget = await getRemainingBudget(user);
  if (total > remainingBudget) {
    const over = (total - remainingBudget).toFixed(2);
    return { error: `This order exceeds your remaining budget by $${over}.` };
  }

  await db.order.create({
    data: {
      userId: user.id,
      total,
      items: {
        create: items.map(({ productId, quantity, priceAtPurchase }) => ({
          productId,
          quantity,
          priceAtPurchase,
        })),
      },
    },
  });

  revalidatePath("/orders");
  revalidatePath("/products");
  redirect("/orders");
}
