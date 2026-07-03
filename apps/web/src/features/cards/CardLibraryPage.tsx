import { useState, useEffect } from 'react';
import { Search, BookOpen, Target, Award } from 'lucide-react';
import { listExpressions, type ExpressionSense } from '../../api/articles';

export function CardLibraryPage() {
  const [expressions, setExpressions] = useState<ExpressionSense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadExpressions();
  }, [statusFilter]);

  async function loadExpressions() {
    setLoading(true);
    try {
      const result = await listExpressions({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setExpressions(result.expressions);
    } catch (err) {
      console.error('Failed to load expressions:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadExpressions();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'learning': return '#f59e0b';
      case 'reviewing': return '#8b5cf6';
      case 'mastered': return '#10b981';
      default: return 'var(--vercel-gray-500)';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'new': return 'New';
      case 'learning': return 'Learning';
      case 'reviewing': return 'Reviewing';
      case 'mastered': return 'Mastered';
      default: return status;
    }
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Library</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          {loading ? 'Loading...' : `${expressions.length} expression cards`}
        </p>
      </header>

      {/* Filters */}
      <div style={{ marginBottom: 'var(--space-3)', maxWidth: '800px' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="search"
              placeholder="Search expressions or meanings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className={statusFilter === '' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            All
          </button>
          <button
            className={statusFilter === 'new' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('new')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            New
          </button>
          <button
            className={statusFilter === 'learning' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('learning')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Learning
          </button>
          <button
            className={statusFilter === 'reviewing' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('reviewing')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Reviewing
          </button>
          <button
            className={statusFilter === 'mastered' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setStatusFilter('mastered')}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>Loading cards...</p>
        </div>
      ) : expressions.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '800px' }}>
          <BookOpen size={48} color="var(--vercel-gray-400)" style={{ marginBottom: 'var(--space-3)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No cards yet</h3>
          <p style={{ color: 'var(--vercel-gray-600)' }}>
            {statusFilter ? `No cards in "${getStatusLabel(statusFilter)}" status` : 'Import an article to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', maxWidth: '800px' }}>
          {expressions.map((expr) => (
            <div
              key={expr.id}
              className="card"
              style={{
                padding: 'var(--space-3)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                  {expr.expression}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--vercel-gray-600)' }}>
                  {expr.meaningZh}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '12px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: getStatusColor(expr.masteryStatus),
                    color: 'white',
                    fontWeight: '500',
                  }}
                >
                  {getStatusLabel(expr.masteryStatus)}
                </span>
                
                <span style={{ color: 'var(--vercel-gray-500)' }}>
                  {expr.type}
                </span>
                
                <span style={{ color: 'var(--vercel-gray-500)' }}>
                  {expr.difficulty}
                </span>
                
                <span style={{ color: 'var(--vercel-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Target size={12} />
                  {expr.reviewCount} reviews
                </span>
                
                <span style={{ color: 'var(--vercel-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={12} />
                  {expr.occurrenceCount} contexts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
