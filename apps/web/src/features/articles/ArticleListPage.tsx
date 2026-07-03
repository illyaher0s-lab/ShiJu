import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { importArticle, listArticles, type Article } from '../../api/articles';

export function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportForm, setShowImportForm] = useState(false);
  
  // Import form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      const result = await listArticles();
      setArticles(result);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!title.trim() || !text.trim()) {
      setError('Title and text are required');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      await importArticle({
        title: title.trim(),
        rawText: text.trim(),
        sourceType: 'txt',
      });

      setSuccess(true);
      setTitle('');
      setText('');
      setShowImportForm(false);

      // Reload articles list
      await loadArticles();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '1000px' }}>
        <div>
          <h1>Articles</h1>
          <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
            {loading ? 'Loading...' : `${articles.length} articles imported`}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowImportForm(!showImportForm)}
        >
          <Upload size={16} />
          {showImportForm ? 'Cancel' : 'Import Article'}
        </button>
      </header>

      {success && (
        <div
          style={{
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            maxWidth: '1000px',
          }}
        >
          <CheckCircle size={20} color="#16a34a" />
          <span style={{ color: '#16a34a', fontSize: '14px' }}>
            Article imported successfully!
          </span>
        </div>
      )}

      {showImportForm && (
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', maxWidth: '800px' }}>
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
              }}
            >
              <AlertCircle size={20} color="#dc2626" />
              <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: 'var(--space-1)',
              }}
            >
              Article Title
            </label>
            <input
              type="text"
              placeholder="Enter article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={importing}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: 'var(--space-1)',
              }}
            >
              Article Text
            </label>
            <textarea
              placeholder="Paste article text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={importing}
              rows={12}
              style={{
                width: '100%',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={!title.trim() || !text.trim() || importing}
            >
              <Upload size={16} />
              {importing ? 'Importing...' : 'Import Article'}
            </button>

            <button className="btn btn-secondary" disabled>
              <FileText size={16} />
              Upload File
            </button>
          </div>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--vercel-gray-500)',
              marginTop: 'var(--space-3)',
            }}
          >
            The article will be automatically segmented and AI will generate expression candidates.
          </p>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '1000px' }}>
          <p style={{ color: 'var(--vercel-gray-600)' }}>Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', maxWidth: '1000px' }}>
          <BookOpen size={48} color="var(--vercel-gray-400)" style={{ marginBottom: 'var(--space-3)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No articles yet</h3>
          <p style={{ color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-3)' }}>
            Import your first article to start learning
          </p>
          <button className="btn btn-primary" onClick={() => setShowImportForm(true)}>
            <Upload size={16} />
            Import Article
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '1000px' }}>
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/reading/${article.id}`}
              className="card"
              style={{
                padding: 'var(--space-3)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0px 0px 0px 1px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    {article.title}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--vercel-gray-600)', 
                    marginBottom: 'var(--space-2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {article.rawText.substring(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '13px', color: 'var(--vercel-gray-500)' }}>
                    <span>
                      {(article as any).segment_count || 0} segments
                    </span>
                    <span>
                      {(article as any).generated_count || 0} generated
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock size={12} />
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
