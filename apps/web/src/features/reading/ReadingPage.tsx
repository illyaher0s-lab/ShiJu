import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { getArticleSegments } from '../../api/articles';
import { extractHighlights } from '../../api/highlights';
import { buildManualSelectionDraft } from './manualSelection';
import type { Segment, CandidateExpression } from '@art/domain';
import { SelectionToolbar } from './SelectionToolbar';
import { GeneratedCardDraftSheet } from './GeneratedCardDraftSheet';

// ponytail: two-phase generation - highlights first, cards on demand

export function ReadingPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  
  const [segments, setSegments] = useState<Segment[]>([]);
  const [highlights, setHighlights] = useState<Record<string, string[]>>({}); // segmentId → phrases
  const [generatedCards, setGeneratedCards] = useState<Record<string, CandidateExpression>>({}); // phrase → card
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [clickedPhrase, setClickedPhrase] = useState<string | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<CandidateExpression | null>(null);

  useEffect(() => {
    if (articleId) loadSegments();
  }, [articleId]);

  useEffect(() => {
    const current = segments[currentIndex];
    if (current && !highlights[current.id]) {
      loadHighlights(current.id);
    }
  }, [currentIndex, segments]);

  async function loadSegments() {
    setLoading(true);
    setError(null);
    try {
      const result = await getArticleSegments(articleId!);
      setSegments(result.segments);
    } catch (err) {
      console.error('Failed to load segments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }

  async function loadHighlights(segmentId: string) {
    try {
      const phrases = await extractHighlights(segmentId);
      setHighlights(prev => ({ ...prev, [segmentId]: phrases }));
    } catch (err) {
      console.error('Failed to load highlights:', err);
    }
  }

  async function generateCardForPhrase(phrase: string) {
    const current = segments[currentIndex];
    if (!current) return;
    
    setGeneratingCard(true);
    try {
      const sentence = extractSentenceContaining(current.text, phrase);
      const draft = await buildManualSelectionDraft({
        selectedText: phrase,
        sentence,
        articleId: articleId!,
        segmentId: current.id,
        generatedAt: new Date().toISOString(),
      });
      
      setGeneratedCards(prev => ({ ...prev, [phrase]: draft }));
      setGeneratedDraft(draft);
      setClickedPhrase(null);
    } catch (err) {
      console.error('Failed to generate card:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setGeneratingCard(false);
    }
  }

  function extractSentenceContaining(text: string, phrase: string): string {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const match = sentences.find(s => s.toLowerCase().includes(phrase.toLowerCase()));
    return match ? `${match}.` : sentences[0] || text;
  }

  async function handleGenerateCard(text: string) {
    const current = segments[currentIndex];
    if (!current) return;
    
    setGeneratingCard(true);
    setShowToolbar(false);
    
    try {
      const sentence = extractSentenceContaining(current.text, text);
      const draft = await buildManualSelectionDraft({
        selectedText: text,
        sentence,
        articleId: articleId!,
        segmentId: current.id,
        generatedAt: new Date().toISOString(),
      });
      
      setGeneratedDraft(draft);
    } catch (err) {
      console.error('Failed to generate card:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setGeneratingCard(false);
    }
  }

  function handleMouseUp() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    
    if (text && text.length > 2) {
      setSelectedText(text);
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }

  async function handleAcceptDraft(draft: CandidateExpression) {
    // ponytail: auto-add, no confirm
    setGeneratedDraft(null);
    alert(`Card "${draft.expression}" added to review!`);
  }

  function handleDismissDraft() {
    setGeneratedDraft(null);
  }

  const currentSegment = segments[currentIndex];
  
  if (loading) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Reading</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>Loading article...</p>
        </div>
      </>
    );
  }

  if (error || !articleId || !currentSegment) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Reading</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: '#dc2626', marginBottom: 'var(--space-3)' }}>
            {error || 'No article or segment found'}
          </p>
          <button className="btn btn-secondary" onClick={() => navigate('/articles')}>
            <BookOpen size={16} />
            Back to Articles
          </button>
        </div>
      </>
    );
  }

  const progress = Math.round(((currentIndex + 1) / segments.length) * 100);
  const segmentHighlights = highlights[currentSegment.id] || [];

  function renderHighlightedText() {
    const text = currentSegment.text;
    const lowerText = text.toLowerCase();
    
    // ponytail: collect all matches, sort, dedupe overlaps
    const matches: Array<{start: number; end: number; phrase: string; idx: number}> = [];
    segmentHighlights.forEach((phrase, idx) => {
      const pos = lowerText.indexOf(phrase.toLowerCase());
      if (pos !== -1) {
        matches.push({ start: pos, end: pos + phrase.length, phrase, idx });
      }
    });
    
    matches.sort((a, b) => a.start - b.start);
    
    // Remove overlaps: keep first, skip if start < prev.end
    const deduped: typeof matches = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        deduped.push(m);
        lastEnd = m.end;
      }
    }
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    deduped.forEach((m) => {
      if (m.start > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, m.start)}</span>);
      }
      
      const isGenerated = !!generatedCards[m.phrase];
      parts.push(
        <mark
          key={`mark-${m.idx}`}
          onClick={() => isGenerated ? setGeneratedDraft(generatedCards[m.phrase]!) : setClickedPhrase(m.phrase)}
          style={{
            cursor: 'pointer',
            background: isGenerated ? '#d1fae5' : '#fef3c7',
            padding: '2px 4px',
            borderRadius: '3px',
          }}
        >
          {text.slice(m.start, m.end)}
        </mark>
      );
      
      lastIndex = m.end;
    });
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    
    return parts;
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px' }}>
        <div>
          <h1>Reading</h1>
          <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
            Segment {currentIndex + 1} of {segments.length} · {progress}% complete
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/articles')}>
          <BookOpen size={16} />
          Articles
        </button>
      </header>

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '800px' }}>
        <div style={{ height: '4px', background: 'var(--vercel-gray-200)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--vercel-develop-blue)', transition: 'width 0.3s' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-3)', maxWidth: '800px', position: 'relative' }}
           onMouseUp={handleMouseUp}>
        <div style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--vercel-gray-900)', whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {renderHighlightedText()}
        </div>

        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--vercel-gray-200)', display: 'flex', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--vercel-gray-500)' }}>
          <span>{currentSegment.wordCount} words</span>
          <span>·</span>
          <span>{segmentHighlights.length} highlights</span>
        </div>
      </div>

      {showToolbar && selectedText && (
        <div style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <SelectionToolbar selectedText={selectedText} onGenerate={handleGenerateCard} />
        </div>
      )}

      {clickedPhrase && (
        <div style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'white', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}>
          <button
            onClick={() => generateCardForPhrase(clickedPhrase)}
            disabled={generatingCard}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: 'white', background: 'var(--vercel-black)', border: 'none', borderRadius: 'var(--radius-md)', cursor: generatingCard ? 'wait' : 'pointer' }}
          >
            <Sparkles size={16} />
            {generatingCard ? 'Generating...' : `Generate card for "${clickedPhrase}"`}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', maxWidth: '800px' }}>
        <button className="btn btn-secondary" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0} style={{ flex: 1 }}>
          <ChevronLeft size={16} />
          Previous
        </button>
        <button className="btn btn-secondary" onClick={() => setCurrentIndex(i => Math.min(segments.length - 1, i + 1))} disabled={currentIndex === segments.length - 1} style={{ flex: 1 }}>
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {generatedDraft && (
        <GeneratedCardDraftSheet draft={generatedDraft} onAccept={handleAcceptDraft} onDismiss={handleDismissDraft} />
      )}
    </>
  );
}
