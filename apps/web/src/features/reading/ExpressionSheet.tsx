import type { CandidateExpression, ReadingFeedback } from "@art/domain";
import { BookmarkPlus, Check, MessageSquareWarning, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface ExpressionSheetProps {
  candidate: CandidateExpression;
  onAddToReview: (candidate: CandidateExpression) => void;
  onReadingFeedback: (candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) => void;
  onClose: () => void;
}

export function ExpressionSheet({ candidate, onAddToReview, onReadingFeedback, onClose }: ExpressionSheetProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="sheet" aria-label={`${candidate.expression} details`}>
      <div className="sheetHandle" />
      <div className="sheetTop">
        <div>
          <p className="typeLabel">{formatType(candidate.type)}</p>
          <h2>{candidate.expression}</h2>
        </div>
        <button className="iconButton" type="button" onClick={onClose} aria-label="Close expression">
          x
        </button>
      </div>

      <p className="localMeaning">{candidate.localMeaning}</p>
      <p className="meaningZh">{candidate.meaningZh}</p>

      <div className="sheetActions">
        <button type="button" onClick={() => onAddToReview(candidate)}>
          <BookmarkPlus size={16} />
          Add
        </button>
        <button type="button" onClick={() => onReadingFeedback(candidate, "known")}>
          <Check size={16} />
          Known
        </button>
        <button type="button" onClick={() => onReadingFeedback(candidate, "too_easy")}>
          <ThumbsDown size={16} />
          Easy
        </button>
        <button type="button" onClick={() => onReadingFeedback(candidate, "bad_explanation")}>
          <MessageSquareWarning size={16} />
          Bad
        </button>
      </div>

      {!expanded ? (
        <button className="expandButton" type="button" onClick={() => setExpanded(true)}>
          Expand full explanation
        </button>
      ) : (
        <div className="fullExplanation">
          <h3>Full sentence</h3>
          <p>{candidate.sentence}</p>
          <p className="translation">{candidate.sentenceTranslation}</p>
          <dl>
            <div>
              <dt>Difficulty</dt>
              <dd>{candidate.difficulty}</dd>
            </div>
            <div>
              <dt>Occurrences</dt>
              <dd>{candidate.occurrenceCount}</dd>
            </div>
            <div>
              <dt>Near expression</dt>
              <dd>{candidate.expression === "roll out" ? "launch" : "similar expression"}</dd>
            </div>
          </dl>
          {candidate.syntaxHint ? <p className="syntaxHint">{candidate.syntaxHint}</p> : null}
        </div>
      )}
    </aside>
  );
}

function formatType(type: CandidateExpression["type"]): string {
  return type.replaceAll("_", " ");
}
