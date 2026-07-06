import { FastifyPluginAsync } from 'fastify';
import { query } from '../db/client';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (request, reply) => {
    try {
      // Test database connection
      await query('SELECT 1');
      
      return {
        status: 'ok',
        timestamp: Date.now(),
        database: 'connected',
        uptime: process.uptime(),
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'error',
        timestamp: Date.now(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
};
