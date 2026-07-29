"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";

const initialState = { error: null };
const inputClass =
  "rounded-md border border-chrome-500/50 bg-aubergine-900 text-oyster-100 px-3 py-2 focus:outline-none focus:border-tangerine-400";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      {state?.error && (
        <p className="rounded-md bg-aubergine-800 border border-tangerine-600 text-oyster-100 px-4 py-2 text-sm">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm text-oyster-300">
        Email
        <input type="email" name="email" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-oyster-300">
        Password
        <input type="password" name="password" required className={inputClass} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-tangerine-500 text-aubergine-950 font-medium px-4 py-2 hover:bg-tangerine-400 disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm text-oyster-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-marigold-400 underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
