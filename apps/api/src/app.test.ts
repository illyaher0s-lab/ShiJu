import { describe, expect, it } from "vitest";
import { buildApp } from "./app";

describe("API app", () => {
  it("imports an article and returns first segment generation status", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/articles",
      payload: {
        title: "Sample",
        sourceType: "markdown",
        rawText: "# Heading\n\n" + "word ".repeat(180),
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.article.title).toBe("Sample");
    expect(body.segments[0].generationStatus).toBe("generated");
  });
});
