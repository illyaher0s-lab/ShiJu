import type { ExpressionSense, ReviewFeedback } from "./types";

const intervalsInDays = [1, 3, 7, 14, 30] as const;

export interface SrsTransition {
  next: ExpressionSense;
  previousDueAt: string | null;
  nextDueAt: string;
}

export function applyReviewFeedback(
  expression: ExpressionSense,
  feedback: ReviewFeedback,
  reviewedAtIso: string
): SrsTransition {
  const reviewedAt = new Date(reviewedAtIso);
  const previousDueAt = expression.srsDueAt;
  const currentStep = Math.max(0, expression.reviewCount);
  const dayInterval = intervalForFeedback(feedback, currentStep);
  const nextDueAt = addDays(reviewedAt, dayInterval).toISOString();

  const nextReviewCount =
    feedback === "known"
      ? Math.min(currentStep + 1, intervalsInDays.length)
      : feedback === "fuzzy"
        ? Math.max(1, currentStep)
        : 0;

  const mistakeCount = feedback === "unknown" ? expression.mistakeCount + 1 : expression.mistakeCount;

  return {
    previousDueAt,
    nextDueAt,
    next: {
      ...expression,
      masteryStatus: masteryFor(nextReviewCount, feedback),
      srsDueAt: nextDueAt,
      reviewCount: nextReviewCount,
      mistakeCount,
      updatedAt: reviewedAt.toISOString()
    }
  };
}

function intervalForFeedback(feedback: ReviewFeedback, currentStep: number): number {
  if (feedback === "unknown") return 1;
  if (feedback === "fuzzy") return currentStep <= 1 ? 1 : 3;
  return intervalsInDays[Math.min(currentStep, intervalsInDays.length - 1)];
}

function masteryFor(reviewCount: number, feedback: ReviewFeedback): ExpressionSense["masteryStatus"] {
  if (feedback === "unknown") return "learning";
  if (reviewCount >= 5) return "mastered";
  if (reviewCount >= 2) return "review";
  return "learning";
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
