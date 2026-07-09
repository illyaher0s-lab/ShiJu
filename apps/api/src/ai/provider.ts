import type { CandidateExpression, ContextEntryGenerationDraft, ContextEntryGenerationRequest, ManualSelectionGenerationDraft, ManualSelectionGenerationRequest, Segment } from "@art/domain";

// AI provider returns candidate data without database fields (id, userId, articleId, segmentId)
export type CandidateData = Omit<CandidateExpression, 'id' | 'userId' | 'articleId' | 'segmentId'>;

export interface AiGenerationResult {
  candidates: CandidateData[];
}

export interface AiProvider {
  generateSegment(segment: Segment): Promise<{ candidates: CandidateExpression[] }>;
  generateManualSelectionDraft(request: ManualSelectionDraftRequest): Promise<ManualSelectionDraft>;
  generateContextEntryDraft(request: ContextEntryGenerationRequest): Promise<ContextEntryGenerationDraft>;
  extractHighlights(segment: Segment): Promise<string[]>;
}
