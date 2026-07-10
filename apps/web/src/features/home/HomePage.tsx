import { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle } from 'lucide-react';
import { getReviewStats } from '../../api/articles';
import { getDailyStats, getReviewCalendar, setDailyGoal } from '../../api/settings';

export function HomePage() {
  const [stats, setStats] = useState({
    dueCount: 0,
    newCount: 0,
    learningCount: 0,
    reviewingCount: 0,
    masteredCount: 0,
    totalCount: 0,
  });
  const [dailyStats, setDailyStats] = useState({ reviewedToday: 0, goal: 20 });
  const [calendar, setCalendar] = useState<Array<{ date: string; count: number }>>([]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('20');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [statsData, dailyData, calendarData] = await Promise.all([
        getReviewStats(),
        getDailyStats(),
        getReviewCalendar(30),
      ]);
      
      setStats({
        dueCount: Number(statsData.dueCount) || 0,
        newCount: Number(statsData.newCount) || 0,
        learningCount: Number(statsData.learningCount) || 0,
        reviewingCount: Number(statsData.reviewingCount) || 0,
        masteredCount: Number(statsData.masteredCount) || 0,
        totalCount: Number(statsData.totalCount) || 0,
      });
      
      setDailyStats(dailyData);
      setGoalInput(String(dailyData.goal));
      
      setCalendar(calendarData.calendar.map(d => ({
        date: d.date,
        count: parseInt(d.count, 10),
      })));
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGoal() {
    const goal = parseInt(goalInput, 10);
    if (goal < 1 || goal > 500) return;
    
    try {
      await setDailyGoal(goal);
      setDailyStats(prev => ({ ...prev, goal }));
      setEditingGoal(false);
    } catch (err) {
      alert('Failed to update goal');
    }
  }

  const progress = dailyStats.goal > 0 
    ? Math.min(100, (dailyStats.reviewedToday / dailyStats.goal) * 100) 
    : 0;

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Welcome to ShiJu AI Reading Trainer
        </p>
      </header>

      {/* Today's Progress */}
      <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Today's Progress</h3>
          {!editingGoal ? (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '12px' }}
              onClick={() => setEditingGoal(true)}
            >
              Set Goal
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
              <input 
                type="number" 
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                min="1"
                max="500"
                style={{ width: '60px', padding: '4px 8px', border: '1px solid var(--vercel-gray-300)', borderRadius: '4px' }}
              />
              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={handleSaveGoal}>Save</button>
              <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setEditingGoal(false)}>Cancel</button>
            </div>
          )}
        </div>
        
        <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
          {loading ? '—' : `${dailyStats.reviewedToday} / ${dailyStats.goal}`}
        </p>
        
        <div style={{ height: '8px', background: 'var(--vercel-gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--vercel-develop-blue)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-2)' }}>Review Calendar (Last 30 Days)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-1)' }}>
          {calendar.slice(0, 35).reverse().map((day, idx) => {
            const intensity = day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / 5));
            const colors = ['#eee', '#c6e7ff', '#8dd3ff', '#54bfff', '#1ba1ff'];
            return (
              <div 
                key={idx}
                title={`${day.date}: ${day.count} reviews`}
                style={{
                  aspectRatio: '1',
                  background: colors[intensity],
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--vercel-gray-500)', marginTop: 'var(--space-2)' }}>
          Lighter = fewer reviews · Darker = more reviews
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
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

      <div className="card" style={{ padding: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
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
