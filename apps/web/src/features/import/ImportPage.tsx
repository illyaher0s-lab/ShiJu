import { useState } from "react";
import type { Article, Segment, CandidateExpression } from "@art/domain";
import { createArticle } from "../../api/articles";
import { BottomActionButton } from "../../components/BottomActionButton";
import { Upload } from "lucide-react";

interface ImportPageProps {
  onArticleImported?: (article: Article, segments: Segment[], candidates: CandidateExpression[]) => void;
}

export function ImportPage({ onArticleImported }: ImportPageProps) {
  const [pastedText, setPastedText] = useState("");
  const [pasteAccepted, setPasteAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);

  async function handleSubmit() {
    if (!pastedText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createArticle({
        title: `Article ${new Date().toLocaleString()}`,
        sourceType: "txt",
        rawText: pastedText,
      });

      setPasteAccepted(true);
      
      // Notify parent with article, segments, and candidates
      if (onArticleImported) {
        onArticleImported(result.article, result.segments, result.candidates);
      }
      
      // Close form after successful import
      setTimeout(() => {
        setShowImportForm(false);
        setPastedText("");
        setPasteAccepted(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import article");
      setPasteAccepted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen library">
      <section className="readingHeader">
        <p>TXT / Markdown</p>
        <h1>Articles</h1>
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
                setPasteAccepted(false);
              }}
            />
            <button type="button" disabled={!pastedText.trim() || loading} onClick={handleSubmit}>
              {loading ? "Importing..." : "Use pasted text"}
            </button>
          </label>
          {pasteAccepted ? <p className="importStatus">Article imported! Switch to Read tab to view.</p> : null}
          {error ? <p className="importStatus" style={{ color: "red" }}>{error}</p> : null}
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

      <BottomActionButton onClick={() => setShowImportForm(!showImportForm)} icon={<Upload size={16} />}>
        {showImportForm ? "Close Import" : "Import Article"}
      </BottomActionButton>
    </main>
  );
}
