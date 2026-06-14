import { describe, expect, it } from "vitest";
import { createMockProvider } from "../ai/mockProvider";
import { generateContextEntryDraft } from "./contextGenerationService";

describe("generateContextEntryDraft", () => {
  it("generates a draft with model metadata from expression and context", async () => {
    const result = await generateContextEntryDraft({
      provider: createMockProvider(),
      request: {
        clientOperationId: "client-op-context-1",
        userId: "user-1",
        expression: "buff",
        contextLabel: "game",
        contextNote: "RPG item description",
        sentence: null,
        clientCreatedAt: "2026-06-13T00:00:00.000Z",
      },
    });

    expect(result.candidate.expression).toBe("buff");
    expect(result.candidate.modelProvider).toBe("mock");
    expect(result.candidate.generationVersion).toBe("context-entry-v1");
    expect(result.recommendation).toBe("add");
  });
});
