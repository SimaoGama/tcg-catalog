"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthButtonProps = {
  user: User | null;
  isAdmin?: boolean;
};

export default function AuthButton({ user, isAdmin = false }: AuthButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
      >
        Login
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="account-dropdown"
        className="flex items-center gap-3 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
      >
        <span className="hidden max-w-[180px] truncate md:inline">
          {user.email ?? "Account"}
        </span>
        <span className="md:hidden">Account</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          id="account-dropdown"
          className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
              Signed in as
            </p>
            <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
              {user.email ?? "No email"}
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-1">
            {isAdmin ? (
              <>
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  Catalog
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  Admin
                </Link>
              </>
            ) : (
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
              >
                My cart
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}