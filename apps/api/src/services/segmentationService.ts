export interface Segment {
  text: string;
  sequence: number;
  wordCount: number;
}

/**
 * Split text into segments of 150-250 words, respecting paragraph boundaries.
 * Strategy:
 * 1. Split by double newline (paragraphs)
 * 2. Accumulate paragraphs until reaching 150-250 words
 * 3. If a single paragraph > 250 words, split at sentence boundaries
 */
export function segmentText(text: string): Segment[] {
  const MIN_WORDS = 150;
  const MAX_WORDS = 250;
  
  // If text has no paragraph breaks, treat as single paragraph
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  
  // If only one paragraph or no paragraph breaks, check if it needs splitting
  if (paragraphs.length === 1) {
    const totalWords = countWords(paragraphs[0]);
    if (totalWords <= MAX_WORDS) {
      return [createSegment(paragraphs[0], 0)];
    }
    // Split single long paragraph at sentence boundaries
    return splitLongParagraph(paragraphs[0]);
  }
  
  const segments: Segment[] = [];
  let currentSegment: string[] = [];
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphWordCount = countWords(paragraph);
    
    // If single paragraph is too long, split at sentences
    if (paragraphWordCount > MAX_WORDS) {
      // Flush current segment if any
      if (currentSegment.length > 0) {
        segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
        currentSegment = [];
        currentWordCount = 0;
      }
      
      // Split and add long paragraph segments
      const longParaSegments = splitLongParagraph(paragraph);
      for (const seg of longParaSegments) {
        segments.push(createSegment(seg.text, segments.length));
      }
      
      continue;
    }
    
    // Check if adding this paragraph exceeds MAX_WORDS
    if (currentWordCount + paragraphWordCount > MAX_WORDS && currentSegment.length > 0) {
      // Flush current segment
      segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
      currentSegment = [paragraph];
      currentWordCount = paragraphWordCount;
    } else {
      currentSegment.push(paragraph);
      currentWordCount += paragraphWordCount;
      
      // If we've reached MIN_WORDS, consider flushing
      if (currentWordCount >= MIN_WORDS) {
        segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
        currentSegment = [];
        currentWordCount = 0;
      }
    }
  }
  
  // Flush remaining
  if (currentSegment.length > 0) {
    segments.push(createSegment(currentSegment.join('\n\n'), segments.length));
  }
  
  return segments;
}

function splitLongParagraph(paragraph: string): Segment[] {
  const MAX_WORDS = 250;
  const segments: Segment[] = [];
  
  // Try to split at sentence boundaries first
  const sentences = paragraph.match(/[^.!?]+[.!?]+/g);
  
  if (sentences && sentences.length > 1) {
    // Has sentences with punctuation
    let sentenceBuffer: string[] = [];
    let sentenceWordCount = 0;
    
    for (const sentence of sentences) {
      const words = countWords(sentence);
      
      if (sentenceWordCount + words > MAX_WORDS && sentenceBuffer.length > 0) {
        segments.push(createSegment(sentenceBuffer.join(' '), segments.length));
        sentenceBuffer = [sentence];
        sentenceWordCount = words;
      } else {
        sentenceBuffer.push(sentence);
        sentenceWordCount += words;
      }
    }
    
    if (sentenceBuffer.length > 0) {
      segments.push(createSegment(sentenceBuffer.join(' '), segments.length));
    }
  } else {
    // No sentence punctuation, split by word count
    const words = paragraph.split(/\s+/);
    let currentChunk: string[] = [];
    
    for (const word of words) {
      currentChunk.push(word);
      
      if (currentChunk.length >= MAX_WORDS) {
        segments.push(createSegment(currentChunk.join(' '), segments.length));
        currentChunk = [];
      }
    }
    
    if (currentChunk.length > 0) {
      segments.push(createSegment(currentChunk.join(' '), segments.length));
    }
  }
  
  return segments;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function createSegment(text: string, sequence: number): Segment {
  return {
    text,
    sequence,
    wordCount: countWords(text),
  };
}
