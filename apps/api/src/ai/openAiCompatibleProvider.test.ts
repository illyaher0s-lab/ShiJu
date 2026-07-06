import { describe, expect, it } from "vitest";
import { buildGenerationPrompt } from "./openAiCompatibleProvider";

describe("buildGenerationPrompt", () => {
  it("includes the five V1 candidate statuses and generation requirements", () => {
    const prompt = buildGenerationPrompt("A team will roll out the service next month.");

    // Check for the five candidate statuses
    expect(prompt).toContain("selected");
    expect(prompt).toContain("backup_candidate");
    expect(prompt).toContain("ignored_too_easy");
    expect(prompt).toContain("ignored_duplicate");
    expect(prompt).toContain("ignored_over_limit");
    
    // Check for generation requirements
    expect(prompt).toContain("type");
    expect(prompt).toContain("difficulty");
    expect(prompt).toContain("value_score");
    expect(prompt).toContain("Segment:");
  });
});
