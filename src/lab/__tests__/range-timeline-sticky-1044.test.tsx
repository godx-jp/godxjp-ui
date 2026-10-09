import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RangeTimeline } from "../range-timeline";

/**
 * gh#1044 (2) — antd Table `sticky` for the Gantt axis. The CSS stickiness itself is measured in
 * Chromium (a jsdom has no layout); what jsdom CAN hold is the structure that makes it possible:
 * the header lives OUTSIDE the horizontal scroller, the offset reaches it, and it follows the
 * body's scrollLeft.
 */
const columns = Array.from({ length: 30 }, (_, day) => ({ label: String(day + 1), units: 1 }));
const rows = [
  { id: "a", label: "Task A", start: 1, end: 4, startLabel: "Start A", endLabel: "End A" },
];

describe("RangeTimeline · sticky (gh#1044)", () => {
  it("renders the classic single scroller by default", () => {
    const { container } = render(<RangeTimeline label="Schedule" columns={columns} rows={rows} />);
    expect(container.querySelector(".ui-range-timeline-sticky-header")).toBeNull();
    expect(screen.getByRole("region", { name: "Schedule" })).toHaveAttribute("tabindex", "0");
  });

  it("puts the header outside the horizontal scroller, at the consumer's offset", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={rows}
        sticky={{ offsetHeader: 56 }}
      />,
    );
    const header = container.querySelector<HTMLElement>(".ui-range-timeline-sticky-header");
    const scroller = container.querySelector<HTMLElement>(".ui-range-timeline-scroller");
    expect(header).not.toBeNull();
    expect(scroller).not.toBeNull();
    expect(scroller!.contains(header)).toBe(false);
    expect(header!.textContent).toContain("30");
    expect(scroller!.textContent).toContain("Task A");
    expect(header!.style.getPropertyValue("--range-timeline-sticky-offset")).toBe("56px");
    // The keyboard stop is what scrolls sideways now, not the section.
    expect(scroller).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("region", { name: "Schedule" })).not.toHaveAttribute("tabindex");
  });

  it("follows the body's horizontal scroll", () => {
    const { container } = render(
      <RangeTimeline label="Schedule" columns={columns} rows={rows} sticky />,
    );
    const header = container.querySelector<HTMLElement>(".ui-range-timeline-sticky-header")!;
    const scroller = container.querySelector<HTMLElement>(".ui-range-timeline-scroller")!;
    expect(header.style.getPropertyValue("--range-timeline-sticky-offset")).toBe("0px");
    scroller.scrollLeft = 120;
    fireEvent.scroll(scroller);
    expect(header.scrollLeft).toBe(120);
  });
});
