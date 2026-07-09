import type { FastifyInstance } from 'fastify';
import { query } from '../db/client';
import { toCamelCaseRow } from '../lib/dbRowTransformer';

export async function registerSettingsRoutes(app: FastifyInstance) {
  // Get daily review goal
  app.get('/settings/daily-goal', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    
    const result = await query(
      `SELECT daily_review_goal FROM user_settings WHERE user_id = $1`,
      [userId]
    );
    
    const goal = result.rows[0]?.daily_review_goal || 20;
    return reply.send({ goal });
  });
  
  // Update daily review goal
  app.post('/settings/daily-goal', async (request, reply) => {
    const userId = 'user-1'; // TODO: from auth
    const { goal } = request.body as { goal: number };
    
    if (!goal || goal < 1 || goal > 500) {
      return reply.code(400).send({ error: 'Goal must be between 1 and 500' });
    }
    
    await query(
      `INSERT INTO user_settings (user_id, daily_review_goal, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET daily_review_goal = $2, updated_at = now()`,
      [userId, goal]
    );
    
    return reply.send({ success: true, goal });
  });
}
