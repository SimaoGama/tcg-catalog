"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cards } from "@/lib/cards";
import Image from "next/image";

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCards = useMemo(() => {
    const results = cards.filter((card) => {
      const matchesSearch = card.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesGame = selectedGame === "" || card.game === selectedGame;
      const matchesCondition =
        selectedCondition === "" || card.condition === selectedCondition;

      return matchesSearch && matchesGame && matchesCondition;
    });

    switch (sortBy) {
      case "name-asc":
        return [...results].sort((a, b) => a.name.localeCompare(b.name));
      case "price-asc":
        return [...results].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...results].sort((a, b) => b.price - a.price);
      default:
        return results;
    }
  }, [searchTerm, selectedGame, selectedCondition, sortBy]);

  function resetFilters() {
    setSearchTerm("");
    setSelectedGame("");
    setSelectedCondition("");
    setSortBy("featured");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
              }`}
            >
              List
            </button>
          </div>

          <p className="text-sm text-stone-500 dark:text-stone-400">
            {filteredCards.length} of {cards.length} items
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-5 md:grid-cols-5 dark:border-stone-800 dark:bg-stone-900">
          <input
            type="text"
            placeholder="Search by card name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
          />

          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All games</option>
            <option value="Pokémon">Pokémon</option>
            <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
            <option value="Magic: The Gathering">Magic: The Gathering</option>
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All conditions</option>
            <option value="Near Mint">Near Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Played">Played</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="featured">Featured</option>
            <option value="name-asc">Name A–Z</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
          </select>

          <button
            onClick={resetFilters}
            className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Reset filters
          </button>
        </div>

        {filteredCards.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-xl font-semibold text-stone-950 dark:text-white">
              No cards found
            </h3>
            <p className="mt-3 text-stone-600 dark:text-stone-400">
              Try changing your search or clearing the filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card) => (
              <article
                key={card.id}
                className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="group relative aspect-[3/4] w-full overflow-hidden bg-white dark:bg-stone-950">
                  <Image
                    src={card.frontImage}
                    alt={`${card.name} front`}
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain transition duration-200 group-hover:scale-[1.02] group-hover:opacity-0"
                  />
                  <Image
                    src={card.backImage}
                    alt={`${card.name} back`}
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain opacity-0 transition duration-200 group-hover:scale-[1.02] group-hover:opacity-100"
                  />

                  <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-stone-700 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-stone-900/90 dark:text-stone-200">
                    Back preview
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-950 dark:text-white">
                        {card.name}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {card.game} • {card.set}
                      </p>
                    </div>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                      {card.condition}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-lg font-bold text-stone-950 dark:text-white">
                      €{card.price.toLocaleString("en-GB")}
                    </p>

                    <Link
                      href={`/cards/${card.slug}`}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <article
                key={card.id}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-5">
                    <div className="group relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-stone-950">
                      <Image
                        src={card.frontImage}
                        alt={`${card.name} front`}
                        fill
                        quality={100}
                        sizes="80px"
                        className="object-cover transition duration-200 group-hover:scale-[1.03] group-hover:opacity-0"
                      />
                      <Image
                        src={card.backImage}
                        alt={`${card.name} back`}
                        fill
                        quality={100}
                        sizes="80px"
                        className="object-cover opacity-0 transition duration-200 group-hover:scale-[1.03] group-hover:opacity-100"
                      />

                      <div className="pointer-events-none absolute inset-x-1 top-1 rounded-full bg-white/90 px-2 py-1 text-center text-[10px] font-medium text-stone-700 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-stone-900/90 dark:text-stone-200">
                        Back
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-stone-950 dark:text-white">
                        {card.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {card.game} • {card.set}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                          {card.condition}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                          €{card.price.toLocaleString("en-GB")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/cards/${card.slug}`}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}