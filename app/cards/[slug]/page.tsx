import Link from "next/link";
import { notFound } from "next/navigation";
import { cards } from "@/lib/cards";
import CardImageModal from "@/components/card-image-modal";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CardDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const card = cards.find((item) => item.slug === slug);

  if (!card) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <section className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Card detail
            </p>
            <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {card.name}
            </h1>
          </div>

          <Link
            href="/cards"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
          >
            Back to cards
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <CardImageModal
            frontSrc={card.frontImage}
            backSrc={card.backImage}
            cardName={card.name}
          />

          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              {card.game}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
              {card.name}
            </h2>

            <p className="mt-2 text-base text-stone-600 dark:text-stone-400">
              {card.set} • {card.number}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Condition: {card.condition}
              </span>
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Rarity: {card.rarity}
              </span>
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Language: {card.language}
              </span>
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Price: €{card.price.toLocaleString("en-GB")}
              </span>
            </div>

            <div className="mt-8 space-y-4 text-base leading-7 text-stone-600 dark:text-stone-400">
              <p>{card.notes}</p>
              <p>
                Sale status: {card.forSale ? "Available" : "Not currently for sale"}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/contact?card=${encodeURIComponent(card.name)}`}
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                Contact / reserve
              </Link>
              <a
                href="https://www.cardmarket.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white"
              >
                View Cardmarket
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}