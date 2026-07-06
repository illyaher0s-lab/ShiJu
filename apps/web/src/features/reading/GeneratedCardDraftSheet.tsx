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
          <p className="typeLabel" style={{ fontSize: '12px', color: 'var(--vercel-gray-500)', marginBottom: 'var(--space-1)' }}>
            AI draft
          </p>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
            {draft.expression}
          </h2>
        </div>
        <button className="iconButton" type="button" onClick={onDismiss} aria-label="Dismiss generated draft">
          x
        </button>
      </div>

      <p className="localMeaning" style={{ fontSize: '16px', color: 'var(--vercel-gray-700)', marginBottom: 'var(--space-2)' }}>
        {draft.localMeaning}
      </p>
      <p className="meaningZh" style={{ fontSize: '15px', color: 'var(--vercel-gray-600)', marginBottom: 'var(--space-4)' }}>
        {draft.meaningZh}
      </p>

      <dl className="answerDetails draftDetails" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <dt style={{ fontSize: '13px', fontWeight: '600', color: 'var(--vercel-gray-700)', marginBottom: 'var(--space-1)' }}>
            Original sentence
          </dt>
          <dd style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--vercel-gray-900)' }}>
            {draft.sentence}
          </dd>
        </div>
        <div>
          <dt style={{ fontSize: '13px', fontWeight: '600', color: 'var(--vercel-gray-700)', marginBottom: 'var(--space-1)' }}>
            Sentence translation
          </dt>
          <dd style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--vercel-gray-900)' }}>
            {draft.sentenceTranslation}
          </dd>
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
