"use client";

import { useEffect, useState } from "react";

const WHEEL_VALUES = [500, 600, 700, 800, 900, 1000];
const SEGMENT_ANGLE = 360 / WHEEL_VALUES.length;

const SEGMENT_COLORS = [
  "var(--color-marigold-500)",
  "var(--color-tangerine-500)",
  "var(--color-aubergine-600)",
  "var(--color-marigold-400)",
  "var(--color-tangerine-600)",
  "var(--color-aubergine-700)",
];

const WHEEL_BACKGROUND = `conic-gradient(${WHEEL_VALUES.map((_, i) => {
  const from = i * SEGMENT_ANGLE;
  const to = from + SEGMENT_ANGLE;
  return `${SEGMENT_COLORS[i]} ${from}deg ${to}deg`;
}).join(", ")})`;

// result: the points value (must be one of WHEEL_VALUES) to land on.
// onDone: called once the spin animation finishes.
export function SpinWheel({ result, onDone }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (result == null) return;
    const index = WHEEL_VALUES.indexOf(result);
    const targetCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    // A few extra full spins for effect, landing the target segment under
    // the fixed top pointer. Deferred a frame so the element first paints
    // at its starting rotation, giving the CSS transition something to
    // actually animate from.
    const frame = requestAnimationFrame(() => {
      setRotation(360 * 5 + (360 - targetCenter));
    });
    const timeout = setTimeout(() => onDone?.(), 3200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="relative w-56 h-56">
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
        style={{
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "16px solid var(--color-oyster-100)",
        }}
      />
      <div
        className="w-full h-full rounded-full border-4 border-chrome-300 shadow-lg"
        style={{
          background: WHEEL_BACKGROUND,
          transform: `rotate(${rotation}deg)`,
          transition: "transform 3s cubic-bezier(0.17, 0.67, 0.32, 1.3)",
        }}
      >
        {WHEEL_VALUES.map((value, i) => {
          const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
          return (
            <div
              key={value}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span
                className="mt-4 text-oyster-100 font-bold text-sm"
                style={{ transform: `rotate(${-angle}deg)`, display: "inline-block" }}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
