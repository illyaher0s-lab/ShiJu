import type { AiProvider } from "./provider";

export function createMockProvider(): AiProvider {
  return {
    async generateSegment(segment) {
      const generatedAt = new Date().toISOString();
      const text = segment.text.toLowerCase();
      
      // ponytail: deterministic mock based on segment text length
      const wordCount = segment.wordCount || 200;
      const selectedCount = Math.min(6, Math.floor(wordCount / 40) + 2); // 2-6 selected
      const backupCount = Math.min(8, Math.floor(wordCount / 30)); // 0-8 backup
      
      const mockExpressions = [
        { expr: "roll out", type: "phrasal_verb", zh: "推出、发布", en: "make available", score: 92 },
        { expr: "turn out", type: "phrasal_verb", zh: "结果是", en: "result in", score: 88 },
        { expr: "carry out", type: "phrasal_verb", zh: "执行", en: "perform", score: 85 },
        { expr: "point out", type: "phrasal_verb", zh: "指出", en: "mention", score: 82 },
        { expr: "set up", type: "phrasal_verb", zh: "建立", en: "establish", score: 80 },
        { expr: "come up with", type: "phrasal_verb", zh: "想出", en: "devise", score: 78 },
        { expr: "on the other hand", type: "idiom", zh: "另一方面", en: "conversely", score: 75 },
        { expr: "in terms of", type: "collocation", zh: "在…方面", en: "regarding", score: 72 },
        { expr: "as a result", type: "collocation", zh: "结果", en: "consequently", score: 70 },
        { expr: "for instance", type: "collocation", zh: "例如", en: "for example", score: 68 },
        { expr: "take into account", type: "phrasal_verb", zh: "考虑", en: "consider", score: 65 },
        { expr: "in addition", type: "collocation", zh: "此外", en: "furthermore", score: 62 },
        { expr: "deal with", type: "phrasal_verb", zh: "处理", en: "handle", score: 60 },
        { expr: "focus on", type: "phrasal_verb", zh: "专注于", en: "concentrate on", score: 58 },
      ];
      
      const candidates = [];
      
      // Selected candidates
      for (let i = 0; i < selectedCount && i < mockExpressions.length; i++) {
        const mock = mockExpressions[i];
        candidates.push({
          id: `candidate-${segment.id}-${i}`,
          userId: segment.userId,
          articleId: segment.articleId,
          segmentId: segment.id,
          expression: mock.expr,
          normalizedForm: mock.expr,
          type: mock.type,
          meaningZh: mock.zh,
          localMeaning: mock.en,
          sentence: firstSentence(segment.text),
          sentenceTranslation: `示例句子包含"${mock.expr}"。`,
          syntaxHint: i === 0 ? "Main action" : null,
          difficulty: "B2",
          valueScore: mock.score,
          candidateStatus: "selected",
          statusReason: "High-value expression",
          occurrenceCount: 1,
          modelProvider: "mock",
          modelName: "mock-v1",
          promptVersion: "prompt-v1",
          generationVersion: "generation-v1",
          generatedAt,
        });
      }
      
      // Backup candidates
      for (let i = selectedCount; i < selectedCount + backupCount && i < mockExpressions.length; i++) {
        const mock = mockExpressions[i];
        candidates.push({
          id: `candidate-${segment.id}-${i}`,
          userId: segment.userId,
          articleId: segment.articleId,
          segmentId: segment.id,
          expression: mock.expr,
          normalizedForm: mock.expr,
          type: mock.type,
          meaningZh: mock.zh,
          localMeaning: mock.en,
          sentence: firstSentence(segment.text),
          sentenceTranslation: `示例句子包含"${mock.expr}"。`,
          syntaxHint: null,
          difficulty: "B1",
          valueScore: mock.score,
          candidateStatus: "backup_candidate",
          statusReason: "Useful but not highlighted",
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

function firstSentence(text: string): string {
  return text.split(".")[0]?.trim() ? `${text.split(".")[0]!.trim()}.` : text;
}
