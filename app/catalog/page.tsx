import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CatalogFilters from "@/components/catalog-filters";

function getAssetUrl(asset?: string | null) {
  if (!asset) return null;
  if (
    asset.endsWith(".jpg") ||
    asset.endsWith(".png") ||
    asset.endsWith(".webp") ||
    asset.endsWith(".svg")
  ) {
    return asset;
  }
  return `${asset}.png`;
}

type CatalogPageProps = {
  searchParams?: Promise<{
    view?: string;
    q?: string;
    language?: string;
    rarity?: string;
    condition?: string;
    inStock?: string;
    productType?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view === "list" ? "list" : "grid";
  const query = params.q?.trim() ?? "";
  const language = params.language?.trim() ?? "";
  const rarity = params.rarity?.trim() ?? "";
  const condition = params.condition?.trim() ?? "";
  const productType = params.productType?.trim() ?? "";
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

  if (productType) {
    productsQuery = productsQuery.eq("product_type", productType);
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
    if (productType) search.set("productType", productType);
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
            <div className="group relative">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-xl font-semibold text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                aria-label="Add product"
              >
                +
              </button>

              <div className="invisible absolute right-0 top-14 z-20 w-56 rounded-2xl border border-stone-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-stone-800 dark:bg-stone-900">
                <Link
                  href="/admin/cards/new"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  Add new card
                </Link>

                <Link
                  href="/admin/products/new"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                >
                  Add sealed product
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

      <CatalogFilters
        view={view}
        query={query}
        language={language}
        rarity={rarity}
        condition={condition}
        productType={productType}
        inStock={inStock}
        languages={languages}
        rarities={rarities}
        conditions={conditions}
      />

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
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const frontSrc = product.front_image_url || "/placeholder-card.png";
            const backSrc =
              product.back_image_url ||
              product.front_image_url ||
              "/placeholder-card.png";
            const setSymbolSrc = getAssetUrl(product.set_symbol_url);
            const setLogoSrc = getAssetUrl(product.set_logo_url);

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="group relative aspect-[3/4] w-full overflow-hidden bg-white dark:bg-stone-950">
                  <img
                    src={frontSrc}
                    alt={`${product.title} front`}
                    className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02] group-hover:opacity-0"
                  />
                  <img
                    src={backSrc}
                    alt={`${product.title} back`}
                    className="absolute inset-0 h-full w-full object-contain opacity-0 transition duration-200 group-hover:scale-[1.02] group-hover:opacity-100"
                  />

                  <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-stone-700 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-stone-900/90 dark:text-stone-200">
                    Back preview
                  </div>
                </div>

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {setSymbolSrc ? (
                          <img
                            src={setSymbolSrc}
                            alt={`${product.set_name || "Set"} symbol`}
                            className="h-5 w-5 shrink-0 object-contain"
                          />
                        ) : null}

                        <h2 className="truncate text-lg font-semibold text-stone-900 dark:text-stone-100">
                          {product.title}
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {"Pokémon"}
                        {product.set_name ? ` • ${product.set_name}` : ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      €{(product.price_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-stone-500 dark:text-stone-400">
                    <p>
                      Type:{" "}
                      {product.product_type === "sealed_product"
                        ? "Sealed product"
                        : "Card single"}
                    </p>
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
                      View details
                    </Link>
                  </div>

                  {setLogoSrc ? (
                    <img
                      src={setLogoSrc}
                      alt={`${product.set_name || "Set"} logo`}
                      className="pointer-events-none absolute bottom-4 right-4 h-10 max-w-[96px] object-contain opacity-70"
                    />
                  ) : setSymbolSrc ? (
                    <img
                      src={setSymbolSrc}
                      alt={`${product.set_name || "Set"} symbol`}
                      className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 object-contain opacity-70"
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}