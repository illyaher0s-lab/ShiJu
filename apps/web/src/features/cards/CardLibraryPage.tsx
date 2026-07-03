export function CardLibraryPage() {
  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Library</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Browse your expression cards
        </p>
      </header>

      <div style={{ marginBottom: 'var(--space-3)', maxWidth: '600px' }}>
        <input
          type="search"
          placeholder="Search expressions..."
          style={{ width: '100%' }}
        />
      </div>

      <div className="card-simple" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '600px' }}>
        <p style={{ color: 'var(--vercel-gray-600)' }}>
          No cards yet. Import an article to get started.
        </p>
      </div>
    </>
  );
}
