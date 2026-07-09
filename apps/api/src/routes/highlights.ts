import type { FastifyInstance } from 'fastify';
import { createGenerationProvider } from '../services/generationService';

export async function registerHighlightRoutes(app: FastifyInstance) {
  // Extract highlights from segment (phase 1)
  app.post('/segments/:segmentId/extract-highlights', async (request, reply) => {
    const { segmentId } = request.params as { segmentId: string };
    const userId = 'user-1'; // TODO: from auth
    
    const segmentRes = await app.pg.query(
      `SELECT * FROM segments WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [segmentId, userId]
    );
    
    if (segmentRes.rows.length === 0) {
      return reply.code(404).send({ error: 'Segment not found' });
    }
    
    const segment = segmentRes.rows[0];
    const provider = createGenerationProvider();
    
    // ponytail: mock returns regex-extracted phrases, real LLM returns semantic list
    const phrases = await provider.extractHighlights(segment);
    
    return reply.send({ phrases });
  });
}
