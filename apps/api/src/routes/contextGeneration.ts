import type { FastifyInstance } from "fastify";
import type { ContextEntryGenerationRequest } from "@art/domain";
import { createGenerationProvider } from "../services/generationService";
import { generateContextEntryDraft } from "../services/contextGenerationService";

export async function registerContextGenerationRoutes(app: FastifyInstance) {
  app.post("/cards/context/generate", async (request, reply) => {
    const body = request.body as ContextEntryGenerationRequest;

    try {
      const provider = createGenerationProvider();
      const draft = await generateContextEntryDraft({
        provider,
        request: body,
      });

      return reply.send(draft);
    } catch (error) {
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  });
}
