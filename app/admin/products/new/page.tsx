import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export default async function NewSealedProductPage() {
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

  async function createSealedProduct(formData: FormData) {
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
    const description = String(formData.get("description") || "").trim();
    const set_name = String(formData.get("set_name") || "").trim();
    const language = String(formData.get("language") || "").trim();
    const condition = String(formData.get("condition") || "").trim();
    const price_cents = Number(formData.get("price_cents") || 0);
    const stock = Number(formData.get("stock") || 0);

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

    const front_image_url = await uploadImage(frontImage, "front");
    const back_image_url = await uploadImage(backImage, "back");

    const { error } = await supabase.from("products").insert({
      title,
      product_type: "sealed_product",
      description: description || null,
      set_name: set_name || null,
      language: language || null,
      condition: condition || null,
      front_image_url,
      back_image_url,
      price_cents,
      stock,
      created_by: userId,
      is_active: true,
      is_already_graded: false,
      card_number: null,
      rarity: null,
      illustrator: null,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/catalog");
    redirect("/catalog");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-stone-500 dark:text-stone-400">Admin / Products</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
          Add sealed product
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Create a new sealed product for your catalog.
        </p>
      </div>

      <form
        action={createSealedProduct}
        className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Title
            </label>
            <input
              name="title"
              required
              placeholder="Pokémon 151 Elite Trainer Box"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Set name
            </label>
            <input
              name="set_name"
              placeholder="Scarlet & Violet 151"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Language
            </label>
            <select
              name="language"
              defaultValue="EN"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            >
              <option value="EN">English (EN)</option>
              <option value="JP">Japanese (JP)</option>
              <option value="PT">Portuguese (PT)</option>
              <option value="ES">Spanish (ES)</option>
              <option value="FR">French (FR)</option>
              <option value="DE">German (DE)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Condition
            </label>
            <input
              name="condition"
              placeholder="Sealed"
              defaultValue="Sealed"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Price (cents)
            </label>
            <input
              name="price_cents"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Stock
            </label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue="1"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Front image
            </label>
            <input
              name="front_image"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Back image
            </label>
            <input
              name="back_image"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Optional notes about the sealed product..."
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Save sealed product
          </button>
        </div>
      </form>
    </main>
  );
}