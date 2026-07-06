import type { FastifyInstance } from "fastify";
import type { ManualSelectionGenerationRequest } from "@art/domain";
import { createGenerationProvider } from "../services/generationService";
import { generateManualSelectionDraft } from "../services/manualSelectionService";

export async function registerManualSelectionRoutes(app: FastifyInstance) {
  app.post("/manual-selection/generate", async (request, reply) => {
    const body = request.body as ManualSelectionGenerationRequest;

    try {
      const provider = createGenerationProvider();
      const draft = await generateManualSelectionDraft({
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
