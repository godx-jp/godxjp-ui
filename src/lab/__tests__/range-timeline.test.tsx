import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeTimeline } from "../range-timeline";

const columns = Array.from({ length: 7 }, (_, day) => ({ label: String(day + 1), units: 1 }));
const row = {
  id: "one",
  label: "Task one",
  start: 1,
  end: 3,
  startLabel: "Start: September 2",
  endLabel: "End: September 4",
};

describe("RangeTimeline", () => {
  it("keeps labels in read-only mode without offering editing", () => {
    render(<RangeTimeline label="Schedule" columns={columns} rows={[row]} />);
    expect(screen.getByRole("region", { name: "Schedule" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("Task one")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("moves an endpoint by keyboard and refuses to cross its opposite endpoint", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <RangeTimeline label="Schedule" columns={columns} rows={[row]} onRangeChange={change} />,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: row.startLabel })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith("one", "start", 1);
    change.mockClear();
    rerender(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: 3 }]}
        onRangeChange={change}
      />,
    );
    await user.keyboard("{ArrowRight}");
    expect(change).not.toHaveBeenCalled();
  });

  it("does not expose a resize handle on a clipped endpoint", () => {
    render(
      <RangeTimeline
        label="Schedule"
        columns={columns}
        rows={[{ ...row, start: -3 }]}
        onRangeChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: row.startLabel })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: row.endLabel })).toBeInTheDocument();
  });

  it("keeps short-range labels reachable without overlapping drag targets at coarse zoom", () => {
    render(
      <RangeTimeline
        label="Year"
        columns={[{ label: "September", units: 30 }]}
        rows={[{ ...row, label: <a href="/edit">Edit task dates</a> }]}
        onRangeChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit task dates" })).toBeInTheDocument();
  });

  it("does not submit a change on a cancelled pointer gesture", () => {
    const change = vi.fn();
    render(
      <RangeTimeline label="Schedule" columns={columns} rows={[row]} onRangeChange={change} />,
    );
    const handle = screen.getByRole("button", { name: row.startLabel });
    const track = screen.getByText("1").parentElement!.parentElement!;
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 700,
      height: 40,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 700,
      bottom: 40,
      toJSON: () => ({}),
    });
    const pointer = (type: string, clientX: number) =>
      fireEvent(handle, new MouseEvent(type, { bubbles: true, button: 0, clientX }));
    pointer("pointerdown", 100);
    pointer("pointermove", 200);
    fireEvent.pointerCancel(handle);
    pointer("pointerup", 200);
    expect(change).not.toHaveBeenCalled();
    pointer("pointerdown", 100);
    pointer("pointerup", 200);
    expect(change).toHaveBeenCalledExactlyOnceWith("one", "start", 1);
  });
});

it("keeps grouped period labels above compact ticks without changing endpoint values", () => {
  render(
    <RangeTimeline
      label="Schedule"
      bands={[
        { label: "September 2026", units: 2 },
        { label: "October 2026", units: 1 },
      ]}
      columns={[
        { label: "29", units: 1 },
        { label: "30", units: 1 },
        { label: "1", units: 1 },
      ]}
      rows={[
        {
          id: "one",
          label: "Release",
          start: 0,
          end: 2,
          startLabel: "September 29",
          endLabel: "October 1",
        },
      ]}
      onRangeChange={() => {}}
    />,
  );
  expect(screen.getByText("September 2026")).toBeInTheDocument();
  expect(screen.getByText("October 2026")).toBeInTheDocument();
  expect(screen.getByText("29")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "September 29" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "October 1" })).toBeEnabled();
});
