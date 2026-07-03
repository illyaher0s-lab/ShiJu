import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerArticleRoutes } from "./routes/articles";
import { registerContextGenerationRoutes } from "./routes/contextGeneration";
import { registerManualSelectionRoutes } from "./routes/manualSelection";
import { registerReviewRoutes } from "./routes/review";
import { registerSyncRoutes } from "./routes/sync";
import { registerExpressionRoutes } from "./routes/expressions";

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true });
  app.register(registerArticleRoutes);
  app.register(registerReviewRoutes);
  app.register(registerExpressionRoutes);
  app.register(registerSyncRoutes);
  app.register(registerManualSelectionRoutes);
  app.register(registerContextGenerationRoutes);
  return app;
}
