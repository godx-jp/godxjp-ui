import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Checkbox } from "../checkbox";

/**
 * Behavioral interaction tests for Checkbox + Checkbox.Group.
 * Codifies real runtime behavior so future runs need NO browser MCP.
 *
 * The standalone Checkbox exposes `checked` (controlled) / `defaultChecked`
 * (uncontrolled) and fires `onCheckedChange` — the public prop names are the
 * same they were on the Radix primitive. Checkbox.Group is a multi-select
 * wrapper: it owns a string[] `value` and fires `onValueChange(next[])`.
 *
 * react-aria renders the checkbox as a REAL <input type="checkbox"> wrapped in
 * a <label> (Radix rendered a <button role="checkbox">), so the checked state
 * is the input's own `checked` property — `.toBeChecked()` — rather than an
 * `aria-checked` attribute. `data-state` is still written, on the wrapping box,
 * because 12k lines of CSS key off it.
 */
describe("Checkbox (standalone) — toggle behavior", () => {
  it("uncontrolled: click toggles the checked state true/false", async () => {
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="agree" />);
    const box = screen.getByRole("checkbox", { name: "agree" });

    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    // The CSS hook the checked fill hangs off, on the box that paints it.
    expect(box.closest('[data-slot="checkbox"]')).toHaveAttribute("data-state", "checked");
    await user.click(box);
    expect(box).not.toBeChecked();
  });

  it("onCheckedChange fires with the new boolean on click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Checkbox aria-label="news" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "news" });

    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("Space toggles when focused (keyboard activation)", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Checkbox aria-label="kb" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "kb" });

    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard("{ }"); // Space
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("controlled: value sticks via parent state (toggle on click)", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <Checkbox
          aria-label="ctrl"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
      );
    }
    renderWithUi(<Controlled />);
    const box = screen.getByRole("checkbox", { name: "ctrl" });

    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });

  it("controlled without a state-syncing handler is FROZEN (stays checked=false)", async () => {
    // Mirrors the controlled-freeze trap: a controlled `checked` whose handler
    // does NOT update the source of truth can never change. Codifies that the
    // primitive itself does not self-mutate a controlled value.
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="frozen" checked={false} onCheckedChange={() => {}} />);
    const box = screen.getByRole("checkbox", { name: "frozen" });

    await user.click(box);
    expect(box).not.toBeChecked(); // never moves
  });

  it("disabled blocks click and keyboard, no onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Checkbox aria-label="dis" disabled onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "dis" });

    await user.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box).not.toBeChecked();
    expect(box).toBeDisabled();
  });

  it("defaultChecked renders initially checked (uncontrolled)", async () => {
    renderWithUi(<Checkbox aria-label="pre" defaultChecked />);
    const box = screen.getByRole("checkbox", { name: "pre" });
    expect(box).toBeChecked();
  });
});

describe("Checkbox.Group — multi-select behavior", () => {
  const OPTIONS = [
    { value: "email", label: "メール" },
    { value: "sms", label: "SMS" },
    { value: "push", label: "プッシュ通知", disabled: true },
  ];

  it("uncontrolled: clicking options accumulates a string[] value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Checkbox.Group options={OPTIONS} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("checkbox", { name: "メール" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["email"]);

    await user.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["email", "sms"]);

    // Toggling an already-selected one removes it.
    await user.click(screen.getByRole("checkbox", { name: "メール" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["sms"]);
  });

  it("checked state reflects the selection visually", async () => {
    const user = userEvent.setup();
    renderWithUi(<Checkbox.Group options={OPTIONS} defaultValue={["email"]} />);

    const email = screen.getByRole("checkbox", { name: "メール" });
    const sms = screen.getByRole("checkbox", { name: "SMS" });
    expect(email).toBeChecked();
    expect(sms).not.toBeChecked();

    await user.click(sms);
    expect(sms).toBeChecked();
  });

  it("controlled: parent state drives checked, value sticks", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState<string[]>([]);
      return <Checkbox.Group options={OPTIONS} value={value} onValueChange={setValue} />;
    }
    renderWithUi(<Controlled />);

    const sms = screen.getByRole("checkbox", { name: "SMS" });
    await user.click(sms);
    expect(sms).toBeChecked();
    await user.click(sms);
    expect(sms).not.toBeChecked();
  });

  it("per-option disabled blocks that option only", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Checkbox.Group options={OPTIONS} onValueChange={onValueChange} />);

    const push = screen.getByRole("checkbox", { name: "プッシュ通知" });
    expect(push).toBeDisabled();
    await user.click(push);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("group-level disabled blocks all options", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Checkbox.Group options={OPTIONS} disabled onValueChange={onValueChange} />);

    await user.click(screen.getByRole("checkbox", { name: "メール" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "メール" })).toBeDisabled();
  });
});
