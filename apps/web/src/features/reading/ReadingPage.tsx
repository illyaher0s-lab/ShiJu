export function ReadingPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Reading</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Read articles and discover expressions
        </p>
      </header>

      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <p style={{ lineHeight: '1.8', fontSize: '16px' }}>
          Select an article from the Library to start reading.
        </p>
      </div>
    </div>
  );
}
