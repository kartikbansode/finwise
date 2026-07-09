export default function ProjectBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      ⚠️ FinWise is currently under development. Financial data, balances, tax
      calculations, reports, and analytics may be inaccurate. Do not rely on
      this application for financial or tax decisions. The developer is not
      responsible for any losses or damages arising from its use.
    </div>
  );
}
