import { HomeGlowingGrid } from "@/components/home-glowing-grid";

export default function Page() {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          English Cheatsheet
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Quick access and upcoming sections of the project.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
        <HomeGlowingGrid />
      </section>
    </div>
  );
}
