"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : systemPrefersDark
        ? "dark"
        : "light";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("theme", next);
      return next;
    });
  }

  const value = useMemo(
    () => ({
      theme,
      mounted,
      toggleTheme,
    }),
    [theme, mounted]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}