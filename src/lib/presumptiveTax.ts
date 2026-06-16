export interface PresumptiveResult {
  turnover: number;
  taxableIncome: number;
  section: string;
}

export function calculate44ADA(
  turnover: number
): PresumptiveResult {
  return {
    turnover,
    taxableIncome: turnover * 0.5,
    section: '44ADA'
  };
}

export function calculate44AD(
  turnover: number
): PresumptiveResult {
  return {
    turnover,
    taxableIncome: turnover * 0.06,
    section: '44AD'
  };
}