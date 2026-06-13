import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeneratedCardDraftSheet } from "./GeneratedCardDraftSheet";
import { buildManualSelectionDraft } from "./manualSelection";

afterEach(() => cleanup());

describe("GeneratedCardDraftSheet", () => {
  it("shows generated metadata and allows accepting the draft", async () => {
    const draft = buildManualSelectionDraft({
      selectedText: "all at once",
      sentence: "Teachers noticed that momentum did not arrive all at once.",
      articleId: "article-sample",
      segmentId: "segment-1",
      generatedAt: "2026-06-13T00:00:00.000Z",
    });
    const onAccept = vi.fn();

    render(<GeneratedCardDraftSheet draft={draft} onAccept={onAccept} onDismiss={vi.fn()} />);

    expect(screen.getByText("manual-selection-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("manual-selection-v1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(onAccept).toHaveBeenCalledWith(draft);
  });
});
