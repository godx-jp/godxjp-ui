import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Toggle } from "../toggle";

/**
 * Behavioral interaction tests for Toggle (Radix react-toggle button).
 * Codifies real runtime behavior so future runs need no browser MCP.
 *
 * Toggle is a single two-state button. Its controlled API is `pressed` +
 * `onPressedChange` (NOT onCheckedChange/onValueChange). State surfaces as
 * aria-pressed + data-state="on|off" on a role="button" element.
 */
describe("Toggle — interaction behavior", () => {
  it("uncontrolled: click toggles aria-pressed on then off", async () => {
    const user = userEvent.setup();
    renderWithUi(<Toggle aria-label="bold">B</Toggle>);
    const btn = screen.getByRole("button", { name: "bold" });

    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");
  });

  it("onPressedChange fires with the new pressed value on click", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderWithUi(
      <Toggle aria-label="italic" onPressedChange={onPressedChange}>
        I
      </Toggle>,
    );
    await user.click(screen.getByRole("button", { name: "italic" }));
    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("controlled: state sticks via pressed + onPressedChange (no freeze)", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [pressed, setPressed] = React.useState(false);
      return (
        <Toggle aria-label="underline" pressed={pressed} onPressedChange={setPressed}>
          U
        </Toggle>
      );
    }
    renderWithUi(<Controlled />);
    const btn = screen.getByRole("button", { name: "underline" });

    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("controlled without handler stays frozen (state cannot change)", async () => {
    const user = userEvent.setup();
    // pressed pinned true, no onPressedChange — clicks must not flip it.
    renderWithUi(
      <Toggle aria-label="frozen" pressed>
        F
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "frozen" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("defaultPressed renders in the on state", () => {
    renderWithUi(
      <Toggle aria-label="defon" defaultPressed>
        D
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "defon" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");
  });

  it("keyboard: Space toggles the focused button", async () => {
    const user = userEvent.setup();
    renderWithUi(<Toggle aria-label="space">S</Toggle>);
    const btn = screen.getByRole("button", { name: "space" });

    await user.tab();
    expect(btn).toHaveFocus();

    await user.keyboard("{ }");
    expect(btn).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{ }");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("keyboard: Enter toggles the focused button", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderWithUi(
      <Toggle aria-label="enter" onPressedChange={onPressedChange}>
        E
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "enter" });
    btn.focus();
    expect(btn).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("disabled: blocks click, state cannot change, not focusable", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderWithUi(
      <Toggle aria-label="dis" disabled onPressedChange={onPressedChange}>
        X
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "dis" });
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(btn).toHaveAttribute("aria-pressed", "false");

    // disabled element is skipped by Tab
    await user.tab();
    expect(btn).not.toHaveFocus();
  });
});
