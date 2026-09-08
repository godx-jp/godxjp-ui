import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("renders checkbox role", () => {
    renderWithUi(<Checkbox aria-label="accept" />);
    // The role lives on the real `<input>` and the `data-slot` CSS hook on the box react-aria
    // wraps it in — one widget, two elements — so assert the hook from the role, not on it.
    expect(screen.getByRole("checkbox").closest('[data-slot="checkbox"]')).not.toBeNull();
  });

  it("can be checked", async () => {
    const { userEvent } = await import("@/test/render");
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="accept" />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });
});
