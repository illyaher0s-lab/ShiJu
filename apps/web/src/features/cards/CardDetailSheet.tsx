import type { ExpressionSense, Occurrence } from "@art/domain";

interface CardDetailSheetProps {
  expression: ExpressionSense;
  occurrences: Occurrence[];
  onClose: () => void;
}

export function CardDetailSheet({ expression, occurrences, onClose }: CardDetailSheetProps) {
  return (
    <aside className="sheet" aria-label={`${expression.expression} card details`}>
      <div className="sheetHandle" />
      <div className="sheetTop">
        <div>
          <p className="typeLabel">{expression.type.replaceAll("_", " ")}</p>
          <h2>{expression.expression}</h2>
        </div>
        <button className="iconButton" type="button" onClick={onClose} aria-label="Close card details">
          x
        </button>
      </div>

      <div className="cardMetaGrid">
        <div>
          <span>Meaning</span>
          <strong>{expression.meaningZh}</strong>
        </div>
        <div>
          <span>Mastery</span>
          <strong>{expression.masteryStatus}</strong>
        </div>
        <div>
          <span>Due</span>
          <strong>{expression.srsDueAt ? expression.srsDueAt.slice(0, 10) : "new"}</strong>
        </div>
        <div>
          <span>Reviews</span>
          <strong>{expression.reviewCount}</strong>
        </div>
      </div>

      <section className="occurrenceEvidence">
        <h3>Occurrence evidence</h3>
        {occurrences.length > 0 ? (
          occurrences.map((occurrence) => (
            <article className="occurrenceItem" key={occurrence.id}>
              <p>{occurrence.sentence}</p>
              <p className="translation">{occurrence.sentenceTranslation}</p>
              <small>{sourceLabel(occurrence)}</small>
            </article>
          ))
        ) : (
          <p className="translation">No occurrence evidence saved yet.</p>
        )}
      </section>
    </aside>
  );
}

function sourceLabel(occurrence: Occurrence): string {
  if (occurrence.sourceType === "context_entry" || occurrence.articleId === "context-entry") {
    const context = occurrence.contextLabel ? ` (${occurrence.contextLabel})` : "";
    const note = occurrence.contextNote ? ` - ${occurrence.contextNote}` : "";
    return `Source: Context entry${context}${note}`;
  }

  return `Source: ${occurrence.articleId}, segment ${occurrence.segmentId}`;
}
