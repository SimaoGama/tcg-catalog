import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CartProduct = {
  id: string;
  title: string;
  price_cents: number;
  stock: number;
  front_image_url: string | null;
  set_name: string | null;
  card_number: string | null;
  condition: string | null;
  is_active: boolean;
};

type CartItemRow = {
  id: string;
  quantity: number;
  product: CartProduct | CartProduct[] | null;
};

export default async function CartPage() {
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

  if (profile?.role === "admin") {
    redirect("/catalog");
  }

    async function removeCartItem(formData: FormData) {
    "use server";

    const cartItemId = formData.get("cartItemId");

    if (typeof cartItemId !== "string" || !cartItemId) {
      throw new Error("Invalid cart item");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
        id,
        quantity,
        product:products (
          id,
          title,
          price_cents,
          stock,
          front_image_url,
          set_name,
          card_number,
          condition,
          is_active
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const cartItems = ((data ?? []) as CartItemRow[])
    .map((item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;

      if (!product || !product.is_active) {
        return null;
      }

      return {
        id: item.id,
        quantity: item.quantity ?? 0,
        product,
      };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        quantity: number;
        product: CartProduct;
      } => item !== null
    );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalCents = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price_cents,
    0
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Buyer area
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
            My cart
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
          </p>
        </div>

        <Link
          href="/catalog"
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
        >
          Continue shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Add some cards or sealed products to see them here.
          </p>

          <div className="mt-6">
            <Link
              href="/catalog"
              className="inline-flex rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Browse catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <section className="space-y-4">
            {cartItems.map((item) => {
              const imageSrc = item.product.front_image_url || "/placeholder-card.png";
              const lineTotal = item.quantity * item.product.price_cents;

              return (
                <article
                  key={item.id}
                  className="flex gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
                    <img
                      src={imageSrc}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div>
                      <Link
                        href={`/catalog/${item.product.id}`}
                        className="text-base font-semibold text-stone-900 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300"
                      >
                        {item.product.title}
                      </Link>

                      <div className="mt-1 space-y-1 text-sm text-stone-500 dark:text-stone-400">
                        {item.product.set_name && <p>Set: {item.product.set_name}</p>}
                        {item.product.card_number && (
                          <p>Number: {item.product.card_number}</p>
                        )}
                        {item.product.condition && (
                          <p>Condition: {item.product.condition}</p>
                        )}
                        <p>Quantity: {item.quantity}</p>
                        <p>Stock available: {item.product.stock}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <p className="text-sm text-stone-600 dark:text-stone-400">
      €{(item.product.price_cents / 100).toFixed(2)} each
    </p>

    <form action={removeCartItem}>
      <input type="hidden" name="cartItemId" value={item.id} />
      <button
        type="submit"
        className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        Remove
      </button>
    </form>
  </div>

  <p className="text-base font-semibold text-stone-900 dark:text-stone-100">
    €{(lineTotal / 100).toFixed(2)}
  </p>
</div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Order summary
            </h2>

            <div className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex items-center justify-between gap-4">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span>€{(subtotalCents / 100).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span>Shipping</span>
                <span>Calculated later</span>
              </div>
            </div>

            <div className="my-4 border-t border-stone-200 dark:border-stone-800" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Total
              </span>
              <span className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                €{(subtotalCents / 100).toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-2xl bg-stone-300 px-4 py-3 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400"
            >
              Checkout coming soon
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}