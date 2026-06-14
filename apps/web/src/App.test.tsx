import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("App", () => {
  it("opens to the learning home dashboard first", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByText("New cards today")).toBeInTheDocument();
    expect(screen.getByText("Reviews completed")).toBeInTheDocument();
    expect(screen.getByText("Due reviews")).toBeInTheDocument();
    expect(screen.getByLabelText("Daily new-card target")).toHaveValue(6);
    expect(screen.getByLabelText("Daily review-card target")).toHaveValue(12);
    expect(screen.getByText("Pending sync: 0")).toBeInTheDocument();
    expect(screen.queryByText("Reading feedback will not advance SRS.")).not.toBeInTheDocument();
  });

  it("uses home actions to jump into the learning surfaces", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    expect(screen.getByRole("heading", { name: "Read first, learn in place" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Home" }));
    await userEvent.click(screen.getByRole("button", { name: "Review due cards" }));
    expect(screen.getByRole("heading", { name: "pick up steam" })).toBeInTheDocument();
  });

  it("adds a context-generated card to the card library", async () => {
    render(<App />);

    await userEvent.click(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("button", { name: "Cards" }));
    await userEvent.type(screen.getByLabelText("Expression"), "buff");
    await userEvent.type(screen.getByLabelText("Context"), "game");
    await userEvent.type(screen.getByLabelText("Where did you see it?"), "RPG item description");
    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));
    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(screen.getByRole("button", { name: /buff/i })).toBeInTheDocument();
  });

  it("queues reading actions as pending sync operations", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    await userEvent.click(screen.getByRole("button", { name: "roll out" }));
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.queryByRole("status", { name: "Pending sync: 1" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("status", { name: "Pending sync: 1" })).toBeInTheDocument();
  });

  it("marks a review card as mastered while keeping it in the card library", async () => {
    vi.useFakeTimers();

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Review due cards" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "鐭ラ亾" }));
    act(() => {
      vi.advanceTimersByTime(650);
    });
    fireEvent.pointerUp(screen.getByRole("button", { name: "鐭ラ亾" }));
    fireEvent.click(screen.getByRole("button", { name: "鐔熺煡" }));

    expect(screen.getByRole("heading", { name: "Review queue clear" })).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("button", { name: "Cards" }));

    expect(screen.getByRole("button", { name: /pick up steam/i })).toBeInTheDocument();
    expect(screen.getByText("mastered")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
