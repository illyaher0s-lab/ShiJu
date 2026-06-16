import type {
  Article,
  CandidateExpression,
  ClientOperation,
  ExpressionSense,
  Occurrence,
  ReadingFeedback,
  ReviewFeedback,
  Segment,
} from "@art/domain";
import { BookMarked, BookOpen, Files, Home, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ArticleListPage } from "./features/articles/ArticleListPage";
import { ArticleDetailPage } from "./features/articles/ArticleDetailPage";
import { CardLibraryPage } from "./features/cards/CardLibraryPage";
import { HomePage } from "./features/home/HomePage";
import { ReadingPage } from "./features/reading/ReadingPage";
import { ReviewPage } from "./features/review/ReviewPage";
import { applyReviewAction, type ReviewState } from "./features/review/reviewState";
import { sampleCandidates, sampleExpressionSenses, sampleOccurrences, sampleSegment } from "./fixtures/sampleSegment";
import { addRecord } from "./storage/db";
import { createClientOperation } from "./storage/operationQueue";

type Tab = "home" | "read" | "review" | "cards" | "articles" | "article-detail";

const senseByCandidateId: Record<string, string> = {
  "candidate-roll-out": "sense-roll-out",
  "candidate-pick-up-steam": "sense-pick-up-steam"
};

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [reviewState, setReviewState] = useState<ReviewState>({
    expressions: sampleExpressionSenses,
    activeReviewIds: ["sense-pick-up-steam"]
  });
  const [occurrences, setOccurrences] = useState<Occurrence[]>(sampleOccurrences);
  const [pendingOperations, setPendingOperations] = useState<ClientOperation[]>([]);
  const [newCardTarget, setNewCardTarget] = useState(6);
  const [reviewTarget, setReviewTarget] = useState(12);
  const [completedReviewsToday, setCompletedReviewsToday] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  // Real data from backend (fallback to sample if empty)
  const [importedArticle, setImportedArticle] = useState<Article | null>(null);
  const [importedSegments, setImportedSegments] = useState<Segment[]>([]);
  const [importedCandidates, setImportedCandidates] = useState<CandidateExpression[]>([]);
  
  // Article list navigation
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  const activeSegment = selectedSegmentId && importedSegments.length > 0
    ? importedSegments.find(s => s.id === selectedSegmentId) || importedSegments[0]!
    : importedSegments.length > 0 
      ? importedSegments[0]! 
      : sampleSegment;
  
  const activeCandidates = selectedSegmentId && importedCandidates.length > 0
    ? importedCandidates.filter(c => c.segmentId === selectedSegmentId)
    : importedCandidates.length > 0 
      ? importedCandidates 
      : sampleCandidates;

  function handleArticleImported(article: Article, segments: Segment[], candidates: CandidateExpression[]) {
    setImportedArticle(article);
    setImportedSegments(segments);
    setImportedCandidates(candidates);
    setSelectedSegmentId(segments[0]?.id || null);
    setTab("read"); // Switch to reading page
    setToast("Article imported successfully!");
  }

  function handleArticleSelected(articleId: string) {
    setSelectedArticleId(articleId);
    setTab("article-detail");
  }

  function handleSegmentSelected(segmentId: string, segments: Segment[], candidates: CandidateExpression[]) {
    setImportedSegments(segments);
    setImportedCandidates(candidates);
    setSelectedSegmentId(segmentId);
    setTab("read");
  }

  function handleSegmentChange(segmentId: string) {
    setSelectedSegmentId(segmentId);
  }

  function handleGenerateCards(segmentId: string) {
    setToast(`Generating cards for segment ${segmentId}...`);
    // TODO: trigger backend card generation
  }

  function handleBackToArticleList() {
    setSelectedArticleId(null);
    setTab("articles");
  }

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
    setCompletedReviewsToday((current) => current + 1);
  }

  function markMastered(expressionSenseId: string, at: string) {
    enqueuePendingOperation({
      operationType: "review.mark_mastered",
      targetType: "expression_sense",
      targetId: expressionSenseId,
      payload: { masteredAt: at },
    });
    setReviewState((current) =>
      applyReviewAction(current, { source: "review", expressionSenseId, action: "mark_mastered", at })
    );
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
        {tab === "home" ? (
          <HomePage
            newCardsToday={pendingOperations.filter((operation) => operation.operationType === "reading.add_to_review").length}
            completedReviewsToday={completedReviewsToday}
            dueReviewCount={reviewState.activeReviewIds?.length ?? 0}
            newCardTarget={newCardTarget}
            reviewTarget={reviewTarget}
            pendingSyncCount={pendingOperations.length}
            onNewCardTargetChange={setNewCardTarget}
            onReviewTargetChange={setReviewTarget}
            onNavigate={setTab}
          />
        ) : null}
        {tab === "read" ? (
          <ReadingPage
            segment={activeSegment}
            segments={importedSegments.length > 0 ? importedSegments : undefined}
            candidates={activeCandidates}
            onAddToReview={addToReview}
            onReadingFeedback={readingFeedback}
            onSegmentChange={handleSegmentChange}
            onGenerateCards={handleGenerateCards}
          />
        ) : null}
        {tab === "review" ? (
          <ReviewPage
            expressions={reviewState.expressions}
            occurrences={occurrences}
            activeReviewIds={reviewState.activeReviewIds ?? []}
            onReview={reviewFeedback}
            onMarkMastered={markMastered}
          />
        ) : null}
        {tab === "cards" ? (
          <CardLibraryPage
            expressions={reviewState.expressions}
            occurrences={occurrences}
            onAddContextDraft={addToReview}
          />
        ) : null}
        {tab === "articles" ? <ArticleListPage onArticleSelected={handleArticleSelected} onArticleImported={handleArticleImported} /> : null}
        {tab === "article-detail" && selectedArticleId ? (
          <ArticleDetailPage 
            articleId={selectedArticleId} 
            onSegmentSelected={handleSegmentSelected}
            onBack={handleBackToArticleList}
          />
        ) : null}

        {toast ? <p className="toast">{toast}</p> : null}
        <nav className="tabs" aria-label="Primary">
          <button className={tab === "home" ? "active" : ""} type="button" onClick={() => setTab("home")}>
            <Home size={18} />
            Home
          </button>
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
    easeFactor: 2.5,
    intervalDays: 0,
    lapseCount: 0,
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
