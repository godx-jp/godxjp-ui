import { describe, expect, it } from "vitest";

import { Progress } from "../progress";
import { renderWithUi, screen } from "@/test/render";

const SEGMENTS = [
  { value: 2, tone: "destructive" as const, label: "期限切れ" },
  { value: 3, tone: "warning" as const, label: "期限間近" },
  { value: 12, tone: "success" as const, label: "完了" },
];

/**
 * Before `size`, the breakdown bar's block size was pinned at `--progress-breakdown-block-size`
 * (22px) with no per-instance axis. A bar that annotates a table ROW rather than being the subject
 * of a screen set the height of every row it sat in, and the only escape was hand-written CSS —
 * which `ui-audit` forbids in a consumer.
 *
 * The bars are found by ROLE (`progressbar` for a meter, `img` for a partition), never by class.
 */
describe("Progress — size", () => {
  it("emits no size attribute at the default, so the token rule owns the height", () => {
    renderWithUi(<Progress value={40} aria-label="容量" />);
    expect(screen.getByRole("progressbar", { name: "容量" })).not.toHaveAttribute("data-size");
  });

  it("marks a meter as sm", () => {
    renderWithUi(<Progress value={40} size="sm" aria-label="容量" />);
    expect(screen.getByRole("progressbar", { name: "容量" })).toHaveAttribute("data-size", "sm");
  });

  it("marks a breakdown as sm", () => {
    renderWithUi(<Progress segments={SEGMENTS} size="sm" aria-label="内訳" />);
    const bar = screen.getByRole("img", { name: /内訳/ });
    expect(bar).toHaveAttribute("data-size", "sm");
    expect(bar).toHaveAttribute("data-breakdown");
  });

  it("changes thickness only — the spoken breakdown is untouched", () => {
    renderWithUi(<Progress segments={SEGMENTS} size="sm" aria-label="内訳" />);
    const name = screen.getByRole("img", { name: /内訳/ }).getAttribute("aria-label")!;
    for (const segment of SEGMENTS) {
      expect(name).toContain(segment.label);
      expect(name).toContain(String(segment.value));
    }
  });

  it("keeps the meter's ARIA value contract at sm", () => {
    renderWithUi(<Progress value={40} size="sm" aria-label="容量" />);
    const bar = screen.getByRole("progressbar", { name: "容量" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuetext", "40%");
  });
});
