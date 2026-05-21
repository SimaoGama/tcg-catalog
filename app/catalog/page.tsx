import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CatalogPageProps = {
  searchParams?: Promise<{
    view?: string;
    q?: string;
    language?: string;
    rarity?: string;
    condition?: string;
    inStock?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view === "list" ? "list" : "grid";
  const query = params.q?.trim() ?? "";
  const language = params.language?.trim() ?? "";
  const rarity = params.rarity?.trim() ?? "";
  const condition = params.condition?.trim() ?? "";
  const inStock = params.inStock === "true";

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

  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (query) {
    productsQuery = productsQuery.or(
      `title.ilike.%${query}%,set_name.ilike.%${query}%,card_number.ilike.%${query}%,illustrator.ilike.%${query}%`
    );
  }

  if (language) {
    productsQuery = productsQuery.eq("language", language);
  }

  if (rarity) {
    productsQuery = productsQuery.eq("rarity", rarity);
  }

  if (condition) {
    productsQuery = productsQuery.eq("condition", condition);
  }

  if (inStock) {
    productsQuery = productsQuery.gt("stock", 0);
  }

  const { data: products, error } = await productsQuery;

  if (error) {
    throw new Error(error.message);
  }

  const { data: allProducts } = await supabase
    .from("products")
    .select("language, rarity, condition")
    .eq("is_active", true);

  const languages = Array.from(
    new Set((allProducts ?? []).map((p) => p.language).filter(Boolean))
  ).sort();

  const rarities = Array.from(
    new Set((allProducts ?? []).map((p) => p.rarity).filter(Boolean))
  ).sort();

  const conditions = Array.from(
    new Set((allProducts ?? []).map((p) => p.condition).filter(Boolean))
  ).sort();

  const buildViewHref = (nextView: "grid" | "list") => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (language) search.set("language", language);
    if (rarity) search.set("rarity", rarity);
    if (condition) search.set("condition", condition);
    if (inStock) search.set("inStock", "true");
    search.set("view", nextView);
    return `/catalog?${search.toString()}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Card store
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Browse available cards, inspect details, and add items to your cart.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="relative group">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-xl font-semibold text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                aria-label="Add product"
              >
                +
              </button>

              <div className="invisible absolute right-0 top-14 z-20 w-52 rounded-2xl border border-stone-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-stone-800 dark:bg-stone-900">
                <Link
                  href="/admin/cards/new"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  Add new card
                </Link>

                <button
                  type="button"
                  disabled
                  className="block w-full cursor-not-allowed rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-400 dark:text-stone-500"
                >
                  Bulk add (soon)
                </button>
              </div>
            </div>
          )}

          {user ? (
            isAdmin ? (
              <>
                <Link
                  href="/catalog"
                  className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                >
                  Catalog
                </Link>

                <Link
                  href="/admin"
                  className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                >
                  Admin
                </Link>
              </>
            ) : (
              <Link
                href="/cart"
                className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
              >
                My cart
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <form className="mb-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-6 dark:border-stone-800 dark:bg-stone-900">
        <input type="hidden" name="view" value={view} />

        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search title, set, number, illustrator..."
          className="md:col-span-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />

        <select
          name="language"
          defaultValue={language}
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
          name="rarity"
          defaultValue={rarity}
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
          name="condition"
          defaultValue={condition}
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
            name="inStock"
            value="true"
            defaultChecked={inStock}
          />
          In stock only
        </label>

        <div className="md:col-span-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={buildViewHref("grid")}
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
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                view === "list"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-200"
              }`}
            >
              List
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/catalog"
              className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-700 dark:text-stone-200"
            >
              Reset
            </Link>

            <button
              type="submit"
              className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900"
            >
              Apply filters
            </button>
          </div>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            No products found
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Try changing your search or filters.
          </p>
        </div>
      ) : view === "list" ? (
        <div className="space-y-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {product.title}
                  </h2>

                  <div className="space-y-1 text-sm text-stone-500 dark:text-stone-400">
                    {product.set_name && <p>Set: {product.set_name}</p>}
                    {product.card_number && <p>Number: {product.card_number}</p>}
                    {product.language && <p>Language: {product.language}</p>}
                    {product.rarity && <p>Rarity: {product.rarity}</p>}
                    {product.condition && <p>Condition: {product.condition}</p>}
                    {product.illustrator && <p>Illustrator: {product.illustrator}</p>}
                    <p>Stock: {product.stock}</p>
                  </div>

                  {product.description && (
                    <p className="pt-2 text-sm text-stone-600 dark:text-stone-300">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    €{(product.price_cents / 100).toFixed(2)}
                  </span>

                  <div className="flex gap-3">
                    <Link
                      href={`/catalog/${product.id}`}
                      className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                    >
                      View card
                    </Link>

                    {!isAdmin && (
                      <Link
                        href={user ? `/catalog/${product.id}` : "/login"}
                        className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                      >
                        {user ? "Buy / add to cart" : "Login to buy"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {product.title}
                </h2>

                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  €{(product.price_cents / 100).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1 text-sm text-stone-500 dark:text-stone-400">
                {product.set_name && <p>Set: {product.set_name}</p>}
                {product.card_number && <p>Number: {product.card_number}</p>}
                {product.rarity && <p>Rarity: {product.rarity}</p>}
                {product.condition && <p>Condition: {product.condition}</p>}
                {product.illustrator && <p>Illustrator: {product.illustrator}</p>}
                {product.predicted_grade && product.predicted_grading_company && (
                  <p>
                    Predicted: {product.predicted_grading_company}{" "}
                    {product.predicted_grade}
                  </p>
                )}
                {product.is_already_graded &&
                  product.actual_grade &&
                  product.actual_grading_company && (
                    <p>
                      Graded: {product.actual_grading_company} {product.actual_grade}
                    </p>
                  )}
                <p>Stock: {product.stock}</p>
              </div>

              {product.description && (
                <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">
                  {product.description}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <Link
                  href={`/catalog/${product.id}`}
                  className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                >
                  View card
                </Link>

                {!isAdmin && (
                  <Link
                    href={user ? `/catalog/${product.id}` : "/login"}
                    className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                  >
                    {user ? "Buy / add to cart" : "Login to buy"}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}