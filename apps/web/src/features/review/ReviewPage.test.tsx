import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleExpressionSenses, sampleOccurrences } from "../../fixtures/sampleSegment";
import { ReviewPage } from "./ReviewPage";

afterEach(() => cleanup());

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
});
