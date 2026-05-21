import Link from "next/link";
import { cards } from "@/lib/cards";
import Image from "next/image";

const featuredCards = cards.filter((card) => card.featured).slice(0, 3);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Personal collection
            </p>
            <h2 className="max-w-xl text-4xl font-bold tracking-tight text-stone-950 md:text-5xl dark:text-white">
              A curated catalog of trading cards and collectible products.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 dark:text-stone-400">
              Browse featured cards, check condition and pricing, and follow my
              collection as I expand the catalog with singles and sealed
              products.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cards"
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                Browse cards
              </Link>
              <a
                href="#about"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
              >
                About the catalog
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-100 p-4 dark:bg-stone-800">
                <p className="text-sm text-stone-500 dark:text-stone-400">Cards listed</p>
                <p className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
                  {cards.length}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-4 dark:bg-stone-800">
                <p className="text-sm text-stone-500 dark:text-stone-400">Games covered</p>
                <p className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
                  {new Set(cards.map((card) => card.game)).size}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-4 dark:bg-stone-800">
                <p className="text-sm text-stone-500 dark:text-stone-400">Available items</p>
                <p className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
                  {cards.filter((card) => card.forSale).length}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 p-4 dark:bg-stone-800">
                <p className="text-sm text-stone-500 dark:text-stone-400">Price style</p>
                <p className="mt-2 text-lg font-semibold text-stone-950 dark:text-white">
                  Manual pricing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Featured cards
            </p>
            <h3 className="mt-2 text-2xl font-bold text-stone-950 dark:text-white">
              Spotlight cards
            </h3>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Most recent or most valuable
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredCards.map((card) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <Image
                src={card.frontImage}
                alt={`${card.name} front`}
                width={600}
                height={840}
                quality={100}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="aspect-[3/4] w-full object-cover bg-white dark:bg-stone-950"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-stone-950 dark:text-white">
                      {card.name}
                    </h4>
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
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="border-t border-stone-200 bg-white py-16 md:py-20 dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              About
            </p>
            <h3 className="mt-2 text-2xl font-bold text-stone-950 dark:text-white">
              Built as a personal catalog first
            </h3>
          </div>
          <div>
            <p className="text-base leading-7 text-stone-600 dark:text-stone-400">
              This website is being built as a clean catalog for my trading card
              collection, with room to expand into product listings, front and
              back card photos, and direct links to my Cardmarket store.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}