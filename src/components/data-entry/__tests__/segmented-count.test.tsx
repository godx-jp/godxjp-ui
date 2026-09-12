import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { Segmented } from "../segmented";

const FILTER_OPTIONS = [
  { value: "all", label: "全件", count: 54 },
  { value: "week", label: "今週", count: 9 },
  { value: "overdue", label: "期限超過", count: 18 },
];

describe("Segmented count pill (gh#602)", () => {
  it("exposes counts via option.count — not Badge in label", () => {
    renderWithUi(
      <Segmented aria-label="対応期限の絞り込み" defaultValue="all" options={FILTER_OPTIONS} />,
    );

    const all = screen.getByRole("radio", { name: /全件/ });
    expect(all).toHaveAccessibleName("全件, 54");
    const allLabel = all.closest("label");
    expect(allLabel?.querySelector('[data-slot="segmented-count"]')).toHaveTextContent("54");

    const week = screen.getByRole("radio", { name: /今週/ });
    expect(week.closest("label")?.querySelector('[data-slot="segmented-count"]')).toHaveTextContent(
      "9",
    );
  });

  it("keeps radiogroup semantics when counts are present", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Segmented
        aria-label="対応期限の絞り込み"
        defaultValue="all"
        onValueChange={onValueChange}
        options={FILTER_OPTIONS}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /今週/ }));
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(screen.getByRole("radio", { name: /今週/ })).toBeChecked();
  });
});
