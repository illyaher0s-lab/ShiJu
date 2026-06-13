import { describe, expect, it } from "vitest";
import { buildContextEntryDraft } from "./contextGeneration";

describe("buildContextEntryDraft", () => {
  it("creates an AI-generated draft from an expression and real-world context", () => {
    const draft = buildContextEntryDraft({
      expression: "buff",
      contextLabel: "game",
      contextNote: "I saw this word in an RPG item description.",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });

    expect(draft.expression).toBe("buff");
    expect(draft.localMeaning).toBe("a temporary improvement or boost in a game context");
    expect(draft.modelProvider).toBe("mock");
    expect(draft.modelName).toBe("context-entry-mock-v1");
    expect(draft.generationVersion).toBe("context-entry-v1");
  });
});
