export interface HealthScoreResult {
  score: number;
  status: string;
}

export function calculateHealthScore(
  income: number,
  expenses: number,
  gstRegistered: boolean,
  profileCompleted: boolean
): HealthScoreResult {
  let score = 50;

  if (income > 0) {
    score += 20;
  }

  if (expenses < income * 0.7) {
    score += 10;
  }

  if (gstRegistered) {
    score += 10;
  }

  if (profileCompleted) {
    score += 10;
  }

  score = Math.min(100, score);

  let status = 'Needs Improvement';

  if (score >= 80) {
    status = 'Excellent';
  } else if (score >= 60) {
    status = 'Good';
  }

  return {
    score,
    status,
  };
}