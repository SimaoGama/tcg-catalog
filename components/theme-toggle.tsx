"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
    >
      {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  );
}