import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      <section className="border-b">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <h1 className="text-2xl font-bold">
            FinWise India
          </h1>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="border px-4 py-2 rounded-lg"
            >
              Login
            </Link>

            <Link
              href="/login"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>

        </div>

      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">

        <div className="inline-flex bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm mb-6">
          Built for Indian Freelancers & Businesses
        </div>

        <h1 className="text-6xl font-bold leading-tight max-w-5xl mx-auto">
          Manage Income,
          Taxes, Invoices
          and Cash Flow
          in One Place
        </h1>

        <p className="text-xl text-gray-600 mt-8 max-w-3xl mx-auto">
          FinWise helps freelancers, agencies,
          consultants and business owners
          understand taxes, monitor finances,
          and make smarter decisions.
        </p>

        <div className="flex justify-center gap-4 mt-10">

          <Link
            href="/login"
            className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg"
          >
            Start Free
          </Link>

          {/* <Link
            href="/dashboard"
            className="border px-8 py-4 rounded-xl text-lg"
          >
            View Dashboard
          </Link> */}

        </div>

      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="border rounded-2xl p-6">
            <h3 className="font-bold text-xl">
              Income Tracking
            </h3>

            <p className="text-gray-600 mt-3">
              Track all client payments,
              invoices and revenue.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <h3 className="font-bold text-xl">
              Tax Center
            </h3>

            <p className="text-gray-600 mt-3">
              GST, advance tax,
              44ADA and 44AD support.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <h3 className="font-bold text-xl">
              Business Insights
            </h3>

            <p className="text-gray-600 mt-3">
              Know where your money goes
              and how much is safe to spend.
            </p>
          </div>

        </div>

      </section>

      <section className="bg-slate-900 text-white py-24">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-5xl font-bold">
            Stop Guessing Your Taxes
          </h2>

          <p className="mt-6 text-slate-300 text-xl">
            Join freelancers and business owners
            who want clarity over their finances.
          </p>

          <Link
            href="/login"
            className="inline-block mt-10 bg-emerald-600 px-8 py-4 rounded-xl text-lg"
          >
            Create Free Account
          </Link>

        </div>

      </section>

    </main>
  );
}