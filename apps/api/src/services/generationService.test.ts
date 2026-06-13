import { describe, expect, it } from "vitest";
import { createGenerationProvider } from "./generationService";

describe("createGenerationProvider", () => {
  it("uses the mock provider by default", async () => {
    const provider = createGenerationProvider({
      aiProvider: "mock",
      aiBaseUrl: null,
      aiApiKey: null,
      aiModel: null,
    });

    const result = await provider.generateSegment({
      id: "segment-1",
      userId: "user-1",
      articleId: "article-1",
      sequence: 0,
      text: "A team will roll out the service next month.",
      wordCount: 9,
      generationStatus: "generated",
      progressStatus: "unread",
      createdAt: "2026-06-13T00:00:00.000Z",
      updatedAt: "2026-06-13T00:00:00.000Z",
      deletedAt: null,
    });

    expect(result.candidates[0]?.modelProvider).toBe("mock");
  });
});
