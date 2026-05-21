"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [showSignupSuccessCard, setShowSignupSuccessCard] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("info");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        setLoading(false);
        return;
      }

      setShowSignupSuccessCard(true);
      setMode("login");
      setPassword("");
      setMessage(
        "Account created. Please confirm your email before logging in if verification is enabled."
      );
      setMessageType("success");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Login successful. Redirecting...");
    setMessageType("success");
    router.push("/catalog");
    router.refresh();
  }

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {mode === "login" ? "Login" : "Create account"}
          </h1>

          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {mode === "login"
              ? "Sign in to browse, buy, and manage your cart."
              : "Create your account to start browsing and buying cards."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create account"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                messageType === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : messageType === "error"
                  ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                  : "border-stone-300 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {message}
            </div>
          )}

          {mode === "signup" && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              If email confirmation is enabled, you’ll need to confirm your email
              before you can log in.
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
              setMessageType("info");
            }}
            className="mt-6 text-sm font-medium text-stone-700 underline underline-offset-4 dark:text-stone-200"
          >
            {mode === "login"
              ? "Need an account? Create one"
              : "Already have an account? Login"}
          </button>
        </div>
      </main>

      {showSignupSuccessCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              ✓
            </div>

            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Account created
            </h2>

            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              Your account was created successfully.
            </p>

            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              If email confirmation is enabled, please check your inbox and confirm
              your email before logging in.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSignupSuccessCard(false)}
                className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                Go to login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}