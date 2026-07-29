// Reorders catalogue items so ones similar to past purchases (same
// category, closest price to what was actually paid) show up first —
// e.g. bought a table for $100 before, so tables priced near $100 now
// float to the top of the results.

export function rankBySimilarityToPurchases(items, orderHistory) {
  const itemsById = new Map(items.map((item) => [item.item_id, item]));

  // For each category the buyer has purchased in before (that also
  // appears in the current results), remember what price(s) they paid.
  const pastPricesByCategory = new Map();
  for (const order of orderHistory) {
    for (const line of order.items) {
      const match = itemsById.get(line.product_id);
      if (!match) continue;
      const prices = pastPricesByCategory.get(match.category) || [];
      prices.push(line.unit_price);
      pastPricesByCategory.set(match.category, prices);
    }
  }

  if (pastPricesByCategory.size === 0) return items;

  function similarityScore(item) {
    const pastPrices = pastPricesByCategory.get(item.category);
    if (!pastPrices) return Infinity;
    return Math.min(...pastPrices.map((price) => Math.abs(item.price - price)));
  }

  return items
    .map((item, index) => ({ item, index, score: similarityScore(item) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(({ item }) => item);
}
