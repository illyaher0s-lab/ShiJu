import { segmentArticleText, type Article, type Segment } from "@art/domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createMockProvider } from "../ai/mockProvider";
import { generateFirstSegment } from "../services/generationService";

const importArticleSchema = z.object({
  title: z.string().min(1),
  sourceType: z.enum(["txt", "markdown"]),
  rawText: z.string().min(1),
});

export async function registerArticleRoutes(app: FastifyInstance) {
  app.post("/articles", async (request, reply) => {
    const input = importArticleSchema.parse(request.body);
    const now = new Date("2026-06-13T00:00:00.000Z").toISOString();
    const articleId = "article-local-1";
    const userId = "user-1";
    const article: Article = {
      id: articleId,
      userId,
      title: input.title,
      sourceType: input.sourceType,
      rawText: input.rawText,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const segments = segmentArticleText(input.rawText).map<Segment>((segment) => ({
      id: `segment-${segment.sequence + 1}`,
      userId,
      articleId,
      sequence: segment.sequence,
      text: segment.text,
      wordCount: segment.wordCount,
      generationStatus: "not_generated",
      progressStatus: "unread",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));
    const generated = await generateFirstSegment({
      provider: createMockProvider(),
      segments,
    });

    return reply.code(201).send({
      article,
      segments: generated.segments,
      candidates: generated.candidates,
    });
  });
}
