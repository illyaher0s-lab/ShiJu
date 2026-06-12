import type { CandidateExpression } from "@art/domain";
import type { ReactNode } from "react";

interface HighlightOptions {
  text: string;
  candidates: CandidateExpression[];
  onSelect: (candidate: CandidateExpression) => void;
}

export function renderHighlightedText({ text, candidates, onSelect }: HighlightOptions): ReactNode[] {
  const sorted = candidates
    .filter((candidate) => candidate.candidateStatus === "selected")
    .slice(0, 6)
    .sort((a, b) => text.indexOf(a.expression) - text.indexOf(b.expression));

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const candidate of sorted) {
    const index = text.indexOf(candidate.expression, cursor);
    if (index < 0) continue;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    nodes.push(
      <button className="highlight" key={candidate.id} type="button" onClick={() => onSelect(candidate)}>
        {text.slice(index, index + candidate.expression.length)}
      </button>
    );

    cursor = index + candidate.expression.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
