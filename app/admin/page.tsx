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

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Signed in as {profile.email}
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Add product
        </h2>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          We’ll wire the real add-product form next.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
          Existing products
        </h2>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center dark:border-stone-700 dark:bg-stone-900">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No products yet.
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
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {product.title}
                  </h3>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    €{(product.price_cents / 100).toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-stone-500 dark:text-stone-400">
                  {product.set_name && <p>Set: {product.set_name}</p>}
                  {product.card_number && <p>Number: {product.card_number}</p>}
                  {product.condition && <p>Condition: {product.condition}</p>}
                  <p>Stock: {product.stock}</p>
                  <p>Status: {product.is_active ? "Active" : "Hidden"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}