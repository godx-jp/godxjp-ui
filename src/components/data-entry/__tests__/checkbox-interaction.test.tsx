import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Checkbox } from "../checkbox";

/**
 * Behavioral interaction tests for Checkbox + Checkbox.Group.
 * Codifies real runtime behavior so future runs need NO browser MCP.
 *
 * The standalone Checkbox is a Radix primitive: it exposes `checked`
 * (controlled) / `defaultChecked` (uncontrolled) and fires `onCheckedChange`.
 * Checkbox.Group is a multi-select wrapper: it owns a string[] `value`
 * and fires `onValueChange(next[])`.
 *
 * Radix renders the checkbox as role="checkbox" (a <button>), NOT an
 * <input>, so we assert `aria-checked` / `data-state`, not `.toBeChecked()`.
 */
describe("Checkbox (standalone) — toggle behavior", () => {
  it("uncontrolled: click toggles aria-checked true/false", async () => {
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="agree" />);
    const box = screen.getByRole("checkbox", { name: "agree" });

    expect(box).toHaveAttribute("aria-checked", "false");
    await user.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(box).toHaveAttribute("data-state", "checked");
    await user.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");
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
    expect(box).toHaveAttribute("aria-checked", "true");
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

    expect(box).toHaveAttribute("aria-checked", "false");
    await user.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("controlled without a state-syncing handler is FROZEN (stays checked=false)", async () => {
    // Mirrors the controlled-freeze trap: a controlled `checked` whose handler
    // does NOT update the source of truth can never change. Codifies that the
    // primitive itself does not self-mutate a controlled value.
    const user = userEvent.setup();
    renderWithUi(<Checkbox aria-label="frozen" checked={false} onCheckedChange={() => {}} />);
    const box = screen.getByRole("checkbox", { name: "frozen" });

    await user.click(box);
    expect(box).toHaveAttribute("aria-checked", "false"); // never moves
  });

  it("disabled blocks click and keyboard, no onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithUi(<Checkbox aria-label="dis" disabled onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "dis" });

    await user.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box).toHaveAttribute("aria-checked", "false");
    expect(box).toBeDisabled();
  });

  it("defaultChecked renders initially checked (uncontrolled)", async () => {
    renderWithUi(<Checkbox aria-label="pre" defaultChecked />);
    const box = screen.getByRole("checkbox", { name: "pre" });
    expect(box).toHaveAttribute("aria-checked", "true");
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
    expect(email).toHaveAttribute("aria-checked", "true");
    expect(sms).toHaveAttribute("aria-checked", "false");

    await user.click(sms);
    expect(sms).toHaveAttribute("aria-checked", "true");
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
    expect(sms).toHaveAttribute("aria-checked", "true");
    await user.click(sms);
    expect(sms).toHaveAttribute("aria-checked", "false");
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
