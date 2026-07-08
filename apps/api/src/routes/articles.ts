import type { FastifyInstance } from 'fastify';
import { segmentArticleText, type Article, type Segment, type CandidateExpression } from "@art/domain";
import { z } from "zod";
import { createGenerationProvider, generateFirstSegment } from "../services/generationService";
import { query } from '../db/client';
import { randomUUID } from "crypto";
import { toCamelCase } from '../lib/dbRowTransformer';

const importArticleSchema = z.object({
  title: z.string().min(1),
  sourceType: z.enum(["txt", "markdown"]),
  rawText: z.string().min(1),
});

export async function registerArticleRoutes(app: FastifyInstance) {
  // Delete article (soft delete)
  app.delete("/articles/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = "user-1"; // TODO: from auth
    const now = new Date().toISOString();

    await query(
      `UPDATE articles SET deleted_at = $1, updated_at = $2 WHERE id = $3 AND user_id = $4 AND deleted_at IS NULL`,
      [now, now, id, userId]
    );

    return { success: true };
  });

  app.post("/articles", async (request, reply) => {
    const input = importArticleSchema.parse(request.body);
    const now = new Date().toISOString();
    const articleId = randomUUID();
    const userId = "user-1"; // TODO: from auth

    // Insert article
    await query(
      `INSERT INTO articles (id, user_id, title, source_type, raw_text, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [articleId, userId, input.title, input.sourceType, input.rawText, now, now]
    );

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

    // Segment text
    const segmentData = segmentArticleText(input.rawText);
    const segments: Segment[] = [];

    for (const seg of segmentData) {
      const segmentId = randomUUID();
      await query(
        `INSERT INTO segments (id, user_id, article_id, sequence, text, word_count, generation_status, progress_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [segmentId, userId, articleId, seg.sequence, seg.text, seg.wordCount, "not_generated", "unread", now, now]
      );
      segments.push({
        id: segmentId,
        userId,
        articleId,
        sequence: seg.sequence,
        text: seg.text,
        wordCount: seg.wordCount,
        generationStatus: "not_generated",
        progressStatus: "unread",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    // Don't generate any segments on import - generate on-demand when user navigates to them
    console.log(`[ARTICLES] Article imported with ${segments.length} segments. Generation will happen on-demand.`);

    return reply.code(201).send({
      article,
      segments,
      candidates: [],
    });
  });

  // Get all articles for current user
  app.get("/articles", async (request, reply) => {
    const userId = "user-1"; // TODO: from auth

    const articlesRes = await query<Article & { segment_count?: number; read_count?: number; generated_count?: number }>(
      `SELECT 
        a.id, a.user_id, a.title, a.source_type, a.raw_text, a.created_at, a.updated_at, a.deleted_at,
        COUNT(DISTINCT s.id) as segment_count,
        COUNT(DISTINCT CASE WHEN s.progress_status = 'read' THEN s.id END) as read_count,
        COUNT(DISTINCT CASE WHEN s.generation_status = 'generated' THEN s.id END) as generated_count
      FROM articles a
      LEFT JOIN segments s ON a.id = s.article_id AND s.deleted_at IS NULL
      WHERE a.user_id = $1 AND a.deleted_at IS NULL
      GROUP BY a.id
      ORDER BY a.created_at DESC`,
      [userId]
    );

    // Transform snake_case to camelCase for frontend
    const articles = articlesRes.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      sourceType: row.source_type,
      rawText: row.raw_text,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      segmentCount: Number(row.segment_count),
      readCount: Number(row.read_count),
      generatedCount: Number(row.generated_count),
    }));
    return reply.send({ articles });
  });

  // Get article segments
  app.get("/articles/:articleId/segments", async (request, reply) => {
    const { articleId } = request.params as { articleId: string };
    const userId = "user-1"; // TODO: from auth

    const segmentsRes = await query<Segment>(
      `SELECT * FROM segments WHERE article_id = $1 AND user_id = $2 AND deleted_at IS NULL ORDER BY sequence`,
      [articleId, userId]
    );

    const candidatesRes = await query<CandidateExpression>(
      `SELECT * FROM candidate_expressions WHERE article_id = $1 AND user_id = $2`,
      [articleId, userId]
    );

    return reply.send({
      segments: toCamelCase(segmentsRes.rows),
      candidates: toCamelCase(candidatesRes.rows),
    });
  });

  // Generate candidates for a specific segment (on-demand)
  app.post("/segments/:segmentId/generate", async (request, reply) => {
    const { segmentId } = request.params as { segmentId: string };
    const userId = "user-1"; // TODO: from auth
    const now = new Date().toISOString();

    // Get segment
    const segmentRes = await query<Segment>(
      `SELECT * FROM segments WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [segmentId, userId]
    );

    if (segmentRes.rows.length === 0) {
      return reply.code(404).send({ error: "Segment not found" });
    }

    const segment = toCamelCase(segmentRes.rows)[0];

    // Check if already generated
    if (segment.generationStatus === "generated") {
      const candidatesRes = await query<CandidateExpression>(
        `SELECT * FROM candidate_expressions WHERE segment_id = $1 AND user_id = $2`,
        [segmentId, userId]
      );
      return reply.send({
        segment,
        candidates: toCamelCase(candidatesRes.rows),
      });
    }

    // Mark as generating
    await query(
      `UPDATE segments SET generation_status = $1, updated_at = $2 WHERE id = $3`,
      ["generating", now, segmentId]
    );

    try {
      // Generate candidates
      console.log(`[SEGMENTS] Starting generation for segment ${segmentId}`);
      const provider = createGenerationProvider();
      const result = await provider.generateSegment(segment);
      console.log(`[SEGMENTS] Generated ${result.candidates.length} candidates`);

      // HARD LIMIT
      if (result.candidates.length > 50) {
        console.error(`[SEGMENTS] HARD LIMIT EXCEEDED: ${result.candidates.length} > 50`);
        await query(
          `UPDATE segments SET generation_status = $1, updated_at = $2 WHERE id = $3`,
          ["failed", now, segmentId]
        );
        throw new Error(`Generated ${result.candidates.length} candidates, exceeding hard limit of 50.`);
      }

      // Helper: normalize difficulty
      function normalizeDifficulty(difficulty: any): string {
        if (typeof difficulty === 'string' && ['A2', 'B1', 'B2', 'C1', 'C2'].includes(difficulty)) {
          return difficulty;
        }
        const num = Number(difficulty);
        if (num <= 3) return 'A2';
        if (num <= 5) return 'B1';
        if (num <= 7) return 'B2';
        if (num <= 9) return 'C1';
        return 'C2';
      }

      // Save candidates
      const candidates: CandidateExpression[] = [];
      const expressionSenseMap = new Map<string, string>();

      for (const candidate of result.candidates) {
        if (!candidate.expression || !candidate.normalizedForm || !candidate.type || !candidate.meaningZh) {
          continue;
        }

        const candidateId = randomUUID();
        const normalizedDifficulty = normalizeDifficulty(candidate.difficulty);

        await query(
          `INSERT INTO candidate_expressions (
            id, user_id, article_id, segment_id, expression, normalized_form, type,
            meaning_zh, local_meaning, sentence, sentence_translation, syntax_hint,
            difficulty, value_score, candidate_status, status_reason, occurrence_count,
            model_provider, model_name, prompt_version, generation_version, generated_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
          [
            candidateId, userId, segment.articleId, segmentId,
            candidate.expression, candidate.normalizedForm, candidate.type,
            candidate.meaningZh, candidate.localMeaning || '', candidate.sentence || '',
            candidate.sentenceTranslation || '', candidate.syntaxHint || null,
            normalizedDifficulty, candidate.valueScore || 5,
            candidate.candidateStatus || 'backup_candidate', candidate.statusReason || '',
            candidate.occurrenceCount || 1, candidate.modelProvider || 'unknown',
            candidate.modelName || 'unknown', candidate.promptVersion || 'v1',
            candidate.generationVersion || 'v1', candidate.generatedAt || now,
            now, now,
          ]
        );

        candidates.push({
          id: candidateId, userId, articleId: segment.articleId, segmentId,
          expression: candidate.expression, normalizedForm: candidate.normalizedForm,
          type: candidate.type, meaningZh: candidate.meaningZh,
          localMeaning: candidate.localMeaning || '', sentence: candidate.sentence || '',
          sentenceTranslation: candidate.sentenceTranslation || '',
          syntaxHint: candidate.syntaxHint || null,
          difficulty: normalizedDifficulty as any, valueScore: candidate.valueScore || 5,
          candidateStatus: (candidate.candidateStatus || 'backup_candidate') as any,
          statusReason: candidate.statusReason || '', occurrenceCount: candidate.occurrenceCount || 1,
          modelProvider: candidate.modelProvider || 'unknown',
          modelName: candidate.modelName || 'unknown',
          promptVersion: candidate.promptVersion || 'v1',
          generationVersion: candidate.generationVersion || 'v1',
          generatedAt: candidate.generatedAt || now,
          createdAt: now, updatedAt: now, deletedAt: null,
        });

        // Handle ExpressionSense
        const senseKey = `${candidate.normalizedForm}::${candidate.type}::${candidate.meaningZh}`;
        let expressionSenseId = expressionSenseMap.get(senseKey);

        if (!expressionSenseId) {
          const existingSenseRes = await query<{ id: string }>(
            `SELECT id FROM expression_senses 
             WHERE user_id = $1 AND normalized_form = $2 AND type = $3 AND meaning_zh = $4 AND deleted_at IS NULL`,
            [userId, candidate.normalizedForm, candidate.type, candidate.meaningZh]
          );

          if (existingSenseRes.rows.length > 0) {
            expressionSenseId = existingSenseRes.rows[0]!.id;
          } else {
            expressionSenseId = randomUUID();
            await query(
              `INSERT INTO expression_senses (
                id, user_id, expression, normalized_form, type, meaning_zh, difficulty,
                mastery_status, srs_due_at, review_count, mistake_count, ease_factor,
                interval_days, lapse_count, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
              [expressionSenseId, userId, candidate.expression, candidate.normalizedForm,
               candidate.type, candidate.meaningZh, normalizedDifficulty,
               'new', now, 0, 0, 2.5, 0, 0, now, now]
            );
          }
          expressionSenseMap.set(senseKey, expressionSenseId);
        }

        // Create occurrence
        await query(
          `INSERT INTO occurrences (
            id, user_id, expression_sense_id, source_type, article_id, segment_id,
            sentence, sentence_translation, local_meaning, syntax_hint, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [randomUUID(), userId, expressionSenseId, 'article', segment.articleId, segmentId,
           candidate.sentence || '', candidate.sentenceTranslation || '',
           candidate.localMeaning || '', candidate.syntaxHint || null, now, now]
        );
      }

      // Mark as generated
      await query(
        `UPDATE segments SET generation_status = $1, updated_at = $2 WHERE id = $3`,
        ["generated", now, segmentId]
      );

      console.log(`[SEGMENTS] Generation complete. Saved ${candidates.length} candidates`);

      return reply.send({
        segment: { ...segment, generationStatus: 'generated' },
        candidates,
      });
    } catch (error) {
      console.error(`[SEGMENTS] Generation failed:`, error);
      await query(
        `UPDATE segments SET generation_status = $1, updated_at = $2 WHERE id = $3`,
        ["failed", now, segmentId]
      );
      throw error;
    }
  });

}