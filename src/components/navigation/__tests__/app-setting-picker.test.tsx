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
});
