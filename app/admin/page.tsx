import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/catalog");
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) {
    throw new Error(productsError.message);
  }

  const allProducts = products ?? [];

  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter((product) => product.is_active).length;
  const outOfStock = allProducts.filter((product) => (product.stock ?? 0) <= 0).length;
  const lowStock = allProducts.filter(
    (product) => (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 3
  ).length;
  const totalUnits = allProducts.reduce(
    (sum, product) => sum + (product.stock ?? 0),
    0
  );
  const inventoryValueCents = allProducts.reduce(
    (sum, product) => sum + (product.price_cents ?? 0) * (product.stock ?? 0),
    0
  );

  const recentProducts = allProducts.slice(0, 6);
  const attentionProducts = allProducts.filter((product) => (product.stock ?? 0) <= 3);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Business overview
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Signed in as {profile.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
          >
            View catalog
          </Link>

          <Link
            href="/admin/cards/new"
            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
          >
            Add new card
          </Link>

          <Link
            href="/admin/products/new"
            className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Add sealed product
          </Link>
        </div>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Total listings</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            {totalProducts}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Active listings</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            {activeProducts}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Out of stock</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            {outOfStock}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Low stock</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            {lowStock}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Inventory units</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            {totalUnits}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">Inventory value</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            €{(inventoryValueCents / 100).toFixed(2)}
          </p>
        </article>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr,1fr]">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Recently added
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Open catalog
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No products yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-stone-900 dark:text-stone-100">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        Type:{" "}
                        {product.product_type === "sealed_product"
                          ? "Sealed product"
                          : "Card single"}
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Stock: {product.stock ?? 0}
                      </p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      €{((product.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            Needs attention
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Products with stock at 3 or below.
          </p>

          {attentionProducts.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
              Everything looks well stocked.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {attentionProducts.slice(0, 8).map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-stone-900 dark:text-stone-100">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {product.product_type === "sealed_product"
                          ? "Sealed product"
                          : "Card single"}
                      </p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}