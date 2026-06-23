export default function PageLoader({
  title = "Loading...",
  subtitle = "Please wait a moment.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="text-zinc-500 mt-2">
          {subtitle}
        </p>
      </div>
    </main>
  );
}