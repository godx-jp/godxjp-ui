import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeTimeline } from "../range-timeline";

/**
 * gh#1189 — a resizable label column (separator), a busy state, and rows without dates, for
 * godx-task's Gantt.
 */
const columns = Array.from({ length: 7 }, (_, day) => ({ label: String(day + 1), units: 1 }));
const row = {
  id: "one",
  label: "EXSELI-81 問い合わせフォームの改修",
  start: 1,
  end: 3,
  startLabel: "Start: September 2",
  endLabel: "End: September 4",
};
const section = () => screen.getByRole("region", { name: "Schedule" });

describe("RangeTimeline label column resize (gh#1189)", () => {
  it("offers no separator unless resizableLabel is set", () => {
    render(<RangeTimeline label="Schedule" columns={columns} rows={[row]} />);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(section().style.getPropertyValue("--range-timeline-label-width")).toBe("");
  });

  it("is a named vertical separator with its range, and resizes by keyboard within it", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row]}
        resizableLabel={{ min: 200, max: 480 }}
        defaultLabelWidth={300}
        onLabelWidthChange={change}
      />,
    );
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAccessibleName();
    expect(separator).toHaveAttribute("aria-valuemin", "200");
    expect(separator).toHaveAttribute("aria-valuemax", "480");
    expect(separator).toHaveAttribute("aria-valuenow", "300");
    expect(section().style.getPropertyValue("--range-timeline-label-width")).toBe("300px");

    separator.focus();
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(308);
    expect(separator).toHaveAttribute("aria-valuenow", "308");
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(change).toHaveBeenLastCalledWith(276);
    await user.keyboard("{End}");
    expect(change).toHaveBeenLastCalledWith(480);
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(480);
    await user.keyboard("{Home}");
    expect(change).toHaveBeenLastCalledWith(200);
    expect(section().style.getPropertyValue("--range-timeline-label-width")).toBe("200px");
  });

  it("follows a controlled labelWidth", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row]}
        resizableLabel
        labelWidth={320}
        onLabelWidthChange={change}
      />,
    );
    screen.getByRole("separator").focus();
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith(328);
    // Controlled: nothing moves until the parent passes the new value.
    expect(section().style.getPropertyValue("--range-timeline-label-width")).toBe("320px");
    rerender(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row]}
        resizableLabel
        labelWidth={328}
        onLabelWidthChange={change}
      />,
    );
    expect(section().style.getPropertyValue("--range-timeline-label-width")).toBe("328px");
  });
});

describe("RangeTimeline busy (gh#1189)", () => {
  it("sets aria-busy and draws the progress line only while busy", () => {
    const { container, rerender } = render(
      <RangeTimeline label="Schedule" columns={columns} rows={[row]} busy />,
    );
    expect(section()).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".ui-range-timeline-busy")).not.toBeNull();
    rerender(<RangeTimeline label="Schedule" columns={columns} rows={[row]} />);
    expect(section()).not.toHaveAttribute("aria-busy");
    expect(container.querySelector(".ui-range-timeline-busy")).toBeNull();
  });
});

describe("RangeTimeline rows without dates (gh#1189)", () => {
  it("draws no bar and no handles, and says the row has no dates", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[row, { ...row, id: "two", start: null, end: null }]}
        onRangeChange={() => undefined}
      />,
    );
    expect(container.querySelectorAll(".ui-range-timeline-bar")).toHaveLength(1);
    const hint = container.querySelector('.ui-range-timeline-outside[data-direction="none"]');
    expect(hint?.textContent?.trim()).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});

describe("RangeTimeline per-row bar state (gh#1189 follow-up)", () => {
  const bar = (container: HTMLElement, index: number) =>
    container.querySelectorAll<HTMLElement>(".ui-range-timeline-bar")[index]!;

  it("fills the bar from a data hex and flips the grip ink by luminance", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[
          { ...row, id: "dark", color: "#1d4ed8" },
          { ...row, id: "light", color: "#fde68a" },
          { ...row, id: "plain" },
          { ...row, id: "named", color: "rebeccapurple" },
        ]}
      />,
    );
    expect(bar(container, 0).style.getPropertyValue("--range-timeline-bar-color")).toBe("#1d4ed8");
    expect(bar(container, 0).style.getPropertyValue("--range-timeline-bar-ink")).toBe("white");
    expect(bar(container, 1).style.getPropertyValue("--range-timeline-bar-ink")).toBe("black");
    expect(bar(container, 2).style.getPropertyValue("--range-timeline-bar-color")).toBe("");
    // A colour CSS accepts but cannot be measured keeps the default ink.
    expect(bar(container, 3).style.getPropertyValue("--range-timeline-bar-color")).toBe(
      "rebeccapurple",
    );
    expect(bar(container, 3).style.getPropertyValue("--range-timeline-bar-ink")).toBe("");
  });

  it("marks a done row muted and an overdue row with a spoken flag, keeping the colour", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[
          { ...row, id: "done", muted: true },
          { ...row, id: "late", overdue: true, color: "#16a34a" },
        ]}
      />,
    );
    expect(bar(container, 0)).toHaveAttribute("data-muted", "true");
    expect(bar(container, 0)).not.toHaveAttribute("data-overdue");
    expect(bar(container, 1)).toHaveAttribute("data-overdue", "true");
    expect(bar(container, 1).style.getPropertyValue("--range-timeline-bar-color")).toBe("#16a34a");
    expect(bar(container, 1).querySelector(".sr-only")?.textContent?.trim()).toBeTruthy();
    expect(bar(container, 0).querySelector(".sr-only")).toBeNull();
  });

  it("gives a row with a tooltip a focusable bar named by the row label, beside the grips", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, tooltip: "EXSELI-81 · 対応中 · 9/2 → 9/4" }]}
        onRangeChange={() => undefined}
      />,
    );
    const hit = container.querySelector<HTMLElement>(".ui-range-timeline-bar-hit")!;
    expect(hit).toHaveAttribute("tabindex", "0");
    expect(hit).toHaveAccessibleName(row.label);
    // Not nested: the grip buttons are siblings of the focus layer, not its children.
    expect(hit.querySelector("button")).toBeNull();
    hit.focus();
    expect(await screen.findByText("EXSELI-81 · 対応中 · 9/2 → 9/4")).toBeInTheDocument();
    await user.keyboard("{Escape}");
  });
});

describe("RangeTimeline planned vs actual (予定 / 実績)", () => {
  const q = (container: HTMLElement, selector: string) =>
    container.querySelectorAll<HTMLElement>(selector);

  it("draws the plan as a ghost behind the actual bar, and nothing extra without a plan", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[
          { ...row, id: "on-plan", start: 1, end: 3, plan: { start: 1, end: 3 } },
          { ...row, id: "no-plan" },
          { ...row, id: "null-plan", plan: { start: null, end: null } },
        ]}
      />,
    );
    expect(q(container, ".ui-range-timeline-plan")).toHaveLength(1);
    expect(q(container, ".ui-range-timeline-plan")[0]).toHaveAttribute("aria-hidden", "true");
    expect(q(container, ".ui-range-timeline-overrun")).toHaveLength(0);
    expect(q(container, ".ui-range-timeline-early")).toHaveLength(0);
  });

  it("marks an overrun from the planned end with a localized +N label and spoken text", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: 1, end: 5, plan: { start: 1, end: 2 } }]}
      />,
    );
    const overrun = q(container, ".ui-range-timeline-overrun")[0]!;
    // Plan ends at unit 2, actual at 5: the segment starts at unit 3 and runs to 6 (exclusive).
    expect(overrun.style.insetInlineStart).toBe(`${(3 / 7) * 100}%`);
    expect(overrun.style.inlineSize).toBe(`${(3 / 7) * 100}%`);
    expect(overrun.querySelector(".ui-range-timeline-variance")?.textContent).toMatch(/\+3/);
    expect(overrun.querySelector(".sr-only")?.textContent?.trim()).toBeTruthy();
  });

  it("uses a consumer variance label, or none with false", () => {
    const { container, rerender } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: 1, end: 5, plan: { start: 1, end: 2 }, varianceLabel: "+3営業日" }]}
      />,
    );
    expect(screen.getByText("+3営業日")).toBeInTheDocument();
    rerender(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: 1, end: 5, plan: { start: 1, end: 2 }, varianceLabel: false }]}
      />,
    );
    expect(container.querySelector(".ui-range-timeline-variance")).toBeNull();
    expect(container.querySelector(".ui-range-timeline-overrun")).not.toBeNull();
  });

  it("puts an early marker at the actual end when it finishes before the plan", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: 1, end: 2, plan: { start: 1, end: 5 } }]}
      />,
    );
    const early = q(container, ".ui-range-timeline-early")[0]!;
    expect(early.style.insetInlineStart).toBe(`${(3 / 7) * 100}%`);
    expect(early.querySelector(".sr-only")?.textContent?.trim()).toBeTruthy();
    expect(q(container, ".ui-range-timeline-overrun")).toHaveLength(0);
  });
});
