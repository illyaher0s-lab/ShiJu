import { describe, expect, it } from "vitest";
import { createClientOperation } from "./operationQueue";

describe("createClientOperation", () => {
  it("creates an idempotent operation with a client operation id", () => {
    const operation = createClientOperation({
      userId: "user-1",
      operationType: "reading.add_to_review",
      targetType: "candidate_expression",
      targetId: "candidate-roll-out",
      payload: { expressionSenseId: "sense-roll-out" },
      now: "2026-06-13T00:00:00.000Z",
    });

    expect(operation.clientOperationId).toMatch(/^client-op-/);
    expect(operation.syncStatus).toBe("pending");
    expect(operation.clientCreatedAt).toBe("2026-06-13T00:00:00.000Z");
  });
});
