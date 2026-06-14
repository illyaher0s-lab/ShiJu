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

    async generateContextEntryDraft(request) {
      const generatedAt = new Date().toISOString();
      const expression = request.expression.toLowerCase().trim();

      // Deterministic mock for "buff" in "game" context
      if (expression === "buff" && request.contextLabel.toLowerCase().includes("game")) {
        return {
          candidate: {
            id: `context-${request.clientOperationId}`,
            userId: request.userId,
            articleId: "context-entry",
            segmentId: "context-entry",
            expression: "buff",
            normalizedForm: "buff",
            type: "other",
            meaningZh: "增益、强化效果",
            localMeaning: "a temporary improvement or boost in a game context",
            sentence: request.sentence ?? "This potion gives your character a short attack buff.",
            sentenceTranslation: "这瓶药水会给你的角色一个短暂的攻击增益。",
            syntaxHint: request.contextNote ? `Source context: ${request.contextNote}` : `Source context: ${request.contextLabel}`,
            difficulty: "B1",
            valueScore: 75,
            candidateStatus: "backup_candidate",
            statusReason: `Generated from learner-entered ${request.contextLabel} context.`,
            occurrenceCount: 1,
            modelProvider: "mock",
            modelName: "context-entry-mock-v1",
            promptVersion: "context-entry-prompt-v1",
            generationVersion: "context-entry-v1",
            generatedAt,
          },
          duplicateExpressionSenseId: null,
          recommendation: "add",
          recommendationReason: "New expression not in learner's existing cards.",
        };
      }

      // Default fallback for other context entries
      return {
        candidate: {
          id: `context-${request.clientOperationId}`,
          userId: request.userId,
          articleId: "context-entry",
          segmentId: "context-entry",
          expression: request.expression,
          normalizedForm: request.expression.toLowerCase(),
          type: "other",
          meaningZh: "根据场景生成的含义",
          localMeaning: `meaning inferred from ${request.contextLabel} context`,
          sentence: request.sentence ?? `I noticed "${request.expression}" in a ${request.contextLabel} context.`,
          sentenceTranslation: `我在${request.contextLabel}场景中注意到了"${request.expression}"。`,
          syntaxHint: request.contextNote ? `Source context: ${request.contextNote}` : `Source context: ${request.contextLabel}`,
          difficulty: "B1",
          valueScore: 70,
          candidateStatus: "backup_candidate",
          statusReason: `Generated from learner-entered ${request.contextLabel} context.`,
          occurrenceCount: 1,
          modelProvider: "mock",
          modelName: "context-entry-mock-v1",
          promptVersion: "context-entry-prompt-v1",
          generationVersion: "context-entry-v1",
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
