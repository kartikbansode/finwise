"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase";

import InvoiceItemsTable from "@/components/invoices/InvoiceItemsTable";
import InvoiceTotals from "@/components/invoices/InvoiceTotals";

export default function NewInvoicePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");

  const [companyAddress, setCompanyAddress] = useState("");

  const [companyGST, setCompanyGST] = useState("");

  const [clientName, setClientName] = useState("");

  const [clientEmail, setClientEmail] = useState("");

  const [clientAddress, setClientAddress] = useState("");

  const [clientGST, setClientGST] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [dueDate, setDueDate] = useState("");

  const [discount, setDiscount] = useState(0);

  const [notes, setNotes] = useState("");

  const [terms, setTerms] = useState("Payment due within 15 days.");

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      unit_price: 0,
      gst_percentage: 18,
    },
  ]);

  async function createInvoice() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    const gstAmount = items.reduce(
      (sum, item) =>
        sum + item.quantity * item.unit_price * (item.gst_percentage / 100),
      0,
    );

    const total = subtotal + gstAmount - discount;

    const invoiceNumber = `INV-${Date.now()}`;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,

        invoice_number: invoiceNumber,

        company_name: companyName,

        company_address: companyAddress,

        company_gst: companyGST,

        client_name: clientName,

        client_email: clientEmail,

        client_address: clientAddress,

        client_gst: clientGST,

        invoice_date: invoiceDate,

        due_date: dueDate || null,

        subtotal,

        gst_amount: gstAmount,

        total_amount: total,

        discount,

        notes,

        terms,

        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    console.log(invoice);
    console.log(error);

    const invoiceItems = items
      .filter((item) => item.description.trim() !== "")
      .map((item) => ({
        invoice_id: invoice.id,

        description: item.description,

        quantity: Number(item.quantity),

        unit_price: Number(item.unit_price),

        gst_percentage: Number(item.gst_percentage),

        amount: Number(item.quantity) * Number(item.unit_price),
      }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Items save error:", itemsError);
    }

    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Invoice</h1>

          <p className="text-gray-500 mt-2">Professional GST Invoice</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Company Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  value={companyGST}
                  onChange={(e) => setCompanyGST(e.target.value)}
                  placeholder="GST Number"
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <textarea
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Company Address"
                className="border rounded-xl px-4 py-3 w-full mt-4"
                rows={3}
              />
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Client Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Name"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client Email"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  value={clientGST}
                  onChange={(e) => setClientGST(e.target.value)}
                  placeholder="Client GST"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client Address"
                className="border rounded-xl px-4 py-3 w-full mt-4"
                rows={3}
              />
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Invoice Dates</h2>

              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="border rounded-xl px-4 py-3"
              />
            </div>

            <InvoiceItemsTable items={items} setItems={setItems} />

            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Notes</h2>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
                rows={4}
              />
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Terms & Conditions</h2>

              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6">
              <label className="block mb-2 font-medium">Discount</label>

              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <InvoiceTotals items={items} discount={discount} />

            <button
              onClick={createInvoice}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
