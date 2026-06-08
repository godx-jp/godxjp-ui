import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";

// a category whose only leaf is disabled → no selectable descendants (total === 0)
const TREE = [
  {
    value: "cat",
    label: "カテゴリ",
    children: [{ value: "a", label: "無効項目", disabled: true }],
  },
];

describe("Cascader — parent with no selectable descendants", () => {
  it("shows an unchecked parent checkbox when all leaves are disabled (total === 0)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={TREE} multiple onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("combobox"));
    const state = screen
      .getByRole("option", { name: /カテゴリ/ })
      .querySelector('[data-slot="checkbox"]')
      ?.getAttribute("data-state");
    expect(state).toBe("unchecked"); // total === 0 → "none"
  });
});
