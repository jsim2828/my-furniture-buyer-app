import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAccount } from "@/lib/shopApi";
import { logoutAction } from "@/lib/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const account = user ? await getAccount() : null;

  return (
    <header className="border-b border-chrome-600/40 bg-aubergine-900">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold tracking-wide uppercase text-oyster-100"
        >
          Lucky Sofa <span className="text-tangerine-500">88</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm text-oyster-200">
            <Link href="/products" className="hover:text-marigold-400">
              Catalogue
            </Link>
            <Link href="/orders" className="hover:text-marigold-400">
              Orders
            </Link>
            <span className="text-oyster-400">
              Balance:{" "}
              <span className="font-medium text-marigold-300">
                ${account.balance.toFixed(2)}
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-chrome-500/60 px-3 py-1 text-oyster-200 hover:bg-aubergine-700"
              >
                Log out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-oyster-200 hover:text-marigold-400">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-3 py-1 hover:bg-tangerine-400"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
