const API_BASE = import.meta.env.VITE_API_BASE_URL || '/shiju/api';

// Import shared types from domain package
import type { 
  Article, 
  Segment, 
  CandidateExpression, 
  ExpressionSense 
} from '@art/domain';

// Re-export for components that import from this file
export type { Article, Segment, CandidateExpression, ExpressionSense };

// ReviewStats not in domain package - keep local definition
// Note: backend returns 'reviewCount', but we keep 'reviewingCount' for backward compatibility
export interface ReviewStats {
  dueCount: number;
  newCount: number;
  learningCount: number;
  reviewingCount: number;
  masteredCount: number;
  totalCount: number;
}

// Articles
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

// Alias for backward compatibility
export const createArticle = importArticle;

export async function deleteArticle(articleId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/articles/${articleId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete article');
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

// Review
export async function getDueReviews(): Promise<{
  expressions: ExpressionSense[];
  total: number;
}> {
  const response = await fetch(`${API_BASE}/review/due`);
  if (!response.ok) throw new Error('Failed to get due reviews');
  return response.json();
}

export async function submitReviewFeedback(
  expressionSenseId: string,
  feedback: 'again' | 'hard' | 'good' | 'easy'
): Promise<{
  success: boolean;
  nextDueAt: string;
  intervalDays: number;
  masteryStatus: string;
}> {
  const response = await fetch(`${API_BASE}/review/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expressionSenseId, feedback }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit feedback');
  }
  
  return response.json();
}

export async function getReviewStats(): Promise<ReviewStats> {
  const response = await fetch(`${API_BASE}/review/stats`);
  if (!response.ok) throw new Error('Failed to get review stats');
  const data = await response.json();
  
  // Backend returns 'reviewCount', map to 'reviewingCount' for frontend compatibility
  return {
    dueCount: data.dueCount,
    newCount: data.newCount,
    learningCount: data.learningCount,
    reviewingCount: data.reviewCount,  // Map reviewCount -> reviewingCount
    masteredCount: data.masteredCount,
    totalCount: data.totalCount,
  };
}

// Expressions
export async function listExpressions(filters?: {
  status?: string;
  search?: string;
}): Promise<{
  expressions: ExpressionSense[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  
  const url = `${API_BASE}/expressions${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to list expressions');
  return response.json();
}

export async function getExpression(id: string): Promise<{
  expression: ExpressionSense;
  occurrences: any[];
}> {
  const response = await fetch(`${API_BASE}/expressions/${id}`);
  if (!response.ok) throw new Error('Failed to get expression');
  return response.json();
}
