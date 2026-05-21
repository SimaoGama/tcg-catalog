"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CatalogFiltersProps = {
  view: "grid" | "list";
  query: string;
  language: string;
  rarity: string;
  condition: string;
  productType: string;
  inStock: boolean;
  languages: string[];
  rarities: string[];
  conditions: string[];
};

export default function CatalogFilters({
  view,
  query,
  language,
  rarity,
  condition,
  productType,
  inStock,
  languages,
  rarities,
  conditions,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const baseParams = useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  function replaceParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(baseParams.toString());
    updater(params);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function setParam(name: string, value: string) {
    replaceParams((params) => {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    });
  }

  function setCheckbox(name: string, checked: boolean) {
    replaceParams((params) => {
      if (checked) {
        params.set(name, "true");
      } else {
        params.delete(name);
      }
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.get("q") ?? "";

      if (searchValue === current) return;

      replaceParams((params) => {
        if (searchValue.trim()) {
          params.set("q", searchValue.trim());
        } else {
          params.delete("q");
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue, searchParams]);

  const buildViewHref = (nextView: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView) {
      params.set("view", nextView);
    } else {
      params.delete("view");
    }

    const next = params.toString();
    return next ? `${pathname}?${next}` : pathname;
  };

  return (
    <div className="mb-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-7 dark:border-stone-800 dark:bg-stone-900">
      <input
  type="text"
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  placeholder="Search title, set, number, illustrator..."
  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none md:col-span-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
/>

<select
  value={productType}
  onChange={(e) => setParam("productType", e.target.value)}
  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
>
  <option value="">All product types</option>
  <option value="single_card">Card singles</option>
  <option value="sealed_product">Sealed products</option>
</select>

<select
  value={language}
  onChange={(e) => setParam("language", e.target.value)}
  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
>
        <option value="">All languages</option>
        {languages.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <select
        value={rarity}
        onChange={(e) => setParam("rarity", e.target.value)}
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      >
        <option value="">All rarities</option>
        {rarities.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <select
        value={condition}
        onChange={(e) => setParam("condition", e.target.value)}
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      >
        <option value="">All conditions</option>
        {conditions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-200">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setCheckbox("inStock", e.target.checked)}
        />
        In stock only
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-7">
        <div className="flex items-center gap-2">
          <Link
            href={buildViewHref("grid")}
            scroll={false}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${
              view === "grid"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-200"
            }`}
          >
            Grid
          </Link>

          <Link
            href={buildViewHref("list")}
            scroll={false}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${
              view === "list"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-200"
            }`}
          >
            List
          </Link>
        </div>

        <Link
          href="/catalog"
          scroll={false}
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-700 dark:text-stone-200"
        >
          Reset
        </Link>
      </div>
    </div>
  );
}