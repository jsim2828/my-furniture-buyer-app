import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAccount, getCategories, searchCatalogue } from "@/lib/shopApi";
import { BudgetBar } from "@/components/BudgetBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { OrderForm } from "@/components/OrderForm";

const PAGE_SIZE = 30;

export default async function ProductsPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const category = params.category || "";
  const requestedPage = parseInt(params.page, 10) || 1;

  const [categories, allItems, account] = await Promise.all([
    getCategories(),
    searchCatalogue({ category }),
    getAccount(),
  ]);

  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const pageItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageHref(targetPage) {
    const linkParams = new URLSearchParams();
    if (category) linkParams.set("category", category);
    linkParams.set("page", targetPage);
    return `/products?${linkParams}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Catalogue</h1>
        <BudgetBar balance={account.balance} />
      </div>

      <CategoryFilter categories={categories} selected={category} />

      <OrderForm items={pageItems} />

      <div className="flex items-center justify-between text-sm text-oyster-400">
        <span>
          {totalItems === 0
            ? "No items found"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${
                (page - 1) * PAGE_SIZE + pageItems.length
              } of ${totalItems}`}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-md border border-chrome-500/60 px-3 py-1 text-oyster-200 hover:bg-aubergine-700"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-md border border-chrome-600/30 px-3 py-1 text-oyster-600">
              ← Prev
            </span>
          )}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-md border border-chrome-500/60 px-3 py-1 text-oyster-200 hover:bg-aubergine-700"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-chrome-600/30 px-3 py-1 text-oyster-600">
              Next →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
