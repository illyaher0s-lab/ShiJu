import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { importArticle } from '../../api/articles';

export function ArticleListPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!title.trim() || !text.trim()) {
      setError('Title and text are required');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await importArticle({
        title: title.trim(),
        rawText: text.trim(),
        sourceType: 'txt',
      });

      console.log('Import successful:', result);
      setSuccess(true);
      setTitle('');
      setText('');

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1>Import Article</h1>
        <p style={{ color: 'var(--vercel-gray-600)', marginTop: 'var(--space-1)' }}>
          Add a new article to start learning
        </p>
      </header>

      <div className="card" style={{ padding: 'var(--space-4)', maxWidth: '800px' }}>
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
            }}
          >
            <CheckCircle size={20} color="#16a34a" />
            <span style={{ color: '#16a34a', fontSize: '14px' }}>
              Article imported successfully! AI is generating expressions...
            </span>
          </div>
        )}

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
    </>
  );
}
