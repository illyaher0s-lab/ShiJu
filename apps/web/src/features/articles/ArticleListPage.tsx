import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export function ArticleListPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    if (!title.trim() || !text.trim()) return;

    setImporting(true);
    // TODO: Call API to import article
    setTimeout(() => {
      setImporting(false);
      alert('Article imported successfully!');
      setTitle('');
      setText('');
    }, 1000);
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
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: 'var(--space-1)' }}>
            Article Title
          </label>
          <input
            type="text"
            placeholder="Enter article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: 'var(--space-1)' }}>
            Article Text
          </label>
          <textarea
            placeholder="Paste article text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
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

        <p style={{ fontSize: '14px', color: 'var(--vercel-gray-500)', marginTop: 'var(--space-3)' }}>
          The article will be automatically segmented and AI will generate expression candidates.
        </p>
      </div>
    </>
  );
}
