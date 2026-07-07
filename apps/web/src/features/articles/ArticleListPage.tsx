import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, BookOpen, Clock, Edit2, Trash2, X } from 'lucide-react';
import { importArticle, listArticles, deleteArticle, type Article } from '../../api/articles';

export function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  
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

  async function handleBatchDelete() {
    if (selectedArticles.size === 0) return;
    
    if (!confirm(`Delete ${selectedArticles.size} article(s)? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedArticles).map(id => deleteArticle(id))
      );
      
      setSelectedArticles(new Set());
      setEditMode(false);
      await loadArticles();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete articles');
    } finally {
      setDeleting(false);
    }
  }

  function toggleArticleSelection(articleId: string) {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  }

  function toggleSelectAll() {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)));
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
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!editMode ? (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => setEditMode(true)}
                disabled={articles.length === 0}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowImportForm(!showImportForm)}
              >
                <Upload size={16} />
                {showImportForm ? 'Cancel' : 'Import Article'}
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  setSelectedArticles(new Set());
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                className="btn"
                onClick={handleBatchDelete}
                disabled={selectedArticles.size === 0 || deleting}
                style={{
                  background: selectedArticles.size > 0 ? '#dc2626' : undefined,
                  color: selectedArticles.size > 0 ? 'white' : undefined,
                }}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting...' : `Delete (${selectedArticles.size})`}
              </button>
            </>
          )}
        </div>
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
              Import Article
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

      {/* Edit Mode Header */}
      {editMode && articles.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3)', maxWidth: '1000px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedArticles.size === articles.length}
              onChange={toggleSelectAll}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: 'var(--vercel-gray-600)' }}>
              Select all ({articles.length})
            </span>
          </label>
        </div>
      )}

      {/* Importing Loading Dialog */}
      {importing && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
            }}
          />
          {/* Loading Dialog */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              zIndex: 1000,
              textAlign: 'center',
              minWidth: '280px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: 'var(--space-3)' }}>📚</div>
            <div style={{ fontSize: '16px', color: 'var(--gray-700)', fontWeight: 500 }}>Importing article...</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
              Segmenting text and generating expressions
            </div>
          </div>
        </>
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
            <div
              key={article.id}
              className="card"
              style={{
                padding: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                transition: 'box-shadow 0.2s',
              }}
            >
              {editMode && (
                <input
                  type="checkbox"
                  checked={selectedArticles.has(article.id)}
                  onChange={() => toggleArticleSelection(article.id)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    marginTop: '2px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              )}
              <a
                href={editMode ? undefined : `/shiju/reading/${article.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  flex: 1,
                  cursor: editMode ? 'default' : 'pointer',
                }}
                onClick={(e) => {
                  if (editMode) {
                    e.preventDefault();
                  }
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
                        {article.segmentCount || 0} segments
                      </span>
                      <span>
                        {article.generatedCount || 0} generated
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <Clock size={12} />
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
