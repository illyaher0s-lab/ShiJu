import type { CandidateExpression } from "@art/domain";

interface ContextEntryDraftInput {
  expression: string;
  contextLabel: string;
  contextNote: string;
  generatedAt: string;
}

export function buildContextEntryDraft(input: ContextEntryDraftInput): CandidateExpression {
  const expression = input.expression.trim();
  const contextLabel = input.contextLabel.trim() || "real-world context";
  const contextNote = input.contextNote.trim();

  return {
    id: `context-draft-${expression.toLowerCase().replaceAll(/\s+/g, "-")}`,
    userId: "user-1",
    articleId: "context-entry",
    segmentId: "context-entry",
    expression,
    normalizedForm: expression.toLowerCase(),
    type: typeFor(expression, contextLabel),
    meaningZh: meaningFor(expression, contextLabel),
    localMeaning: localMeaningFor(expression, contextLabel),
    sentence: exampleFor(expression, contextLabel),
    sentenceTranslation: translationFor(expression, contextLabel),
    syntaxHint: contextNote ? `Source context: ${contextNote}` : `Source context: ${contextLabel}`,
    difficulty: "B1",
    valueScore: 0.7,
    candidateStatus: "backup_candidate",
    statusReason: `Generated from learner-entered ${contextLabel} context.`,
    occurrenceCount: 1,
    modelProvider: "mock",
    modelName: "context-entry-mock-v1",
    promptVersion: "context-entry-prompt-v1",
    generationVersion: "context-entry-v1",
    generatedAt: input.generatedAt,
  };
}

function typeFor(expression: string, contextLabel: string): CandidateExpression["type"] {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) return "other";
  return "other";
}

function meaningFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "增益、强化效果";
  }
  return "根据场景生成的含义";
}

function localMeaningFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "a temporary improvement or boost in a game context";
  }
  return `meaning inferred from ${contextLabel} context`;
}

function exampleFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "This potion gives your character a short attack buff.";
  }
  return `I noticed "${expression}" in a ${contextLabel} context.`;
}

function translationFor(expression: string, contextLabel: string): string {
  if (expression.toLowerCase() === "buff" && contextLabel.toLowerCase().includes("game")) {
    return "这瓶药水会给你的角色一个短暂的攻击增益。";
  }
  return `我在${contextLabel}场景中注意到了“${expression}”。`;
}
