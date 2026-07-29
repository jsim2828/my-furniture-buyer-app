"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";

const initialState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      {state?.error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          name="password"
          required
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 text-white px-4 py-2 hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm text-stone-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
