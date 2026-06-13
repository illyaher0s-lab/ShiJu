import type { CandidateExpression } from "@art/domain";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { buildContextEntryDraft } from "./contextGeneration";

interface ContextCardGeneratorProps {
  onAccept: (draft: CandidateExpression) => void;
}

export function ContextCardGenerator({ onAccept }: ContextCardGeneratorProps) {
  const [expression, setExpression] = useState("");
  const [contextLabel, setContextLabel] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [draft, setDraft] = useState<CandidateExpression | null>(null);

  function generate() {
    if (!expression.trim() || !contextLabel.trim()) return;
    setDraft(
      buildContextEntryDraft({
        expression,
        contextLabel,
        contextNote,
        generatedAt: new Date().toISOString(),
      }),
    );
  }

  function acceptDraft() {
    if (!draft) return;
    onAccept(draft);
    setExpression("");
    setContextLabel("");
    setContextNote("");
    setDraft(null);
  }

  return (
    <section className="contextGenerator">
      <div className="contextGeneratorHeader">
        <Sparkles size={18} />
        <h2>Add from context</h2>
      </div>

      <div className="contextForm">
        <label>
          <span>Expression</span>
          <input value={expression} onChange={(event) => setExpression(event.target.value)} />
        </label>
        <label>
          <span>Context</span>
          <input
            value={contextLabel}
            onChange={(event) => setContextLabel(event.target.value)}
            placeholder="game, programming, work"
          />
        </label>
        <label>
          <span>Where did you see it?</span>
          <textarea value={contextNote} onChange={(event) => setContextNote(event.target.value)} />
        </label>
      </div>

      <button className="contextGenerateButton" type="button" onClick={generate}>
        <Sparkles size={16} />
        Generate card
      </button>

      {draft ? (
        <article className="generatedDraft">
          <p className="typeLabel">{draft.modelName}</p>
          <h3>{draft.expression}</h3>
          <p>{draft.localMeaning}</p>
          <p className="meaningZh">{draft.meaningZh}</p>
          <p>{draft.sentence}</p>
          <p className="translation">{draft.sentenceTranslation}</p>
          <div className="draftActions">
            <button type="button" onClick={acceptDraft}>
              Add to review
            </button>
            <button type="button" onClick={() => setDraft(null)}>
              Dismiss
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
