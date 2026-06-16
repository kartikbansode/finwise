"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { createClient } from "@/lib/supabase";
export default function InvoiceViewPage() {
  const supabase = createClient();

  const params = useParams();

  const [invoice, setInvoice] = useState<any>(null);

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadInvoice();
  }, []);

  function formatCurrency(amount: number) {
    return Number(amount).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }

  async function loadInvoice() {
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", params.id)
      .single();

    setInvoice(invoiceData);

    const { data: itemsData } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", params.id);

    setItems(itemsData || []);
  }

  if (!invoice) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <div className="bg-white max-w-[210mm] mx-auto p-12">
        {/* <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invoice</h1>
        </div>*/}

        <div className="border-b pb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {invoice.company_name}
            </h1>

            <p className="mt-3 text-gray-600">{invoice.company_address}</p>

            <p className="mt-2 text-sm">GSTIN: {invoice.company_gst || "-"}</p>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold">TAX INVOICE</h2>

            <div className="mt-5 space-y-2 text-sm">
              <p>
                <span className="font-medium">Invoice No:</span>{" "}
                {invoice.invoice_number}
              </p>

              <p>
                <span className="font-medium">Date:</span>{" "}
                {invoice.invoice_date}
              </p>

              <p>
                <span className="font-medium">Due Date:</span>{" "}
                {invoice.due_date || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 py-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Bill To
            </p>

            <h3 className="text-xl font-semibold mt-3">
              {invoice.client_name}
            </h3>

            <p className="mt-2">{invoice.client_email}</p>

            <p className="mt-2 whitespace-pre-line">{invoice.client_address}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Client GST
            </p>

            <p className="mt-3">{invoice.client_gst || "-"}</p>
          </div>
        </div>

        <div className="overflow-hidden border rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4">Description</th>

                <th className="text-left px-6 py-4">Qty</th>

                <th className="text-left px-6 py-4">Rate</th>

                <th className="text-left px-6 py-4">GST</th>

                <th className="text-right px-6 py-4">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const lineTotal =
                  Number(item.quantity) * Number(item.unit_price);

                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4">{item.description}</td>

                    <td className="px-6 py-4">{item.quantity}</td>

                    <td className="px-6 py-4">
                      {formatCurrency(item.unit_price)}
                    </td>

                    <td className="px-6 py-4">{item.gst_percentage}%</td>

                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-10">
          <div className="w-[420px]">
            <div className="flex justify-between py-2">
              <span>Subtotal</span>

              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>GST</span>

              <span>{formatCurrency(invoice.gst_amount)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>Discount</span>

              <span>{formatCurrency(invoice.discount || 0)}</span>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between text-3xl font-bold">
              <span>Total</span>

              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t pt-8">
          <h3 className="font-semibold text-lg mb-4">Payment Information</h3>

          <p className="text-gray-600">
            Payment is due on or before {invoice.due_date || "the due date"}.
          </p>
        </div>

        <div className="flex justify-between mb-10">
          {invoice.notes && (
            <div className="mt-10">
              <h3 className="font-semibold mb-2">Notes</h3>

              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div className="mt-10">
              <h3 className="font-semibold mb-2">Terms & Conditions</h3>

              <p className="text-gray-600">{invoice.terms}</p>
            </div>
          )}
        </div>
        <div className="mt-20 flex justify-end">
          <div className="text-center">
            <div className="w-56 border-b mb-3" />

            <p className="text-sm">Authorized Signature</p>
          </div>
        </div>
      </div>
    </main>
  );
}
