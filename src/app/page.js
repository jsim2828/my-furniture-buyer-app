import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center text-center gap-6 py-20">
      <span className="text-xs uppercase tracking-[0.3em] text-marigold-400">
        Est. 1971
      </span>
      <h1 className="text-3xl font-semibold text-oyster-100">
        Furnish your space, on budget.
      </h1>
      <p className="max-w-md text-oyster-400">
        Browse the Lucky Sofa 88 catalogue and place orders — we&apos;ll keep
        track of what you&apos;ve spent so you never go over budget.
      </p>

      {user ? (
        <Link
          href="/products"
          className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-5 py-2.5 hover:bg-tangerine-400"
        >
          Browse catalogue
        </Link>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/register"
            className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-5 py-2.5 hover:bg-tangerine-400"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-chrome-500/60 text-oyster-200 px-5 py-2.5 hover:bg-aubergine-800"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
