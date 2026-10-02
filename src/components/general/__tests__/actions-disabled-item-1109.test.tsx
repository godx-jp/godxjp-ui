import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Actions } from "../actions";

/**
 * gh#1109 — `ActionsItemsProp.disabled`. A formatting toolbar (the @godxjp/editor toolbar is
 * `Actions`) must stand still while the user previews or the document is read-only, and a strip had
 * no way to say so. A disabled action is `aria-disabled` and ignores clicks, but stays FOCUSABLE and
 * in the arrow-key order (WAI-ARIA toolbar: disabled items remain discoverable).
 */
describe("Actions — disabled action (gh#1109)", () => {
  it("is aria-disabled, ignores the click, and fires neither handler", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onClick = vi.fn();
    renderWithUi(
      <Actions
        label="書式"
        onClick={onClick}
        items={[
          { key: "bold", label: "太字", disabled: true, onItemClick },
          { key: "italic", label: "斜体", disabled: true },
        ]}
      />,
    );
    const bold = screen.getByRole("button", { name: "太字" });
    expect(bold).toHaveAttribute("aria-disabled", "true");
    expect(bold).not.toBeDisabled();
    await user.click(bold);
    await user.click(screen.getByRole("button", { name: "斜体" }));
    expect(onItemClick).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("stays in the roving order: Tab lands on it and the arrows move past it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Actions
        label="書式"
        items={[
          { key: "a", label: "A", disabled: true },
          { key: "b", label: "B" },
        ]}
      />,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "A" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "B" })).toHaveFocus();
  });

  it("an enabled action is unchanged: no aria-disabled, the click runs", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    renderWithUi(<Actions label="x" items={[{ key: "a", label: "A", onItemClick }]} />);
    const a = screen.getByRole("button", { name: "A" });
    expect(a).not.toHaveAttribute("aria-disabled");
    await user.click(a);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });
});
