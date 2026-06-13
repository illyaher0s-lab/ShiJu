import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ImportPage } from "./ImportPage";

afterEach(() => cleanup());

describe("ImportPage", () => {
  it("shows a TXT or Markdown import entry point", () => {
    render(<ImportPage />);

    expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument();
    expect(screen.getByLabelText("Import TXT or Markdown article")).toBeInTheDocument();
    expect(screen.getByText("First segment starts first")).toBeInTheDocument();
  });

  it("accepts pasted article text for the local MVP", async () => {
    render(<ImportPage />);

    await userEvent.type(screen.getByLabelText("Paste article text"), "A team will roll out the service next month.");
    await userEvent.click(screen.getByRole("button", { name: "Use pasted text" }));

    expect(screen.getByText("Pasted article ready")).toBeInTheDocument();
  });
});
