import type { FastifyInstance } from 'fastify';
import { createGenerationProvider } from '../services/generationService';

export async function registerHighlightRoutes(app: FastifyInstance) {
  console.log('[HIGHLIGHTS] Registering highlight routes...');
  
  // Extract highlights from segment (phase 1)
  app.post('/segments/:segmentId/extract-highlights', async (request, reply) => {
    console.log('[HIGHLIGHTS] Route called:', request.params);
    const { segmentId } = request.params as { segmentId: string };
    const userId = 'user-1'; // TODO: from auth
    
    const { query } = await import('../db/client');
    const segmentRes = await query(
      `SELECT * FROM segments WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [segmentId, userId]
    );
    
    if (segmentRes.rows.length === 0) {
      return reply.code(404).send({ error: 'Segment not found' });
    }
    
    const segment = segmentRes.rows[0];
    
    // ponytail: cache to avoid re-calling LLM on every page load
    if (segment.highlights) {
      console.log('[HIGHLIGHTS] Returning cached:', segment.highlights.length, 'phrases');
      return reply.send({ phrases: segment.highlights });
    }
    
    const provider = createGenerationProvider();
    const phrases = await provider.extractHighlights(segment);
    console.log('[HIGHLIGHTS] Extracted:', phrases.length, 'phrases');
    
    // Store for next time
    await query(
      `UPDATE segments SET highlights = $1, updated_at = now() WHERE id = $2`,
      [JSON.stringify(phrases), segmentId]
    );
    
    return reply.send({ phrases });
  });
  
  console.log('[HIGHLIGHTS] Registration complete');
}
