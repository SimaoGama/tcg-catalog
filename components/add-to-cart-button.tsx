"use client";

import { useActionState, useEffect, useState } from "react";
import { addToCartAction, type AddToCartState } from "@/app/catalog/[id]/actions";

type AddToCartButtonProps = {
  productId: string;
};

const initialState: AddToCartState = {
  status: "idle",
  message: "",
};

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const actionWithProduct = addToCartAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(actionWithProduct, initialState);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      setVisible(true);

      const timeout = setTimeout(() => {
        setVisible(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
        >
          {pending ? "Adding..." : "Add to cart"}
        </button>
      </form>

      {visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${
            state.status === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-300"
              : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/90 dark:text-rose-300"
          }`}
        >
          {state.message}
        </div>
      )}
    </>
  );
}