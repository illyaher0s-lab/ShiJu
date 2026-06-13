import { appearsInMoreExpressions, type CandidateExpression, type ReadingFeedback, type Segment } from "@art/domain";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderHighlightedText } from "../../lib/highlightText";
import { ExpressionSheet } from "./ExpressionSheet";
import { GeneratedCardDraftSheet } from "./GeneratedCardDraftSheet";
import { buildManualSelectionDraft } from "./manualSelection";
import { SelectionToolbar } from "./SelectionToolbar";

interface ReadingPageProps {
  segment: Segment;
  candidates: CandidateExpression[];
  onAddToReview: (candidate: CandidateExpression) => void;
  onReadingFeedback: (candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) => void;
}

export function ReadingPage({ segment, candidates, onAddToReview, onReadingFeedback }: ReadingPageProps) {
  const passageRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<CandidateExpression | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<CandidateExpression | null>(null);
  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.candidateStatus === "selected").slice(0, 6),
    [candidates]
  );
  const moreCandidates = candidates.filter((candidate) => appearsInMoreExpressions(candidate.candidateStatus));

  useEffect(() => {
    function captureManualSelection() {
      window.setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? "";
        if (!selection || !text || !selectionBelongsToPassage(selection, passageRef.current)) return;
        setSelectedText(text);
      }, 0);
    }

    document.addEventListener("selectionchange", captureManualSelection);
    document.addEventListener("mouseup", captureManualSelection);
    document.addEventListener("touchend", captureManualSelection);

    return () => {
      document.removeEventListener("selectionchange", captureManualSelection);
      document.removeEventListener("mouseup", captureManualSelection);
      document.removeEventListener("touchend", captureManualSelection);
    };
  }, []);

  function captureManualSelectionFromPassage() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!text) return;
    setSelectedText(text);
  }

  function generateDraft(text: string) {
    const sentence = sentenceContaining(segment.text, text);
    setGeneratedDraft(
      buildManualSelectionDraft({
        selectedText: text,
        sentence,
        articleId: segment.articleId,
        segmentId: segment.id,
        generatedAt: new Date().toISOString(),
      }),
    );
  }

  function acceptGeneratedDraft(draft: CandidateExpression) {
    onAddToReview(draft);
    setGeneratedDraft(null);
    setSelectedText(null);
  }

  return (
    <main className="screen">
      <section className="readingHeader">
        <p>Fixture segment</p>
        <h1>Read first, learn in place</h1>
      </section>

      <article
        ref={passageRef}
        className="passage"
        aria-label="Original reading segment"
        onMouseUp={captureManualSelectionFromPassage}
        onTouchEnd={captureManualSelectionFromPassage}
      >
        {renderHighlightedText({
          text: segment.text,
          candidates: selectedCandidates,
          onSelect: setSelected
        })}
      </article>

      <section className="morePanel">
        <button
          className="moreToggle"
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((current) => !current)}
        >
          <span>More expressions</span>
          {moreOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {moreOpen ? (
          <div className="moreList">
            {moreCandidates.map((candidate) => (
              <button className="moreItem" key={candidate.id} type="button" onClick={() => setSelected(candidate)}>
                <span>{candidate.expression}</span>
                <small>{candidate.candidateStatus}</small>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {selectedText && !generatedDraft ? (
        <SelectionToolbar selectedText={selectedText} onGenerate={generateDraft} />
      ) : null}

      {selected ? (
        <ExpressionSheet
          candidate={selected}
          onAddToReview={onAddToReview}
          onReadingFeedback={onReadingFeedback}
          onClose={() => setSelected(null)}
        />
      ) : null}

      {generatedDraft ? (
        <GeneratedCardDraftSheet
          draft={generatedDraft}
          onAccept={acceptGeneratedDraft}
          onDismiss={() => setGeneratedDraft(null)}
        />
      ) : null}
    </main>
  );
}

function sentenceContaining(text: string, selectedText: string): string {
  const sentences = text.match(/[^.!?]+[.!?]/g) ?? [text];
  return sentences.find((sentence) => sentence.includes(selectedText))?.trim() ?? selectedText;
}

function selectionBelongsToPassage(selection: Selection, passage: HTMLElement | null): boolean {
  if (!passage) return false;
  return nodeIsInside(selection.anchorNode, passage) || nodeIsInside(selection.focusNode, passage);
}

function nodeIsInside(node: Node | null, passage: HTMLElement): boolean {
  if (!node) return false;
  const target = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  return target ? passage.contains(target) : false;
}
