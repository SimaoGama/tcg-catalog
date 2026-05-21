import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import NewCardForm from "./new-card-form";

export default async function NewCardPage() {
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

  async function createCard(formData: FormData) {
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
const card_number = String(formData.get("card_number") || "").trim();
const language = String(formData.get("language") || "EN").trim();
const rarity = String(formData.get("rarity") || "").trim();
const condition = String(formData.get("condition") || "").trim();
const illustrator = String(formData.get("illustrator") || "").trim();
const tcgdex_id = String(formData.get("tcgdex_id") || "").trim();
const price_cents = Number(formData.get("price_cents") || 0);
const stock = Number(formData.get("stock") || 0);

    const frontImage = formData.get("front_image") as File | null;
    const backImage = formData.get("back_image") as File | null;

    if (!title) {
      throw new Error("Title is required");
    }

        let tcgCard: any = null;

    if (tcgdex_id) {
      const res = await fetch(
        `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(tcgdex_id)}`,
        { cache: "no-store" }
      );

      if (res.ok) {
        tcgCard = await res.json();
      }
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
      product_type: "single_card",
      description: description || null,
      set_name: set_name || tcgCard?.set?.name || null,
      set_logo_url: tcgCard?.set?.logo || null,
      set_symbol_url: tcgCard?.set?.symbol || null,
      card_number: card_number || null,
      language,
      rarity: rarity || tcgCard?.rarity || null,
      condition: condition || null,
      illustrator: illustrator || tcgCard?.illustrator || null,
      tcgdex_id: tcgdex_id || null,
      front_image_url,
      back_image_url,
      price_cents,
      stock,
      created_by: userId,
      is_active: true,
      is_already_graded: false,
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
        <p className="text-sm text-stone-500 dark:text-stone-400">Admin / Cards</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">
          Add new card
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Create a new single card for your catalog.
        </p>
      </div>

      <NewCardForm action={createCard} />
    </main>
  );
}