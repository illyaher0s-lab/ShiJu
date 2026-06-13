import { describe, expect, it } from "vitest";
import { buildManualSelectionDraft } from "./manualSelection";

describe("buildManualSelectionDraft", () => {
  it("creates an AI-generated draft from selected text and sentence context", () => {
    const draft = buildManualSelectionDraft({
      selectedText: "all at once",
      sentence: "Teachers noticed that momentum did not arrive all at once.",
      articleId: "article-sample",
      segmentId: "segment-1",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });

    expect(draft.expression).toBe("all at once");
    expect(draft.localMeaning).toBe("suddenly or together in this sentence");
    expect(draft.modelProvider).toBe("mock");
    expect(draft.generationVersion).toBe("manual-selection-v1");
  });
});
