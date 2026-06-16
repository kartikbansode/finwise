"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

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

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold">Invoice Tracker</h2>

          <p className="text-gray-500 text-sm">
            Track invoice status and payments
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl"
        >
          + New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoices</h1>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white"
          >
            <option value="all">All Invoices</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-xl p-5 bg-gray-50">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </div>

          <div className="border rounded-xl p-5 bg-gray-50">
            <p className="text-gray-500 text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {invoices.filter((i) => i.status === "paid").length}
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-gray-50">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {invoices.filter((i) => i.status === "pending").length}
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-gray-50">
            <p className="text-gray-500 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-600">
              {invoices.filter((i) => i.status === "draft").length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">No invoices yet.</div>
        ) : (
          <table className="w-full">
            <thead className="border-b bg-gray-50">
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
                  <tr key={invoice.id} className="border-b">
                    <td className="p-4 font-medium">
                      {invoice.invoice_number}
                    </td>

                    <td className="p-4">{invoice.client_name}</td>

                    <td className="p-4">
                      ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          updateStatus(invoice.id, e.target.value)
                        }
                        className={`
      px-3 py-2 rounded-lg border text-sm font-medium
      ${
        invoice.status === "paid"
          ? "bg-green-50 text-green-700 border-green-200"
          : invoice.status === "pending"
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : invoice.status === "draft"
              ? "bg-gray-50 text-gray-700 border-gray-200"
              : "bg-red-50 text-red-700 border-red-200"
      }
    `}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-emerald-600 mr-4"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-600"
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
