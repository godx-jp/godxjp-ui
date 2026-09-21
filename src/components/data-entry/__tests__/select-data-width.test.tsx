import { describe, expect, it } from "vitest";

import { Select } from "../select";
import { renderWithUi, screen } from "@/test/render";

const OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "open", label: "対応中" },
];

/**
 * `docs/CONSUMER-RULES.md` rule 5 tells every consumer that "a Select outside a form takes
 * `width="auto"`". That was true of the compound API and false of the data-driven (`options`) one,
 * which had no `width` at all — so two filter Selects in one bar each took the full row and
 * stacked, and the only escape was to wrap each in a `<Flex width={280}>`.
 */
describe("Select (data-driven) — width", () => {
  it("takes width=auto so two filters share one row", () => {
    renderWithUi(<Select options={OPTIONS} width="auto" aria-label="状態" defaultValue="all" />);
    const trigger = screen.getByRole("combobox", { name: "状態" });
    expect(trigger).toHaveAttribute("data-width", "auto");
  });

  it("defaults to full width, as a field wants", () => {
    renderWithUi(<Select options={OPTIONS} aria-label="状態" defaultValue="all" />);
    expect(screen.getByRole("combobox", { name: "状態" })).toHaveAttribute("data-width", "full");
  });

  it("takes width=auto on the searchable panel too (showSearch)", () => {
    renderWithUi(
      <Select options={OPTIONS} showSearch width="auto" aria-label="状態" defaultValue="all" />,
    );
    expect(screen.getByRole("combobox", { name: "状態" })).toHaveAttribute("data-width", "auto");
  });

  it("takes width=bounded and leaves the width to the token rule", () => {
    renderWithUi(<Select options={OPTIONS} width="bounded" aria-label="状態" defaultValue="all" />);
    expect(screen.getByRole("combobox", { name: "状態" })).toHaveAttribute("data-width", "bounded");
  });
});
