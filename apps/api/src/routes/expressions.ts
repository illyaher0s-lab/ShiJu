import type { FastifyInstance } from 'fastify';
import { query } from '../db/client';
import { toCamelCase, toCamelCaseRow, stringToNumberArray } from '../lib/dbRowTransformer';

export async function registerExpressionRoutes(app: FastifyInstance) {
  // Get all expression senses with filtering
  app.get('/expressions', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    const { status, search } = request.query as { 
      status?: string;
      search?: string;
    };
    
    let sql = `
      SELECT 
        es.id,
        es.expression,
        es.normalized_form,
        es.type,
        es.meaning_zh,
        es.difficulty,
        es.mastery_status,
        es.srs_due_at,
        es.review_count,
        es.mistake_count,
        es.created_at,
        COUNT(DISTINCT o.id) as occurrence_count
      FROM expression_senses es
      LEFT JOIN occurrences o ON es.id = o.expression_sense_id AND o.deleted_at IS NULL
      WHERE es.user_id = $1 AND es.deleted_at IS NULL
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (status) {
      sql += ` AND es.mastery_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (es.expression ILIKE $${paramIndex} OR es.meaning_zh ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` GROUP BY es.id ORDER BY es.created_at DESC LIMIT 100`;
    
    const result = await query(sql, params);
    
    const camelCaseExpressions = toCamelCase(result.rows);
    const expressions = stringToNumberArray(camelCaseExpressions, ['occurrenceCount', 'reviewCount', 'mistakeCount']);
    
    return reply.send({ 
      expressions,
      total: result.rowCount || 0,
    });
  });
  
  // Get single expression sense with occurrences
  app.get('/expressions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'user-1'; // TODO: from auth
    
    const senseResult = await query(
      `SELECT * FROM expression_senses WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );
    
    if (senseResult.rowCount === 0) {
      return reply.code(404).send({ error: 'Expression sense not found' });
    }
    
    const occurrencesResult = await query(
      `SELECT 
        o.*,
        a.title as article_title,
        s.sequence as segment_sequence
      FROM occurrences o
      LEFT JOIN articles a ON o.article_id = a.id
      LEFT JOIN segments s ON o.segment_id = s.id
      WHERE o.expression_sense_id = $1 AND o.user_id = $2 AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC`,
      [id, userId]
    );
    
    return reply.send({
      expression: toCamelCaseRow(senseResult.rows[0]),
      occurrences: toCamelCase(occurrencesResult.rows),
    });
  });
  
  // Delete expression sense (soft delete)
  app.delete('/expressions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'user-1'; // TODO: from auth
    
    const result = await query(
      `UPDATE expression_senses 
       SET deleted_at = NOW() 
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Expression sense not found' });
    }
    
    return reply.send({ success: true });
  });
}
