import type { CandidateExpression, Segment } from "@art/domain";
import { createMockProvider } from "../ai/mockProvider";
import { createOpenAiCompatibleProvider } from "../ai/openAiCompatibleProvider";
import type { AiProvider, CandidateData } from "../ai/provider";
import { loadConfig, type ApiConfig } from "../config";

export interface SegmentGenerationResult {
  segments: Segment[];
  candidates: CandidateData[];
}

export function createGenerationProvider(config: ApiConfig = loadConfig()): AiProvider {
  if (config.aiProvider === "openai_compatible") {
    if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
      throw new Error("OpenAI-compatible provider requires AI_BASE_URL, AI_API_KEY, and AI_MODEL.");
    }

    return createOpenAiCompatibleProvider({
      baseUrl: config.aiBaseUrl,
      apiKey: config.aiApiKey,
      model: config.aiModel,
    });
  }

  return createMockProvider();
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
