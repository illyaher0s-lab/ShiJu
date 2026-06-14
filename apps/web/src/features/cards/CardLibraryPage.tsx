import type { CandidateExpression, ExpressionSense, Occurrence } from "@art/domain";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { isDue, nowIso } from "../../lib/date";
import { CardDetailSheet } from "./CardDetailSheet";
import { ContextCardGenerator } from "./ContextCardGenerator";

interface CardLibraryPageProps {
  expressions: ExpressionSense[];
  occurrences: Occurrence[];
  onAddContextDraft?: (draft: CandidateExpression) => void;
}

export function CardLibraryPage({ expressions, occurrences, onAddContextDraft }: CardLibraryPageProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const now = nowIso();
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return expressions;
    return expressions.filter(
      (expression) =>
        expression.expression.toLowerCase().includes(normalizedQuery) ||
        expression.meaningZh.toLowerCase().includes(normalizedQuery),
    );
  }, [expressions, query]);
  const selected = expressions.find((expression) => expression.id === selectedId) ?? null;
  const selectedOccurrences = selected
    ? occurrences.filter((occurrence) => occurrence.expressionSenseId === selected.id)
    : [];

  return (
    <main className="screen cardsScreen">
      <section className="readingHeader">
        <p>ExpressionSense</p>
        <h1>Card Library</h1>
      </section>

      {onAddContextDraft ? <ContextCardGenerator onAccept={onAddContextDraft} /> : null}

      <label className="searchBox">
        <Search size={16} />
        <span className="srOnly">Search cards</span>
        <input
          type="search"
          placeholder="Search expression or meaning"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="cardList">
        {filtered.map((expression) => {
          const due = expression.masteryStatus !== "mastered" && isDue(expression.srsDueAt, now);

          return (
            <button
              className="cardLibraryItem"
              key={expression.id}
              type="button"
              onClick={() => setSelectedId(expression.id)}
            >
              <span>
                <strong>{expression.expression}</strong>
                <small>{expression.type.replaceAll("_", " ")} · {expression.meaningZh}</small>
              </span>
              <span className={due ? "dueBadge" : "quietBadge"}>{due ? "due" : expression.masteryStatus}</span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <CardDetailSheet
          expression={selected}
          occurrences={selectedOccurrences}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </main>
  );
}
