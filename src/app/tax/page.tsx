"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import { calculate44ADA, calculate44AD } from "@/lib/presumptiveTax";
import MobileBlocker from "@/components/MobileBlocker";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaxPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setProfile(profileData);

    const { data: incomeData } = await supabase
      .from("income_entries")
      .select("*")
      .eq("user_id", userData.user.id);

    const { data: expenseData } = await supabase
      .from("expense_entries")
      .select("*")
      .eq("user_id", userData.user.id);

    const totalIncome = (incomeData || []).reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const projectedAnnual = totalIncome * 12;

    setAnnualIncome(projectedAnnual);

    let calculatedTaxable = projectedAnnual;

    if (profileData?.tax_method === "44ada") {
      calculatedTaxable = calculate44ADA(projectedAnnual).taxableIncome;
    }

    if (profileData?.tax_method === "44ad") {
      calculatedTaxable = calculate44AD(projectedAnnual).taxableIncome;
    }

    setTaxableIncome(calculatedTaxable);
    setLoading(false);
  }

  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return <MobileBlocker />;
  }

  if (loading) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading Tax & Compliance Center...
          </p>
        </div>
      </main>
    );
  }

  const taxMethodLabel = profile?.tax_method === "44ada"
    ? "44ADA"
    : profile?.tax_method === "44ad"
      ? "44AD"
      : "Normal";

  const gstStatus = profile?.gst_registered ? "Registered" : "Not Registered";

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Tax & compliance
            </p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              Tax Center
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Manage GST, advance tax, TDS and presumptive compliance from one professional dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">Update Profile</Link>
            </Button>
            <Button onClick={loadData} variant="secondary" size="sm">
              Refresh Data
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Annual Revenue</CardTitle>
              <CardDescription>Projected from your current monthly income.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
                ₹{annualIncome.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Taxable Income</CardTitle>
              <CardDescription>Estimated taxable value based on your tax regime.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
                ₹{taxableIncome.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Tax Method</CardTitle>
              <CardDescription>Your current compliance method.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
                {taxMethodLabel}
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>GST Status</CardTitle>
              <CardDescription>Track whether GST registration is active.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
                {gstStatus}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>GST Overview</CardTitle>
              <CardDescription>Review turnover and filing readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Annual Turnover:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">
                  ₹{annualIncome.toLocaleString("en-IN")}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Presumptive Taxation</CardTitle>
              <CardDescription>Understand how your taxable income is determined.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Current Method:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">
                  {profile?.tax_method || "Normal"}
                </span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Taxable Income:
                <span className="font-medium ml-2 text-gray-900 dark:text-white">
                  ₹{taxableIncome.toLocaleString("en-IN")}
                </span>
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Advance Tax</CardTitle>
              <CardDescription>Quarterly filing deadlines for business tax.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">15 June — Q1</p>
              <p className="text-gray-700 dark:text-gray-300">15 September — Q2</p>
              <p className="text-gray-700 dark:text-gray-300">15 December — Q3</p>
              <p className="text-gray-700 dark:text-gray-300">15 March — Q4</p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>TDS Tracker</CardTitle>
              <CardDescription>Monitor your deduction obligations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="gap-2">
              <CardTitle>Regime Comparison</CardTitle>
              <CardDescription>Use this space to compare standard vs. presumptive filing.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">Next phase</p>
            </CardContent>
          </Card>
        </section>

        <TaxDisclaimer />
      </div>
    </main>
  );
}
