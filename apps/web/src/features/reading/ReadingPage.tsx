import { appearsInMoreExpressions, type CandidateExpression, type ReadingFeedback, type Segment } from "@art/domain";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderHighlightedText } from "../../lib/highlightText";
import { ExpressionSheet } from "./ExpressionSheet";
import { GeneratedCardDraftSheet } from "./GeneratedCardDraftSheet";
import { buildManualSelectionDraft } from "./manualSelection";
import { SelectionToolbar } from "./SelectionToolbar";

interface ReadingPageProps {
  segment: Segment;
  segments?: Segment[]; // All segments for navigation
  candidates: CandidateExpression[];
  onAddToReview: (candidate: CandidateExpression) => void;
  onReadingFeedback: (candidate: CandidateExpression, feedback: Exclude<ReadingFeedback, "add_to_review">) => void;
  onSegmentChange?: (segmentId: string) => void;
  onGenerateCards?: (segmentId: string) => void;
}

export function ReadingPage({ segment, segments, candidates, onAddToReview, onReadingFeedback, onSegmentChange, onGenerateCards }: ReadingPageProps) {
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

  // Segment navigation
  const currentIndex = segments?.findIndex(s => s.id === segment.id) ?? -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = segments && currentIndex >= 0 && currentIndex < segments.length - 1;
  const totalSegments = segments?.length ?? 1;
  const segmentNumber = currentIndex >= 0 ? currentIndex + 1 : 1;

  function goToPrevious() {
    if (hasPrevious && segments && onSegmentChange) {
      onSegmentChange(segments[currentIndex - 1]!.id);
    }
  }

  function goToNext() {
    if (hasNext && segments && onSegmentChange) {
      onSegmentChange(segments[currentIndex + 1]!.id);
    }
  }

  function handleGenerateCards() {
    if (onGenerateCards) {
      onGenerateCards(segment.id);
    }
  }

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
        <p>Segment {segmentNumber} / {totalSegments}</p>
        <h1>Read first, learn in place</h1>
        {segment.generationStatus === "not_generated" && (
          <div className="generationStatus notGenerated">
            <AlertCircle size={14} />
            Cards not generated
          </div>
        )}
        {segment.generationStatus === "generating" && (
          <div className="generationStatus generating">
            Generating cards...
          </div>
        )}
        {segment.generationStatus === "generated" && (
          <div className="generationStatus generated">
            Cards ready
          </div>
        )}
        {segment.generationStatus === "not_generated" && onGenerateCards && (
          <button className="generateButton" type="button" onClick={handleGenerateCards}>
            Generate cards for this segment
          </button>
        )}
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

      {segments && segments.length > 1 && (
        <nav className="segmentNavigation">
          <button 
            className="segmentNavButton" 
            type="button" 
            disabled={!hasPrevious}
            onClick={goToPrevious}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="segmentProgress">{segmentNumber} / {totalSegments}</span>
          <button 
            className="segmentNavButton" 
            type="button" 
            disabled={!hasNext}
            onClick={goToNext}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

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
