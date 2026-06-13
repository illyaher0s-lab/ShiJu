import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("does not show a persistent reading feedback notice on first load", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Read first, learn in place" })).toBeInTheDocument();
    expect(screen.queryByText("Reading feedback will not advance SRS.")).not.toBeInTheDocument();
  });
});
