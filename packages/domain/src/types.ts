import type { CandidateStatus } from "./candidateStatus";

export type ExpressionType = "phrasal_verb" | "collocation" | "idiom" | "sentence_pattern" | "other";
export type Difficulty = "A2" | "B1" | "B2" | "C1" | "C2";
export type MasteryStatus = "new" | "learning" | "review" | "mastered";
export type GenerationStatus = "not_generated" | "generating" | "generated" | "failed" | "retryable";
export type ReadingFeedback = "add_to_review" | "known" | "too_easy" | "bad_explanation";
export type ReviewFeedback = "known" | "fuzzy" | "unknown";
export type ReviewMasteryAction = "mark_mastered";

export interface Article {
  id: string;
  userId: string;
  title: string;
  sourceType: "txt" | "markdown";
  rawText: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Segment {
  id: string;
  userId: string;
  articleId: string;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: GenerationStatus;
  progressStatus: "unread" | "reading" | "read";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CandidateExpression {
  id: string;
  userId: string;
  articleId: string;
  segmentId: string;
  expression: string;
  normalizedForm: string;
  type: ExpressionType;
  meaningZh: string;
  localMeaning: string;
  sentence: string;
  sentenceTranslation: string;
  syntaxHint: string | null;
  difficulty: Difficulty;
  valueScore: number;
  candidateStatus: CandidateStatus;
  statusReason: string;
  occurrenceCount: number;
  modelProvider: string;
  modelName: string;
  promptVersion: string;
  generationVersion: string;
  generatedAt: string;
}

export interface ExpressionSense {
  id: string;
  userId: string;
  expression: string;
  normalizedForm: string;
  type: ExpressionType;
  meaningZh: string;
  difficulty: Difficulty;
  masteryStatus: MasteryStatus;
  srsDueAt: string | null;
  reviewCount: number;
  occurrenceCount: number;
  mistakeCount: number;
  easeFactor: number;
  intervalDays: number;
  lapseCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Occurrence {
  id: string;
  userId: string;
  expressionSenseId: string;
  sourceType?: "article" | "context_entry";
  articleId: string;
  segmentId: string;
  contextLabel?: string | null;
  contextNote?: string | null;
  sentence: string;
  sentenceTranslation: string;
  localMeaning: string;
  syntaxHint: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReviewLog {
  id: string;
  userId: string;
  expressionSenseId: string;
  feedback: ReviewFeedback;
  rating: number;
  previousDueAt: string | null;
  nextDueAt: string;
  previousEaseFactor: number;
  nextEaseFactor: number;
  previousIntervalDays: number;
  nextIntervalDays: number;
  reviewedAt: string;
  createdAt: string;
}

export interface ClientOperation {
  clientOperationId: string;
  userId: string;
  operationType: string;
  targetType: string;
  targetId: string;
  payload: Record<string, unknown>;
  clientCreatedAt: string;
  syncStatus: "pending" | "synced" | "failed";
  serverAppliedAt: string | null;
}

export interface ManualSelectionGenerationRequest {
  clientOperationId: string;
  userId: string;
  articleId: string;
  segmentId: string;
  selectedText: string;
  sentence: string;
  context: string;
  clientCreatedAt: string;
}

export interface ManualSelectionGenerationDraft {
  candidate: CandidateExpression;
  duplicateExpressionSenseId: string | null;
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}

export interface ContextEntryGenerationRequest {
  clientOperationId: string;
  userId: string;
  expression: string;
  contextLabel: string;
  contextNote: string;
  sentence: string | null;
  clientCreatedAt: string;
}

export interface ContextEntryGenerationDraft {
  candidate: CandidateExpression;
  duplicateExpressionSenseId: string | null;
  recommendation: "add" | "merge" | "reject";
  recommendationReason: string;
}
