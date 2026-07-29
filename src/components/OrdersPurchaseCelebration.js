"use client";

import { useRouter } from "next/navigation";
import { PurchaseCelebration } from "@/components/PurchaseCelebration";

// Shown when arriving at /orders right after a purchase (see
// placeOrderAction's redirect). "Next" dismisses it and strips the query
// params so a manual refresh doesn't replay it.
export function OrdersPurchaseCelebration({ pointsAwarded }) {
  const router = useRouter();

  if (pointsAwarded == null) return null;

  return (
    <PurchaseCelebration
      pointsAwarded={pointsAwarded}
      onDismiss={() => router.replace("/orders")}
    />
  );
}
