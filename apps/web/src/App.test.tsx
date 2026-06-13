import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("adds a context-generated card to the card library", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Cards" }));
    await userEvent.type(screen.getByLabelText("Expression"), "buff");
    await userEvent.type(screen.getByLabelText("Context"), "game");
    await userEvent.type(screen.getByLabelText("Where did you see it?"), "RPG item description");
    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(screen.getByRole("button", { name: /buff/i })).toBeInTheDocument();
  });

  it("queues reading actions as pending sync operations", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "roll out" }));
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Pending sync: 1")).toBeInTheDocument();
  });
});
