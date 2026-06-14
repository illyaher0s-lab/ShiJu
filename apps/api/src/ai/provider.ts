import type { CandidateExpression, ManualSelectionGenerationDraft, ManualSelectionGenerationRequest, Segment } from "@art/domain";

export interface AiGenerationResult {
  candidates: CandidateExpression[];
}

export interface AiProvider {
  generateSegment(segment: Segment): Promise<AiGenerationResult>;
  generateManualSelectionDraft(request: ManualSelectionGenerationRequest): Promise<ManualSelectionGenerationDraft>;
}
