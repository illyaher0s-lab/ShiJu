export const candidateStatuses = [
  "selected",
  "backup_candidate",
  "ignored_too_easy",
  "ignored_duplicate",
  "ignored_over_limit"
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

export function isCandidateStatus(value: string): value is CandidateStatus {
  return candidateStatuses.includes(value as CandidateStatus);
}

export function appearsInMoreExpressions(status: CandidateStatus): boolean {
  return status === "backup_candidate" || status === "ignored_over_limit";
}
