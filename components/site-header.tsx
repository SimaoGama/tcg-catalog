import Link from "next/link";
import AuthButton from "@/components/auth-button";
import ThemeToggle from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-900 dark:text-stone-100"
        >
          TCG Catalog
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <nav className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-300">
            <Link href="/cards" className="hover:text-stone-950 dark:hover:text-white">
              Browse
            </Link>

            {isAdmin && (
              <Link
                href="/catalog"
                className="hover:text-stone-950 dark:hover:text-white"
              >
                Catalog
              </Link>
            )}

            <a href="/#about" className="hover:text-stone-950 dark:hover:text-white">
              About
            </a>

            <a
              href="https://www.cardmarket.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-stone-900 px-4 py-2 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Cardmarket
            </a>
          </nav>

          <AuthButton user={user} isAdmin={isAdmin} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}