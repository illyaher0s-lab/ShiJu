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

    async generateManualSelectionDraft(request) {
      const generatedAt = new Date().toISOString();
      const selectedText = request.selectedText.toLowerCase().trim();

      // Deterministic mock for "all at once"
      if (selectedText === "all at once") {
        return {
          candidate: {
            id: `manual-${request.clientOperationId}`,
            userId: request.userId,
            articleId: request.articleId,
            segmentId: request.segmentId,
            expression: "all at once",
            normalizedForm: "all at once",
            type: "idiom",
            meaningZh: "突然、同时",
            localMeaning: "suddenly or at the same time",
            sentence: request.sentence,
            sentenceTranslation: "老师注意到动力并非一下子就到来。",
            syntaxHint: "Used to describe something happening suddenly or simultaneously.",
            difficulty: "B1",
            valueScore: 85,
            candidateStatus: "backup_candidate",
            statusReason: "Generated from manual selection",
            occurrenceCount: 1,
            modelProvider: "mock",
            modelName: "manual-selection-mock-v1",
            promptVersion: "manual-selection-prompt-v1",
            generationVersion: "manual-selection-v1",
            generatedAt,
          },
          duplicateExpressionSenseId: null,
          recommendation: "add",
          recommendationReason: "New expression not in learner's existing cards.",
        };
      }

      // Default fallback for other selections
      return {
        candidate: {
          id: `manual-${request.clientOperationId}`,
          userId: request.userId,
          articleId: request.articleId,
          segmentId: request.segmentId,
          expression: request.selectedText,
          normalizedForm: request.selectedText.toLowerCase(),
          type: "other",
          meaningZh: "待定义",
          localMeaning: "meaning to be determined",
          sentence: request.sentence,
          sentenceTranslation: "需要翻译",
          syntaxHint: null,
          difficulty: "B1",
          valueScore: 70,
          candidateStatus: "backup_candidate",
          statusReason: "Generated from manual selection",
          occurrenceCount: 1,
          modelProvider: "mock",
          modelName: "manual-selection-mock-v1",
          promptVersion: "manual-selection-prompt-v1",
          generationVersion: "manual-selection-v1",
          generatedAt,
        },
        duplicateExpressionSenseId: null,
        recommendation: "add",
        recommendationReason: "New expression not in learner's existing cards.",
      };
    },
  };
}

function firstSentence(text: string): string {
  return text.split(".")[0]?.trim() ? `${text.split(".")[0]!.trim()}.` : text;
}
