import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Switch } from "../switch";

/**
 * Behavioral interaction tests for <Switch> (Radix-backed toggle).
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
 */
describe("Switch — toggle interaction", () => {
  it("uncontrolled: click toggles on then off and fires onCheckedChange each time", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="wifi" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "wifi" });

    // starts off (defaultChecked=false in source)
    expect(sw).toHaveAttribute("data-state", "unchecked");
    expect(sw).toHaveAttribute("aria-checked", "false");

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(sw).toHaveAttribute("data-state", "checked");
    expect(sw).toHaveAttribute("aria-checked", "true");

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(sw).toHaveAttribute("data-state", "unchecked");
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("uncontrolled: defaultChecked renders the on state", () => {
    renderWithUi(<Switch aria-label="dark" defaultChecked />);
    expect(screen.getByRole("switch", { name: "dark" })).toHaveAttribute("data-state", "checked");
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
    expect(sw).toHaveAttribute("data-state", "checked");

    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(sw).toHaveAttribute("data-state", "unchecked");
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
    expect(sw).toHaveAttribute("data-state", "checked");
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

    expect(sw).toHaveAttribute("data-state", "unchecked");
    await user.click(sw);
    expect(spy).toHaveBeenLastCalledWith(true);
    expect(sw).toHaveAttribute("data-state", "checked"); // parent state drove it on
    await user.click(sw);
    expect(sw).toHaveAttribute("data-state", "unchecked");
  });

  it("controlled: pinned checked cannot be flipped when parent ignores the change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    // Parent never updates state -> value is frozen by design (controlled, ignored).
    renderWithUi(<Switch aria-label="pinned" checked={false} onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "pinned" });

    await user.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true); // handler still fires
    expect(sw).toHaveAttribute("data-state", "unchecked"); // but visual stays pinned
  });

  it("disabled: blocks click and keyboard, cannot change, not focusable via Tab", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="dis" disabled onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "dis" });

    expect(sw).toBeDisabled();

    await user.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(sw).toHaveAttribute("data-state", "unchecked");

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
    expect(screen.getByRole("switch", { name: "small" })).toHaveAttribute("data-size", "sm");
  });
});
