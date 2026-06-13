import type { ClientOperation } from "@art/domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { applyClientOperationsInMemory } from "../services/syncService";

const clientOperationSchema = z.object({
  clientOperationId: z.string().min(1),
  userId: z.string().min(1),
  operationType: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  payload: z.record(z.unknown()),
  clientCreatedAt: z.string().min(1),
  syncStatus: z.enum(["pending", "synced", "failed"]),
  serverAppliedAt: z.string().nullable(),
});

const syncRequestSchema = z.object({
  operations: z.array(clientOperationSchema),
});

export async function registerSyncRoutes(app: FastifyInstance) {
  app.post("/sync", async (request) => {
    const input = syncRequestSchema.parse(request.body);
    const result = applyClientOperationsInMemory(input.operations as ClientOperation[]);

    return {
      appliedClientOperationIds: result.applied.map((operation) => operation.clientOperationId),
      ignoredDuplicateIds: result.ignoredDuplicateIds,
    };
  });
}
