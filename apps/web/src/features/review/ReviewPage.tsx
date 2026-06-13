import type { ExpressionSense, Occurrence, ReviewFeedback } from "@art/domain";
import { Eye, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { isDue, nowIso } from "../../lib/date";

interface ReviewPageProps {
  expressions: ExpressionSense[];
  occurrences: Occurrence[];
  activeReviewIds: string[];
  onReview: (expressionSenseId: string, feedback: ReviewFeedback, at: string) => void;
}

export function ReviewPage({ expressions, occurrences, activeReviewIds, onReview }: ReviewPageProps) {
  const [answerVisible, setAnswerVisible] = useState(false);
  const [reviewedMessage, setReviewedMessage] = useState<string | null>(null);
  const now = nowIso();
  const due = useMemo(
    () => expressions.filter((expression) => activeReviewIds.includes(expression.id) && isDue(expression.srsDueAt, now)),
    [activeReviewIds, expressions, now]
  );
  const current = due[0];
  const occurrence = occurrences.find((item) => item.expressionSenseId === current?.id);

  if (!current) {
    return (
      <main className="screen reviewEmpty">
        <RotateCcw size={28} />
        <h1>Review queue clear</h1>
        <p>Add an expression from the reading page or come back when a card is due.</p>
        {reviewedMessage ? <p className="reviewNote">{reviewedMessage}</p> : null}
      </main>
    );
  }

  function submit(feedback: ReviewFeedback) {
    if (!current) return;
    onReview(current.id, feedback, "2026-06-13T00:00:00.000Z");
    setReviewedMessage(`Review feedback changed the SRS interval for ${current.expression}.`);
    setAnswerVisible(false);
  }

  return (
    <main className="screen">
      <section className="reviewCard">
        <p className="typeLabel">{current.type.replaceAll("_", " ")}</p>
        <h1>{current.expression}</h1>
        <p className="prompt">{occurrence?.sentence ?? "Recall the meaning before opening the answer."}</p>

        {!answerVisible ? (
          <button className="expandButton" type="button" onClick={() => setAnswerVisible(true)}>
            <Eye size={16} />
            Show answer
          </button>
        ) : (
          <div className="answer">
            <dl className="answerDetails">
              <div>
                <dt>Meaning</dt>
                <dd>{current.meaningZh}</dd>
              </div>
              <div>
                <dt>Local meaning</dt>
                <dd>{occurrence?.localMeaning ?? "Use the expression in this article context."}</dd>
              </div>
              <div>
                <dt>Original sentence</dt>
                <dd>{occurrence?.sentence ?? "No saved occurrence yet."}</dd>
              </div>
              <div>
                <dt>Sentence translation</dt>
                <dd>{occurrence?.sentenceTranslation ?? "No translation saved yet."}</dd>
              </div>
              <div>
                <dt>Usage hint</dt>
                <dd>{occurrence?.syntaxHint ?? "Focus on how the expression works in the sentence."}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{occurrence ? `Article ${occurrence.articleId}, segment ${occurrence.segmentId}` : "No source"}</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd>{current.difficulty}</dd>
              </div>
              <div>
                <dt>Review count</dt>
                <dd>{current.reviewCount}</dd>
              </div>
              <div>
                <dt>Mistakes</dt>
                <dd>{current.mistakeCount}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="reviewActions">
          <button type="button" onClick={() => submit("unknown")}>
            Unknown
          </button>
          <button type="button" onClick={() => submit("fuzzy")}>
            Fuzzy
          </button>
          <button type="button" onClick={() => submit("known")}>
            Known
          </button>
        </div>
        <p className="reviewNote">Only review feedback changes SRS. Reading taps do not advance intervals.</p>
      </section>
    </main>
  );
}
