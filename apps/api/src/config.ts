export interface ApiConfig {
  aiProvider: "mock" | "openai_compatible";
  aiBaseUrl: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
}

export function loadConfig(): ApiConfig {
  return {
    aiProvider: (process.env.AI_PROVIDER as ApiConfig["aiProvider"]) ?? "mock",
    aiBaseUrl: process.env.AI_BASE_URL ?? null,
    aiApiKey: process.env.AI_API_KEY ?? null,
    aiModel: process.env.AI_MODEL ?? null,
  };
}
