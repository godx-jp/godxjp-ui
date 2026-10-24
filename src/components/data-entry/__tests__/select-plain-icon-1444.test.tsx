/**
 * gh#1444 — `option.icon` is documented as the leading node of BOTH the option row and the trigger.
 * The search panel (showSearch) rendered it; the plain react-aria listbox dropped it, so a rarity
 * filter whose options carry a code badge showed bare labels.
 */
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select } from "../select";

const OPTIONS = [
  { value: "C", label: "コモン", icon: <span data-testid="badge-C">C</span> },
  { value: "RR", label: "ダブルレア", icon: <span data-testid="badge-RR">RR</span> },
  { value: "all", label: "すべて" },
];

describe("Select plain listbox: option icon (gh#1444)", () => {
  it("leads each row with its icon, hidden from the option's name", async () => {
    const user = userEvent.setup();
    renderWithUi(<Select aria-label="レアリティ" options={OPTIONS} value="all" onValueChange={() => {}} />);
    await user.click(screen.getByRole("combobox"));
    const row = await screen.findByRole("option", { name: "ダブルレア" });
    const badge = screen.getAllByTestId("badge-RR").find((n) => row.contains(n));
    expect(badge).toBeTruthy();
    expect(badge?.parentElement?.getAttribute("aria-hidden")).toBe("true");
    // An option without an icon is its bare label.
    expect(screen.getByRole("option", { name: "すべて" }).querySelector(".ui-select-option-icon")).toBeNull();
  });

  it("shows the selected option's icon in the trigger", () => {
    renderWithUi(<Select aria-label="レアリティ" options={OPTIONS} value="RR" onValueChange={() => {}} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.querySelector("[data-testid=badge-RR]")).toBeTruthy();
    expect(trigger.textContent).toContain("ダブルレア");
  });

  it("leaves labelRender in charge when it is given", () => {
    renderWithUi(
      <Select
        aria-label="レアリティ"
        options={OPTIONS}
        value="RR"
        onValueChange={() => {}}
        labelRender={({ label }) => <span>※{label}</span>}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("※ダブルレア");
    expect(trigger.querySelector("[data-testid=badge-RR]")).toBeNull();
  });
});
