import type {
  CandidateExpression,
  ClientOperation,
  ExpressionSense,
  Occurrence,
  ReadingFeedback,
  ReviewFeedback,
} from "@art/domain";
import { BookMarked, BookOpen, Files, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CardLibraryPage } from "./features/cards/CardLibraryPage";
import { ImportPage } from "./features/import/ImportPage";
import { ReadingPage } from "./features/reading/ReadingPage";
import { ReviewPage } from "./features/review/ReviewPage";
import { applyReviewAction, type ReviewState } from "./features/review/reviewState";
import { sampleCandidates, sampleExpressionSenses, sampleOccurrences, sampleSegment } from "./fixtures/sampleSegment";
import { addRecord } from "./storage/db";
import { createClientOperation } from "./storage/operationQueue";

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
  const [occurrences, setOccurrences] = useState<Occurrence[]>(sampleOccurrences);
  const [pendingOperations, setPendingOperations] = useState<ClientOperation[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  function addToReview(candidate: CandidateExpression) {
    const expressionSenseId =
      senseByCandidateId[candidate.id] ?? `sense-${candidate.normalizedForm.replaceAll(/\s+/g, "-")}`;
    enqueuePendingOperation({
      operationType: "reading.add_to_review",
      targetType: "candidate_expression",
      targetId: candidate.id,
      payload: { expressionSenseId, expression: candidate.expression },
    });
    setReviewState((current) =>
      applyReviewAction(ensureExpressionSense(current, candidate, expressionSenseId), {
        source: "reading",
        expressionSenseId,
        feedback: "add_to_review",
        at: "2026-06-13T00:00:00.000Z"
      })
    );
    setOccurrences((current) => ensureOccurrence(current, candidate, expressionSenseId));
    setToast(`${candidate.expression} added to review.`);
  }

  function readingFeedback(candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) {
    const expressionSenseId = senseByCandidateId[candidate.id] ?? "sense-roll-out";
    enqueuePendingOperation({
      operationType: "reading.feedback",
      targetType: "candidate_expression",
      targetId: candidate.id,
      payload: { expressionSenseId, feedback },
    });
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
    enqueuePendingOperation({
      operationType: "review.feedback",
      targetType: "expression_sense",
      targetId: expressionSenseId,
      payload: { feedback, reviewedAt: at },
    });
    setReviewState((current) => applyReviewAction(current, { source: "review", expressionSenseId, feedback, at }));
  }

  function enqueuePendingOperation(input: {
    operationType: string;
    targetType: string;
    targetId: string;
    payload: Record<string, unknown>;
  }) {
    const operation = createClientOperation({
      userId: "user-1",
      operationType: input.operationType,
      targetType: input.targetType,
      targetId: input.targetId,
      payload: input.payload,
      now: new Date().toISOString(),
    });
    setPendingOperations((current) => [...current, operation]);
    void addRecord("clientOperations", operation).catch(() => {
      // IndexedDB is unavailable in tests and may be blocked in some browser modes.
    });
  }

  return (
    <div className="appShell">
      <div className="phoneFrame">
        {pendingOperations.length > 0 ? (
          <div className="syncStatus" role="status" aria-label={`Pending sync: ${pendingOperations.length}`}>
            Pending sync: {pendingOperations.length}
          </div>
        ) : null}
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
            occurrences={occurrences}
            activeReviewIds={reviewState.activeReviewIds ?? []}
            onReview={reviewFeedback}
          />
        ) : null}
        {tab === "cards" ? (
          <CardLibraryPage
            expressions={reviewState.expressions}
            occurrences={occurrences}
            onAddContextDraft={addToReview}
          />
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

function ensureExpressionSense(state: ReviewState, candidate: CandidateExpression, expressionSenseId: string): ReviewState {
  if (state.expressions.some((expression) => expression.id === expressionSenseId)) return state;

  const now = new Date().toISOString();
  const expression: ExpressionSense = {
    id: expressionSenseId,
    userId: candidate.userId,
    expression: candidate.expression,
    normalizedForm: candidate.normalizedForm,
    type: candidate.type,
    meaningZh: candidate.meaningZh,
    difficulty: candidate.difficulty,
    masteryStatus: "new",
    srsDueAt: null,
    reviewCount: 0,
    mistakeCount: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  return {
    ...state,
    expressions: [...state.expressions, expression],
  };
}

function ensureOccurrence(occurrences: Occurrence[], candidate: CandidateExpression, expressionSenseId: string): Occurrence[] {
  const occurrenceId = `occurrence-${expressionSenseId}`;
  if (occurrences.some((occurrence) => occurrence.id === occurrenceId)) return occurrences;
  const now = new Date().toISOString();

  return [
    ...occurrences,
    {
      id: occurrenceId,
      userId: candidate.userId,
      expressionSenseId,
      articleId: candidate.articleId,
      segmentId: candidate.segmentId,
      sourceType: candidate.articleId === "context-entry" ? "context_entry" : "article",
      contextLabel: candidate.articleId === "context-entry" ? contextLabelFrom(candidate) : null,
      contextNote: candidate.articleId === "context-entry" ? contextNoteFrom(candidate) : null,
      sentence: candidate.sentence,
      sentenceTranslation: candidate.sentenceTranslation,
      localMeaning: candidate.localMeaning,
      syntaxHint: candidate.syntaxHint,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];
}

function contextLabelFrom(candidate: CandidateExpression): string | null {
  const match = candidate.statusReason.match(/learner-entered (.+) context/i);
  return match?.[1] ?? null;
}

function contextNoteFrom(candidate: CandidateExpression): string | null {
  return candidate.syntaxHint?.replace(/^Source context:\s*/i, "") ?? null;
}
