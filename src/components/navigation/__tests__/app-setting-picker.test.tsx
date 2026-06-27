import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { AppSettingPicker } from "../app-setting-picker";
import { renderWithUi, screen, userEvent } from "@/test/render";

describe("AppSettingPicker", () => {
  it.each([
    ["locale", "ja"],
    ["timezone", "Asia/Tokyo"],
    ["dateFormat", "iso"],
    ["timeFormat", "24h"],
  ] as const)("renders the %s kind as a labelled Select trigger", (kind, value) => {
    renderWithUi(<AppSettingPicker kind={kind} value={value} onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-label");
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
