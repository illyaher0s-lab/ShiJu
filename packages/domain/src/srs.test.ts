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
  createdAt: "2026-06-13T00:00:00.000Z",
  updatedAt: "2026-06-13T00:00:00.000Z",
  deletedAt: null
};

describe("applyReviewFeedback", () => {
  it("advances known reviews using the V1 interval ladder", () => {
    const result = applyReviewFeedback(base, "known", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(1);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });

  it("keeps fuzzy reviews on a short interval", () => {
    const result = applyReviewFeedback({ ...base, reviewCount: 3 }, "fuzzy", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(3);
    expect(result.next.srsDueAt).toBe("2026-06-16T00:00:00.000Z");
  });

  it("returns unknown reviews to a one-day interval and counts mistakes", () => {
    const result = applyReviewFeedback({ ...base, reviewCount: 4, mistakeCount: 2 }, "unknown", "2026-06-13T00:00:00.000Z");
    expect(result.next.reviewCount).toBe(0);
    expect(result.next.mistakeCount).toBe(3);
    expect(result.next.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });
});
