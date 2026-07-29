import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center text-center gap-6 py-20">
      <h1 className="text-3xl font-semibold text-stone-900">
        Furnish your space, on budget.
      </h1>
      <p className="max-w-md text-stone-600">
        Browse our furniture catalogue and place orders — we&apos;ll keep
        track of what you&apos;ve spent so you never go over budget.
      </p>

      {user ? (
        <Link
          href="/products"
          className="rounded-md bg-stone-900 text-white px-5 py-2.5 hover:bg-stone-700"
        >
          Browse catalogue
        </Link>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/register"
            className="rounded-md bg-stone-900 text-white px-5 py-2.5 hover:bg-stone-700"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-stone-300 px-5 py-2.5 hover:bg-stone-100"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
