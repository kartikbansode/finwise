"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import { processRecurringExpenses } from "@/lib/processRecurringExpenses";
import MobileBlocker from "@/components/MobileBlocker";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseEntry {
  id: string;
  description: string;
  vendor: string | null;
  amount: number;
  category: string;
  expense_type: string;
  gst_paid: boolean;
  payment_method: string;
  recurring: boolean;
  recurring_frequency: string;
  business_personal: string;
  notes: string | null;
  entry_date: string;
  next_due_date: string | null;
  recurrence_end_date: string | null;
  auto_generated: boolean;
  parent_recurring_id: string | null;
}

const EXPENSE_CATEGORIES = [
  "rent",
  "salary",
  "utilities",
  "marketing",
  "software",
  "travel",
  "other",
];

const CHART_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

function calculateNextDate(currentDate: string, frequency: string) {
  const date = new Date(currentDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "half_yearly":
      date.setMonth(date.getMonth() + 6);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      if (frequency.startsWith("custom_")) {
        const months = Number(frequency.replace("custom_", ""));
        date.setMonth(date.getMonth() + months);
      }
      break;
  }

  return date.toISOString().split("T")[0];
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ExpensesPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [vendor, setVendor] = useState("");
  const [expenseType, setExpenseType] = useState("variable");
  const [gstPaid, setGstPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [recurringFrequency, setRecurringFrequency] = useState("one_time");
  const [customMonths, setCustomMonths] = useState("1");
  const [businessPersonal, setBusinessPersonal] = useState("business");
  const [notes, setNotes] = useState("");
  const [dateFilter, setDateFilter] = useState("this_month");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadEntries() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("expense_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setEntries(data as ExpenseEntry[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      await processRecurringExpenses();
      await loadEntries();
    }

    initialize();
  }, []);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 900);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const entryDateValue = new Date(entry.entry_date);
    const now = new Date();

    switch (dateFilter) {
      case "this_month":
        return (
          entryDateValue.getMonth() === now.getMonth() &&
          entryDateValue.getFullYear() === now.getFullYear()
        );
      case "last_month": {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return (
          entryDateValue.getMonth() === lastMonth.getMonth() &&
          entryDateValue.getFullYear() === lastMonth.getFullYear()
        );
      }
      case "last_3_months": {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return entryDateValue >= threeMonthsAgo;
      }
      case "this_year":
        return entryDateValue.getFullYear() === now.getFullYear();
      case "all_time":
      default:
        return true;
    }
  });

  const totalExpenses = filteredEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const totalTransactions = filteredEntries.length;
  const averageExpense = totalTransactions ? totalExpenses / totalTransactions : 0;

  const vendorTotals = filteredEntries.reduce<Record<string, number>>(
    (acc, entry) => {
      const name = entry.vendor?.trim() || entry.description || "Unknown";
      acc[name] = (acc[name] || 0) + entry.amount;
      return acc;
    },
    {},
  );

  const topVendor = Object.entries(vendorTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name)[0] || "-";

  const recurringAmount = filteredEntries
    .filter((entry) => entry.recurring)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const businessExpense = filteredEntries
    .filter((entry) => entry.business_personal === "business")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const personalExpense = filteredEntries
    .filter((entry) => entry.business_personal === "personal")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const monthlyMap = new Map<string, { key: string; month: string; amount: number }>();

  filteredEntries.forEach((entry) => {
    const date = new Date(entry.entry_date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = date.toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });

    const existing = monthlyMap.get(key);
    if (existing) {
      existing.amount += entry.amount;
    } else {
      monthlyMap.set(key, { key, month, amount: entry.amount });
    }
  });

  const chartData = Array.from(monthlyMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key),
  );

  const categoryMap = new Map<string, number>();
  filteredEntries.forEach((entry) => {
    categoryMap.set(entry.category, (categoryMap.get(entry.category) || 0) + entry.amount);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const expenseGrowth = chartData.length > 1
    ? Math.round(
        ((chartData[chartData.length - 1].amount -
          chartData[chartData.length - 2].amount) /
          Math.max(chartData[chartData.length - 2].amount, 1)) *
          100,
      )
    : 0;

  const highestExpenseMonth = chartData.reduce<{ month: string; amount: number } | null>(
    (acc, item) => {
      if (!acc || item.amount > acc.amount) return item;
      return acc;
    },
    null,
  );

  const topVendors = Object.entries(vendorTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError("Please enter a valid description and amount.");
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("expense_entries").insert({
      user_id: userData.user.id,
      description: description.trim(),
      vendor,
      amount: Number(amount),
      category,
      expense_type: expenseType,
      gst_paid: gstPaid,
      payment_method: paymentMethod,
      recurring: recurringFrequency !== "one_time",
      recurring_frequency:
        recurringFrequency === "custom"
          ? `custom_${customMonths}`
          : recurringFrequency,
      business_personal: businessPersonal,
      notes,
      entry_date: new Date().toISOString().split("T")[0],
      next_due_date:
        recurringFrequency !== "one_time"
          ? calculateNextDate(
              new Date().toISOString().split("T")[0],
              recurringFrequency === "custom"
                ? `custom_${customMonths}`
                : recurringFrequency,
            )
          : null,
      auto_generated: false,
      parent_recurring_id: null,
    });

    if (insertError) {
      setError("Unable to add expense. Please try again.");
    } else {
      setDescription("");
      setVendor("");
      setAmount("");
      setCategory("other");
      setExpenseType("variable");
      setGstPaid(false);
      setPaymentMethod("bank_transfer");
      setRecurringFrequency("one_time");
      setCustomMonths("1");
      setBusinessPersonal("business");
      setNotes("");
      await loadEntries();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("expense_entries").delete().eq("id", id);
    await loadEntries();
  }

  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return <MobileBlocker />;
  }

  if (loading || isMobile === null) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Expense Center
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing expense analytics...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="p-6">
          <CardHeader className="items-start gap-4 sm:flex sm:justify-between sm:items-end">
            <div>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Manage spend, recurring commitments, and strategic vendor insights in one interface.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
                <option value="all_time">All Time</option>
              </select>
              <Button onClick={loadEntries} variant="secondary" size="sm">
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <CardTitle>Total Expenses</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Average Expense</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(Math.round(averageExpense))}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Top Vendor</CardTitle>
            <CardContent>
              <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white truncate">
                {topVendor}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Transactions</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                {totalTransactions}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Expense Growth</CardTitle>
            <CardContent>
              <p className={`mt-3 text-3xl font-semibold ${expenseGrowth >= 0 ? "text-red-500" : "text-emerald-500"}`}>
                {expenseGrowth >= 0 ? "+" : ""}
                {expenseGrowth}%
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Recurring Spend</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(recurringAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardTitle>Highest Month</CardTitle>
            <CardContent>
              <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                {highestExpenseMonth?.month || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader className="items-start gap-4 sm:flex sm:justify-between sm:items-end">
            <div>
              <CardTitle>Add Expense</CardTitle>
              <CardDescription>
                Capture spend immediately with category, vendor, payment, and GST details.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleAdd} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Office rent, utilities, software"
                  className="bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
                <Input
                  type="text"
                  value={vendor}
                  onChange={(event) => setVendor(event.target.value)}
                  placeholder="Google, Adobe, Rent"
                  className="bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="15000"
                  className="bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Type</label>
                <select
                  value={expenseType}
                  onChange={(event) => setExpenseType(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="fixed">Fixed Expense</option>
                  <option value="variable">Variable Expense</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Usage</label>
                <select
                  value={businessPersonal}
                  onChange={(event) => setBusinessPersonal(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recurring Schedule</label>
                <select
                  value={recurringFrequency}
                  onChange={(event) => setRecurringFrequency(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="one_time">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="2_months">Every 2 Months</option>
                  <option value="3_months">Every 3 Months</option>
                  <option value="6_months">Every 6 Months</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                {recurringFrequency === "custom" && (
                  <Input
                    type="number"
                    min="1"
                    value={customMonths}
                    onChange={(event) => setCustomMonths(event.target.value)}
                    className="bg-white dark:bg-zinc-950"
                    placeholder="Months"
                  />
                )}
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GST Paid</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGstPaid(!gstPaid)}
                  className={`w-16 rounded-full p-1 transition ${gstPaid ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"}`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${gstPaid ? "translate-x-7" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Expense"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Expense ledger</CardTitle>
            <CardDescription>
              Review entries and delete any outdated records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredEntries.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                No expenses logged for the selected period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Vendor</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">GST</th>
                      <th className="px-4 py-3 font-medium">Recurring</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{entry.vendor || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-gray-900 dark:text-white">
                              {entry.auto_generated ? "🔁 " : ""}
                              {entry.description}
                            </p>
                            {entry.notes ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-45">
                                {entry.notes}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">{entry.category}</td>
                        <td className="px-4 py-3">
                          {entry.auto_generated ? (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Auto Generated
                            </span>
                          ) : entry.recurring ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Recurring
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                              One-Time
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 capitalize">{entry.expense_type}</td>
                        <td className="px-4 py-3 capitalize">{entry.payment_method.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3">{entry.gst_paid ? <span className="text-emerald-500">Yes</span> : <span className="text-gray-400">No</span>}</td>
                        <td className="px-4 py-3 capitalize text-blue-500">{entry.recurring_frequency.replaceAll("_", " ") || "One Time"}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(entry.entry_date).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(entry.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteId(entry.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-6">
            <CardTitle>Expense Trend</CardTitle>
            <CardDescription>Visualize how your expenses evolve month to month.</CardDescription>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value: any) => (typeof value === 'number' ? formatCurrency(value) : String(value))} />
                  <Area type="monotone" dataKey="amount" stroke="#ef4444" fill="#ef444420" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Category share for the selected range.</CardDescription>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <CardTitle>Top Vendors</CardTitle>
            <CardDescription>Suppliers driving the highest spend.</CardDescription>
            <div className="mt-6 space-y-4">
              {topVendors.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No vendors found.</p>
              ) : (
                topVendors.map(([vendorName, amount], index) => (
                  <div key={vendorName} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{index + 1}</div>
                      <span className="font-medium text-gray-900 dark:text-white">{vendorName}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 border-emerald-500/20">
            <CardTitle>Business Expenses</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-emerald-600">{formatCurrency(businessExpense)}</p>
            </CardContent>
          </Card>
          <Card className="p-6 border-blue-500/20">
            <CardTitle>Personal Expenses</CardTitle>
            <CardContent>
              <p className="mt-3 text-3xl font-semibold text-blue-600">{formatCurrency(personalExpense)}</p>
            </CardContent>
          </Card>
        </div>

        <TaxDisclaimer />
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Expense Entry</h3>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              This expense record will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await handleDelete(deleteId);
                    setDeleteId(null);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
