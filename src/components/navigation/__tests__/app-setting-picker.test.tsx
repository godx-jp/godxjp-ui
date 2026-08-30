import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { AppSettingPicker } from "../app-setting-picker";
import { cleanup, renderWithUi, screen, userEvent } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";

const navigationCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/navigation-layout.css"),
  "utf8",
);

/**
 * The shipped rule that gives a locale picker its OWNED per-kind width — selector extracted from
 * the stylesheet, never retyped. "Hugs its value" means precisely that this rule stops selecting
 * the trigger, which is a thing `.matches()` can settle and a class name cannot.
 */
const perKindWidthSelector = ruleSelector(
  navigationCss,
  /\.ui-app-setting-picker-trigger\[data-kind="locale"\] \{\s*\n\s*inline-size:/,
);

describe("AppSettingPicker", () => {
  it("renders the inline appearance without field-like trigger chrome", () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="inline" value="en" onValueChange={() => {}} />,
    );
    // The chrome-less box lives in `.ui-app-setting-picker-inline`'s own rule now, so the
    // component no longer repeats border-0/bg-transparent/shadow-none as utilities (#319).
    expect(screen.getByRole("combobox")).toHaveClass("ui-app-setting-picker-inline");
  });

  it.each([
    ["timezone", "Asia/Tokyo"],
    ["dateFormat", "iso"],
    ["timeFormat", "24h"],
  ] as const)("renders the %s kind as a labelled Select trigger", (kind, value) => {
    renderWithUi(<AppSettingPicker kind={kind} value={value} onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-label");
  });

  it('kind="locale" defaults to the compact icon-only trigger (product contract, gh#175)', () => {
    // No `appearance` prop: locale's canonical form is the icon-only language switcher, so it
    // must default to icon (no visible value text) while still exposing its localized aria-label —
    // NOT the labeled full-width Select the other kinds default to.
    renderWithUi(<AppSettingPicker kind="locale" value="ja" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger).toHaveTextContent("");
  });

  it('kind="locale" honours an explicit appearance="labeled" override (settings-form row)', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="labeled" value="ja" onValueChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");
  });

  it("controlled: picking an option fires onValueChange (locale)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<AppSettingPicker kind="locale" value="ja" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it("is disabled when unbound (no AppProvider + no value)", () => {
    // plain render → useOptionalAppContext() is undefined → unbound → disabled
    const { getByRole } = render(<AppSettingPicker kind="locale" />);
    expect(getByRole("combobox")).toBeDisabled();
  });

  it("respects an explicit disabled prop", () => {
    renderWithUi(
      <AppSettingPicker kind="timezone" value="Asia/Tokyo" onValueChange={vi.fn()} disabled />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it.each([
    ["theme", "light"],
    ["density", "default"],
    ["fontSize", "md"],
  ] as const)("builds the option list for the %s theme axis", (kind, value) => {
    renderWithUi(<AppSettingPicker kind={kind} value={value} onValueChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label");
  });

  it("brand: includes the opt-out option and maps it back to null on select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // value="moss" (a concrete brand) so the trigger is bound/enabled.
    renderWithUi(<AppSettingPicker kind="brand" value="moss" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    // the first option is the brand opt-out (none)
    const none = await screen.findByRole("option", { name: /none|không|なし|mặc định|default/i });
    await user.click(none);
    // onValueChange receives the raw wire value (__app__); the ctx-bound setter is what
    // maps __app__ → null, but here we passed onValueChange directly.
    expect(onValueChange).toHaveBeenCalledWith("__app__");
  });

  it("brand: a null/undefined current resolves to the opt-out option, not undefined", () => {
    // No value, but provide onValueChange so it stays bound (current === BRAND_NONE).
    renderWithUi(<AppSettingPicker kind="brand" onValueChange={vi.fn()} />);
    // bound because brand maps null → BRAND_NONE (a defined current), so not disabled.
    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("context-bound: reads from AppProvider and writes via its setter (locale)", async () => {
    const user = userEvent.setup();
    // No value / no onValueChange → it binds to the AppProvider ctx (vi default locale).
    renderWithUi(<AppSettingPicker kind="locale" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled();
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    // the ctx setter ran without throwing; the trigger reflects the new selection
    expect(trigger).toBeInTheDocument();
  });

  it("context-bound brand: selecting a concrete brand routes through the ctx setter wrapper", async () => {
    const user = userEvent.setup();
    renderWithUi(<AppSettingPicker kind="brand" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled(); // brand null → BRAND_NONE → bound via ctx.setBrand
    await user.click(trigger);
    const options = await screen.findAllByRole("option");
    // pick a concrete (non-opt-out) brand → wrapper maps value !== __app__ to that brand
    await user.click(options[1]);
    expect(trigger).toBeInTheDocument();
  });

  it('appearance="icon": keeps its localized accessible name but drops the visible value text', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox");
    // The icon-only trigger MUST still expose an accessible name (its aria-label is the only one).
    expect(trigger).toHaveAccessibleName();
    // No SelectValue is rendered, so the closed trigger carries no textual value (icon only).
    expect(trigger).toHaveTextContent("");
  });

  it('appearance="icon": has no resting border/bg, matching the ghost icon buttons beside it in a topbar', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveClass("ui-app-setting-picker-icon");
  });

  it('appearance="icon": still opens and fires onValueChange with localized options', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    // Menu options retain their localized language names even though the trigger is icon-only.
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it('appearance="labeled" (default) renders the value text', () => {
    renderWithUi(<AppSettingPicker kind="timeFormat" value="24h" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");
  });

  it('compact + appearance="labeled": keeps icon + value, drops the owned per-kind width (gh#217)', () => {
    // The canonical auth-footer locale switch: readable value text (not the square icon-only
    // default), a small tokenized box, and a trigger that HUGS its value instead of stretching to
    // the picker's `sm:w-40`.
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="labeled"
        compact
        value="ja"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("ui-app-setting-picker-compact");
    // The owned width is GONE: the shipped per-kind rule no longer selects this trigger, so it
    // hugs its value instead of stretching.
    expect(trigger.matches(perKindWidthSelector)).toBe(false);
    // Accessible name (localized aria-label) and the visible value are both preserved.
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");

    // Positive control — without `compact` the SAME rule does select the trigger, so the `false`
    // above is the compact opt-out and not a selector that matches nothing anywhere.
    cleanup();
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="labeled" value="ja" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox").matches(perKindWidthSelector)).toBe(true);
  });

  it("compact: still opens and fires onValueChange with localized options", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="labeled"
        compact
        value="ja"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it("compact is a no-op on the already chrome-less inline appearance", () => {
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="inline"
        compact
        value="en"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("ui-app-setting-picker-inline");
    expect(trigger).not.toHaveClass("ui-app-setting-picker-compact");
  });

  it("compact defaults to off, so existing labelled pickers keep their per-kind width", () => {
    renderWithUi(<AppSettingPicker kind="dateFormat" value="iso" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toHaveClass("ui-app-setting-picker-compact");
    // Per-kind width moved from a `sm:w-*` lookup table to a token selected by `data-kind`,
    // so a service can widen just the picker whose locale overflows (#319).
    expect(trigger).toHaveClass("ui-app-setting-picker-trigger");
    expect(trigger).toHaveAttribute("data-kind", "dateFormat");
  });

  it("renders an id and name through to the Select", () => {
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        value="ja"
        onValueChange={vi.fn()}
        id="locale-picker"
        name="locale"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("id", "locale-picker");
  });
});
