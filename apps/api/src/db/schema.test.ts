import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("database schema", () => {
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

  it("enforces idempotent client operations", () => {
    expect(schema).toContain("client_operation_id");
    expect(schema).toContain("unique");
  });

  it("stores generation version metadata", () => {
    expect(schema).toContain("model_provider");
    expect(schema).toContain("model_name");
    expect(schema).toContain("prompt_version");
    expect(schema).toContain("generation_version");
  });

  it("separates expression senses from occurrences", () => {
    expect(schema).toContain("create table expression_senses");
    expect(schema).toContain("create table occurrences");
  });
});
