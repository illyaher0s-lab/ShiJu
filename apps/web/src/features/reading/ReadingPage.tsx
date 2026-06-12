import { appearsInMoreExpressions, type CandidateExpression, type ReadingFeedback, type Segment } from "@art/domain";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { renderHighlightedText } from "../../lib/highlightText";
import { ExpressionSheet } from "./ExpressionSheet";

interface ReadingPageProps {
  segment: Segment;
  candidates: CandidateExpression[];
  onAddToReview: (candidate: CandidateExpression) => void;
  onReadingFeedback: (candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) => void;
}

export function ReadingPage({ segment, candidates, onAddToReview, onReadingFeedback }: ReadingPageProps) {
  const [selected, setSelected] = useState<CandidateExpression | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.candidateStatus === "selected").slice(0, 6),
    [candidates]
  );
  const moreCandidates = candidates.filter((candidate) => appearsInMoreExpressions(candidate.candidateStatus));

  return (
    <main className="screen">
      <section className="readingHeader">
        <p>Fixture segment</p>
        <h1>Read first, learn in place</h1>
      </section>

      <article className="passage" aria-label="Original reading segment">
        {renderHighlightedText({
          text: segment.text,
          candidates: selectedCandidates,
          onSelect: setSelected
        })}
      </article>

      <section className="morePanel">
        <button
          className="moreToggle"
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((current) => !current)}
        >
          <span>More expressions</span>
          {moreOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {moreOpen ? (
          <div className="moreList">
            {moreCandidates.map((candidate) => (
              <button className="moreItem" key={candidate.id} type="button" onClick={() => setSelected(candidate)}>
                <span>{candidate.expression}</span>
                <small>{candidate.candidateStatus}</small>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {selected ? (
        <ExpressionSheet
          candidate={selected}
          onAddToReview={onAddToReview}
          onReadingFeedback={onReadingFeedback}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </main>
  );
}
