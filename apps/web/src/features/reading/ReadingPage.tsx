import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getArticleSegments } from '../../api/articles';
import type { Segment, CandidateExpression } from '@art/domain';
import { SelectionToolbar } from './SelectionToolbar';
import { GeneratedCardDraftSheet } from './GeneratedCardDraftSheet';
import { buildManualSelectionDraft } from './manualSelection';

export function ReadingPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Manual selection state
  const [selectedText, setSelectedText] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<CandidateExpression | null>(null);

  useEffect(() => {
    if (articleId) {
      loadSegments();
    }
  }, [articleId]);

  useEffect(() => {
    // Listen for text selection
    function handleSelectionChange() {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      if (text && text.length > 0) {
        setSelectedText(text);
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  async function loadSegments() {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getArticleSegments(articleId);
      setSegments(result.segments);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load segments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }

  function goToPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      clearSelection();
    }
  }

  function goToNext() {
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(currentIndex + 1);
      clearSelection();
    }
  }

  function clearSelection() {
    window.getSelection()?.removeAllRanges();
    setShowToolbar(false);
    setSelectedText('');
  }

  function handleGenerateCard(text: string) {
    if (!articleId) return;
    
    const currentSegment = segments[currentIndex];
    if (!currentSegment) return;
    
    const draft = buildManualSelectionDraft({
      selectedText: text,
      sentence: currentSegment.text,
      articleId,
      segmentId: currentSegment.id,
      generatedAt: new Date().toISOString(),
    });
    
    setGeneratedDraft(draft);
    setShowToolbar(false);
  }

  function handleAcceptDraft(draft: CandidateExpression) {
    console.log('Accepted draft:', draft);
    // TODO: Save to backend via POST /manual-selection/accept or similar
    alert(`Card "${draft.expression}" added to review!`);
    setGeneratedDraft(null);
    clearSelection();
  }

  function handleDismissDraft() {
    setGeneratedDraft(null);
    clearSelection();
  }

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

  if (error || !articleId) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Reading</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: '#dc2626', marginBottom: 'var(--space-3)' }}>
            {error || 'No article selected'}
          </p>
          <button className="btn btn-secondary" onClick={() => navigate('/articles')}>
            <BookOpen size={16} />
            Back to Articles
          </button>
        </div>
      </>
    );
  }

  if (segments.length === 0) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Reading</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-3)' }}>
            This article has no segments
          </p>
          <button className="btn btn-secondary" onClick={() => navigate('/articles')}>
            <BookOpen size={16} />
            Back to Articles
          </button>
        </div>
      </>
    );
  }

  const currentSegment = segments[currentIndex];
  if (!currentSegment) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Reading</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>Invalid segment index</p>
        </div>
      </>
    );
  }

  const progress = Math.round(((currentIndex + 1) / segments.length) * 100);

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

      {/* Progress bar */}
      <div style={{ marginBottom: 'var(--space-4)', maxWidth: '800px' }}>
        <div
          style={{
            height: '4px',
            background: 'var(--vercel-gray-200)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--vercel-black)',
              width: `${progress}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Segment content */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-3)', maxWidth: '800px', position: 'relative' }}>
        <div
          style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: 'var(--vercel-gray-900)',
            whiteSpace: 'pre-wrap',
            userSelect: 'text',
          }}
        >
          {currentSegment.text}
        </div>

        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--vercel-gray-200)',
            display: 'flex',
            gap: 'var(--space-2)',
            fontSize: '13px',
            color: 'var(--vercel-gray-500)',
          }}
        >
          <span>{currentSegment.wordCount} words</span>
          <span>·</span>
          <span>
            Status:{' '}
            <span style={{ textTransform: 'capitalize' }}>
              {currentSegment.progressStatus}
            </span>
          </span>
          <span>·</span>
          <span>
            Generation:{' '}
            <span style={{ textTransform: 'capitalize' }}>
              {currentSegment.generationStatus.replace('_', ' ')}
            </span>
          </span>
        </div>
      </div>

      {/* Selection Toolbar */}
      {showToolbar && selectedText && (
        <div style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <SelectionToolbar
            selectedText={selectedText}
            onGenerate={handleGenerateCard}
          />
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '800px' }}>
        <button
          className="btn btn-secondary"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          style={{ flex: 1 }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={goToNext}
          disabled={currentIndex === segments.length - 1}
          style={{ flex: 1 }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {currentIndex === segments.length - 1 && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          <p style={{ color: '#16a34a', marginBottom: 'var(--space-2)' }}>
            🎉 You've reached the end of this article!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/articles')}>
            <BookOpen size={16} />
            Back to Articles
          </button>
        </div>
      )}

      {/* Generated Draft Sheet */}
      {generatedDraft && (
        <GeneratedCardDraftSheet
          draft={generatedDraft}
          onAccept={handleAcceptDraft}
          onDismiss={handleDismissDraft}
        />
      )}
    </>
  );
}
