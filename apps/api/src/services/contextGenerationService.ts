import type { ContextEntryGenerationDraft, ContextEntryGenerationRequest } from "@art/domain";
import type { AiProvider } from "../ai/provider";

interface GenerateContextEntryDraftInput {
  provider: AiProvider;
  request: ContextEntryGenerationRequest;
}

export async function generateContextEntryDraft(
  input: GenerateContextEntryDraftInput,
): Promise<ContextEntryGenerationDraft> {
  const { provider, request } = input;

  // Validate non-empty expression
  if (!request.expression.trim()) {
    throw new Error("Expression cannot be empty");
  }

  // Validate non-empty context label
  if (!request.contextLabel.trim()) {
    throw new Error("Context label cannot be empty");
  }

  // Call provider to generate draft
  const draft = await provider.generateContextEntryDraft(request);

  return draft;
}
