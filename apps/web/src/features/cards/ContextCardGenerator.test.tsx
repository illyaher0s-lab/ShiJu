import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextCardGenerator } from "./ContextCardGenerator";

afterEach(() => cleanup());

describe("ContextCardGenerator", () => {
  it("generates and accepts a card draft from learner-entered context", async () => {
    const onAccept = vi.fn();

    render(<ContextCardGenerator onAccept={onAccept} />);

    await userEvent.type(screen.getByLabelText("Expression"), "buff");
    await userEvent.type(screen.getByLabelText("Context"), "game");
    await userEvent.type(screen.getByLabelText("Where did you see it?"), "RPG item description");
    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));

    expect(screen.getByText("context-entry-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("a temporary improvement or boost in a game context")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add to review" }));

    expect(onAccept).toHaveBeenCalledWith(expect.objectContaining({ expression: "buff" }));
  });
});
