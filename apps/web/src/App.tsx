import type { CandidateExpression, ReadingFeedback, ReviewFeedback } from "@art/domain";
import { BookMarked, BookOpen, Files, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CardLibraryPage } from "./features/cards/CardLibraryPage";
import { ImportPage } from "./features/import/ImportPage";
import { ReadingPage } from "./features/reading/ReadingPage";
import { ReviewPage } from "./features/review/ReviewPage";
import { applyReviewAction, type ReviewState } from "./features/review/reviewState";
import { sampleCandidates, sampleExpressionSenses, sampleOccurrences, sampleSegment } from "./fixtures/sampleSegment";

type Tab = "read" | "review" | "cards" | "articles";

const senseByCandidateId: Record<string, string> = {
  "candidate-roll-out": "sense-roll-out",
  "candidate-pick-up-steam": "sense-pick-up-steam"
};

export function App() {
  const [tab, setTab] = useState<Tab>("read");
  const [reviewState, setReviewState] = useState<ReviewState>({
    expressions: sampleExpressionSenses,
    activeReviewIds: ["sense-pick-up-steam"]
  });
  const [toast, setToast] = useState<string | null>(null);

  function addToReview(candidate: CandidateExpression) {
    const expressionSenseId = senseByCandidateId[candidate.id] ?? "sense-roll-out";
    setReviewState((current) =>
      applyReviewAction(current, {
        source: "reading",
        expressionSenseId,
        feedback: "add_to_review",
        at: "2026-06-13T00:00:00.000Z"
      })
    );
    setToast(`${candidate.expression} added to review.`);
  }

  function readingFeedback(candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) {
    const expressionSenseId = senseByCandidateId[candidate.id] ?? "sense-roll-out";
    setReviewState((current) =>
      applyReviewAction(current, {
        source: "reading",
        expressionSenseId,
        feedback,
        at: "2026-06-13T00:00:00.000Z"
      })
    );
    setToast(`${feedback} saved for reading triage only.`);
  }

  function reviewFeedback(expressionSenseId: string, feedback: ReviewFeedback, at: string) {
    setReviewState((current) => applyReviewAction(current, { source: "review", expressionSenseId, feedback, at }));
  }

  return (
    <div className="appShell">
      <div className="phoneFrame">
        {tab === "read" ? (
          <ReadingPage
            segment={sampleSegment}
            candidates={sampleCandidates}
            onAddToReview={addToReview}
            onReadingFeedback={readingFeedback}
          />
        ) : null}
        {tab === "review" ? (
          <ReviewPage
            expressions={reviewState.expressions}
            occurrences={sampleOccurrences}
            activeReviewIds={reviewState.activeReviewIds ?? []}
            onReview={reviewFeedback}
          />
        ) : null}
        {tab === "cards" ? (
          <CardLibraryPage expressions={reviewState.expressions} occurrences={sampleOccurrences} />
        ) : null}
        {tab === "articles" ? <ImportPage /> : null}

        {toast ? <p className="toast">{toast}</p> : null}
        <nav className="tabs" aria-label="Primary">
          <button className={tab === "read" ? "active" : ""} type="button" onClick={() => setTab("read")}>
            <BookOpen size={18} />
            Read
          </button>
          <button className={tab === "review" ? "active" : ""} type="button" onClick={() => setTab("review")}>
            <RotateCcw size={18} />
            Review
          </button>
          <button className={tab === "cards" ? "active" : ""} type="button" onClick={() => setTab("cards")}>
            <BookMarked size={18} />
            Cards
          </button>
          <button className={tab === "articles" ? "active" : ""} type="button" onClick={() => setTab("articles")}>
            <Files size={18} />
            Articles
          </button>
        </nav>
      </div>
    </div>
  );
}
