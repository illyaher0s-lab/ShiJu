import type { ClientOperation } from "@art/domain";

interface CreateOperationInput {
  userId: string;
  operationType: string;
  targetType: string;
  targetId: string;
  payload: Record<string, unknown>;
  now: string;
  id?: string;
}

export function createClientOperation(input: CreateOperationInput): ClientOperation {
  return {
    clientOperationId: input.id ?? `client-op-${crypto.randomUUID()}`,
    userId: input.userId,
    operationType: input.operationType,
    targetType: input.targetType,
    targetId: input.targetId,
    payload: input.payload,
    clientCreatedAt: input.now,
    syncStatus: "pending",
    serverAppliedAt: null,
  };
}
