import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "../../test/render";
import { DashboardGrid } from "../index";

const items = [
  { id: "a", label: "Revenue", content: "Revenue" },
  { id: "b", label: "Orders", content: "Orders" },
];
const layout = [
  { id: "a", x: 0, y: 0, w: 1, h: 2 },
  { id: "b", x: 1, y: 0, w: 1, h: 2 },
];
describe("DashboardGrid #1397", () => {
  it("previews a collision without saving, Escape restores, drop commits exactly once", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <DashboardGrid
        items={items}
        defaultLayout={layout}
        columns={2}
        editable
        onLayoutChange={change}
      />,
    );
    const grip = screen.getAllByRole("button", { name: /Revenue/ })[0]!;
    grip.focus();
    await user.keyboard("{Enter}{ArrowRight}");
    expect(change).not.toHaveBeenCalled();
    expect(document.querySelector('[data-dashboard-id="b"]')).toHaveAttribute("data-y", "2");
    await user.keyboard("{Escape}");
    expect(document.querySelector('[data-dashboard-id="b"]')).toHaveAttribute("data-y", "0");
    await user.keyboard(" {ArrowRight} ");
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toEqual([
      { id: "a", x: 1, y: 0, w: 1, h: 2 },
      { id: "b", x: 1, y: 2, w: 1, h: 2 },
    ]);
  });
});

import { resolveDashboardLayout } from "../dashboard-grid-layout";
import { translate } from "../../i18n/translate";

describe("DashboardGrid layout engine", () => {
  it("pushes chained collisions deterministically, compacts holes and does not mutate input", () => {
    const input = [
      { id: "a", x: 0, y: 0, w: 1, h: 2 },
      { id: "b", x: 0, y: 1, w: 1, h: 2 },
      { id: "c", x: 0, y: 2, w: 1, h: 2 },
    ];
    const saved = structuredClone(input);
    expect(resolveDashboardLayout(input, 2, "a").map((item) => item.y)).toEqual([0, 2, 4]);
    expect(input).toEqual(saved);
    expect(resolveDashboardLayout([{ id: "a", x: 0, y: 20, w: 1, h: 2 }], 2)[0].y).toBe(0);
  });
  it("normalizes invalid coordinates and clamps widths to the responsive projection", () => {
    expect(resolveDashboardLayout([{ id: "a", x: Infinity, y: -1, w: 20, h: NaN }], 1)).toEqual([
      { id: "a", x: 0, y: 0, w: 1, h: 1 },
    ]);
  });
});
describe("DashboardGrid editing contract", () => {
  it("view mode has no edit controls and forwards the ref and root attributes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithUi(
      <DashboardGrid
        ref={ref}
        id="dashboard"
        aria-label="BI"
        items={items}
        defaultLayout={layout}
      />,
    );
    expect(ref.current).toHaveAttribute("id", "dashboard");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("region", { name: "Revenue" })).toBeVisible();
  });
  it("resizes with Shift+arrows and keeps controlled state authoritative", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const fixed = [layout[0]];
    renderWithUi(
      <DashboardGrid
        items={items.slice(0, 1)}
        layout={fixed}
        columns={4}
        editable
        onLayoutChange={change}
      />,
    );
    screen.getAllByRole("button", { name: /Revenue/ })[0].focus();
    await user.keyboard("{Enter}{Shift>}{ArrowRight}{ArrowDown}{/Shift}{Enter}");
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0][0]).toMatchObject({ w: 2, h: 3 });
    expect(document.querySelector('[data-dashboard-id="a"]')).toHaveAttribute("data-w", "1");
  });
  it("unchanged drop and blur cancellation do not save", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithUi(
      <DashboardGrid
        items={items}
        defaultLayout={layout}
        columns={2}
        editable
        onLayoutChange={change}
      />,
    );
    screen.getAllByRole("button", { name: /Revenue/ })[0].focus();
    await user.keyboard("{Enter}{Enter}{Enter}{ArrowRight}{Tab}");
    expect(change).not.toHaveBeenCalled();
    expect(document.querySelector('[data-dashboard-id="b"]')).toHaveAttribute("data-y", "0");
  });
  it.each(["ja", "en", "vi"] as const)("has translated announcements in %s", (locale) => {
    const text = translate(locale, locale, "dashboardGrid.dropped", {
      label: "BI",
      x: "1",
      y: "1",
      w: "2",
      h: "3",
    });
    expect(text).toContain("BI");
    expect(text).not.toContain("dashboardGrid.");
  });
});

it("reconciles added items during a preview without saving or crashing", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = renderWithUi(
    <DashboardGrid
      items={items}
      defaultLayout={layout}
      columns={2}
      editable
      onLayoutChange={change}
    />,
  );
  screen.getAllByRole("button", { name: /Revenue/ })[0].focus();
  await user.keyboard("{Enter}{ArrowRight}");
  rerender(
    <DashboardGrid
      items={[...items, { id: "c", label: "Retention", content: "Retention" }]}
      defaultLayout={layout}
      columns={2}
      editable
      onLayoutChange={change}
    />,
  );
  expect(document.querySelector('[data-dashboard-id="c"]')).toBeInTheDocument();
  expect(document.querySelector("[data-held]")).not.toBeInTheDocument();
  expect(change).not.toHaveBeenCalled();
});
