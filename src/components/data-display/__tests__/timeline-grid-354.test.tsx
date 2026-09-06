import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimelineGrid } from "../timeline-grid";
import type { TimelineGridEventProp } from "../timeline-grid";

/**
 * #354 item 7 — the library had no time grid, so `docs/showcase/case5-shift-calendar.tsx` built
 * one out of absolutely-positioned divs and percentage offsets. These tests pin the three things
 * that hand-rolled grid could not get right: the ARITHMETIC (a block's offset and span are hours,
 * expressed against one token), the OVERLAP (two shifts on one day must not sit on top of each
 * other), and the SEMANTICS (the time range is text, so nothing depends on the pixel offset).
 */
const COLUMNS = [
  { id: "mon", label: "月 11" },
  { id: "thu", label: "木 14", current: true },
];

const shift = (over: Partial<TimelineGridEventProp> = {}): TimelineGridEventProp => ({
  id: "e1",
  columnId: "thu",
  start: "09:00",
  end: "17:30",
  title: "早番",
  ...over,
});

function styleOf(element: Element, property: string): string {
  return (element as HTMLElement).style.getPropertyValue(property);
}

describe("TimelineGrid geometry", () => {
  it("places a block by start hour and duration, both in hours off one token", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[shift()]}
        start="06:00"
        end="22:00"
      />,
    );

    const block = container.querySelector('[data-event-id="e1"]')!;
    // 09:00 is 3 hours after the 06:00 axis start; the shift runs 8.5 hours.
    expect(styleOf(block, "--timeline-grid-event-offset")).toBe("3");
    expect(styleOf(block, "--timeline-grid-event-span")).toBe("8.5");
    // The window is 16 hours, and the axis + every column read the SAME expression.
    expect(styleOf(container.querySelector(".ui-timeline-grid")!, "--timeline-grid-hours")).toBe(
      "16",
    );
  });

  it("derives the window from the events when it is not pinned, so nothing is dropped", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[shift({ start: "09:15", end: "17:30" })]}
      />,
    );

    // 09:15 → 17:30 snaps outward to 09:00 → 18:00 = 9 hours.
    expect(styleOf(container.querySelector(".ui-timeline-grid")!, "--timeline-grid-hours")).toBe(
      "9",
    );
    expect(container.querySelectorAll(".ui-timeline-grid-event")).toHaveLength(1);
  });

  it("clips a night shift at the window edge instead of dropping it, and still prints its real end", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        // end at or before start = continues into the next day (22:00–06:00 夜勤).
        events={[shift({ id: "night", start: "22:00", end: "06:00", title: "夜勤" })]}
        start="06:00"
        end="24:00"
      />,
    );

    const block = container.querySelector('[data-event-id="night"]')!;
    expect(styleOf(block, "--timeline-grid-event-offset")).toBe("16");
    expect(styleOf(block, "--timeline-grid-event-span")).toBe("2");
    expect(block.getAttribute("data-clipped")).toBe("end");
    // The BLOCK is cut; the time it announces is not.
    expect(screen.getByText("22:00–06:00")).toBeInTheDocument();
  });

  it("lays overlapping shifts out in side-by-side lanes, cluster by cluster", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[
          shift({ id: "early", start: "09:00", end: "17:30", title: "早番" }),
          shift({ id: "late", start: "13:00", end: "22:00", title: "遅番" }),
          // Starts after both end — its own cluster, so it keeps the full column width.
          shift({ id: "clean", start: "22:00", end: "23:00", title: "清掃" }),
        ]}
        start="06:00"
        end="24:00"
      />,
    );

    const early = container.querySelector('[data-event-id="early"]')!;
    const late = container.querySelector('[data-event-id="late"]')!;
    const clean = container.querySelector('[data-event-id="clean"]')!;

    expect(styleOf(early, "--timeline-grid-event-lane")).toBe("0");
    expect(styleOf(early, "--timeline-grid-event-lanes")).toBe("2");
    expect(styleOf(late, "--timeline-grid-event-lane")).toBe("1");
    expect(styleOf(late, "--timeline-grid-event-lanes")).toBe("2");
    // One long block must not halve the width of an unrelated one later in the day.
    expect(styleOf(clean, "--timeline-grid-event-lanes")).toBe("1");
  });

  it("draws the now marker only in the column marked current", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[shift()]}
        start="06:00"
        end="22:00"
        now="14:35"
      />,
    );

    const markers = container.querySelectorAll(".ui-timeline-grid-now");
    expect(markers).toHaveLength(1);
    expect(styleOf(markers[0], "--timeline-grid-now-offset")).toBeTruthy();
    // A ruler mark, not content: the time it points at is already text on every block.
    expect(markers[0].getAttribute("aria-hidden")).toBe("true");
    expect(
      container.querySelectorAll('.ui-timeline-grid-column[data-current="true"]'),
    ).toHaveLength(1);
  });
});

describe("TimelineGrid semantics", () => {
  it("names each column's event list from that column's own head", () => {
    const { container } = renderWithUi(
      <TimelineGrid label="週シフト" columns={COLUMNS} events={[shift()]} />,
    );

    const lists = [...container.querySelectorAll("ul.ui-timeline-grid-column")];
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      const head = container.ownerDocument.getElementById(list.getAttribute("aria-labelledby")!);
      expect(head, "every column list resolves to a rendered head").not.toBeNull();
      expect(head!.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it("prints the time range as text on the block, never as position alone", () => {
    renderWithUi(<TimelineGrid label="週シフト" columns={COLUMNS} events={[shift()]} />);

    // A reader who never sees the pixel offset still gets the hours.
    expect(screen.getByText("09:00–17:30")).toBeInTheDocument();
    expect(screen.getByText("早番")).toBeInTheDocument();
  });

  it("reads the blocks of a column in time order however they arrive", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[
          shift({ id: "late", start: "13:00", end: "22:00", title: "遅番" }),
          shift({ id: "early", start: "09:00", end: "17:30", title: "早番" }),
        ]}
      />,
    );

    const ids = [...container.querySelectorAll("[data-event-id]")].map((el) =>
      el.getAttribute("data-event-id"),
    );
    expect(ids).toEqual(["early", "late"]);
  });

  it("is a keyboard tab stop, because it is a scrolling region", () => {
    // jsdom reports no overflow, so axe's scrollable-region-focusable rule can never fire here
    // — the same trap as testing a component in isolation. Assert the attribute directly.
    const { container } = renderWithUi(
      <TimelineGrid label="週シフト" columns={COLUMNS} events={[shift()]} />,
    );

    const grid = container.querySelector(".ui-timeline-grid")! as HTMLElement;
    expect(grid.tabIndex).toBe(0);
    expect(grid.getAttribute("role")).toBe("group");
    expect(grid.getAttribute("aria-label")).toBe("週シフト");
  });

  it("keeps blocks inert until onEventSelect makes them real buttons", async () => {
    const onEventSelect = vi.fn();
    const { rerender, container } = renderWithUi(
      <TimelineGrid label="週シフト" columns={COLUMNS} events={[shift()]} />,
    );
    expect(container.querySelector("button")).toBeNull();

    rerender(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[shift()]}
        onEventSelect={onEventSelect}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /早番/ }));
    expect(onEventSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "e1" }));
  });

  it("ignores an event whose column does not exist and one the pinned axis excludes", () => {
    const { container } = renderWithUi(
      <TimelineGrid
        label="週シフト"
        columns={COLUMNS}
        events={[
          shift({ id: "orphan", columnId: "sat" }),
          shift({ id: "dawn", start: "01:00", end: "04:00" }),
          shift({ id: "kept" }),
        ]}
        start="06:00"
        end="22:00"
      />,
    );

    const ids = [...container.querySelectorAll("[data-event-id]")].map((el) =>
      el.getAttribute("data-event-id"),
    );
    expect(ids).toEqual(["kept"]);
  });
});
