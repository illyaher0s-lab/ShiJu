import type { AiProvider } from "./provider";

export function createMockProvider(): AiProvider {
  return {
    async generateSegment(segment) {
      const generatedAt = new Date("2026-06-13T00:00:00.000Z").toISOString();
      return {
        candidates: [
          {
            id: `candidate-${segment.id}-roll-out`,
            userId: segment.userId,
            articleId: segment.articleId,
            segmentId: segment.id,
            expression: "roll out",
            normalizedForm: "roll out",
            type: "phrasal_verb",
            meaningZh: "推出、发布",
            localMeaning: "make a new service available",
            sentence: firstSentence(segment.text),
            sentenceTranslation: "该句说明一项服务被推出。",
            syntaxHint: "Main action: teams roll out a service.",
            difficulty: "B2",
            valueScore: 92,
            candidateStatus: "selected",
            statusReason: "High-value phrasal verb in product and policy writing.",
            occurrenceCount: 1,
            modelProvider: "mock",
            modelName: "mock-v1",
            promptVersion: "prompt-v1",
            generationVersion: "generation-v1",
            generatedAt,
          },
        ],
      };
    },
  };
}

function firstSentence(text: string): string {
  return text.split(".")[0]?.trim() ? `${text.split(".")[0]!.trim()}.` : text;
}
