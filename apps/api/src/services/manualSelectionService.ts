import type { ManualSelectionGenerationDraft, ManualSelectionGenerationRequest } from "@art/domain";
import type { AiProvider } from "../ai/provider";

interface GenerateManualSelectionDraftInput {
  provider: AiProvider;
  request: ManualSelectionGenerationRequest;
}

export async function generateManualSelectionDraft(
  input: GenerateManualSelectionDraftInput,
): Promise<ManualSelectionGenerationDraft> {
  const { provider, request } = input;

  // Validate non-empty selected text
  if (!request.selectedText.trim()) {
    throw new Error("Selected text cannot be empty");
  }

  // Call provider to generate draft
  const draft = await provider.generateManualSelectionDraft(request);

  return draft;
}
