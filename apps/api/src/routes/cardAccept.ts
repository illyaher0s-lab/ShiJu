import type { FastifyInstance } from "fastify";
import type { CandidateExpression } from "@art/domain";
import { query } from "../db/client";
import { randomUUID } from "crypto";

export async function registerCardAcceptRoutes(app: FastifyInstance) {
  app.post("/cards/accept", async (request, reply) => {
    const draft = request.body as CandidateExpression;
    const userId = "user-1"; // TODO: from auth
    const now = new Date().toISOString();

    // Validate required fields
    if (!draft.expression || !draft.normalizedForm || !draft.type || !draft.meaningZh) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    try {
      // Check if ExpressionSense already exists (de-duplication)
      const existingSenseRes = await query<{ id: string }>(
        `SELECT id FROM expression_senses 
         WHERE user_id = $1 AND normalized_form = $2 AND type = $3 AND meaning_zh = $4 AND deleted_at IS NULL`,
        [userId, draft.normalizedForm, draft.type, draft.meaningZh]
      );

      let expressionSenseId: string;

      if (existingSenseRes.rows.length > 0) {
        // Already exists, use existing
        expressionSenseId = existingSenseRes.rows[0]!.id;
        console.log(`[CARDS] Expression sense already exists: ${expressionSenseId}`);
      } else {
        // Create new ExpressionSense
        expressionSenseId = randomUUID();
        await query(
          `INSERT INTO expression_senses (
            id, user_id, expression, normalized_form, type, meaning_zh, difficulty,
            mastery_status, srs_due_at, review_count, mistake_count, ease_factor,
            interval_days, lapse_count, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            expressionSenseId,
            userId,
            draft.expression,
            draft.normalizedForm,
            draft.type,
            draft.meaningZh,
            draft.difficulty || 'B1',
            'new',
            now, // immediately available for review
            0, 0, 2.5, 0, 0,
            now, now,
          ]
        );
        console.log(`[CARDS] Created new expression sense: ${expressionSenseId}`);
      }

      // Create occurrence (even if sense exists, this is a new encounter)
      const occurrenceId = randomUUID();
      await query(
        `INSERT INTO occurrences (
          id, user_id, expression_sense_id, source_type, article_id, segment_id,
          context_label, context_note, sentence, sentence_translation, local_meaning, syntax_hint,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          occurrenceId,
          userId,
          expressionSenseId,
          'context_entry',
          null,  // No article for context entries
          null,  // No segment for context entries
          'user-added',  // context_label (required for context_entry)
          draft.syntaxHint || null,  // Store original context note
          draft.sentence || '',
          draft.sentenceTranslation || '',
          draft.localMeaning || '',
          null,  // syntax_hint moved to context_note
          now, now,
        ]
      );

      console.log(`[CARDS] Created occurrence: ${occurrenceId}`);

      return reply.send({
        success: true,
        expressionSenseId,
        occurrenceId,
        existed: existingSenseRes.rows.length > 0,
      });
    } catch (error) {
      console.error('[CARDS] Failed to accept card:', error);
      return reply.status(500).send({
        error: error instanceof Error ? error.message : 'Failed to save card',
      });
    }
  });
}
