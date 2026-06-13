import type { ClientOperation } from "@art/domain";

export function applyClientOperationsInMemory(operations: ClientOperation[]) {
  const seen = new Set<string>();
  const applied: ClientOperation[] = [];
  const ignoredDuplicateIds: string[] = [];

  for (const operation of [...operations].sort((a, b) => a.clientCreatedAt.localeCompare(b.clientCreatedAt))) {
    if (seen.has(operation.clientOperationId)) {
      ignoredDuplicateIds.push(operation.clientOperationId);
      continue;
    }

    seen.add(operation.clientOperationId);
    applied.push({ ...operation, syncStatus: "synced", serverAppliedAt: new Date().toISOString() });
  }

  return { applied, ignoredDuplicateIds };
}
