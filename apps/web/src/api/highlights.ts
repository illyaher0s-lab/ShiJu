const API_BASE = import.meta.env.VITE_API_BASE_URL || '/shiju/api';

export async function extractHighlights(segmentId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/segments/${segmentId}/extract-highlights`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to extract highlights');
  const data = await response.json();
  return data.phrases || [];
}
