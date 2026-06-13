import type { CandidateExpression, Segment } from "@art/domain";
import type { AiProvider } from "../ai/provider";

export interface SegmentGenerationResult {
  segments: Segment[];
  candidates: CandidateExpression[];
}

export async function generateFirstSegment(options: {
  provider: AiProvider;
  segments: Segment[];
}): Promise<SegmentGenerationResult> {
  const [firstSegment, ...remainingSegments] = options.segments;
  if (!firstSegment) return { segments: [], candidates: [] };

  const generatedSegment: Segment = {
    ...firstSegment,
    generationStatus: "generated",
  };
  const result = await options.provider.generateSegment(generatedSegment);

  return {
    segments: [
      generatedSegment,
      ...remainingSegments.map((segment) => ({
        ...segment,
        generationStatus: "generating" as const,
      })),
    ],
    candidates: result.candidates,
  };
}
