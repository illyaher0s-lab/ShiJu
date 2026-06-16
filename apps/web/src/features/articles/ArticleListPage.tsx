import { useState, useEffect } from "react";
import type { Article, Segment, CandidateExpression } from "@art/domain";
import { getArticles, createArticle } from "../../api/articles";
import { Plus } from "lucide-react";
import { BottomActionButton } from "../../components/BottomActionButton";

interface ArticleListPageProps {
  onArticleSelected: (articleId: string) => void;
  onArticleImported?: (article: Article, segments: Segment[], candidates: CandidateExpression[]) => void;
}

export function ArticleListPage({ onArticleSelected, onArticleImported }: ArticleListPageProps) {
  const [articles, setArticles] = useState<Array<Article & {
    segmentCount: number;
    readCount: number;
    generatedCount: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Import form state
  const [showImportForm, setShowImportForm] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const result = await getArticles();
        setArticles(result.articles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load articles");
      } finally {
        setLoading(false);
      }
    }
    void loadArticles();
  }, []);

  async function handleImportSubmit() {
    if (!pastedText.trim()) return;

    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const result = await createArticle({
        title: `Article ${new Date().toLocaleString()}`,
        sourceType: "txt",
        rawText: pastedText,
      });

      setImportSuccess(true);
      
      // Notify parent
      if (onArticleImported) {
        onArticleImported(result.article, result.segments, result.candidates);
      }
      
      // Reload articles list
      const updatedArticles = await getArticles();
      setArticles(updatedArticles.articles);
      
      // Close form after 1.5s
      setTimeout(() => {
        setShowImportForm(false);
        setPastedText("");
        setImportSuccess(false);
      }, 1500);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import article");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <main className="screen library">
        <section className="readingHeader">
          <h1>Articles</h1>
        </section>
        <p>Loading articles...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="screen library">
        <section className="readingHeader">
          <h1>Articles</h1>
        </section>
        <p style={{ color: "red" }}>Error: {error}</p>
      </main>
    );
  }

  if (articles.length === 0) {
    return (
      <main className="screen library">
        <section className="readingHeader">
          <h1>Articles</h1>
        </section>
        <p>No articles yet. Import one to get started.</p>
      </main>
    );
  }

  return (
    <main className="screen library">
      <section className="readingHeader">
        <h1>Articles</h1>
        <p>{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
      </section>

      {showImportForm && (
        <section className="importPanel">
          <label className="pastePanel">
            <span>Paste article text</span>
            <textarea
              aria-label="Paste article text"
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value);
                setImportSuccess(false);
              }}
            />
            <button type="button" disabled={!pastedText.trim() || importing} onClick={handleImportSubmit}>
              {importing ? "Importing..." : "Use pasted text"}
            </button>
          </label>
          {importSuccess ? <p className="importStatus">Article imported!</p> : null}
          {importError ? <p className="importStatus" style={{ color: "red" }}>{importError}</p> : null}
          <label className="importDrop">
            <span>Import TXT or Markdown article</span>
            <strong>Choose a .txt or .md file</strong>
            <input
              aria-label="Import TXT or Markdown article"
              type="file"
              accept=".txt,.md,.markdown,text/plain,text/markdown"
            />
          </label>
        </section>
      )}

      <BottomActionButton onClick={() => setShowImportForm(!showImportForm)} icon={<Plus size={16} />}>
        {showImportForm ? "Close Import" : "Import Article"}
      </BottomActionButton>

      {articles.map((article) => (
        <section key={article.id} className="libraryItem" onClick={() => onArticleSelected(article.id)} style={{ cursor: "pointer" }}>
          <h2>{article.title}</h2>
          <p>
            {article.segmentCount} segment{article.segmentCount !== 1 ? "s" : ""} · 
            {article.generatedCount} generated · 
            {article.readCount} read
          </p>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </section>
      ))}
    </main>
  );
}
