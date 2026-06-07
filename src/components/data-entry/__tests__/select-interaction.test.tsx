import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

/**
 * Behavioral interaction tests for <Select> (Radix-backed single-select).
 *
 * Codifies what was verified by driving the component in a real browser, so the
 * suite is the permanent regression guard (`pnpm test`, no MCP needed). Covers
 * the skill's Select checklist: open (click / keyboard), Arrow nav, Enter to
 * select, Escape to close, controlled value sticks, disabled blocks, and the
 * data-driven (Ant-style) `options` API.
 *
 * jsdom note: Radix Select relies on pointer-capture + scrollIntoView, both
 * polyfilled in the repo's vitest setup. Focus/aria state is asserted rather
 * than visual focus rings.
 */

const HUBS = [
  { value: "osaka", label: "Osaka" },
  { value: "tokyo", label: "Tokyo" },
  { value: "nagoya", label: "Nagoya" },
];

function Compound({
  onValueChange,
  defaultValue,
  disabled,
}: {
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger aria-label="Hub">
        <SelectValue placeholder="拠点を選択" />
      </SelectTrigger>
      <SelectContent>
        {HUBS.map((h) => (
          <SelectItem key={h.value} value={h.value}>
            {h.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

describe("Select — open + select via mouse", () => {
  it("click trigger opens the listbox, click option selects and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Compound onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "Hub" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("option", { name: "Tokyo" }));
    expect(onValueChange).toHaveBeenCalledWith("tokyo");

    // popover closed; selected label now shows on the trigger.
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent("Tokyo");
  });
});

describe("Select — keyboard navigation", () => {
  it("ArrowDown opens, ArrowDown moves highlight, Enter selects", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Compound onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "Hub" });
    trigger.focus();
    expect(trigger).toHaveFocus();

    // ArrowDown on a closed trigger opens the listbox (Radix Select behavior).
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    // Highlight moves down to the 2nd option, Enter commits it.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("tokyo");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("Escape closes the listbox without changing the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Compound onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "Hub" });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus(); // focus returns to the trigger
  });

  it("typeahead jumps to the matching option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Compound onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "Hub" });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    // Type "n" to jump to Nagoya, Enter to select.
    await user.keyboard("n{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("nagoya");
  });
});

describe("Select — controlled value sticks", () => {
  it("controlled value updates and persists across selections", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = React.useState("osaka");
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger aria-label="Hub">
            <SelectValue placeholder="拠点を選択" />
          </SelectTrigger>
          <SelectContent>
            {HUBS.map((h) => (
              <SelectItem key={h.value} value={h.value}>
                {h.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    renderWithUi(<Controlled />);
    const trigger = screen.getByRole("combobox", { name: "Hub" });
    expect(trigger).toHaveTextContent("Osaka"); // initial controlled value

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Nagoya" }));

    // Value sticks (not reverted to "Osaka", not frozen).
    await waitFor(() => expect(trigger).toHaveTextContent("Nagoya"));
  });
});

describe("Select — disabled", () => {
  it("disabled trigger cannot be opened", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Compound onValueChange={onValueChange} disabled />);

    const trigger = screen.getByRole("combobox", { name: "Hub" });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    // No listbox opens; no change fires.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a disabled option cannot be selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Hub">
          <SelectValue placeholder="拠点を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="osaka">Osaka</SelectItem>
          <SelectItem value="tokyo" disabled>
            Tokyo
          </SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByRole("combobox", { name: "Hub" }));
    const tokyo = await screen.findByRole("option", { name: "Tokyo" });
    expect(tokyo).toHaveAttribute("aria-disabled", "true");

    await user.click(tokyo);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Select — data-driven (Ant-style) options API", () => {
  it("renders a no-search Radix listbox and selects via onValueChange(value, option)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select value="" onValueChange={onValueChange} placeholder="拠点を選択" options={HUBS} />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-slot", "select-trigger"); // plain listbox, no search

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Nagoya" }));

    // Data-driven Select passes the resolved option as the 2nd arg.
    expect(onValueChange).toHaveBeenCalledWith(
      "nagoya",
      expect.objectContaining({ value: "nagoya" }),
    );
  });
});

describe("Select — open-state ring (gh#101 regression)", () => {
  // `:focus-visible` does NOT fire when a trigger is opened by MOUSE, so an open Select must carry a
  // `data-[state=open]` ring (otherwise mouse-opening shows only a border change — inconsistent with
  // a focused Input). The ring class is wired via controlTriggerClass; assert it's present and that
  // opening sets data-state=open so the ring actually applies.
  it("wires a data-[state=open] ring and sets data-state=open when opened", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select>
        <SelectTrigger aria-label="拠点">
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="osaka">Osaka</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("data-[state=open]:ring-[3px]");
    expect(trigger.className).toContain("data-[state=open]:border-ring");

    expect(trigger).toHaveAttribute("data-state", "closed");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
  });
});
