import type { Article, Segment, CandidateExpression } from "@art/domain";

export interface CreateArticleRequest {
  title: string;
  sourceType: "txt" | "markdown";
  rawText: string;
}

export interface CreateArticleResponse {
  article: Article;
  segments: Segment[];
  candidates: CandidateExpression[];
}

export interface GetArticlesResponse {
  articles: Array<Article & {
    segmentCount: number;
    readCount: number;
    generatedCount: number;
  }>;
}

export interface GetArticleSegmentsResponse {
  segments: Segment[];
  candidates: CandidateExpression[];
}

/**
 * Convert snake_case API response to camelCase frontend format
 */
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}

export async function createArticle(request: CreateArticleRequest): Promise<CreateArticleResponse> {
  const response = await fetch("/shiju/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}

export async function getArticles(): Promise<GetArticlesResponse> {
  const response = await fetch("/shiju/api/articles");

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}

export async function getArticleSegments(articleId: string): Promise<GetArticleSegmentsResponse> {
  const response = await fetch(`/shiju/api/articles/${articleId}/segments`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}
