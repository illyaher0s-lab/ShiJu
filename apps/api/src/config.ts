export interface ApiConfig {
  aiProvider: "mock" | "openai_compatible";
  aiBaseUrl: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
}

export function loadConfig(): ApiConfig {
  const provider = process.env.AI_PROVIDER as ApiConfig["aiProvider"] | undefined;
  
  // Explicit validation: if provider is set to openai_compatible, require all fields
  if (provider === "openai_compatible") {
    const missing: string[] = [];
    if (!process.env.AI_BASE_URL) missing.push("AI_BASE_URL");
    if (!process.env.AI_API_KEY) missing.push("AI_API_KEY");
    if (!process.env.AI_MODEL) missing.push("AI_MODEL");
    
    if (missing.length > 0) {
      throw new Error(
        `AI_PROVIDER=openai_compatible requires: ${missing.join(", ")}. ` +
        `Check your .env file or environment variables.`
      );
    }
  }
  
  return {
    aiProvider: provider ?? "mock",
    aiBaseUrl: process.env.AI_BASE_URL ?? null,
    aiApiKey: process.env.AI_API_KEY ?? null,
    aiModel: process.env.AI_MODEL ?? null,
  };
}
