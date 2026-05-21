import BackButton from "@/components/BackButton";
import ThemeToggle from "@/components/theme-toggle";

type ContactPageProps = {
  searchParams?: Promise<{
    card?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const selectedCard = params?.card ?? "";

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <BackButton label="Back" />
          <ThemeToggle />
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Contact
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
            Ask about a card
          </h1>

          <p className="mt-4 text-stone-600 dark:text-stone-400">
            Use this page to ask questions, request more photos, or reserve a card.
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
                Name
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
                Card
              </label>
              <input
                type="text"
                defaultValue={selectedCard}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="Which card are you asking about?"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="Write your message"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}