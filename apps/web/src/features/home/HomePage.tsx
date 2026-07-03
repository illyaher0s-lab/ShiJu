import { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle } from 'lucide-react';
import { getReviewStats } from '../../api/articles';

export function HomePage() {
  const [stats, setStats] = useState({
    dueCount: 0,
    newCount: 0,
    learningCount: 0,
    reviewingCount: 0,
    masteredCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getReviewStats();
      setStats({
        dueCount: Number(data.due_count) || 0,
        newCount: Number(data.new_count) || 0,
        learningCount: Number(data.learning_count) || 0,
        reviewingCount: Number(data.reviewing_count) || 0,
        masteredCount: Number(data.mastered_count) || 0,
        totalCount: Number(data.total_count) || 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Welcome to ShiJu AI Reading Trainer
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', maxWidth: '1000px' }}>
        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-1)' }}>
            Due Reviews
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            {loading ? '—' : stats.dueCount}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            Ready to review now
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-1)' }}>
            Total Cards
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            {loading ? '—' : stats.totalCount}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            {stats.newCount} new · {stats.learningCount} learning
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-1)' }}>
            Mastered
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            {loading ? '—' : stats.masteredCount}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            {stats.totalCount > 0 ? Math.round((stats.masteredCount / stats.totalCount) * 100) : 0}% of total
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-3)', marginTop: 'var(--space-4)', maxWidth: '1000px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-2)' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <a href="/articles" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <BookOpen size={16} />
            Import Article
          </a>
          <a href="/review" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <Target size={16} />
            Start Review
          </a>
          <a href="/library" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <CheckCircle size={16} />
            Browse Cards
          </a>
        </div>
      </div>
    </>
  );
}
