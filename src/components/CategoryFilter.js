"use client";

import { useRouter } from "next/navigation";

export function CategoryFilter({ categories, selected }) {
  const router = useRouter();

  function handleChange(event) {
    const category = event.target.value;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-oyster-300">
      Category
      <select
        value={selected}
        onChange={handleChange}
        className="rounded-md border border-chrome-500/50 bg-aubergine-900 text-oyster-100 px-3 py-2 focus:outline-none focus:border-tangerine-400"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}
