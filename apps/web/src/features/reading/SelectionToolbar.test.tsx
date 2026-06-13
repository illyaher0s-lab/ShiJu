import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectionToolbar } from "./SelectionToolbar";

afterEach(() => cleanup());

describe("SelectionToolbar", () => {
  it("requests card generation for selected text", async () => {
    const onGenerate = vi.fn();

    render(<SelectionToolbar selectedText="all at once" onGenerate={onGenerate} />);

    await userEvent.click(screen.getByRole("button", { name: "Generate card" }));

    expect(onGenerate).toHaveBeenCalledWith("all at once");
  });
});
