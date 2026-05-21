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

export default function NewCardForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  const [title, setTitle] = useState("");
  const [setName, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [rarity, setRarity] = useState("");
  const [illustrator, setIllustrator] = useState("");
  const [description, setDescription] = useState("");

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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/pokemon/search?q=${encodeURIComponent(query)}&language=${encodeURIComponent(selectedLanguage)}`
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
  }, [query, selectedLanguage]);

  async function handleSelect(cardId: string) {
    try {
      const res = await fetch(
        `/api/pokemon/card/${encodeURIComponent(cardId)}?language=${encodeURIComponent(selectedLanguage)}`
      );
      const data = await res.json();
      const card: FullCard | null = data.card ?? null;

      if (!card) return;

      setSelectedCardId(card.id);
      setTitle(card.name ?? "");
      setSetName(card.set?.name ?? "");
      setCardNumber(card.localId ?? "");
      setRarity(card.rarity ?? "");
      setIllustrator(card.illustrator ?? "");
      setDescription(card.description ?? "");
      setQuery(card.name ?? "");
      setResults([]);
      setShowResults(false);
    } catch {
      setShowResults(false);
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
                        onClick={() => handleSelect(card.id)}
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
          Save card
        </button>
      </div>
    </form>
  );
}