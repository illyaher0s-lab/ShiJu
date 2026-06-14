import type { ExpressionSense, ReviewFeedback } from "./types";

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export interface SrsTransition {
  next: ExpressionSense;
  previousDueAt: string | null;
  nextDueAt: string;
  rating: number;
  previousEaseFactor: number;
  nextEaseFactor: number;
  previousIntervalDays: number;
  nextIntervalDays: number;
}

export function applyReviewFeedback(
  expression: ExpressionSense,
  feedback: ReviewFeedback,
  reviewedAtIso: string
): SrsTransition {
  const reviewedAt = new Date(reviewedAtIso);
  const previousDueAt = expression.srsDueAt;
  const currentReviewCount = Math.max(0, expression.reviewCount);
  const previousEaseFactor = currentEaseFactor(expression);
  const previousIntervalDays = currentIntervalDays(expression);
  const rating = ratingForFeedback(feedback);
  const nextEaseFactor = nextEase(previousEaseFactor, rating);
  const nextIntervalDays = intervalForFeedback(feedback, currentReviewCount, previousIntervalDays, nextEaseFactor);
  const dayInterval = nextIntervalDays;
  const nextDueAt = addDays(reviewedAt, dayInterval).toISOString();

  const nextReviewCount =
    feedback === "known"
      ? currentReviewCount + 1
      : feedback === "fuzzy"
        ? Math.max(1, currentReviewCount)
        : 0;

  const mistakeCount = feedback === "unknown" ? expression.mistakeCount + 1 : expression.mistakeCount;
  const lapseCount = feedback === "unknown" ? expression.lapseCount + 1 : expression.lapseCount;

  return {
    previousDueAt,
    nextDueAt,
    rating,
    previousEaseFactor,
    nextEaseFactor,
    previousIntervalDays,
    nextIntervalDays,
    next: {
      ...expression,
      masteryStatus: masteryFor(nextReviewCount, feedback),
      srsDueAt: nextDueAt,
      reviewCount: nextReviewCount,
      mistakeCount,
      easeFactor: nextEaseFactor,
      intervalDays: nextIntervalDays,
      lapseCount,
      updatedAt: reviewedAt.toISOString()
    }
  };
}

function intervalForFeedback(
  feedback: ReviewFeedback,
  currentReviewCount: number,
  previousIntervalDays: number,
  nextEaseFactor: number
): number {
  if (feedback === "unknown") return 1;
  if (feedback === "fuzzy") return previousIntervalDays <= 1 ? 1 : Math.max(1, Math.round(previousIntervalDays / 2));
  if (currentReviewCount <= 0) return 1;
  if (currentReviewCount === 1) return 6;
  return Math.max(1, Math.round(previousIntervalDays * nextEaseFactor));
}

function masteryFor(reviewCount: number, feedback: ReviewFeedback): ExpressionSense["masteryStatus"] {
  if (feedback === "unknown") return "learning";
  if (reviewCount >= 2) return "review";
  return "learning";
}

function ratingForFeedback(feedback: ReviewFeedback): number {
  if (feedback === "known") return 4;
  if (feedback === "fuzzy") return 3;
  return 2;
}

function currentEaseFactor(expression: ExpressionSense): number {
  return Math.max(MIN_EASE_FACTOR, expression.easeFactor ?? DEFAULT_EASE_FACTOR);
}

function currentIntervalDays(expression: ExpressionSense): number {
  return Math.max(0, expression.intervalDays ?? 0);
}

function nextEase(current: number, rating: number): number {
  const missDistance = 5 - rating;
  const adjusted = current + (0.1 - missDistance * (0.08 + missDistance * 0.02));
  return Math.max(MIN_EASE_FACTOR, roundToTwo(adjusted));
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
