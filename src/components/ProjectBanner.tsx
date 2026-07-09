export default function ProjectBanner() {
  return (
    <div className="w-full border-b border-amber-300 bg-amber-100 dark:border-amber-900 dark:bg-amber-950">
      <div className="mx-auto flex max-w-screen-2xl items-start gap-3 px-4 py-3 text-xs leading-relaxed text-amber-900 sm:px-6 sm:text-sm dark:text-amber-100">
        <span className="mt-0.5 text-base">⚠️</span>

        <p>
          <span className="font-semibold">
            Development Preview:
          </span>{" "}
          FinWise is currently under active development and is not production
          ready. Financial figures, tax calculations, balances, reports, and
          analytics shown in this application may be inaccurate or incomplete.
          Do <span className="font-semibold">not</span> rely on any displayed
          amounts for financial, tax, legal, or business decisions. The
          developer accepts no responsibility or liability for any loss,
          damages, or decisions made using this application.
        </p>
      </div>
    </div>
  );
}
