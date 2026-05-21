import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
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

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

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
            <>
              <Link
                href="/cart"
                className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
              >
                My cart
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                >
                  Admin
                </Link>
              )}
            </>
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

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            No products yet
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Your store is ready. Add your first card from the admin page.
          </p>
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

                <Link
                  href={user ? `/catalog/${product.id}` : "/login"}
                  className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                >
                  {user ? "Buy / add to cart" : "Login to buy"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}