const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Article {
  id: string;
  userId: string;
  title: string;
  sourceType: 'txt' | 'markdown';
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  articleId: string;
  sequence: number;
  text: string;
  wordCount: number;
  generationStatus: string;
  progressStatus: string;
}

export interface CandidateExpression {
  id: string;
  expression: string;
  normalizedForm: string;
  type: string;
  meaningZh: string;
  difficulty: string;
  candidateStatus: string;
}

export async function importArticle(data: {
  title: string;
  rawText: string;
  sourceType: 'txt' | 'markdown';
}): Promise<{ article: Article; segments: Segment[]; candidates: CandidateExpression[] }> {
  const response = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to import article');
  }
  
  return response.json();
}

export async function listArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/articles`);
  if (!response.ok) throw new Error('Failed to list articles');
  const data = await response.json();
  return data.articles;
}

export async function getArticleSegments(articleId: string): Promise<{
  segments: Segment[];
  candidates: CandidateExpression[];
}> {
  const response = await fetch(`${API_BASE}/articles/${articleId}/segments`);
  if (!response.ok) throw new Error('Failed to get article segments');
  return response.json();
}
