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

    await userEvent.click(screen.getByRole("button", { name: "Show answer" }));

    expect(screen.getByText("Local meaning")).toBeInTheDocument();
    expect(screen.getByText("Original sentence")).toBeInTheDocument();
    expect(screen.getByText("Usage hint")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
  });
});
