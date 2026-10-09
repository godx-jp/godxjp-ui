import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RangeTimeline, type RangeTimelineRow } from "../range-timeline";

/*
 * gh#724 — nested rows (depth indent + collapsible parents). A timeline with no `depth` anywhere
 * must render exactly as before the feature; the snapshot below was recorded on the pre-#724 code.
 * jsdom does no layout, so geometry was measured in Chromium on the docs frame when this landed:
 * label content starts 36 / 52 / 68px into the cell at depth 0 / 1 / 2 (16px per level), LTR and
 * RTL; the label column stays 256px; after folding and unfolding parents the grid layer, row rules
 * and header/body column edges all measure 0px off.
 */
const flat: RangeTimelineRow[] = [
  { id: "a", label: "Alpha", start: 0, end: 1, startLabel: "Start a", endLabel: "End a" },
  { id: "b", label: "Beta", start: 1, end: 2, startLabel: "Start b", endLabel: "End b" },
];
const days = [
  { label: "1", units: 1 },
  { label: "2", units: 1, muted: true },
  { label: "3", units: 1 },
];

describe("RangeTimeline nested rows (gh#724)", () => {
  it("renders a timeline without depth byte-identically to the pre-#724 markup", () => {
    const { container } = render(
      <RangeTimeline label="Schedule" columns={days} rows={flat} today={1} />,
    );
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<section class="ui-range-timeline" data-bordered="true" aria-label="Schedule" tabindex="0"><div class="ui-range-timeline-canvas" style="--range-timeline-columns: 3; --range-timeline-units: 3;"><div class="ui-range-timeline-header"><div class="ui-range-timeline-label"><span data-slot="text" data-size="sm" data-tone="default" data-weight="bold" class="ui-text">Schedule</span></div><div class="ui-range-timeline-columns"><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">1</span></div><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">2</span></div><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">3</span></div></div></div><div class="ui-range-timeline-body"><div class="ui-range-timeline-grid" aria-hidden="true"><div></div><div class="ui-range-timeline-columns"><div class="ui-range-timeline-grid-column" style="grid-column: span 1;"></div><div class="ui-range-timeline-grid-column" data-muted="true" style="grid-column: span 1;"></div><div class="ui-range-timeline-grid-column" style="grid-column: span 1;"></div></div></div><div class="ui-range-timeline-row"><div class="ui-range-timeline-label">Alpha</div><div class="ui-range-timeline-track"><span aria-hidden="true" class="ui-range-timeline-today" style="inset-inline-start: 50%;"></span><div class="ui-range-timeline-bar" style="inset-inline-start: 0%; inline-size: 66.66666666666666%;"></div></div></div><div class="ui-range-timeline-row"><div class="ui-range-timeline-label">Beta</div><div class="ui-range-timeline-track"><span aria-hidden="true" class="ui-range-timeline-today" style="inset-inline-start: 50%;"></span><div class="ui-range-timeline-bar" style="inset-inline-start: 33.33333333333333%; inline-size: 66.66666666666666%;"></div></div></div></div></div></section>"`,
    );
  });

  it("keeps an editable timeline without depth byte-identical too (grips, bands, bordered off)", () => {
    const { container } = render(
      <RangeTimeline
        label="Schedule"
        bordered={false}
        bands={[{ label: "Sep", units: 3 }]}
        columns={days}
        rows={flat}
        onRangeChange={() => {}}
      />,
    );
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<section class="ui-range-timeline" aria-label="Schedule" tabindex="0"><div class="ui-range-timeline-canvas" style="--range-timeline-columns: 3; --range-timeline-units: 3;"><div class="ui-range-timeline-header"><div class="ui-range-timeline-label" aria-hidden="true"></div><div class="ui-range-timeline-columns"><div class="ui-range-timeline-column" style="grid-column: span 3;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="medium" class="ui-text">Sep</span></div></div></div><div class="ui-range-timeline-header"><div class="ui-range-timeline-label"><span data-slot="text" data-size="sm" data-tone="default" data-weight="bold" class="ui-text">Schedule</span></div><div class="ui-range-timeline-columns"><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">1</span></div><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">2</span></div><div class="ui-range-timeline-column" style="grid-column: span 1;"><span data-slot="text" data-size="xs" data-tone="default" data-weight="regular" class="ui-text">3</span></div></div></div><div class="ui-range-timeline-body"><div class="ui-range-timeline-grid" aria-hidden="true"><div></div><div class="ui-range-timeline-columns"><div class="ui-range-timeline-grid-column" style="grid-column: span 1;"></div><div class="ui-range-timeline-grid-column" data-muted="true" style="grid-column: span 1;"></div><div class="ui-range-timeline-grid-column" style="grid-column: span 1;"></div></div></div><div class="ui-range-timeline-row"><div class="ui-range-timeline-label">Alpha</div><div class="ui-range-timeline-track"><div class="ui-range-timeline-bar" style="inset-inline-start: 0%; inline-size: 66.66666666666666%;"><button data-slot="button" data-variant="ghost" data-size="icon-xs" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon-xs [&amp;_svg]:size-[var(--button-xs-icon-size)] [&amp;_svg]:shrink-0 rounded-[var(--button-radius)] ui-range-timeline-handle" data-edge="start" aria-label="Start a"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical" aria-hidden="true"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></button><button data-slot="button" data-variant="ghost" data-size="icon-xs" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon-xs [&amp;_svg]:size-[var(--button-xs-icon-size)] [&amp;_svg]:shrink-0 rounded-[var(--button-radius)] ui-range-timeline-handle" data-edge="end" aria-label="End a"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical" aria-hidden="true"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></button></div></div></div><div class="ui-range-timeline-row"><div class="ui-range-timeline-label">Beta</div><div class="ui-range-timeline-track"><div class="ui-range-timeline-bar" style="inset-inline-start: 33.33333333333333%; inline-size: 66.66666666666666%;"><button data-slot="button" data-variant="ghost" data-size="icon-xs" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon-xs [&amp;_svg]:size-[var(--button-xs-icon-size)] [&amp;_svg]:shrink-0 rounded-[var(--button-radius)] ui-range-timeline-handle" data-edge="start" aria-label="Start b"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical" aria-hidden="true"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></button><button data-slot="button" data-variant="ghost" data-size="icon-xs" data-shape="default" type="button" class="aria-invalid:border-destructive [&amp;_svg]:pointer-events-none ui-button ui-button--ghost hover:bg-accent hover:text-accent-foreground ui-button--icon-xs [&amp;_svg]:size-[var(--button-xs-icon-size)] [&amp;_svg]:shrink-0 rounded-[var(--button-radius)] ui-range-timeline-handle" data-edge="end" aria-label="End b"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical" aria-hidden="true"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></button></div></div></div></div></div></section>"`,
    );
  });
});

// Depth-first, like the server sends it: plan > (design > spec), build; release.
const tree: RangeTimelineRow[] = [
  ["plan", "Plan", 0, 0, 2],
  ["design", "Design", 1, 0, 1],
  ["spec", "Spec", 2, 0, 0],
  ["build", "Build", 1, 1, 2],
  ["release", "Release", 0, 2, 2],
].map(([id, label, depth, start, end]) => ({
  id: id as string,
  label: label as string,
  depth: depth as number,
  start: start as number,
  end: end as number,
  startLabel: `Start ${label}`,
  endLabel: `End ${label}`,
}));

const childRows = ["en", "ja", "vi"].map(
  (locale) =>
    JSON.parse(readFileSync(join(process.cwd(), `src/i18n/messages/${locale}.json`), "utf8"))
      .rangeTimeline.childRows as string,
);
const toggleName = (label: string) => new RegExp(`^(${childRows.join("|")}) ${label}$`);
const labelsOf = () =>
  screen.getAllByRole("listitem").map((item) => within(item).getByText(/^[A-Z]\w+$/).textContent);
const barCount = (container: HTMLElement) =>
  container.querySelectorAll(".ui-range-timeline-bar").length;

describe("RangeTimeline nested rows — structure", () => {
  it("renders `depth: 0` rows exactly like rows without depth", () => {
    const plain = render(<RangeTimeline label="Schedule" columns={days} rows={flat} />);
    const html = plain.container.innerHTML;
    plain.unmount();
    const zero = render(
      <RangeTimeline
        label="Schedule"
        columns={days}
        rows={flat.map((row) => ({ ...row, depth: 0 }))}
      />,
    );
    expect(zero.container.innerHTML).toBe(html);
  });

  it("exposes a list of rows with aria-level, sibling position and the locale's every key", () => {
    expect(childRows.every(Boolean)).toBe(true);
    render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    const items = screen.getAllByRole("listitem");
    expect(screen.getByRole("list")).toContainElement(items[0]);
    expect(items.map((item) => item.getAttribute("aria-level"))).toEqual(["1", "2", "3", "2", "1"]);
    expect(items.map((item) => item.getAttribute("aria-setsize"))).toEqual([
      "2",
      "2",
      "1",
      "2",
      "2",
    ]);
    expect(items.map((item) => item.getAttribute("aria-posinset"))).toEqual([
      "1",
      "1",
      "1",
      "2",
      "2",
    ]);
  });

  it("gives a disclosure button only to rows whose next row is deeper", () => {
    render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    const toggles = screen.getAllByRole("button", { expanded: true });
    expect(toggles).toHaveLength(2);
    expect(screen.getByRole("button", { name: toggleName("Plan") })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: toggleName("Design") })).toBeInTheDocument();
    for (const leaf of ["Spec", "Build", "Release"])
      expect(screen.queryByRole("button", { name: toggleName(leaf) })).not.toBeInTheDocument();
  });

  it("indents the label cell by depth through the token, never the label column", () => {
    const { container } = render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    const cells = [
      ...container.querySelectorAll<HTMLElement>(
        ".ui-range-timeline-body .ui-range-timeline-label",
      ),
    ];
    expect(cells.map((cell) => cell.style.getPropertyValue("--range-timeline-depth"))).toEqual([
      "0",
      "1",
      "2",
      "1",
      "0",
    ]);
    expect(cells.every((cell) => cell.dataset.nested === "true")).toBe(true);
    // Leaves hold a decorative spacer so same-depth labels align with and without a disclosure.
    expect(container.querySelectorAll(".ui-range-timeline-disclosure-spacer")).toHaveLength(3);
    const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
    const css = strip(
      readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8"),
    ).replace(/\s+/g, " ");
    expect(css).toContain(
      '.ui-range-timeline-label[data-nested="true"] { display: flex; align-items: center; gap: var(--space-1); padding-inline-start: calc( var(--space-2) + var(--range-timeline-depth, 0) * var(--range-timeline-indent-width) ); }',
    );
    const tokens = readFileSync(
      join(process.cwd(), "src/tokens/components/data-display.css"),
      "utf8",
    );
    expect(tokens).toContain("--range-timeline-indent-width: var(--space-4);");
  });
});

describe("RangeTimeline nested rows — folding", () => {
  it("folding a parent removes every descendant row and bar; unfolding restores them", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <RangeTimeline label="Schedule" columns={days} rows={tree} onExpandedValuesChange={change} />,
    );
    expect(barCount(container)).toBe(5);
    await user.click(screen.getByRole("button", { name: toggleName("Plan") }));
    expect(change).toHaveBeenLastCalledWith(["design"]);
    expect(labelsOf()).toEqual(["Plan", "Release"]);
    expect(screen.queryByText("Spec")).not.toBeInTheDocument();
    expect(barCount(container)).toBe(2);
    expect(container.querySelectorAll(".ui-range-timeline-row")).toHaveLength(2);
    expect(screen.getByRole("button", { name: toggleName("Plan") })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // A folded top level: two siblings, positions recomputed from what is visible.
    expect(
      screen.getAllByRole("listitem").map((item) => item.getAttribute("aria-posinset")),
    ).toEqual(["1", "2"]);
    await user.click(screen.getByRole("button", { name: toggleName("Plan") }));
    expect(change).toHaveBeenLastCalledWith(["plan", "design"]);
    expect(labelsOf()).toEqual(["Plan", "Design", "Spec", "Build", "Release"]);
    expect(barCount(container)).toBe(5);
  });

  it("folding a nested parent hides only its own subtree, and an ancestor fold remembers it", async () => {
    const user = userEvent.setup();
    render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    await user.click(screen.getByRole("button", { name: toggleName("Design") }));
    expect(labelsOf()).toEqual(["Plan", "Design", "Build", "Release"]);
    await user.click(screen.getByRole("button", { name: toggleName("Plan") }));
    await user.click(screen.getByRole("button", { name: toggleName("Plan") }));
    expect(labelsOf()).toEqual(["Plan", "Design", "Build", "Release"]);
  });

  it("toggles from the keyboard with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    await user.tab(); // the scrollable region
    await user.tab();
    const plan = screen.getByRole("button", { name: toggleName("Plan") });
    expect(plan).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(plan).toHaveAttribute("aria-expanded", "false");
    expect(labelsOf()).toEqual(["Plan", "Release"]);
    expect(plan).toHaveFocus();
    await user.keyboard(" ");
    expect(plan).toHaveAttribute("aria-expanded", "true");
    expect(labelsOf()).toHaveLength(5);
  });

  it("controlled: renders exactly `expandedValues` and only reports the request", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container, rerender } = render(
      <RangeTimeline
        label="Schedule"
        columns={days}
        rows={tree}
        expandedValues={[]}
        onExpandedValuesChange={change}
      />,
    );
    expect(labelsOf()).toEqual(["Plan", "Release"]);
    expect(barCount(container)).toBe(2);
    await user.click(screen.getByRole("button", { name: toggleName("Plan") }));
    expect(change).toHaveBeenCalledExactlyOnceWith(["plan"]);
    expect(labelsOf()).toEqual(["Plan", "Release"]);
    rerender(
      <RangeTimeline
        label="Schedule"
        columns={days}
        rows={tree}
        expandedValues={["plan"]}
        onExpandedValuesChange={change}
      />,
    );
    expect(labelsOf()).toEqual(["Plan", "Design", "Build", "Release"]);
    expect(screen.getByRole("button", { name: toggleName("Design") })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("uncontrolled: `defaultExpandedValues` seeds the open parents; omitted, all start open", () => {
    const { unmount } = render(
      <RangeTimeline
        label="Schedule"
        columns={days}
        rows={tree}
        defaultExpandedValues={["plan"]}
      />,
    );
    expect(labelsOf()).toEqual(["Plan", "Design", "Build", "Release"]);
    unmount();
    render(<RangeTimeline label="Schedule" columns={days} rows={tree} />);
    expect(labelsOf()).toEqual(["Plan", "Design", "Spec", "Build", "Release"]);
  });
});
