"use client";

import { useEffect, useState } from "react";
import { PurchaseFlash } from "@/components/PurchaseFlash";
import { SpinWheel } from "@/components/SpinWheel";

// Shown after any successful purchase: the screen keeps flashing on a loop
// until the user clicks Next, a wheel spins to reveal the Plush Points
// bonus just earned, and a big "Winner" banner shows for exactly 3 seconds
// once the wheel stops (independent of when Next gets clicked).
export function PurchaseCelebration({ pointsAwarded, onDismiss }) {
  const [flashKey, setFlashKey] = useState(1);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setFlashKey((key) => key + 1), 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showWinner) return;
    const timeout = setTimeout(() => setShowWinner(false), 3000);
    return () => clearTimeout(timeout);
  }, [showWinner]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-aubergine-950/85">
      <PurchaseFlash trigger={flashKey} />

      <div className="relative flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-oyster-100">
          You won bonus Plush Points!
        </h2>

        <SpinWheel
          result={pointsAwarded}
          onDone={() => setShowWinner(true)}
        />

        {showWinner && (
          <div className="text-5xl font-black text-marigold-300 drop-shadow-lg tracking-wide">
            WINNER!
          </div>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-6 py-2 hover:bg-tangerine-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
