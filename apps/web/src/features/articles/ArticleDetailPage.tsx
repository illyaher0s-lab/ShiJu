import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{  margin: '0 auto' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/import')}
        style={{ marginBottom: 'var(--space-3)' }}
      >
        <ArrowLeft size={16} />
        Back to Articles
      </button>

      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Article {id}</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Article details and segments
        </p>
      </header>

      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <p>Article content will be displayed here.</p>
      </div>
    </div>
  );
}
