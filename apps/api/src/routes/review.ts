import type { FastifyInstance } from "fastify";

export async function registerReviewRoutes(app: FastifyInstance) {
  app.get("/review/due", async () => ({
    expressions: [],
  }));
}
