export function nowIso(): string {
  return new Date().toISOString();
}

export function isDue(dueAt: string | null, atIso: string): boolean {
  return dueAt === null || dueAt <= atIso;
}
