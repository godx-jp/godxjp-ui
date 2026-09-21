import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

import { DataTable } from "../data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * gh#817 — `Table`'s scroll container took keyboard focus with NO role and NO accessible name, so
 * a keyboard or screen-reader user landed on an anonymous stop that announced nothing. Reported by
 * `godx-jp/id` against 28.2.1, from markup that carried exactly one focus-related attribute:
 *
 *   <div class="relative w-full overflow-auto ui-table-collection" tabindex="0">
 *
 * The tab stop itself is correct (WCAG 2.1.1 — it is how the overflow is reached without a
 * pointer), so the fix NAMES it rather than removing it: `role="group"` + an accessible name that
 * defaults to the localized `dataTable.scrollRegion`, so no consumer is forced to invent one.
 *
 * `group`, not `region`: a named `region` is a LANDMARK, and a page with several tables would ship
 * several identically-named landmarks (axe `landmark-unique`).
 *
 * The second half: the stop only exists while there IS overflow to reach. jsdom reports 0 for every
 * layout box, so overflow has to be STUBBED — and the guard that an unlaid-out box (clientWidth 0)
 * counts as scrolling is what keeps every other jsdom test seeing the tab stop.
 */

const resizeCallbacks: (() => void)[] = [];

beforeEach(() => {
  resizeCallbacks.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Make one scroll box report a real layout, then let the observer notice. */
function measure(el: Element, clientWidth: number, scrollWidth: number) {
  Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
  Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
  act(() => {
    for (const fire of resizeCallbacks) fire();
  });
}

function Queue(props: React.ComponentProps<typeof Table>) {
  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead priority="primary">申請者</TableHead>
          <TableHead priority="actions">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell priority="primary">山田 太郎</TableCell>
          <TableCell priority="actions">対応する</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function wrapperOf(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>("div.overflow-auto");
  if (!el) throw new Error("no overflow-auto scroll wrapper in the tree");
  return el;
}

describe("Table — the scroll region is a NAMED stop, not an anonymous one (gh#817)", () => {
  it("carries role=group and the localized default name beside its tabindex", () => {
    const { container } = render(<Queue preset="action-collection" />);
    const wrapper = wrapperOf(container);

    // The reported markup, restored in full: the same tab stop, no longer unroled and unnamed.
    expect(wrapper).toHaveAttribute("tabindex", "0");
    expect(wrapper).toHaveAttribute("role", "group");
    expect(wrapper).toHaveAccessibleName("Bảng có thể cuộn");
  });

  it("is a GROUP, never a landmark region — several tables must not collide on one page", () => {
    const { container } = render(
      <>
        <Queue />
        <Queue />
      </>,
    );
    expect(container.querySelectorAll("[role='region']")).toHaveLength(0);
    expect(container.querySelectorAll("[role='group']")).toHaveLength(2);
  });

  it("takes the consumer's `label` as the region name when one is given", () => {
    const { container } = render(<Queue label="承認待ち" />);
    expect(wrapperOf(container)).toHaveAccessibleName("承認待ち");
  });

  it("falls back to the default when `label` is not a usable aria-label", () => {
    const { container } = render(<Queue label={<strong>承認待ち</strong>} />);
    expect(wrapperOf(container)).toHaveAccessibleName("Bảng có thể cuộn");
  });

  it("drops the stop, the role and the name once the table provably FITS", () => {
    const { container } = render(<Queue />);
    const wrapper = wrapperOf(container);

    measure(wrapper, 800, 800);

    expect(wrapper).not.toHaveAttribute("tabindex");
    expect(wrapper).not.toHaveAttribute("role");
    expect(wrapper).not.toHaveAttribute("aria-label");
  });

  it("keeps all three the moment there IS overflow to reach", () => {
    const { container } = render(<Queue />);
    const wrapper = wrapperOf(container);

    measure(wrapper, 390, 900);

    expect(wrapper).toHaveAttribute("tabindex", "0");
    expect(wrapper).toHaveAttribute("role", "group");
    expect(wrapper).toHaveAccessibleName("Bảng có thể cuộn");
  });

  it("adds nothing at all when an ancestor owns the scroll region", () => {
    const { container } = render(<Queue scrollable={false} label="承認待ち" />);
    const wrapper = container.querySelector<HTMLElement>("div.relative")!;

    expect(wrapper.className).not.toContain("overflow-auto");
    expect(wrapper).not.toHaveAttribute("tabindex");
    expect(wrapper).not.toHaveAttribute("role");
    expect(wrapper).not.toHaveAttribute("aria-label");
  });
});

describe("DataTable — the same stop, the same defect (gh#817)", () => {
  const columns = [{ key: "name", header: "名前", render: (row: { name: string }) => row.name }];
  const data = [{ id: "1", name: "山田 太郎" }];

  it("names `.ui-data-table-scroll`, which owned the tab stop and nothing else", () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const region = container.querySelector<HTMLElement>(".ui-data-table-scroll")!;

    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("role", "group");
    expect(region).toHaveAccessibleName("Bảng có thể cuộn");
  });

  it("takes `label`, and hands it to the primitive's wrapper under the collection preset", () => {
    const { container } = render(
      <DataTable data={data} columns={columns} label="承認待ち" preset="action-collection" />,
    );
    // Under the preset the primitive's own wrapper is the scroll region; the outer one steps aside.
    expect(container.querySelector(".ui-data-table-scroll")).not.toHaveAttribute("tabindex");
    expect(wrapperOf(container)).toHaveAccessibleName("承認待ち");
  });
});
