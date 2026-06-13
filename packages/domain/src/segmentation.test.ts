import { describe, expect, it } from "vitest";
import { segmentArticleText } from "./segmentation";

describe("segmentArticleText", () => {
  it("keeps markdown headings as segment boundaries", () => {
    const text = "# First\n\n" + "word ".repeat(160) + "\n\n# Second\n\n" + "next ".repeat(160);
    const segments = segmentArticleText(text);
    expect(segments).toHaveLength(2);
    expect(segments[0]!.text.startsWith("# First")).toBe(true);
    expect(segments[1]!.text.startsWith("# Second")).toBe(true);
  });

  it("splits long paragraph groups near the 150 to 250 word target", () => {
    const text = Array.from({ length: 7 }, (_, index) => `Paragraph ${index}. ` + "word ".repeat(60)).join("\n\n");
    const segments = segmentArticleText(text);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => segment.wordCount <= 260)).toBe(true);
  });
});
