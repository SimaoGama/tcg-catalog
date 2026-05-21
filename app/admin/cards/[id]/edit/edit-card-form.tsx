"use client";

import { useEffect, useRef, useState } from "react";

function getImageUrl(image?: string | null) {
  if (!image) return null;
  if (image.endsWith(".jpg") || image.endsWith(".png") || image.endsWith(".webp")) {
    return image;
  }
  return `${image}.jpg`;
}

function getAssetUrl(asset?: string | null) {
  if (!asset) return null;
  if (
    asset.endsWith(".jpg") ||
    asset.endsWith(".png") ||
    asset.endsWith(".webp") ||
    asset.endsWith(".svg")
  ) {
    return asset;
  }
  return `${asset}.png`;
}

type Product = {
  title: string | null;
  set_name: string | null;
  card_number: string | null;
  language: string | null;
  rarity: string | null;
  condition: string | null;
  illustrator: string | null;
  description: string | null;
  stock: number | null;
  price_cents: number | null;
  front_image_url: string | null;
  back_image_url: string | null;
  tcgdex_id?: string | null;
};

type SearchCard = {
  id: string;
  name: string;
  localId?: string | null;
  image?: string | null;
  setCode?: string | null;
  setName?: string | null;
  setLogo?: string | null;
  setSymbol?: string | null;
};

type FullCard = {
  id: string;
  name: string;
  localId?: string | null;
  image?: string | null;
  rarity?: string | null;
  illustrator?: string | null;
  description?: string | null;
  set?: {
    id?: string;
    name?: string;
    logo?: string;
    symbol?: string;
  } | null;
};

export default function EditCardForm({
  product,
  action,
}: {
  product: Product;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [query, setQuery] = useState(product.title ?? "");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasEditedQuery, setHasEditedQuery] = useState(false);

  const [selectedCardId, setSelectedCardId] = useState(product.tcgdex_id ?? "");
  const [selectedLanguage, setSelectedLanguage] = useState(product.language ?? "EN");

  const [title, setTitle] = useState(product.title ?? "");
  const [setName, setSetName] = useState(product.set_name ?? "");
  const [cardNumber, setCardNumber] = useState(product.card_number ?? "");
  const [rarity, setRarity] = useState(product.rarity ?? "");
  const [condition, setCondition] = useState(product.condition ?? "");
  const [illustrator, setIllustrator] = useState(product.illustrator ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [stock, setStock] = useState(String(product.stock ?? 0));
  const [priceEur, setPriceEur] = useState(
    ((product.price_cents ?? 0) / 100).toFixed(2)
  );

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setShowResults(false);
    }
  }

  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleEscape);
  };
}, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!hasEditedQuery) return;

    if (trimmed.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/pokemon/search?q=${encodeURIComponent(trimmed)}&language=${encodeURIComponent(selectedLanguage)}`
        );

        const data = await res.json();
        const cards = data.cards ?? [];
        setResults(cards);
        setShowResults(true);
      } catch {
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedLanguage, hasEditedQuery]);

  async function handleSelect(card: SearchCard) {
  setSelectedCardId(card.id);
  setQuery(card.name ?? "");
  setTitle(card.name ?? "");
  setSetName(card.setName ?? "");
  setCardNumber(card.localId ?? "");
  setResults([]);
  setShowResults(false);
  setHasEditedQuery(false);

  try {
    const res = await fetch(
      `/api/pokemon/card/${encodeURIComponent(card.id)}?language=${encodeURIComponent(selectedLanguage)}`
    );

    if (!res.ok) return;

    const data = await res.json();
    const fullCard: FullCard | null = data.card ?? null;

    if (!fullCard) return;

    setSelectedCardId(fullCard.id || card.id);
setTitle(fullCard.name || card.name || "");
setSetName(fullCard.set?.name || card.setName || "");
setCardNumber(
  fullCard.localId != null && fullCard.localId !== ""
    ? String(fullCard.localId)
    : card.localId != null
      ? String(card.localId)
      : ""
);
setRarity(fullCard.rarity || rarity || "");
setIllustrator(fullCard.illustrator || illustrator || "");
setDescription(fullCard.description || description || "");
setQuery(fullCard.name || card.name || "");
  } catch {
    // keep optimistic selection
  }
}

  return (
    <form
      action={action}
      className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2" ref={wrapperRef}>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Search Pokémon card
          </label>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedCardId("");
                setHasEditedQuery(true);
              }}
              onFocus={() => {
                if (results.length > 0) setShowResults(true);
              }}
              placeholder="Try: Charizard 199"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />

            {showResults && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-950">
                {loading ? (
                  <div className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  results.map((card) => {
                    const previewImage = getImageUrl(card.image);
                    const setLogo = getAssetUrl(card.setLogo);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onMouseDown={(e) => {
 e.preventDefault();
  console.log("selected", card.id, card.name);
  handleSelect(card);
}}

                        className="flex w-full items-center gap-3 border-b border-stone-100 px-4 py-3 text-left transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
                      >
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={card.name}
                            className="h-12 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-stone-100 text-[10px] text-stone-400 dark:bg-stone-800">
                            No img
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                            {card.name}
                          </p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {card.setName || card.setCode || "Unknown set"} • Card #{card.localId || "?"}
                          </p>
                        </div>

                        {setLogo ? (
                          <img
                            src={setLogo}
                            alt={card.setName || "Set logo"}
                            className="h-8 w-8 shrink-0 object-contain"
                          />
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
                    No results found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <input type="hidden" name="tcgdex_id" value={selectedCardId} />

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Title
          </label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Charizard ex #199"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Set name
          </label>
          <input
            name="set_name"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            placeholder="Obsidian Flames"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Card number
          </label>
          <input
            name="card_number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="199/197"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Language
          </label>
          <select
            name="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          >
            <option value="EN">English (EN)</option>
            <option value="JP">Japanese (JP)</option>
            <option value="PT">Portuguese (PT)</option>
            <option value="ES">Spanish (ES)</option>
            <option value="FR">French (FR)</option>
            <option value="DE">German (DE)</option>
            <option value="KO">Korean (KO)</option>
            <option value="ZH-TW">Traditional Chinese (ZH-TW)</option>
            <option value="ZH-CN">Simplified Chinese (ZH-CN)</option>
            <option value="TH">Thai (TH)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Rarity
          </label>
          <input
            name="rarity"
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            placeholder="Illustration Rare"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Condition
          </label>
          <input
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Near Mint"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Illustrator
          </label>
          <input
            name="illustrator"
            value={illustrator}
            onChange={(e) => setIllustrator(e.target.value)}
            placeholder="Akira Egawa"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Price (EUR)
          </label>
          <input
            name="price_eur"
            type="number"
            min="0"
            step="0.01"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
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
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Current front image
          </label>
          <div className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-950">
            {product.front_image_url ? (
              <img
                src={product.front_image_url}
                alt={`${title || "Card"} front`}
                className="h-56 w-full object-contain"
              />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-stone-500 dark:text-stone-400">
                No front image
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Current back image
          </label>
          <div className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-950">
            {product.back_image_url ? (
              <img
                src={product.back_image_url}
                alt={`${title || "Card"} back`}
                className="h-56 w-full object-contain"
              />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-stone-500 dark:text-stone-400">
                No back image
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Replace front image
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
            Replace back image
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes about the card..."
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/catalog"
          className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
        >
          Cancel
        </a>

        <button
          type="submit"
          className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}