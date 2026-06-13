import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { sampleExpressionSenses, sampleOccurrences } from "../../fixtures/sampleSegment";
import { CardLibraryPage } from "./CardLibraryPage";

afterEach(() => cleanup());

describe("CardLibraryPage", () => {
  it("lists expression sense cards and opens occurrence evidence", async () => {
    render(<CardLibraryPage expressions={sampleExpressionSenses} occurrences={sampleOccurrences} />);

    expect(screen.getByRole("heading", { name: "Card Library" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /roll out/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /roll out/i }));

    expect(screen.getByText("Occurrence evidence")).toBeInTheDocument();
    expect(screen.getByText(/When the city began to roll out/i)).toBeInTheDocument();
  });
});
