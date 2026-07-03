import { describe, expect, it } from 'vitest';
import { segmentText } from './segmentationService';

describe('segmentText', () => {
  it('should split text into segments of 150-250 words', () => {
    const text = 'word '.repeat(500); // 500 words
    const segments = segmentText(text.trim());
    
    expect(segments.length).toBeGreaterThan(1);
    for (const segment of segments) {
      const wordCount = segment.text.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(150);
      expect(wordCount).toBeLessThanOrEqual(250);
    }
  });
  
  it('should preserve paragraph boundaries', () => {
    const text = 'First paragraph with fifty words. '.repeat(50) + '\n\n' + 
                 'Second paragraph with fifty words. '.repeat(50);
    const segments = segmentText(text);
    
    // Should not break in the middle of "Second paragraph"
    const hasCleanBreak = segments.some(s => s.text.startsWith('Second paragraph'));
    expect(hasCleanBreak).toBe(true);
  });
  
  it('should handle short text (< 150 words)', () => {
    const text = 'Short text with only twenty words. '.repeat(4);
    const segments = segmentText(text.trim());
    
    expect(segments.length).toBe(1);
    expect(segments[0].text).toBe(text.trim());
  });
  
  it('should assign correct sequence numbers', () => {
    const text = 'word '.repeat(500);
    const segments = segmentText(text.trim());
    
    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].sequence).toBe(i);
    }
  });
  
  it('should calculate word count correctly', () => {
    const text = 'one two three four five';
    const segments = segmentText(text);
    
    expect(segments[0].wordCount).toBe(5);
  });
});
