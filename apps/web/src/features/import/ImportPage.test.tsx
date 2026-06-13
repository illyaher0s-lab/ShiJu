import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
});
