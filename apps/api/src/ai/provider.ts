import type { CandidateExpression, Segment } from "@art/domain";

export interface AiGenerationResult {
  candidates: CandidateExpression[];
}

export interface AiProvider {
  generateSegment(segment: Segment): Promise<AiGenerationResult>;
}
