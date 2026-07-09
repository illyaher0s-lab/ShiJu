import type { AiProvider } from "./provider";

export function createMockProvider(): AiProvider {
  return {
    async generateSegment(segment) {
      const generatedAt = new Date().toISOString();
      
      // ponytail: extract real phrases from segment text for highlighting
      const text = segment.text;
      const words = text.match(/\b[a-z]+(?:\s+[a-z]+){0,2}\b/gi) || [];
      const uniquePhrases = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 20);
      
      if (uniquePhrases.length === 0) {
        return { candidates: [] }; // Empty segment or non-English
      }
      
      const selectedCount = Math.min(6, Math.floor(uniquePhrases.length / 3));
      const backupCount = Math.min(8, uniquePhrases.length - selectedCount);
      
      const candidates = [];
      
      // Selected candidates (real phrases from text)
      for (let i = 0; i < selectedCount; i++) {
        const expr = uniquePhrases[i];
        const meaning = mockMeaning(expr);
        candidates.push({
          id: `candidate-${segment.id}-${i}`,
          userId: segment.userId,
          articleId: segment.articleId,
          segmentId: segment.id,
          expression: expr,
          normalizedForm: expr,
          type: meaning.type,
          meaningZh: meaning.zh,
          localMeaning: meaning.en,
          sentence: extractSentenceContaining(text, expr),
          sentenceTranslation: "示例翻译。",
          syntaxHint: null,
          difficulty: "B2",
          valueScore: 90 - i * 5,
          candidateStatus: "selected",
          statusReason: "Mock highlight",
          occurrenceCount: 1,
          modelProvider: "mock",
          modelName: "mock-v1",
          promptVersion: "prompt-v1",
          generationVersion: "generation-v1",
          generatedAt,
        });
      }
      
      // Backup candidates
      for (let i = selectedCount; i < selectedCount + backupCount; i++) {
        const expr = uniquePhrases[i];
        const meaning = mockMeaning(expr);
        candidates.push({
          id: `candidate-${segment.id}-${i}`,
          userId: segment.userId,
          articleId: segment.articleId,
          segmentId: segment.id,
          expression: expr,
          normalizedForm: expr,
          type: meaning.type,
          meaningZh: meaning.zh,
          localMeaning: meaning.en,
          sentence: extractSentenceContaining(text, expr),
          sentenceTranslation: "示例翻译。",
          syntaxHint: null,
          difficulty: "B1",
          valueScore: 70 - (i - selectedCount) * 3,
          candidateStatus: "backup_candidate",
          statusReason: "Backup",
          occurrenceCount: 1,
          modelProvider: "mock",
          modelName: "mock-v1",
          promptVersion: "prompt-v1",
          generationVersion: "generation-v1",
          generatedAt,
        });
      }
      
      return { candidates };
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

function mockMeaning(phrase: string): { zh: string; en: string; type: string } {
  // ponytail: naive heuristic, real LLM replaces this
  const words = phrase.trim().split(/\s+/);
  if (words.length >= 2) {
    return { zh: `${phrase}的含义`, en: `meaning of "${phrase}"`, type: "phrasal_verb" };
  }
  return { zh: `${phrase}`, en: `${phrase}`, type: "other" };
}

function firstSentence(text: string): string {
  return text.split(".")[0]?.trim() ? `${text.split(".")[0]!.trim()}.` : text;
}

function extractSentenceContaining(text: string, phrase: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const match = sentences.find(s => s.toLowerCase().includes(phrase.toLowerCase()));
  return match ? `${match}.` : firstSentence(text);
}
