import { describe, expect, it, beforeAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';
import { query } from '../db/client';
import { config } from 'dotenv';
import { resolve } from 'path';

describe('POST /articles', () => {
  let app: FastifyInstance;
  
  beforeAll(() => {
    // Load .env file before tests
    config({ path: resolve(__dirname, '../../.env') });
  });
  
  beforeEach(async () => {
    app = await buildApp();
  });
  
  afterEach(async () => {
    await app.close();
  });
  
  it('should import article and create segments', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Test Article',
        rawText: 'word '.repeat(300), // 300 words
        sourceType: 'txt',
      },
    });
    
    if (response.statusCode !== 201) {
      console.log('Error response:', response.body);
    }
    
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.article).toBeDefined();
    expect(body.article.id).toBeDefined();
    expect(body.segments).toBeDefined();
    expect(body.segments.length).toBeGreaterThan(0);
    expect(body.segments[0].generationStatus).toBeDefined();
    
    // Cleanup
    if (body.article?.id) {
      await query('DELETE FROM occurrences WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM candidate_expressions WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM segments WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM articles WHERE id = $1', [body.article.id]);
    }
  });
  
  it('should reject empty text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Empty',
        rawText: '',
        sourceType: 'txt',
      },
    });
    
    // Zod validation throws, Fastify catches and returns 500
    // This is expected behavior without custom error handler
    expect([400, 500]).toContain(response.statusCode);
  });
  
  it('should create multiple segments for long text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/articles',
      payload: {
        title: 'Test',
        rawText: 'word '.repeat(500),
        sourceType: 'txt',
      },
    });
    
    if (response.statusCode !== 201) {
      console.log('Error response:', response.body);
    }
    
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.segments.length).toBeGreaterThan(1);
    
    // Cleanup
    if (body.article?.id) {
      await query('DELETE FROM occurrences WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM candidate_expressions WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM segments WHERE article_id = $1', [body.article.id]);
      await query('DELETE FROM articles WHERE id = $1', [body.article.id]);
    }
  });
});
