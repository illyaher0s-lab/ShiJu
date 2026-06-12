import type { CandidateExpression, ReadingFeedback, ReviewFeedback } from "@art/domain";
import { BookOpen, Library, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ImportPage } from "./features/import/ImportPage";
import { ReadingPage } from "./features/reading/ReadingPage";
import { ReviewPage } from "./features/review/ReviewPage";
import { applyReviewAction, type ReviewState } from "./features/review/reviewState";
import { sampleCandidates, sampleExpressionSenses, sampleOccurrences, sampleSegment } from "./fixtures/sampleSegment";

type Tab = "read" | "review" | "library";

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
  const [toast, setToast] = useState("Reading feedback will not advance SRS.");

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
        {tab === "library" ? <ImportPage /> : null}

        <p className="toast">{toast}</p>
        <nav className="tabs" aria-label="Primary">
          <button className={tab === "read" ? "active" : ""} type="button" onClick={() => setTab("read")}>
            <BookOpen size={18} />
            Read
          </button>
          <button className={tab === "review" ? "active" : ""} type="button" onClick={() => setTab("review")}>
            <RotateCcw size={18} />
            Review
          </button>
          <button className={tab === "library" ? "active" : ""} type="button" onClick={() => setTab("library")}>
            <Library size={18} />
            Library
          </button>
        </nav>
      </div>
    </div>
  );
}
