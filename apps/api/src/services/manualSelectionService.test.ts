import { describe, expect, it } from "vitest";
import { generateManualSelectionDraft } from "./manualSelectionService";
import { createMockProvider } from "../ai/mockProvider";

describe("generateManualSelectionDraft", () => {
  it("generates a draft with model metadata from learner-selected text", async () => {
    const result = await generateManualSelectionDraft({
      provider: createMockProvider(),
      request: {
        clientOperationId: "client-op-selection-1",
        userId: "user-1",
        articleId: "article-1",
        segmentId: "segment-1",
        selectedText: "all at once",
        sentence: "Teachers noticed that momentum did not arrive all at once.",
        context: "Teachers noticed that momentum did not arrive all at once.",
        clientCreatedAt: "2026-06-13T00:00:00.000Z",
      },
    });

    expect(result.candidate.expression).toBe("all at once");
    expect(result.candidate.modelProvider).toBe("mock");
    expect(result.candidate.generationVersion).toBe("manual-selection-v1");
    expect(result.recommendation).toBe("add");
  });
});
