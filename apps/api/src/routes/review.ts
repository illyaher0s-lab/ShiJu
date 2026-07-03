import type { FastifyInstance } from 'fastify';
import { query } from '../db/client';

export async function registerReviewRoutes(app: FastifyInstance) {
  // Get cards due for review
  app.get('/review/due', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    
    const result = await query(
      `SELECT 
        es.id,
        es.expression,
        es.normalized_form,
        es.type,
        es.meaning_zh,
        es.difficulty,
        es.mastery_status,
        es.srs_due_at,
        es.review_count,
        COUNT(o.id) as occurrence_count
      FROM expression_senses es
      LEFT JOIN occurrences o ON es.id = o.expression_sense_id AND o.deleted_at IS NULL
      WHERE es.user_id = $1 
        AND es.deleted_at IS NULL
        AND es.srs_due_at <= NOW()
        AND es.mastery_status IN ('new', 'learning', 'reviewing')
      GROUP BY es.id
      ORDER BY es.srs_due_at ASC
      LIMIT 20`,
      [userId]
    );
    
    return reply.send({ 
      expressions: result.rows,
      total: result.rowCount || 0,
    });
  });
  
  // Submit review feedback
  app.post('/review/feedback', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    const { expressionSenseId, feedback } = request.body as {
      expressionSenseId: string;
      feedback: 'again' | 'hard' | 'good' | 'easy';
    };
    
    if (!expressionSenseId || !feedback) {
      return reply.code(400).send({ error: 'expressionSenseId and feedback are required' });
    }
    
    // Get current state
    const senseResult = await query(
      `SELECT * FROM expression_senses WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [expressionSenseId, userId]
    );
    
    if (senseResult.rowCount === 0) {
      return reply.code(404).send({ error: 'Expression sense not found' });
    }
    
    const sense = senseResult.rows[0];
    const now = new Date().toISOString();
    
    // Simple SM-2 algorithm
    const rating = { again: 1, hard: 2, good: 3, easy: 4 }[feedback];
    let easeFactor = sense.ease_factor || 2.5;
    let intervalDays = sense.interval_days || 0;
    let masteryStatus = sense.mastery_status;
    
    if (rating === 1) {
      // Forgot - reset
      intervalDays = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      masteryStatus = 'learning';
    } else {
      // Successful recall
      if (intervalDays === 0) {
        intervalDays = 1;
      } else if (intervalDays === 1) {
        intervalDays = rating === 4 ? 4 : 3; // Easy: 4 days, Good: 3 days
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      
      // Adjust ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
      
      // Update mastery status
      if (intervalDays >= 21) {
        masteryStatus = 'mastered';
      } else if (intervalDays >= 7) {
        masteryStatus = 'reviewing';
      } else {
        masteryStatus = 'learning';
      }
    }
    
    const nextDueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
    
    // Update expression_sense
    await query(
      `UPDATE expression_senses 
       SET ease_factor = $1, 
           interval_days = $2, 
           mastery_status = $3, 
           srs_due_at = $4,
           review_count = review_count + 1,
           mistake_count = mistake_count + $5,
           lapse_count = lapse_count + $6,
           updated_at = $7
       WHERE id = $8 AND user_id = $9`,
      [
        easeFactor,
        intervalDays,
        masteryStatus,
        nextDueAt,
        rating === 1 ? 1 : 0, // mistake_count increment
        rating === 1 ? 1 : 0, // lapse_count increment
        now,
        expressionSenseId,
        userId,
      ]
    );
    
    // Log the review
    await query(
      `INSERT INTO review_logs (
        user_id, expression_sense_id, feedback, rating,
        previous_due_at, next_due_at, 
        previous_ease_factor, next_ease_factor,
        previous_interval_days, next_interval_days,
        reviewed_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        userId,
        expressionSenseId,
        feedback,
        rating,
        sense.srs_due_at,
        nextDueAt,
        sense.ease_factor,
        easeFactor,
        sense.interval_days,
        intervalDays,
        now,
        now,
      ]
    );
    
    return reply.send({
      success: true,
      nextDueAt,
      intervalDays,
      masteryStatus,
    });
  });
  
  // Get review statistics
  app.get('/review/stats', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    
    const stats = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE srs_due_at <= NOW() AND mastery_status IN ('new', 'learning', 'reviewing')) as due_count,
        COUNT(*) FILTER (WHERE mastery_status = 'new') as new_count,
        COUNT(*) FILTER (WHERE mastery_status = 'learning') as learning_count,
        COUNT(*) FILTER (WHERE mastery_status = 'reviewing') as reviewing_count,
        COUNT(*) FILTER (WHERE mastery_status = 'mastered') as mastered_count,
        COUNT(*) as total_count
      FROM expression_senses
      WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    
    return reply.send(stats.rows[0]);
  });
}
