import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCardPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/catalog");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  async function updateCard(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const userId = user.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const title = String(formData.get("title") || "").trim();
    const set_name = String(formData.get("set_name") || "").trim();
    const card_number = String(formData.get("card_number") || "").trim();
    const language = String(formData.get("language") || "").trim();
    const rarity = String(formData.get("rarity") || "").trim();
    const condition = String(formData.get("condition") || "").trim();
    const illustrator = String(formData.get("illustrator") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const stock = Number(formData.get("stock") || 0);
    const price_cents = Math.round(Number(formData.get("price_eur") || 0) * 100);

    const frontImage = formData.get("front_image") as File | null;
    const backImage = formData.get("back_image") as File | null;

    if (!title) {
      throw new Error("Title is required");
    }

    async function uploadImage(file: File | null, kind: "front" | "back") {
      if (!file || file.size === 0) return null;

      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const bytes = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, bytes, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    }

    const newFrontImageUrl = await uploadImage(frontImage, "front");
    const newBackImageUrl = await uploadImage(backImage, "back");

    const { error } = await supabase
      .from("products")
      .update({
        title,
        set_name: set_name || null,
        card_number: card_number || null,
        language: language || null,
        rarity: rarity || null,
        condition: condition || null,
        illustrator: illustrator || null,
        description: description || null,
        stock,
        price_cents,
        front_image_url: newFrontImageUrl ?? product.front_image_url ?? null,
        back_image_url: newBackImageUrl ?? product.back_image_url ?? null,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/catalog");
    revalidatePath(`/catalog/${id}`);
    revalidatePath(`/admin/cards/${id}/edit`);
    redirect(`/catalog/${id}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Admin</p>
          <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Edit card
          </h1>
        </div>

        <Link
          href={`/catalog/${id}`}
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
        >
          Back to card
        </Link>
      </div>

      <form
        action={updateCard}
        className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Title
            </span>
            <input
              name="title"
              defaultValue={product.title}
              required
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Set name
            </span>
            <input
              name="set_name"
              defaultValue={product.set_name ?? ""}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Card number
            </span>
            <input
              name="card_number"
              defaultValue={product.card_number ?? ""}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Language
            </span>
            <select
              name="language"
              defaultValue={product.language ?? "EN"}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            >
              <option value="EN">English (EN)</option>
              <option value="JP">Japanese (JP)</option>
              <option value="PT">Portuguese (PT)</option>
              <option value="ES">Spanish (ES)</option>
              <option value="FR">French (FR)</option>
              <option value="DE">German (DE)</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Rarity
            </span>
            <input
              name="rarity"
              defaultValue={product.rarity ?? ""}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Condition
            </span>
            <input
              name="condition"
              defaultValue={product.condition ?? ""}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Illustrator
            </span>
            <input
              name="illustrator"
              defaultValue={product.illustrator ?? ""}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Stock
            </span>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={product.stock ?? 0}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Price (EUR)
            </span>
            <input
              name="price_eur"
              type="number"
              min="0"
              step="0.01"
              defaultValue={(product.price_cents / 100).toFixed(2)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Current front image
              </span>
              <div className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-950">
                {product.front_image_url ? (
                  <img
                    src={product.front_image_url}
                    alt={`${product.title} front`}
                    className="h-56 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-stone-500 dark:text-stone-400">
                    No front image
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Current back image
              </span>
              <div className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-950">
                {product.back_image_url ? (
                  <img
                    src={product.back_image_url}
                    alt={`${product.title} back`}
                    className="h-56 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-stone-500 dark:text-stone-400">
                    No back image
                  </div>
                )}
              </div>
            </div>
          </div>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Replace front image
            </span>
            <input
              name="front_image"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Replace back image
            </span>
            <input
              name="back_image"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Description
            </span>
            <textarea
              name="description"
              defaultValue={product.description ?? ""}
              rows={5}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Save changes
          </button>

          <Link
            href={`/catalog/${id}`}
            className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}