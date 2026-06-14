import { describe, expect, it } from "vitest";
import { applyReviewFeedback } from "./srs";
import type { ExpressionSense } from "./types";

const base: ExpressionSense = {
  id: "sense-1",
  userId: "user-1",
  expression: "roll out",
  normalizedForm: "roll out",
  type: "phrasal_verb",
  meaningZh: "推出、发布",
  difficulty: "B2",
  masteryStatus: "learning",
  srsDueAt: null,
  reviewCount: 0,
  mistakeCount: 0,
  easeFactor: 2.5,
  intervalDays: 0,
  lapseCount: 0,
  createdAt: "2026-06-13T00:00:00.000Z",
  updatedAt: "2026-06-13T00:00:00.000Z",
  deletedAt: null
};

describe("applyReviewFeedback", () => {
  it("advances known reviews using SM-2-compatible repetitions and ease", () => {
    const result = applyReviewFeedback(base, "known", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(1);
    expect(result.next.intervalDays).toBe(1);
    expect(result.next.easeFactor).toBe(2.5);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");

    const mature = applyReviewFeedback(
      { ...base, reviewCount: 2, intervalDays: 6, easeFactor: 2.5 },
      "known",
      "2026-06-13T00:00:00.000Z",
    );
    expect(mature.next.reviewCount).toBe(3);
    expect(mature.next.intervalDays).toBe(15);
    expect(mature.next.srsDueAt).toBe("2026-06-28T00:00:00.000Z");
  });

  it("schedules fuzzy reviews earlier than known and slightly reduces ease", () => {
    const result = applyReviewFeedback(
      { ...base, reviewCount: 3, intervalDays: 6, easeFactor: 2.5 },
      "fuzzy",
      "2026-06-13T00:00:00.000Z",
    );
    expect(result.next.reviewCount).toBe(3);
    expect(result.next.intervalDays).toBe(3);
    expect(result.next.easeFactor).toBeCloseTo(2.36, 2);
    expect(result.next.srsDueAt).toBe("2026-06-16T00:00:00.000Z");
  });

  it("resets unknown reviews, counts mistakes and lapses, and schedules soon", () => {
    const result = applyReviewFeedback(
      { ...base, reviewCount: 4, mistakeCount: 2, lapseCount: 1, intervalDays: 14, easeFactor: 2 },
      "unknown",
      "2026-06-13T00:00:00.000Z",
    );
    expect(result.next.reviewCount).toBe(0);
    expect(result.next.mistakeCount).toBe(3);
    expect(result.next.lapseCount).toBe(2);
    expect(result.next.intervalDays).toBe(1);
    expect(result.next.easeFactor).toBeCloseTo(1.68, 2);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });
});
