import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getExpression, type ExpressionSense } from '../../api/articles';

export function ExpressionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expression, setExpression] = useState<ExpressionSense | null>(null);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadExpression();
  }, [id]);

  async function loadExpression() {
    try {
      const result = await getExpression(id!);
      setExpression(result.expression);
      setOccurrences(result.occurrences);
    } catch (err) {
      console.error('Failed to load expression:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 'var(--space-4)' }}>Loading...</div>;
  }

  if (!expression) {
    return <div style={{ padding: 'var(--space-4)' }}>Expression not found</div>;
  }

  return (
    <>
      <button
        onClick={() => navigate('/library')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '8px 12px',
          marginBottom: 'var(--space-3)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--vercel-gray-600)',
          fontSize: '14px',
        }}
      >
        <ArrowLeft size={16} />
        Back to Cards
      </button>

      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-3)', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          {expression.expression}
        </h1>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p style={{ fontSize: '16px', color: 'var(--vercel-gray-700)', marginBottom: 'var(--space-1)' }}>
            {expression.localMeaning}
          </p>
          <p style={{ fontSize: '16px', color: 'var(--vercel-gray-600)' }}>
            {expression.meaningZh}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '14px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--vercel-gray-100)',
            color: 'var(--vercel-gray-700)',
          }}>
            {expression.type}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--vercel-gray-100)',
            color: 'var(--vercel-gray-700)',
          }}>
            {expression.difficulty}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--vercel-gray-100)',
            color: 'var(--vercel-gray-700)',
          }}>
            {expression.masteryStatus}
          </span>
        </div>
      </div>

      {occurrences.length > 0 && (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            <BookOpen size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Contexts ({occurrences.length})
          </h2>
          {occurrences.map((occ, idx) => (
            <div key={idx} className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: 'var(--space-1)' }}>
                {occ.sentence}
              </p>
              {occ.sentenceTranslation && (
                <p style={{ fontSize: '13px', color: 'var(--vercel-gray-600)' }}>
                  {occ.sentenceTranslation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
