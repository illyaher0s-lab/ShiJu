import type { CandidateExpression, ManualSelectionGenerationRequest, ManualSelectionGenerationDraft } from '@art/domain';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/shiju/api';

function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface BuildManualSelectionDraftInput {
  selectedText: string;
  sentence: string;
  articleId: string;
  segmentId: string;
  generatedAt: string;
}

export async function buildManualSelectionDraft(
  input: BuildManualSelectionDraftInput
): Promise<CandidateExpression> {
  const request: ManualSelectionGenerationRequest = {
    clientOperationId: self.crypto?.randomUUID?.() || generateFallbackUUID(),
    userId: 'user-1',
    articleId: input.articleId,
    segmentId: input.segmentId,
    selectedText: input.selectedText,
    sentence: input.sentence,
    context: input.sentence, // Use sentence as context
    clientCreatedAt: input.generatedAt,
  };

  const response = await fetch(`${API_BASE}/manual-selection/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate card');
  }

  const draft: ManualSelectionGenerationDraft = await response.json();
  return draft.candidate;
}
