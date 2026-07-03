export function ReviewPage() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Review</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Practice your expressions
        </p>
      </header>

      <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--vercel-gray-400)', margin: '0 auto' }}>
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </div>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>All caught up!</h2>
        <p style={{ color: 'var(--vercel-gray-600)' }}>
          No cards due for review right now.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: 'var(--space-3)' }}>
          Refresh
        </button>
      </div>
    </div>
  );
}
