// ============================================================
// FinWise India — Tax Calculation Engine
// Financial Year 2024–25 (Assessment Year 2025–26)
// IMPORTANT: These are reference calculations only.
// Always show a disclaimer to consult a CA before filing.
// ============================================================

export interface IncomeEntry {
  amount: number;
  date: string;
}

export interface TaxBreakdown {
  grossIncome: number;
  gstCollected: number;
  advanceTaxSetAside: number;
  emergencyBuffer: number;
  safeToSpend: number;
  isGstApplicable: boolean;
}

// ------------------------------------------------------------
// 1. GST CALCULATION
// Threshold: ₹20 lakh/year for services, ₹40 lakh/year for goods
// Standard rate for most freelance/professional services: 18%
// ------------------------------------------------------------
const GST_THRESHOLD_SERVICES = 2000000; // ₹20,00,000 per year
const GST_RATE = 0.18; // 18%

export function calculateGST(
  monthlyIncome: number,
  annualIncomeEstimate: number,
  isGstRegistered: boolean
): { gstAmount: number; isApplicable: boolean } {
  const isApplicable = isGstRegistered || annualIncomeEstimate > GST_THRESHOLD_SERVICES;

  if (!isApplicable) {
    return { gstAmount: 0, isApplicable: false };
  }

  // GST is typically collected ON TOP of the service fee (output tax)
  // For budgeting purposes we estimate what you'd need to remit
  const gstAmount = monthlyIncome * GST_RATE;
  return { gstAmount, isApplicable: true };
}

// ------------------------------------------------------------
// 2. INCOME TAX SLABS — NEW REGIME (FY 2024-25 / AY 2025-26)
// This is the default regime since FY 2023-24 unless taxpayer opts out
// ------------------------------------------------------------
interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

const NEW_REGIME_SLABS: TaxSlab[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 },
];

// Old regime slabs (for users who opt out of new regime)
const OLD_REGIME_SLABS: TaxSlab[] = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: Infinity, rate: 0.30 },
];

// Section 87A rebate: New regime - full tax rebate if taxable income <= ₹7,00,000
const NEW_REGIME_REBATE_LIMIT = 700000;
// Old regime - full tax rebate if taxable income <= ₹5,00,000
const OLD_REGIME_REBATE_LIMIT = 500000;

export function calculateAnnualIncomeTax(
  annualTaxableIncome: number,
  regime: "new" | "old" = "new"
): number {
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  const rebateLimit = regime === "new" ? NEW_REGIME_REBATE_LIMIT : OLD_REGIME_REBATE_LIMIT;

  // Apply 87A rebate — if income is within the limit, tax is fully waived
  if (annualTaxableIncome <= rebateLimit) {
    return 0;
  }

  let tax = 0;
  for (const slab of slabs) {
    if (annualTaxableIncome > slab.min) {
      const taxableInThisSlab = Math.min(annualTaxableIncome, slab.max) - slab.min;
      tax += taxableInThisSlab * slab.rate;
    }
  }

  // Health & Education Cess: 4% on the tax amount
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

// ------------------------------------------------------------
// 3. ADVANCE TAX — Quarterly due dates and cumulative percentages
// Applicable if total tax liability for the year exceeds ₹10,000
// ------------------------------------------------------------
export interface AdvanceTaxInstallment {
  dueDate: string;
  cumulativePercent: number;
  label: string;
}

export const ADVANCE_TAX_SCHEDULE: AdvanceTaxInstallment[] = [
  { dueDate: "15 June", cumulativePercent: 0.15, label: "Q1 — 15% of estimated tax" },
  { dueDate: "15 September", cumulativePercent: 0.45, label: "Q2 — 45% of estimated tax" },
  { dueDate: "15 December", cumulativePercent: 0.75, label: "Q3 — 75% of estimated tax" },
  { dueDate: "15 March", cumulativePercent: 1.00, label: "Q4 — 100% of estimated tax" },
];

const ADVANCE_TAX_THRESHOLD = 10000; // ₹10,000 minimum liability to trigger advance tax

export function calculateAdvanceTaxSetAside(
  monthlyIncome: number,
  annualIncomeEstimate: number,
  regime: "new" | "old" = "new"
): number {
  const annualTax = calculateAnnualIncomeTax(annualIncomeEstimate, regime);

  if (annualTax < ADVANCE_TAX_THRESHOLD) {
    return 0;
  }

  // Simple monthly set-aside: spread annual tax liability across 12 months
  // proportional to this month's income vs annual estimate
  const incomeRatio = annualIncomeEstimate > 0 ? monthlyIncome / annualIncomeEstimate : 0;
  return Math.round(annualTax * incomeRatio);
}

export function getNextAdvanceTaxDueDate(): { dueDate: string; daysRemaining: number } {
  const today = new Date();
  const year = today.getFullYear();

  const dueDates = [
    new Date(year, 5, 15),  // 15 June
    new Date(year, 8, 15),  // 15 September
    new Date(year, 11, 15), // 15 December
    new Date(year + 1, 2, 15), // 15 March (next year)
  ];

  for (const due of dueDates) {
    if (due > today) {
      const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        dueDate: due.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        daysRemaining,
      };
    }
  }

  // If all passed this cycle, return first one of next year
  const nextYearFirst = new Date(year + 1, 5, 15);
  const daysRemaining = Math.ceil((nextYearFirst.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    dueDate: nextYearFirst.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    daysRemaining,
  };
}

// ------------------------------------------------------------
// 4. TDS (Tax Deducted at Source) — for business owners
// ------------------------------------------------------------
export function calculateTDS(
  paymentAmount: number,
  section: "194C" | "194J"
): { tdsAmount: number; rate: number; applicable: boolean } {
  const THRESHOLD_194C = 30000; // contractor payments
  const THRESHOLD_194J = 30000; // professional fees

  if (section === "194C") {
    if (paymentAmount <= THRESHOLD_194C) {
      return { tdsAmount: 0, rate: 0.01, applicable: false };
    }
    return { tdsAmount: Math.round(paymentAmount * 0.01), rate: 0.01, applicable: true };
  }

  // 194J - professional/technical fees
  if (paymentAmount <= THRESHOLD_194J) {
    return { tdsAmount: 0, rate: 0.10, applicable: false };
  }
  return { tdsAmount: Math.round(paymentAmount * 0.10), rate: 0.10, applicable: true };
}

// ------------------------------------------------------------
// 5. THE CORE FEATURE — Safe to Spend calculation
// This combines everything into one trustworthy number
// ------------------------------------------------------------
export function calculateSafeToSpend(params: {
  monthlyIncome: number;
  annualIncomeEstimate: number;
  isGstRegistered: boolean;
  monthlyExpenseBuffer: number;
  regime?: "new" | "old";
}): TaxBreakdown {
  const { monthlyIncome, annualIncomeEstimate, isGstRegistered, monthlyExpenseBuffer, regime = "new" } = params;

  const gst = calculateGST(monthlyIncome, annualIncomeEstimate, isGstRegistered);
  const advanceTax = calculateAdvanceTaxSetAside(monthlyIncome, annualIncomeEstimate, regime);

  const safeToSpend = monthlyIncome - gst.gstAmount - advanceTax - monthlyExpenseBuffer;

  return {
    grossIncome: monthlyIncome,
    gstCollected: gst.gstAmount,
    advanceTaxSetAside: advanceTax,
    emergencyBuffer: monthlyExpenseBuffer,
    safeToSpend: Math.max(0, Math.round(safeToSpend)),
    isGstApplicable: gst.isApplicable,
  };
}

// ------------------------------------------------------------
// 6. HELPER — Detect "dry month" warning
// If recent income is significantly below the 3-month average
// ------------------------------------------------------------
export function detectDryMonthWarning(monthlyIncomes: number[]): {
  isDryMonthAhead: boolean;
  message: string;
} {
  if (monthlyIncomes.length < 3) {
    return { isDryMonthAhead: false, message: "" };
  }

  const recent = monthlyIncomes[monthlyIncomes.length - 1];
  const last3 = monthlyIncomes.slice(-4, -1); // previous 3 months, excluding current
  const average = last3.reduce((a, b) => a + b, 0) / last3.length;

  if (recent < average * 0.5) {
    return {
      isDryMonthAhead: true,
      message: "Your income this month is significantly lower than your recent average. Consider reducing discretionary spending.",
    };
  }

  return { isDryMonthAhead: false, message: "" };
}

// ------------------------------------------------------------
// Formatting helper for Indian Rupee display
// ------------------------------------------------------------
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
