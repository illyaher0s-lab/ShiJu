import type { CandidateExpression } from "@art/domain";
import type { AiProvider } from "./provider";

export interface OpenAiCompatibleProviderOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function buildGenerationPrompt(segmentText: string): string {
  return [
    "Analyze this English reading segment for an adult Chinese-speaking English learner.",
    "Return JSON only.",
    "Candidate statuses must be one of: selected, backup_candidate, ignored_too_easy, ignored_duplicate, ignored_over_limit.",
    "Each candidate must include expression, normalized_form, type, meaning_zh, local_meaning, sentence, sentence_translation, difficulty, value_score, candidate_status, status_reason, syntax_hint.",
    "Include model_provider, model_name, prompt_version, generation_version, generated_at in metadata.",
    "Do not create permanent sentence cards. SRS will schedule ExpressionSense only.",
    "Segment:",
    segmentText,
  ].join("\n");
}

export function createOpenAiCompatibleProvider(options: OpenAiCompatibleProviderOptions): AiProvider {
  return {
    async generateSegment(segment) {
      const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options.model,
          messages: [{ role: "user", content: buildGenerationPrompt(segment.text) }],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI provider request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as OpenAiCompatibleResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI provider returned no content.");

      const generated = JSON.parse(content) as { candidates?: CandidateExpression[] };
      return { candidates: generated.candidates ?? [] };
    },
  };
}

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}
