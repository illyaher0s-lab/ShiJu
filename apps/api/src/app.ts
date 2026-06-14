import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerArticleRoutes } from "./routes/articles";
import { registerManualSelectionRoutes } from "./routes/manualSelection";
import { registerReviewRoutes } from "./routes/review";
import { registerSyncRoutes } from "./routes/sync";

export function buildApp() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: true });
  app.register(registerArticleRoutes);
  app.register(registerReviewRoutes);
  app.register(registerSyncRoutes);
  app.register(registerManualSelectionRoutes);
  return app;
}
