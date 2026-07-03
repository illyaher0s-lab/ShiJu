export function HomePage() {
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
            New Cards Today
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            0
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            Target: 6
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-1)' }}>
            Reviews Completed
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            0
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            Target: 12
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-1)' }}>
            Due Reviews
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--vercel-black)' }}>
            0
          </p>
          <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)' }}>
            Ready now
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-3)', marginTop: 'var(--space-4)', maxWidth: '1000px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-2)' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-primary">Start Review</button>
          <button className="btn btn-secondary">Import Article</button>
        </div>
      </div>
    </>
  );
}
