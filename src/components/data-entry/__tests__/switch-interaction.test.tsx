import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Switch } from "../switch";

/**
 * Behavioral interaction tests for <Switch> (react-aria-components toggle).
 * Codifies the real runtime behaviors so future runs need NO browser MCP.
 *
 * Switch is a binary toggle, so the relevant axes are:
 *  - toggle via click, and via Space / Enter when focused
 *  - controlled value sticks (no freeze) and onCheckedChange fires the next state
 *  - uncontrolled defaultChecked + internal state
 *  - disabled blocks every interaction and is not focusable
 *  - hidden form input mirrors the checked state ("1"/"0") when `name` is set
 *
 * Prop names are taken from the real source: `checked` / `defaultChecked` /
 * `onCheckedChange` (NOT onValueChange/onChange). data-state is "checked" | "unchecked".
 *
 * DOM SHAPE. `role="switch"` is on the real `<input type="checkbox">` react-aria renders; the
 * PAINTED box is the `<label>` around it, and that is where `data-state` / `data-size` live —
 * exactly the split the Checkbox already has since it moved off Radix. `box()` walks the one hop
 * from the focus target to the painted box.
 */
const box = (control: HTMLElement) => control.closest('[data-slot="switch"]')!;
describe("Switch — toggle interaction", () => {
  it("uncontrolled: click toggles on then off and fires onCheckedChange each time", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="wifi" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "wifi" });

    // starts off (defaultChecked=false in source)
    expect(box(sw)).toHaveAttribute("data-state", "unchecked");
    expect(sw).not.toBeChecked();

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box(sw)).toHaveAttribute("data-state", "checked");
    expect(sw).toBeChecked();

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(box(sw)).toHaveAttribute("data-state", "unchecked");
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("uncontrolled: defaultChecked renders the on state", () => {
    renderWithUi(<Switch aria-label="dark" defaultChecked />);
    expect(box(screen.getByRole("switch", { name: "dark" }))).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("keyboard: Space toggles the focused switch", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="bt" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "bt" });

    await user.tab();
    expect(sw).toHaveFocus(); // Tab reaches it

    await user.keyboard(" "); // Space
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box(sw)).toHaveAttribute("data-state", "checked");

    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(box(sw)).toHaveAttribute("data-state", "unchecked");
  });

  it("keyboard: Enter toggles the focused switch", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="loc" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "loc" });

    sw.focus();
    expect(sw).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box(sw)).toHaveAttribute("data-state", "checked");
  });

  it("controlled: state sticks to the parent value (no freeze) and reflects updates", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    function Controlled() {
      const [on, setOn] = React.useState(false);
      return (
        <Switch
          aria-label="sync"
          checked={on}
          onCheckedChange={(next) => {
            spy(next);
            setOn(next);
          }}
        />
      );
    }
    renderWithUi(<Controlled />);
    const sw = screen.getByRole("switch", { name: "sync" });

    expect(box(sw)).toHaveAttribute("data-state", "unchecked");
    await user.click(sw);
    expect(spy).toHaveBeenLastCalledWith(true);
    expect(box(sw)).toHaveAttribute("data-state", "checked"); // parent state drove it on
    await user.click(sw);
    expect(box(sw)).toHaveAttribute("data-state", "unchecked");
  });

  it("controlled: pinned checked cannot be flipped when parent ignores the change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    // Parent never updates state -> value is frozen by design (controlled, ignored).
    renderWithUi(<Switch aria-label="pinned" checked={false} onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "pinned" });

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true); // handler still fires
    expect(box(sw)).toHaveAttribute("data-state", "unchecked"); // but visual stays pinned
  });

  it("disabled: blocks click and keyboard, cannot change, not focusable via Tab", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="dis" disabled onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "dis" });

    expect(sw).toBeDisabled();

    await user.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box(sw)).toHaveAttribute("data-state", "unchecked");

    await user.tab();
    expect(sw).not.toHaveFocus(); // disabled is skipped in tab order
  });

  it("name: renders a hidden input mirroring the checked state as 1/0", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<Switch aria-label="notif" name="notifications" />);
    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="notifications"]',
    );
    expect(hidden).not.toBeNull();
    expect(hidden).toHaveValue("0");

    await user.click(screen.getByRole("switch", { name: "notif" }));
    expect(
      container.querySelector<HTMLInputElement>('input[type="hidden"][name="notifications"]'),
    ).toHaveValue("1");
  });

  it("size prop is reflected on data-size (sm | md)", () => {
    renderWithUi(<Switch aria-label="small" size="sm" />);
    expect(box(screen.getByRole("switch", { name: "small" }))).toHaveAttribute("data-size", "sm");
  });
});
