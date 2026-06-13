import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleCandidates, sampleSegment } from "../../fixtures/sampleSegment";
import { ReadingPage } from "./ReadingPage";

afterEach(() => {
  cleanup();
});

describe("ReadingPage", () => {
  it("shows selected highlights and hides more expressions until expanded", async () => {
    render(
      <ReadingPage
        segment={sampleSegment}
        candidates={sampleCandidates}
        onAddToReview={vi.fn()}
        onReadingFeedback={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "roll out" })).toBeInTheDocument();
    expect(screen.queryByText("shore up")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /more expressions/i }));
    expect(screen.getByText("shore up")).toBeInTheDocument();
  });

  it("opens a lightweight layer before the full explanation", async () => {
    render(
      <ReadingPage
        segment={sampleSegment}
        candidates={sampleCandidates}
        onAddToReview={vi.fn()}
        onReadingFeedback={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "roll out" }));
    expect(screen.getByText("推出、发布")).toBeInTheDocument();
    expect(screen.queryByText(/Full sentence/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /expand/i }));
    expect(screen.getByText(/Full sentence/i)).toBeInTheDocument();
  });
});
