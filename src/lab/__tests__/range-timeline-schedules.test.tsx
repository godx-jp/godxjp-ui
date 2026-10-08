import { render as rtlRender, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../app/app-provider";
import { RangeTimeline, type RangeTimelineRow } from "../range-timeline";

/**
 * RangeTimeline schedules for godx-task's 工程 Gantt: label-only rows, finish-only rows, open ends,
 * milestones, one-sided plans, the ghost's meaning in speech, early labels, cancelled rows,
 * dependency links and row emphasis. Rendered in Japanese so the spoken strings are the real copy.
 */
const render = (ui: React.ReactElement) =>
  rtlRender(
    <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
      {ui}
    </AppProvider>,
  );
const columns = Array.from({ length: 10 }, (_, day) => ({ label: String(day + 1), units: 1 }));
const base: RangeTimelineRow = {
  id: "a",
  label: "設計",
  start: 1,
  end: 3,
  startLabel: "開始: 9/2",
  endLabel: "終了: 9/4",
};
const q = (container: HTMLElement, selector: string) => [
  ...container.querySelectorAll<HTMLElement>(selector),
];
const pct = (value: number) => `${(value / 10) * 100}%`;

describe("1. label-only rows (emptyHint)", () => {
  it("says the default hint, a custom hint, or nothing", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, id: "default", start: null, end: null },
          { ...base, id: "custom", start: null, end: null, emptyHint: "日付未設定" },
          { ...base, id: "context", start: null, end: null, emptyHint: false },
        ]}
      />,
    );
    const hints = q(container, '.ui-range-timeline-outside[data-direction="none"]');
    expect(hints).toHaveLength(2);
    expect(hints[0]!.textContent).toBe("日付なし");
    expect(hints[1]!.textContent).toBe("日付未設定");
  });
});

describe("2. finish-only rows", () => {
  it("draws a finish tick at end, no bar, no grips, and speaks the unknown start", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, start: null, end: 4 },
          { ...base, id: "b", start: null, end: 6, startUnknownLabel: "着手日不明" },
        ]}
        onRangeChange={() => undefined}
      />,
    );
    const ticks = q(container, ".ui-range-timeline-finish");
    expect(ticks).toHaveLength(2);
    expect(ticks[0]!.style.insetInlineStart).toBe(pct(5));
    expect(ticks[0]!.textContent).toBe("開始日不明");
    expect(ticks[1]!.textContent).toBe("着手日不明");
    expect(q(container, ".ui-range-timeline-bar")).toHaveLength(0);
    expect(q(container, '.ui-range-timeline-outside[data-direction="none"]')).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("3. open-ended rows", () => {
  it("fades the end, keeps only the start grip, and speaks the open end", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[{ ...base, openEnd: true }]}
        onRangeChange={() => undefined}
      />,
    );
    const bar = q(container, ".ui-range-timeline-bar")[0]!;
    expect(bar).toHaveAttribute("data-open-end", "true");
    expect(bar.querySelector(".sr-only")?.textContent).toBe("完了未記録");
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      base.startLabel,
    ]);
  });
});

describe("4. milestones", () => {
  it("draws a diamond at end (start ignored), its plan as a hollow diamond, and overrun / variance", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[{ ...base, shape: "milestone", start: 0, end: 6, plan: { start: null, end: 4 } }]}
      />,
    );
    const diamond = q(container, ".ui-range-timeline-milestone")[0]!;
    expect(diamond.style.insetInlineStart).toBe(pct(6.5));
    expect(q(container, ".ui-range-timeline-plan-diamond")[0]!.style.insetInlineStart).toBe(
      pct(4.5),
    );
    expect(q(container, ".ui-range-timeline-bar")).toHaveLength(0);
    const overrun = q(container, ".ui-range-timeline-overrun")[0]!;
    expect(overrun.style.insetInlineStart).toBe(pct(4.5));
    expect(overrun.style.inlineSize).toBe(pct(2));
    expect(overrun.querySelector(".ui-range-timeline-variance")?.textContent).toBe("+2日");
  });

  it("has ONE grip that reports edge 'end', and a focusable tooltip layer", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[{ ...base, shape: "milestone", start: null, end: 5, tooltip: "リリース 9/6" }]}
        onRangeChange={change}
      />,
    );
    const grips = screen.getAllByRole("button");
    expect(grips.map((b) => b.getAttribute("aria-label"))).toEqual([base.endLabel]);
    grips[0]!.focus();
    await user.keyboard("{ArrowLeft}");
    expect(change).toHaveBeenLastCalledWith("a", "end", -1);
    const hit = container.querySelector<HTMLElement>(
      ".ui-range-timeline-milestone .ui-range-timeline-bar-hit",
    )!;
    expect(hit).toHaveAttribute("tabindex", "0");
    expect(hit).toHaveAccessibleName("設計");
  });
});

describe("5. one-sided plans", () => {
  it("draws a due tick at the known plan end (or start), and no ghost bar", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, id: "due", plan: { start: null, end: 5 } },
          { ...base, id: "begin", plan: { start: 2, end: null } },
        ]}
      />,
    );
    const ticks = q(container, ".ui-range-timeline-plan-tick");
    expect(ticks.map((tick) => tick.style.insetInlineStart)).toEqual([pct(6), pct(2)]);
    expect(q(container, ".ui-range-timeline-plan")).toHaveLength(0);
    // A known plan END still measures the early finish.
    expect(q(container, ".ui-range-timeline-early")).toHaveLength(1);
  });
});

describe("6. planLabel (what the ghost means)", () => {
  it("speaks the overrun against the timeline's planLabel, a row's own label winning", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        planLabel="予定"
        rows={[
          { ...base, id: "x", start: 1, end: 6, plan: { start: 1, end: 3 } },
          {
            ...base,
            id: "y",
            start: 1,
            end: 6,
            plan: { start: 1, end: 3 },
            planLabel: "ベースライン",
          },
        ]}
      />,
    );
    const spoken = q(container, ".ui-range-timeline-overrun .sr-only").map((n) => n.textContent);
    expect(spoken).toEqual(["予定より3日遅れ", "ベースラインより3日遅れ"]);
  });

  it("keeps the plain overrun text without a planLabel", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[{ ...base, start: 1, end: 6, plan: { start: 1, end: 3 } }]}
      />,
    );
    expect(q(container, ".ui-range-timeline-overrun .sr-only")[0]!.textContent).toBe("予定超過");
  });
});

describe("7. earlyLabel", () => {
  it("shows how early by default, a custom label, or none", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, id: "d", start: 1, end: 3, plan: { start: 1, end: 5 } },
          { ...base, id: "c", start: 1, end: 3, plan: { start: 1, end: 5 }, earlyLabel: "前倒し" },
          { ...base, id: "n", start: 1, end: 3, plan: { start: 1, end: 5 }, earlyLabel: false },
        ]}
      />,
    );
    expect(q(container, ".ui-range-timeline-early")).toHaveLength(3);
    const labels = q(container, ".ui-range-timeline-early-label").map((label) => label.textContent);
    expect(labels).toEqual(["-2日", "前倒し"]);
  });
});

describe("8. cancelled", () => {
  it("hatches the bar, speaks 中止, and offers no grips; distinct from muted", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[{ ...base, cancelled: true }]}
        onRangeChange={() => undefined}
      />,
    );
    const bar = q(container, ".ui-range-timeline-bar")[0]!;
    expect(bar).toHaveAttribute("data-cancelled", "true");
    expect(bar).not.toHaveAttribute("data-muted");
    expect(bar.querySelector(".sr-only")?.textContent).toBe("中止");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("9. dependency links", () => {
  const rows: RangeTimelineRow[] = [
    { ...base, id: "a", label: "設計", start: 0, end: 2 },
    { ...base, id: "b", label: "開発", start: 3, end: 6 },
    { ...base, id: "m", label: "リリース", shape: "milestone", start: null, end: 8 },
    { ...base, id: "u", label: "未定", start: null, end: null },
  ];

  it("draws one connector per drawable link, skipping undated or unknown rows", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={rows}
        links={[
          { id: "l1", from: "a", to: "b" },
          { id: "l2", from: "b", to: "m", type: "FF" },
          { id: "l3", from: "a", to: "u" },
          { id: "l4", from: "a", to: "missing" },
        ]}
      />,
    );
    const drawn = q(container, ".ui-range-timeline-link").map((g) =>
      g.getAttribute("data-link-id"),
    );
    expect(drawn).toEqual(["l1", "l2"]);
    const [first, , last] = q(container, '[data-link-id="l1"] line');
    // FS: from a's finish (unit 3 boundary) to b's start (unit 3).
    expect(first!.getAttribute("x1")).toBe(pct(3));
    expect(last!.getAttribute("x2")).toBe(pct(3));
    // FF into a milestone: its diamond centre.
    const ff = q(container, '[data-link-id="l2"] line');
    expect(ff[0]!.getAttribute("x1")).toBe(pct(7));
    expect(ff[2]!.getAttribute("x2")).toBe(pct(8.5));
    // The connector layer is decorative.
    expect(container.querySelector(".ui-range-timeline-links-svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("marks a violated link with a focusable, named marker and a spoken list", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={rows}
        links={[
          { id: "ok", from: "a", to: "b" },
          { id: "bad", from: "b", to: "a", violated: true, label: "開発は設計の後" },
        ]}
      />,
    );
    expect(q(container, '.ui-range-timeline-link[data-violated="true"]')).toHaveLength(1);
    const markers = q(container, ".ui-range-timeline-link-violation");
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute("tabindex", "0");
    expect(markers[0]).toHaveAccessibleName("依存関係の違反：開発は設計の後");
    // The marker is not nested in anything interactive.
    expect(markers[0]!.closest("button, a, [role='button']")).toBeNull();
    const list = container.querySelector(".ui-range-timeline-links ul.sr-only")!;
    expect(list.querySelectorAll("li")).toHaveLength(1);
    expect(list.textContent).toContain("開発");
    expect(list.textContent).toContain("(FS)");
  });

  it("hides links whose endpoint is folded away", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, id: "p", label: "親", start: 0, end: 5 },
          { ...base, id: "c", label: "子", start: 1, end: 2, depth: 1 },
          { ...base, id: "z", label: "次", start: 6, end: 8 },
        ]}
        defaultExpandedValues={[]}
        links={[{ id: "l", from: "c", to: "z" }]}
      />,
    );
    expect(q(container, ".ui-range-timeline-link")).toHaveLength(0);
  });

  it("adds nothing to the markup without links", () => {
    const { container } = render(<RangeTimeline label="工程" columns={columns} rows={rows} />);
    expect(container.querySelector(".ui-range-timeline-links")).toBeNull();
  });
});

describe("10. row emphasis", () => {
  it("accents the row and speaks why", () => {
    const { container } = render(
      <RangeTimeline
        label="工程"
        columns={columns}
        rows={[
          { ...base, id: "w", emphasis: "warning" },
          { ...base, id: "c", emphasis: "critical" },
          { ...base, id: "n" },
        ]}
      />,
    );
    const rowsEl = q(container, ".ui-range-timeline-row");
    expect(rowsEl.map((row) => row.getAttribute("data-emphasis"))).toEqual([
      "warning",
      "critical",
      null,
    ]);
    expect(rowsEl[0]!.querySelector(".ui-range-timeline-label .sr-only")?.textContent).toBe(
      "要注意",
    );
    expect(rowsEl[1]!.querySelector(".ui-range-timeline-label .sr-only")?.textContent).toBe(
      "クリティカルパス",
    );
    expect(rowsEl[2]!.querySelector(".ui-range-timeline-label .sr-only")).toBeNull();
  });
});
