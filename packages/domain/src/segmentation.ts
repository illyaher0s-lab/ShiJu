export interface SegmentedText {
  sequence: number;
  text: string;
  wordCount: number;
}

const targetMin = 150;
const targetMax = 250;

export function segmentArticleText(input: string): SegmentedText[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const headingGroups = splitByMarkdownHeadings(normalized);
  const segments: SegmentedText[] = [];

  for (const group of headingGroups) {
    for (const chunk of splitGroupByParagraphs(group)) {
      segments.push({
        sequence: segments.length,
        text: chunk,
        wordCount: countWords(chunk),
      });
    }
  }

  return segments;
}

function splitByMarkdownHeadings(text: string): string[] {
  const lines = text.split("\n");
  const groups: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && current.length > 0) {
      groups.push(current.join("\n").trim());
      current = [];
    }
    current.push(line);
  }

  if (current.length > 0) groups.push(current.join("\n").trim());
  return groups.filter(Boolean);
}

function splitGroupByParagraphs(group: string): string[] {
  const paragraphs = group
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);
    if (currentWords >= targetMin && currentWords + paragraphWords > targetMax) {
      chunks.push(current.join("\n\n"));
      current = [];
      currentWords = 0;
    }
    current.push(paragraph);
    currentWords += paragraphWords;
  }

  if (current.length > 0) chunks.push(current.join("\n\n"));
  return chunks;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
