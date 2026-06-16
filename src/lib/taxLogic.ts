export type TaxRegime = 'new' | 'old';

export interface TaxBreakdown {
  grossIncome: number;
  gstAmount: number;
  incomeTax: number;
  advanceTaxThisQuarter: number;
  safeToSpend: number;
  taxableIncome: number;
}

// FY 2024-25 new regime slabs
export function calculateNewRegimeTax(annualIncome: number): number {
  let tax = 0;
  const slabs = [
    { upTo: 300000, rate: 0 },
    { upTo: 700000, rate: 0.05 },
    { upTo: 1000000, rate: 0.10 },
    { upTo: 1200000, rate: 0.15 },
    { upTo: 1500000, rate: 0.20 },
    { upTo: Infinity, rate: 0.30 },
  ];

  let remaining = annualIncome;
  let lastLimit = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabAmount = Math.min(remaining, slab.upTo - lastLimit);
    tax += slabAmount * slab.rate;
    remaining -= slabAmount;
    lastLimit = slab.upTo;
  }

  // 4% health and education cess
  return tax * 1.04;
}

// FY 2024-25 old regime slabs (simplified, no deductions)
export function calculateOldRegimeTax(annualIncome: number): number {
  let tax = 0;
  const slabs = [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.20 },
    { upTo: Infinity, rate: 0.30 },
  ];

  let remaining = annualIncome;
  let lastLimit = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabAmount = Math.min(remaining, slab.upTo - lastLimit);
    tax += slabAmount * slab.rate;
    remaining -= slabAmount;
    lastLimit = slab.upTo;
  }

  return tax * 1.04;
}

export function calculateGST(amount: number, gstRegistered: boolean, rate: number = 0.18): number {
  if (!gstRegistered) return 0;
  return amount * rate;
}

// Returns which advance tax installment % applies based on today's date
export function getAdvanceTaxQuarterPercent(date: Date = new Date()): number {
  const month = date.getMonth() + 1; // 1-12
  if (month <= 6) return 0.15;
  if (month <= 9) return 0.45;
  if (month <= 12) return 0.75;
  return 1.0;
}

export function getNextAdvanceTaxDueDate(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month <= 6) return `15 Jun ${year}`;
  if (month <= 9) return `15 Sep ${year}`;
  if (month <= 12) return `15 Dec ${year}`;
  return `15 Mar ${year + 1}`;
}

export function calculateFullTaxBreakdown(
  monthlyGrossIncome: number,
  annualProjectedIncome: number,
  regime: TaxRegime,
  gstRegistered: boolean,
  monthlyExpenseEstimate: number
): TaxBreakdown {
  const gstAmount = calculateGST(monthlyGrossIncome, gstRegistered);

  const annualTax =
    regime === 'new'
      ? calculateNewRegimeTax(annualProjectedIncome)
      : calculateOldRegimeTax(annualProjectedIncome);

  const monthlyTaxSetAside = annualTax / 12;

  const safeToSpend =
    monthlyGrossIncome - gstAmount - monthlyTaxSetAside - monthlyExpenseEstimate;

  return {
    grossIncome: monthlyGrossIncome,
    gstAmount: Math.round(gstAmount),
    incomeTax: Math.round(monthlyTaxSetAside),
    advanceTaxThisQuarter: Math.round(annualTax * getAdvanceTaxQuarterPercent()),
    safeToSpend: Math.round(safeToSpend),
    taxableIncome: annualProjectedIncome,
  };
}