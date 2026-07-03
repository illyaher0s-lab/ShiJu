import type { CandidateExpression, ContextEntryGenerationDraft, ContextEntryGenerationRequest, ManualSelectionGenerationDraft, ManualSelectionGenerationRequest, Segment } from "@art/domain";

// AI provider returns candidate data without database fields (id, userId, articleId, segmentId)
export type CandidateData = Omit<CandidateExpression, 'id' | 'userId' | 'articleId' | 'segmentId'>;

export interface AiGenerationResult {
  candidates: CandidateData[];
}

export interface AiProvider {
  generateSegment(segment: Segment): Promise<AiGenerationResult>;
  generateManualSelectionDraft(request: ManualSelectionGenerationRequest): Promise<ManualSelectionGenerationDraft>;
  generateContextEntryDraft(request: ContextEntryGenerationRequest): Promise<ContextEntryGenerationDraft>;
}
