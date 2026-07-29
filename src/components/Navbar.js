import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getRemainingBudget } from "@/lib/budget";
import { logoutAction } from "@/lib/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const remainingBudget = user ? await getRemainingBudget(user) : null;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-stone-900">
          Furniture Buyer
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/products" className="hover:underline">
              Catalogue
            </Link>
            <Link href="/orders" className="hover:underline">
              Orders
            </Link>
            <span className="text-stone-500">
              Budget left:{" "}
              <span className="font-medium text-stone-900">
                ${remainingBudget.toFixed(2)}
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-stone-300 px-3 py-1 hover:bg-stone-100"
              >
                Log out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-stone-900 text-white px-3 py-1 hover:bg-stone-700"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
