import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerArticleRoutes } from "./routes/articles";
import { registerReviewRoutes } from "./routes/review";

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true });
  app.register(registerArticleRoutes);
  app.register(registerReviewRoutes);
  return app;
}
