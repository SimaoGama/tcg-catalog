"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AddToCartState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function addToCartAction(
  productId: string,
  _prevState: AddToCartState,
  _formData: FormData
): Promise<AddToCartState> {
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
    return {
      status: "error",
      message: "Admins cannot add items to cart",
    };
  }

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("stock, is_active, product_type")
    .eq("id", productId)
    .single();

  if (productError || !productRow || !productRow.is_active) {
    return {
      status: "error",
      message: "Product not available",
    };
  }

  if ((productRow.stock ?? 0) <= 0) {
    return {
      status: "error",
      message: "Product is out of stock",
    };
  }

  const { data: existingItem, error: existingItemError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingItemError) {
    return {
      status: "error",
      message: existingItemError.message,
    };
  }

  const isSealedProduct = productRow.product_type === "sealed_product";

  if (existingItem) {
    if (isSealedProduct) {
      if (existingItem.quantity >= (productRow.stock ?? 0)) {
        return {
          status: "error",
          message: "Cannot add more than available stock",
        };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id)
        .eq("user_id", user.id);

      if (updateError) {
        return {
          status: "error",
          message: updateError.message,
        };
      }

      revalidatePath("/cart");
      revalidatePath("/", "layout");
      revalidatePath(`/catalog/${productId}`);

      return {
        status: "success",
        message: "Item added to cart",
      };
    }

    return {
      status: "error",
      message: "This card is already in your cart",
    };
  }

  const { error: insertError } = await supabase.from("cart_items").insert({
    user_id: user.id,
    product_id: productId,
    quantity: 1,
  });

  if (insertError) {
    return {
      status: "error",
      message: insertError.message,
    };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  revalidatePath(`/catalog/${productId}`);

  return {
    status: "success",
    message: "Item added to cart",
  };
}