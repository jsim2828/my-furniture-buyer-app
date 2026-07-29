// trigger: any value that changes (e.g. an incrementing counter) each time
// a new flash should play. A falsy trigger (0, null) never flashes. Keying
// the element by trigger forces a fresh DOM node each time, which restarts
// the CSS animation; it ends at opacity 0 (fill-mode: forwards) and stays
// invisible/non-interactive, so nothing needs to explicitly unmount it.
export function PurchaseFlash({ trigger }) {
  if (!trigger) return null;
  return <div key={trigger} className="purchase-flash" />;
}
