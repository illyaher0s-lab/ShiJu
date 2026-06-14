import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleExpressionSenses, sampleOccurrences } from "../../fixtures/sampleSegment";
import { ReviewPage } from "./ReviewPage";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("ReviewPage", () => {
  it("keeps learning details hidden until answer reveal", async () => {
    render(
      <ReviewPage
        expressions={sampleExpressionSenses}
        occurrences={sampleOccurrences}
        activeReviewIds={["sense-roll-out"]}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "roll out" })).toBeInTheDocument();
    expect(screen.queryByText("Local meaning")).not.toBeInTheDocument();
    expect(screen.queryByText("Sentence clue")).not.toBeInTheDocument();
    expect(screen.queryByText("Another example")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show answer" }));

    expect(screen.getByText("Local meaning")).toBeInTheDocument();
    expect(screen.getByText("Original sentence")).toBeInTheDocument();
    expect(screen.getByText("Sentence clue")).toBeInTheDocument();
    expect(screen.getByText("Another example")).toBeInTheDocument();
    expect(screen.queryByText("Usage hint")).not.toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
  });

  it("shows Chinese color-coded review feedback buttons", () => {
    render(
      <ReviewPage
        expressions={sampleExpressionSenses}
        occurrences={sampleOccurrences}
        activeReviewIds={["sense-roll-out"]}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "涓嶇煡閬揱" })).toHaveClass("feedbackUnknown");
    expect(screen.getByRole("button", { name: "杩锋儜" })).toHaveClass("feedbackFuzzy");
    expect(screen.getByRole("button", { name: "鐭ラ亾" })).toHaveClass("feedbackKnown");
  });

  it("reveals a mastered action after long-pressing known", async () => {
    vi.useFakeTimers();
    const onMarkMastered = vi.fn();

    render(
      <ReviewPage
        expressions={sampleExpressionSenses}
        occurrences={sampleOccurrences}
        activeReviewIds={["sense-roll-out"]}
        onReview={vi.fn()}
        onMarkMastered={onMarkMastered}
      />,
    );

    expect(screen.queryByRole("button", { name: "鐔熺煡" })).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "鐭ラ亾" }));
    act(() => {
      vi.advanceTimersByTime(650);
    });
    fireEvent.pointerUp(screen.getByRole("button", { name: "鐭ラ亾" }));

    fireEvent.click(screen.getByRole("button", { name: "鐔熺煡" }));

    expect(onMarkMastered).toHaveBeenCalledWith("sense-roll-out", "2026-06-13T00:00:00.000Z");
    vi.useRealTimers();
  });

  it("excludes mastered expressions from the active review queue", () => {
    render(
      <ReviewPage
        expressions={sampleExpressionSenses.map((expression) =>
          expression.id === "sense-pick-up-steam" ? { ...expression, masteryStatus: "mastered" } : expression,
        )}
        occurrences={sampleOccurrences}
        activeReviewIds={["sense-pick-up-steam"]}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Review queue clear" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "pick up steam" })).not.toBeInTheDocument();
  });
});
