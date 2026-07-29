"use client";

import { useState } from "react";

export function AssistantChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [confirming, setConfirming] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending || pendingOrder) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply || "(no reply)" },
      ]);
      setPendingOrder(data.pendingOrder || null);
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "That took too long — try again."
          : "Something went wrong — try again."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleConfirmOrder() {
    if (!pendingOrder || confirming) return;
    setConfirming(true);

    try {
      const res = await fetch("/api/assistant/confirm-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: pendingOrder.items.map(({ item_id, quantity }) => ({
            item_id,
            quantity,
          })),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      const text = data.message || "Something went wrong placing that order.";

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong placing that order.\n\nVery comfy.",
        },
      ]);
    } finally {
      setPendingOrder(null);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-3 min-h-[300px] rounded-lg border border-chrome-600/30 bg-aubergine-800 p-4">
        {messages.length === 0 && (
          <p className="text-oyster-400 text-sm">
            Ask me things like &quot;show me sofas under $500&quot; or
            &quot;I need a bookcase&quot;.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap ${
              message.role === "user"
                ? "self-end bg-tangerine-500 text-aubergine-950"
                : "self-start bg-aubergine-900 text-oyster-100"
            }`}
          >
            {message.content}
          </div>
        ))}
        {pending && (
          <div className="self-start rounded-md px-3 py-2 text-sm bg-aubergine-900 text-oyster-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-marigold-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="inline-block w-2 h-2 rounded-full bg-marigold-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="inline-block w-2 h-2 rounded-full bg-marigold-400 animate-bounce" />
            <span>Thinking (can take up to 15-20 seconds)...</span>
          </div>
        )}

        {pendingOrder && (
          <div className="rounded-md border border-tangerine-600 bg-aubergine-900 p-3 flex flex-col gap-2">
            <p className="text-sm text-oyster-100 font-medium">
              Confirm this order:
            </p>
            <ul className="text-sm text-oyster-200 flex flex-col gap-1">
              {pendingOrder.items.map((item) => (
                <li key={item.item_id} className="flex justify-between gap-4">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0">${item.line_total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm font-medium text-marigold-300 border-t border-chrome-600/30 pt-2">
              <span>Total</span>
              <span>${pendingOrder.total_price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={confirming}
                className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-4 py-2 hover:bg-tangerine-400 disabled:opacity-50"
              >
                {confirming ? "Placing order..." : "Confirm & buy"}
              </button>
              <span className="text-xs text-marigold-400 italic">
                YOLO be comfy, be lucky
              </span>
              <button
                type="button"
                onClick={() => setPendingOrder(null)}
                disabled={confirming}
                className="text-xs text-oyster-400 underline disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-tangerine-400 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            pendingOrder
              ? "Confirm or cancel the order above to continue..."
              : "Ask for a recommendation..."
          }
          disabled={!!pendingOrder}
          className="flex-1 rounded-md border border-chrome-500/50 bg-aubergine-900 text-oyster-100 px-3 py-2 focus:outline-none focus:border-tangerine-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !!pendingOrder}
          className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-4 py-2 hover:bg-tangerine-400 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
