import type { ExpressionSense, Occurrence, ReviewFeedback } from "@art/domain";
import { Eye, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { isDue, nowIso } from "../../lib/date";

interface ReviewPageProps {
  expressions: ExpressionSense[];
  occurrences: Occurrence[];
  activeReviewIds: string[];
  onReview: (expressionSenseId: string, feedback: ReviewFeedback, at: string) => void;
  onMarkMastered?: (expressionSenseId: string, at: string) => void;
}

export function ReviewPage({ expressions, occurrences, activeReviewIds, onReview, onMarkMastered }: ReviewPageProps) {
  const [answerVisible, setAnswerVisible] = useState(false);
  const [reviewedMessage, setReviewedMessage] = useState<string | null>(null);
  const [masteredVisible, setMasteredVisible] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const now = nowIso();
  const due = useMemo(
    () =>
      expressions.filter(
        (expression) =>
          expression.masteryStatus !== "mastered" && activeReviewIds.includes(expression.id) && isDue(expression.srsDueAt, now)
      ),
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
    setMasteredVisible(false);
  }

  function startKnownPress() {
    clearKnownPress();
    longPressTimer.current = window.setTimeout(() => {
      setMasteredVisible(true);
    }, 600);
  }

  function clearKnownPress() {
    if (longPressTimer.current === null) return;
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  function submitKnown() {
    if (masteredVisible) return;
    submit("known");
  }

  function markMastered() {
    if (!current || !onMarkMastered) return;
    onMarkMastered(current.id, "2026-06-13T00:00:00.000Z");
    setReviewedMessage(`${current.expression} marked as mastered.`);
    setAnswerVisible(false);
    setMasteredVisible(false);
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
                <dt>Sentence clue</dt>
                <dd>{sentenceClue(current.expression, occurrence?.syntaxHint ?? undefined)}</dd>
              </div>
              <div>
                <dt>Another example</dt>
                <dd>{extraExample(current.expression)}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{occurrence ? sourceLabel(occurrence) : "No source"}</dd>
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
          <button className="feedbackUnknown" type="button" onClick={() => submit("unknown")}>
            涓嶇煡閬揱
          </button>
          <button className="feedbackFuzzy" type="button" onClick={() => submit("fuzzy")}>
            杩锋儜
          </button>
          <button
            className="feedbackKnown"
            type="button"
            onClick={submitKnown}
            onPointerCancel={clearKnownPress}
            onPointerDown={startKnownPress}
            onPointerLeave={clearKnownPress}
            onPointerUp={clearKnownPress}
          >
            鐭ラ亾
          </button>
        </div>
        {masteredVisible && onMarkMastered ? (
          <button className="masteredAction" type="button" onClick={markMastered}>
            鐔熺煡
          </button>
        ) : null}
        <p className="reviewNote">Only review feedback changes SRS. Reading taps do not advance intervals.</p>
      </section>
    </main>
  );
}

function sentenceClue(expression: string, syntaxHint?: string): string {
  const clues: Record<string, string> = {
    "roll out": "Here it means the city started making the program available.",
    "pick up steam": "Here it means the habit gradually became stronger.",
    "all at once": "Here it means everything happened in one sudden moment.",
    "keep pace with": "Here it means learners could continue reading without falling behind.",
  };

  return clues[expression] ?? syntaxHint ?? "Notice how this expression works inside the saved sentence.";
}

function extraExample(expression: string): string {
  const examples: Record<string, string> = {
    "roll out": "The school will roll out the new reading app next week. / 学校下周会推出新的阅读应用。",
    "pick up steam": "After a slow start, the study group began to pick up steam. / 慢热之后，学习小组开始有起色。",
    "all at once": "The answer did not come all at once. / 答案不是一下子就冒出来的。",
    "keep pace with": "Short notes helped her keep pace with the article. / 简短笔记帮助她跟上文章节奏。",
  };

  return examples[expression] ?? `Try making one new sentence with "${expression}" after you review the original sentence.`;
}

function sourceLabel(occurrence: Occurrence): string {
  if (occurrence.sourceType === "context_entry" || occurrence.articleId === "context-entry") {
    return occurrence.contextLabel ? `Context entry: ${occurrence.contextLabel}` : "Context entry";
  }

  return `Article ${occurrence.articleId}, segment ${occurrence.segmentId}`;
}
