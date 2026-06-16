'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import TaxDisclaimer from '@/components/TaxDisclaimer';
import {
  calculate44ADA,
  calculate44AD,
} from '@/lib/presumptiveTax';

export default function TaxPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  const [annualIncome, setAnnualIncome] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: userData } =
      await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: profileData } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

    setProfile(profileData);

    const { data: incomeData } =
      await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', userData.user.id);

    const { data: expenseData } =
      await supabase
        .from('expense_entries')
        .select('*')
        .eq('user_id', userData.user.id);

    const totalIncome =
      (incomeData || []).reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

    const totalExpenses =
      (expenseData || []).reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

    setMonthlyIncome(totalIncome);
    setMonthlyExpenses(totalExpenses);

    const projectedAnnual =
      totalIncome * 12;

    setAnnualIncome(projectedAnnual);

    let calculatedTaxable =
      projectedAnnual;

    if (
      profileData?.tax_method ===
      '44ada'
    ) {
      calculatedTaxable =
        calculate44ADA(
          projectedAnnual
        ).taxableIncome;
    }

    if (
      profileData?.tax_method ===
      '44ad'
    ) {
      calculatedTaxable =
        calculate44AD(
          projectedAnnual
        ).taxableIncome;
    }

    setTaxableIncome(
      calculatedTaxable
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="p-8">
        Loading tax center...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="w-full">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Tax Center
          </h1>

          <p className="text-gray-500 mt-2">
            Manage GST, Advance Tax,
            TDS and Presumptive Taxation
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">
              Annual Revenue
            </p>

            <h2 className="text-2xl font-bold mt-2">
              ₹
              {annualIncome.toLocaleString(
                'en-IN'
              )}
            </h2>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">
              Taxable Income
            </p>

            <h2 className="text-2xl font-bold mt-2">
              ₹
              {taxableIncome.toLocaleString(
                'en-IN'
              )}
            </h2>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">
              Tax Method
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {profile?.tax_method ===
              '44ada'
                ? '44ADA'
                : profile?.tax_method ===
                  '44ad'
                ? '44AD'
                : 'Normal'}
            </h2>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-lg mb-4">
              GST Overview
            </h3>

            <div className="space-y-2">
              <p>
                GST Registered:
                <span className="font-medium ml-2">
                  {profile?.gst_registered
                    ? 'Yes'
                    : 'No'}
                </span>
              </p>

              <p>
                Annual Turnover:
                <span className="font-medium ml-2">
                  ₹
                  {annualIncome.toLocaleString(
                    'en-IN'
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-lg mb-4">
              Presumptive Taxation
            </h3>

            <div className="space-y-2">
              <p>
                Current Method:
                <span className="font-medium ml-2">
                  {profile?.tax_method}
                </span>
              </p>

              <p>
                Taxable Income:
                <span className="font-medium ml-2">
                  ₹
                  {taxableIncome.toLocaleString(
                    'en-IN'
                  )}
                </span>
              </p>
            </div>
          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-3">
              Advance Tax
            </h3>

            <p className="text-sm text-gray-500">
              15 June
            </p>

            <p className="text-sm text-gray-500">
              15 September
            </p>

            <p className="text-sm text-gray-500">
              15 December
            </p>

            <p className="text-sm text-gray-500">
              15 March
            </p>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-3">
              TDS Tracker
            </h3>

            <p className="text-gray-500">
              Coming soon
            </p>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-3">
              Regime Comparison
            </h3>

            <p className="text-gray-500">
              Next phase
            </p>
          </div>

        </div>

        <TaxDisclaimer />

      </div>
    </main>
  );
}