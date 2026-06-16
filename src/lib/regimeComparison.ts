export interface RegimeComparisonResult {
  annualIncome: number;
  oldRegimeTax: number;
  newRegimeTax: number;
  savings: number;
  recommendedRegime: 'old' | 'new';
}

export function calculateNewRegime(annualIncome: number): number {
  let tax = 0;

  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  let previousLimit = 0;

  for (const slab of slabs) {
    if (annualIncome > previousLimit) {
      const taxableAmount =
        Math.min(annualIncome, slab.limit) - previousLimit;

      tax += taxableAmount * slab.rate;
      previousLimit = slab.limit;
    }
  }

  return Math.round(tax * 1.04); // 4% cess
}

export function calculateOldRegime(
  annualIncome: number,
  deductions: number = 0
): number {
  const taxableIncome = Math.max(
    annualIncome - deductions,
    0
  );

  let tax = 0;

  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];

  let previousLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome > previousLimit) {
      const taxableAmount =
        Math.min(taxableIncome, slab.limit) -
        previousLimit;

      tax += taxableAmount * slab.rate;
      previousLimit = slab.limit;
    }
  }

  return Math.round(tax * 1.04); // 4% cess
}

export function compareRegimes(
  annualIncome: number,
  deductions: number = 0
): RegimeComparisonResult {
  const oldTax = calculateOldRegime(
    annualIncome,
    deductions
  );

  const newTax = calculateNewRegime(
    annualIncome
  );

  const savings = Math.abs(
    oldTax - newTax
  );

  return {
    annualIncome,
    oldRegimeTax: oldTax,
    newRegimeTax: newTax,
    savings,
    recommendedRegime:
      oldTax < newTax ? 'old' : 'new',
  };
}