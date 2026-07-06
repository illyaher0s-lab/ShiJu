import { useState } from "react";
import { BarChart3, BookOpen, Library, ListChecks } from "lucide-react";
import { getDueExpressions, submitReviewFeedback, getReviewStats } from "../../api/articles";
import type { ExpressionSense } from '@art/domain';

export function ReviewPage() {
  const [expressions, setExpressions] = useState<ExpressionSense[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadDueReviews();
  }, []);

  async function loadDueReviews() {
    setLoading(true);
    setError(null);
    try {
      const result = await getDueReviews();
      setExpressions(result.expressions);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(feedback: 'again' | 'hard' | 'good' | 'easy') {
    const current = expressions[currentIndex];
    if (!current) return;
    
    setSubmitting(true);
    
    try {
      const result = await submitReviewFeedback(current.id, feedback);
      console.log('Review feedback submitted:', result);
      
      // Move to next card
      if (currentIndex < expressions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Completed all reviews
        await loadDueReviews();
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Review</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '700px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>Loading reviews...</p>
        </div>
      </>
    );
  }

  if (expressions.length === 0) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Review</h1>
          <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
            No cards due for review
          </p>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '700px' }}>
          <CheckCircle size={48} color="var(--vercel-gray-400)" style={{ marginBottom: 'var(--space-3)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>All caught up!</h3>
          <p style={{ color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-3)' }}>
            You have no cards due for review right now.
          </p>
          <button className="btn btn-secondary" onClick={loadDueReviews}>
            <RotateCcw size={16} />
            Check Again
          </button>
        </div>
      </>
    );
  }

  const current = expressions[currentIndex];
  
  if (!current) {
    return (
      <>
        <header style={{ marginBottom: 'var(--space-4)' }}>
          <h1>Review</h1>
        </header>
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '700px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>No card available</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Review</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Card {currentIndex + 1} of {expressions.length}
        </p>
      </header>

      {error && (
        <div
          style={{
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            maxWidth: '700px',
          }}
        >
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-5)', maxWidth: '700px' }}>
        {/* Question side */}
        <div style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: 'var(--space-2)',
              color: 'var(--vercel-gray-900)',
            }}
          >
            {current!.expression}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'var(--vercel-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {current!.type} • {current!.difficulty}
          </div>
        </div>

        {/* Show answer button */}
        {!showAnswer && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowAnswer(true)}
              disabled={submitting}
            >
              Show Answer
            </button>
          </div>
        )}

        {/* Answer side */}
        {showAnswer && (
          <>
            <div
              style={{
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--vercel-gray-50)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '500', marginBottom: 'var(--space-1)' }}>
                {current!.meaningZh}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--vercel-gray-600)' }}>
                Reviewed {current!.reviewCount} times • {current!.occurrenceCount} occurrences
              </div>
            </div>

            {/* Feedback buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleFeedback('again')}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Again
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleFeedback('hard')}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Hard
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleFeedback('good')}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Good
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleFeedback('easy')}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Easy
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
