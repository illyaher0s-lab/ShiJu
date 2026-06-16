import { useState, useEffect } from "react";
import type { Segment, CandidateExpression } from "@art/domain";
import { getArticleSegments } from "../../api/articles";
import { ChevronLeft } from "lucide-react";

interface ArticleDetailPageProps {
  articleId: string;
  onSegmentSelected: (segmentId: string, segments: Segment[], candidates: CandidateExpression[]) => void;
  onBack: () => void;
}

export function ArticleDetailPage({ articleId, onSegmentSelected, onBack }: ArticleDetailPageProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [candidates, setCandidates] = useState<CandidateExpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSegments() {
      try {
        setLoading(true);
        const result = await getArticleSegments(articleId);
        setSegments(result.segments);
        setCandidates(result.candidates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load segments");
      } finally {
        setLoading(false);
      }
    }
    void loadSegments();
  }, [articleId]);

  if (loading) {
    return (
      <main className="screen library">
        <header style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}>
          <button 
            onClick={onBack} 
            type="button"
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginRight: "8px"
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Segments</h1>
        </header>
        <p style={{ padding: "16px" }}>Loading segments...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="screen library">
        <header style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}>
          <button 
            onClick={onBack} 
            type="button"
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginRight: "8px"
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Segments</h1>
        </header>
        <p style={{ color: "red", padding: "16px" }}>Error: {error}</p>
      </main>
    );
  }

  if (segments.length === 0) {
    return (
      <main className="screen library">
        <header style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff"
        }}>
          <button 
            onClick={onBack} 
            type="button"
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginRight: "8px"
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Segments</h1>
        </header>
        <p style={{ padding: "16px" }}>No segments found.</p>
      </main>
    );
  }

  return (
    <main className="screen library">
      <header style={{
        display: "flex",
        alignItems: "center",
        padding: "16px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fff"
      }}>
        <button 
          onClick={onBack} 
          type="button"
          style={{
            background: "none",
            border: "none",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            marginRight: "8px"
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Segments</h1>
      </header>

      <div style={{ padding: "16px 0" }}>
        {segments.map((segment) => {
          const segmentCandidates = candidates.filter(c => c.segmentId === segment.id);
          const isGenerated = segment.generationStatus === "generated";
          const isRead = segment.progressStatus === "read";
          
          return (
            <section 
              key={segment.id} 
              className="libraryItem" 
              onClick={() => isGenerated ? onSegmentSelected(segment.id, segments, candidates) : null}
              style={{ 
                cursor: isGenerated ? "pointer" : "default",
                opacity: isGenerated ? 1 : 0.6
              }}
            >
              <h2>Segment {segment.sequence + 1}</h2>
              <p>
                {segment.wordCount} words · 
                {isGenerated ? ` ${segmentCandidates.length} candidates` : " Not generated"} · 
                {isRead ? " Read" : " Unread"}
              </p>
              <span style={{ 
                fontSize: "0.875rem",
                color: isGenerated ? (isRead ? "#4ade80" : "#60a5fa") : "#9ca3af"
              }}>
                {isGenerated ? (isRead ? "✓ Read" : "● Ready") : "○ Not generated"}
              </span>
            </section>
          );
        })}
      </div>
    </main>
  );
}
