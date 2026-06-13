import { describe, expect, it } from "vitest";
import { buildApp } from "./app";

describe("API app", () => {
  it("imports an article and returns first segment generation status", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/articles",
      payload: {
        title: "Sample",
        sourceType: "markdown",
        rawText: "# Heading\n\n" + "word ".repeat(180),
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.article.title).toBe("Sample");
    expect(body.segments[0].generationStatus).toBe("generated");
  });

  it("accepts pending sync operations idempotently", async () => {
    const app = buildApp();
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

    const response = await app.inject({
      method: "POST",
      url: "/sync",
      payload: { operations: [operation, operation] },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.appliedClientOperationIds).toEqual(["client-op-1"]);
    expect(body.ignoredDuplicateIds).toEqual(["client-op-1"]);
  });
});
