import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import EditCardForm from "./edit-card-form";

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
  const language = String(formData.get("language") || "EN").trim();
  const rarity = String(formData.get("rarity") || "").trim();
  const condition = String(formData.get("condition") || "").trim();
  const illustrator = String(formData.get("illustrator") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  const price_cents = Math.round(Number(formData.get("price_eur") || 0) * 100);
  const tcgdex_id = String(formData.get("tcgdex_id") || "").trim();

  if (!title) {
    throw new Error("Title is required");
  }

  function mapLanguage(input: string) {
    const value = input.toLowerCase().trim();

    switch (value) {
      case "en":
        return "en";
      case "jp":
      case "ja":
        return "ja";
      case "fr":
        return "fr";
      case "es":
        return "es";
      case "it":
        return "it";
      case "pt":
        return "pt";
      case "pt-br":
        return "pt-br";
      case "pt-pt":
        return "pt-pt";
      case "de":
        return "de";
      case "nl":
        return "nl";
      case "pl":
        return "pl";
      case "ru":
        return "ru";
      case "ko":
        return "ko";
      case "id":
        return "id";
      case "th":
        return "th";
      case "zh":
      case "zh-tw":
      case "tw":
        return "zh-tw";
      case "zh-cn":
      case "cn":
        return "zh-cn";
      default:
        return "en";
    }
  }

  let tcgCard: any = null;

  if (tcgdex_id) {
    const tcgLanguage = mapLanguage(language);

    const res = await fetch(
      `https://api.tcgdex.net/v2/${tcgLanguage}/cards/${encodeURIComponent(tcgdex_id)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      tcgCard = await res.json();
    }
  }

  const frontImage = formData.get("front_image") as File | null;
  const backImage = formData.get("back_image") as File | null;

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
      set_name: set_name || tcgCard?.set?.name || product.set_name || null,
      set_logo_url: tcgCard?.set?.logo || product.set_logo_url || null,
      set_symbol_url: tcgCard?.set?.symbol || product.set_symbol_url || null,
      card_number: card_number || null,
      language: language || null,
      rarity: rarity || tcgCard?.rarity || product.rarity || null,
      condition: condition || null,
      illustrator: illustrator || tcgCard?.illustrator || product.illustrator || null,
      tcgdex_id: tcgdex_id || null,
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

      <EditCardForm product={product} action={updateCard} />

      <div className="mt-4">
        <Link
          href={`/catalog/${id}`}
          className="inline-flex rounded-2xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}