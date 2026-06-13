import { describe, expect, it } from "vitest";
import { applyClientOperationsInMemory } from "./syncService";

describe("applyClientOperationsInMemory", () => {
  it("applies duplicate client operations only once", () => {
    const operation = {
      clientOperationId: "client-op-1",
      userId: "user-1",
      operationType: "reading.add_to_review",
      targetType: "candidate_expression",
      targetId: "candidate-roll-out",
      payload: { expressionSenseId: "sense-roll-out" },
      clientCreatedAt: "2026-06-13T00:00:00.000Z",
      syncStatus: "pending" as const,
      serverAppliedAt: null,
    };

    const result = applyClientOperationsInMemory([operation, operation]);

    expect(result.applied).toHaveLength(1);
    expect(result.ignoredDuplicateIds).toEqual(["client-op-1"]);
  });
});
