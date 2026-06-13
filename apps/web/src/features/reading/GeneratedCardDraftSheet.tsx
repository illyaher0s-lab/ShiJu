import type { CandidateExpression } from "@art/domain";

interface GeneratedCardDraftSheetProps {
  draft: CandidateExpression;
  onAccept: (draft: CandidateExpression) => void;
  onDismiss: () => void;
}

export function GeneratedCardDraftSheet({ draft, onAccept, onDismiss }: GeneratedCardDraftSheetProps) {
  return (
    <aside className="sheet" aria-label={`${draft.expression} generated card draft`}>
      <div className="sheetHandle" />
      <div className="sheetTop">
        <div>
          <p className="typeLabel">AI draft</p>
          <h2>{draft.expression}</h2>
        </div>
        <button className="iconButton" type="button" onClick={onDismiss} aria-label="Dismiss generated draft">
          x
        </button>
      </div>

      <p className="localMeaning">{draft.localMeaning}</p>
      <p className="meaningZh">{draft.meaningZh}</p>

      <dl className="answerDetails draftDetails">
        <div>
          <dt>Original sentence</dt>
          <dd>{draft.sentence}</dd>
        </div>
        <div>
          <dt>Sentence translation</dt>
          <dd>{draft.sentenceTranslation}</dd>
        </div>
        <div>
          <dt>Model</dt>
          <dd>{draft.modelName}</dd>
        </div>
        <div>
          <dt>Generation</dt>
          <dd>{draft.generationVersion}</dd>
        </div>
      </dl>

      <div className="draftActions">
        <button className="expandButton" type="button" onClick={() => onAccept(draft)}>
          Add to review
        </button>
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </aside>
  );
}
