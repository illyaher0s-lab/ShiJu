import { BookMarked, BookOpen, Files, RotateCcw } from "lucide-react";
import type { ChangeEvent } from "react";

interface HomePageProps {
  newCardsToday: number;
  completedReviewsToday: number;
  dueReviewCount: number;
  newCardTarget: number;
  reviewTarget: number;
  pendingSyncCount: number;
  onNewCardTargetChange: (target: number) => void;
  onReviewTargetChange: (target: number) => void;
  onNavigate: (target: "read" | "review" | "cards" | "articles") => void;
}

export function HomePage({
  newCardsToday,
  completedReviewsToday,
  dueReviewCount,
  newCardTarget,
  reviewTarget,
  pendingSyncCount,
  onNewCardTargetChange,
  onReviewTargetChange,
  onNavigate,
}: HomePageProps) {
  function updateTarget(event: ChangeEvent<HTMLInputElement>, onChange: (target: number) => void) {
    onChange(Number(event.target.value));
  }

  return (
    <main className="screen homeScreen">
      <section className="homeHeader">
        <p>Daily plan</p>
        <h1>Today</h1>
      </section>

      <section className="homeStats" aria-label="Today's learning status">
        <article>
          <span>New cards today</span>
          <strong>{newCardsToday}</strong>
          <small>Target {newCardTarget}</small>
        </article>
        <article>
          <span>Reviews completed</span>
          <strong>{completedReviewsToday}</strong>
          <small>Target {reviewTarget}</small>
        </article>
        <article>
          <span>Due reviews</span>
          <strong>{dueReviewCount}</strong>
          <small>Ready now</small>
        </article>
      </section>

      <section className="targetPanel" aria-label="Daily targets">
        <label>
          <span>Daily new-card target</span>
          <input
            aria-label="Daily new-card target"
            min={0}
            step={1}
            type="number"
            value={newCardTarget}
            onChange={(event) => updateTarget(event, onNewCardTargetChange)}
          />
        </label>
        <label>
          <span>Daily review-card target</span>
          <input
            aria-label="Daily review-card target"
            min={0}
            step={1}
            type="number"
            value={reviewTarget}
            onChange={(event) => updateTarget(event, onReviewTargetChange)}
          />
        </label>
      </section>

      <section className="homeActions" aria-label="Primary actions">
        <button type="button" onClick={() => onNavigate("read")}>
          <BookOpen size={18} />
          Continue reading
        </button>
        <button type="button" onClick={() => onNavigate("review")}>
          <RotateCcw size={18} />
          Review due cards
        </button>
        <button type="button" onClick={() => onNavigate("cards")}>
          <BookMarked size={18} />
          Cards
        </button>
        <button type="button" onClick={() => onNavigate("articles")}>
          <Files size={18} />
          Articles
        </button>
      </section>

      <p className="homeSyncStatus" role="status" aria-label={`Pending sync: ${pendingSyncCount}`}>
        Pending sync: {pendingSyncCount}
      </p>
    </main>
  );
}
