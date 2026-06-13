import type { ExpressionSense, Occurrence } from "@art/domain";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { isDue, nowIso } from "../../lib/date";
import { CardDetailSheet } from "./CardDetailSheet";

interface CardLibraryPageProps {
  expressions: ExpressionSense[];
  occurrences: Occurrence[];
}

export function CardLibraryPage({ expressions, occurrences }: CardLibraryPageProps) {
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
        {filtered.map((expression) => (
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
            <span className={isDue(expression.srsDueAt, now) ? "dueBadge" : "quietBadge"}>
              {isDue(expression.srsDueAt, now) ? "due" : expression.masteryStatus}
            </span>
          </button>
        ))}
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
