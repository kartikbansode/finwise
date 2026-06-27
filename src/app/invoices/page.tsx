"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import MobileBlocker from "@/components/MobileBlocker";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  status: string;
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const filteredInvoices = invoices.filter((invoice) =>
    statusFilter === "all" ? true : invoice.status === statusFilter,
  );

  const invoiceStats = {
    total: invoices.length,
    paid: invoices.filter((invoice) => invoice.status === "paid").length,
    pending: invoices.filter((invoice) => invoice.status === "pending").length,
    draft: invoices.filter((invoice) => invoice.status === "draft").length,
    overdue: invoices.filter((invoice) => invoice.status === "overdue").length,
  };

  async function loadInvoices() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setInvoices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  async function deleteInvoice(id: string) {
    await supabase.from("invoices").delete().eq("id", id);

    loadInvoices();
  }
  async function updateStatus(id: string, status: string) {
    await supabase.from("invoices").update({ status }).eq("id", id);

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice,
      ),
    );
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  if (isMobile) return <MobileBlocker />;

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="p-5">
          <CardHeader className="items-start gap-4 sm:flex sm:justify-between sm:items-end">
            <div>
              <CardTitle>Invoice Tracker</CardTitle>
              <CardDescription>Track invoice status, payments and overdue follow-up.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/invoices/new">+ New Invoice</Link>
              </Button>
              <Button onClick={loadInvoices} variant="secondary" size="sm">
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="p-5">
            <CardTitle>Total</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                {invoiceStats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Paid</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-emerald-600">
                {invoiceStats.paid}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Pending</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-amber-600">
                {invoiceStats.pending}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Draft</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-600">
                {invoiceStats.draft}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Review current invoices, update status and manage launches.
              </p>
            </div>

            <div className="relative max-w-xs w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="all">All Invoices</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No invoices yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{invoice.client_name}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{Number(invoice.total_amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : invoice.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : invoice.status === "draft"
                            ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}> 
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/invoices/${invoice.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {loading ? (
          <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No invoices yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="p-4 text-left">Invoice</th>

                <th className="p-4 text-left">Client</th>

                <th className="p-4 text-left">Amount</th>

                <th className="p-4 text-left">Status</th>

                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices
                .filter((invoice) =>
                  statusFilter === "all"
                    ? true
                    : invoice.status === statusFilter,
                )
                .map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="
  border-b border-gray-100 dark:border-zinc-800
  hover:bg-gray-50 dark:hover:bg-zinc-800/50
"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </td>

                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {invoice.client_name}
                    </td>

                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                      ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <div className="relative inline-block">
                        <select
                          value={invoice.status}
                          onChange={(e) =>
                            updateStatus(invoice.id, e.target.value)
                          }
                          className={`
px-3 py-2
rounded-lg
text-sm
font-medium
border
appearance-none
pr-8
focus:outline-none
cursor-pointer


${
  invoice.status === "paid"
    ? `
      bg-green-100
      text-green-800
      border-green-300

      dark:bg-green-950/40
      dark:text-green-300
      dark:border-green-700
    `
    : invoice.status === "pending"
      ? `
      bg-amber-100
      text-amber-800
      border-amber-300

      dark:bg-amber-950/40
      dark:text-amber-300
      dark:border-amber-700
    `
      : invoice.status === "draft"
        ? `
      bg-zinc-100
      text-zinc-700
      border-zinc-300

      dark:bg-zinc-800
      dark:text-zinc-300
      dark:border-zinc-700
    `
        : `
      bg-red-100
      text-red-800
      border-red-300

      dark:bg-red-950/40
      dark:text-red-300
      dark:border-red-700
    `
}
`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <span
                          className="
  absolute
  right-3
  top-1/2
  -translate-y-1/2
  pointer-events-none
  text-current
  text-xs
"
                        >
                          ▼
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-emerald-600 hover:text-emerald-500 mr-4"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
