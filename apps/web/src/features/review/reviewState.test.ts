import { describe, expect, it } from "vitest";
import { sampleExpressionSenses } from "../../fixtures/sampleSegment";
import { applyReviewAction } from "./reviewState";

describe("applyReviewAction", () => {
  it("does not advance SRS from reading known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0]!;
    const after = applyReviewAction(state, {
      source: "reading",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z"
    });

    expect(after.expressions[0]!.reviewCount).toBe(before.reviewCount);
    expect(after.expressions[0]!.srsDueAt).toBe(before.srsDueAt);
  });

  it("advances SRS from review known feedback", () => {
    const state = { expressions: sampleExpressionSenses };
    const before = state.expressions[0]!;
    const after = applyReviewAction(state, {
      source: "review",
      expressionSenseId: before.id,
      feedback: "known",
      at: "2026-06-13T00:00:00.000Z"
    });

    expect(after.expressions[0]!.reviewCount).toBe(before.reviewCount + 1);
    expect(after.expressions[0]!.srsDueAt).toBe("2026-06-14T00:00:00.000Z");
  });

  it("marks an expression as mastered without deleting it from cards", () => {
    const state = { expressions: sampleExpressionSenses, activeReviewIds: ["sense-pick-up-steam"] };
    const after = applyReviewAction(state, {
      source: "review",
      expressionSenseId: "sense-pick-up-steam",
      action: "mark_mastered",
      at: "2026-06-13T00:00:00.000Z"
    });

    expect(after.activeReviewIds).not.toContain("sense-pick-up-steam");
    expect(after.expressions).toHaveLength(state.expressions.length);
    expect(after.expressions.find((expression) => expression.id === "sense-pick-up-steam")?.masteryStatus).toBe(
      "mastered",
    );
  });
});
