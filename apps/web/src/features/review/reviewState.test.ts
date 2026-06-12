import { describe, expect, it } from "vitest";
import { sampleExpressionSenses } from "../../fixtures/sampleSegment";
import { applyReviewAction } from "./reviewState";

describe("applyReviewAction", () => {
  it("does not advance SRS from reading known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0];
    const after = applyReviewAction(state, {
      source: "reading",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z"
    });

    expect(after.expressions[0].reviewCount).toBe(before.reviewCount);
    expect(after.expressions[0].srsDueAt).toBe(before.srsDueAt);
  });

  it("advances SRS from review known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0];
    const after = applyReviewAction(state, {
      source: "review",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z"
    });

    expect(after.expressions[0].reviewCount).toBe(before.reviewCount + 1);
    expect(after.expressions[0].srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });
});
