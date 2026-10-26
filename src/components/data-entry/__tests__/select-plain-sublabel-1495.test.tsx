/**
 * gh#1495 — `option.sublabel` rendered on the SearchSelect panel (showSearch) but the plain
 * react-aria listbox dropped it, so a consumer folded the item code into the label itself
 * (「通勤手当（A012）」) to keep it visible.
 */
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select } from "../select";

const OPTIONS = [
  { value: "A012", label: "通勤手当", sublabel: "A012" },
  { value: "A020", label: "住宅手当", sublabel: "A020" },
  { value: "none", label: "なし" },
];

describe("Select plain listbox: option sublabel (gh#1495)", () => {
  it("shows each row's sublabel after its label: named by the label, described by the sublabel", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select aria-label="支給項目" options={OPTIONS} value="none" onValueChange={() => {}} />,
    );
    await user.click(screen.getByRole("combobox"));
    const row = await screen.findByRole("option", { name: "住宅手当" });
    const sub = row.querySelector(".ui-search-select-option-sublabel");
    expect(sub?.textContent).toBe("A020");
    expect(row).toHaveAccessibleDescription("A020");
    // An option without a sublabel is its bare label (negative case).
    expect(
      screen
        .getByRole("option", { name: "なし" })
        .querySelector(".ui-search-select-option-sublabel"),
    ).toBeNull();
  });

  it("the trigger names the pick by its label alone", () => {
    renderWithUi(
      <Select aria-label="支給項目" options={OPTIONS} value="A012" onValueChange={() => {}} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("通勤手当");
    expect(trigger.textContent).not.toContain("A012");
  });
});
