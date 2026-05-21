import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import CardImageModal from "@/components/card-image-modal";
import AddToCartButton from "@/components/add-to-cart-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

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

  async function deleteCard() {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/catalog");
    redirect("/catalog");
  }

    

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  const frontSrc = product.front_image_url || "/placeholder-card.png";
  const backSrc =
    product.back_image_url ||
    product.front_image_url ||
    "/placeholder-card.png";
    

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/catalog"
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
        >
          Back to catalog
        </Link>

        {user ? (
          <Link
            href="/cart"
            className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            My cart
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Login
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CardImageModal
          frontSrc={frontSrc}
          backSrc={backSrc}
          cardName={product.title}
        />

        <aside className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              {product.product_type ?? "Pokémon"}
            </p>
            

            <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
              {product.title}
            </h1>

            <p className="mt-2 text-base text-stone-600 dark:text-stone-400">
              {product.set_name || "Single card"}
              {product.card_number ? ` • ${product.card_number}` : ""}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.condition && (
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Condition: {product.condition}
              </span>
            )}

            {product.rarity && (
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Rarity: {product.rarity}
              </span>
            )}

            {product.language && (
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Language: {product.language}
              </span>
            )}

            <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
              Price: €{(product.price_cents / 100).toFixed(2)}
            </span>

            <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
              Stock: {product.stock}
            </span>

            {product.illustrator && (
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Illustrator: {product.illustrator}
              </span>
            )}
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-stone-600 dark:text-stone-400">
            {product.description && <p>{product.description}</p>}

            {product.predicted_grade && product.predicted_grading_company && (
              <p>
                Predicted grade: {product.predicted_grading_company}{" "}
                {product.predicted_grade}
              </p>
            )}

            {product.is_already_graded &&
              product.actual_grade &&
              product.actual_grading_company && (
                <p>
                  Certified grade: {product.actual_grading_company}{" "}
                  {product.actual_grade}
                </p>
              )}

            <p>Sale status: {product.stock > 0 ? "Available" : "Out of stock"}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
  {!user ? (
    <Link
      href="/login"
      className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
    >
      Login to buy
    </Link>
    ) : isAdmin ? null : product.stock > 0 ? (
    <AddToCartButton productId={product.id} />
  ) : (
    <button
      type="button"
      disabled
      className="cursor-not-allowed rounded-full bg-stone-300 px-5 py-3 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400"
    >
      Out of stock
    </button>
  )}
</div>

          {isAdmin && (
            <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 dark:border-stone-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Admin actions
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/cards/${product.id}/edit`}
                  className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                >
                  Edit card
                </Link>

                <form action={deleteCard}>
                  <button
                    type="submit"
                    className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Delete card
                  </button>
                </form>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}