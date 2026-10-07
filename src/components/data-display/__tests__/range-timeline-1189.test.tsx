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
