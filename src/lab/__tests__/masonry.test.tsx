import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Masonry } from "../masonry";
import type { MasonryItemProp, MasonryLayoutEntryProp } from "../masonry";

/**
 * Every measurement here comes from `MasonryItem.height`, which is the one place this port
 * deliberately departs from antd's implementation: antd declares the field, documents it as
 * "Height of the item" and then never reads it, so its layout is only expressible against a real
 * layout engine. Honouring it makes the packing assertable without mocking
 * `getBoundingClientRect` — and makes a first paint land in the right place, which was the reason
 * for the deviation, not a side effect of it.
 */
function tiles(heights: number[], extra: Partial<MasonryItemProp>[] = []): MasonryItemProp[] {
  return heights.map((height, index) => ({
    key: `t${index}`,
    height,
    children: `tile ${index}`,
    ...extra[index],
  }));
}

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="masonry"]')!;
const items = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="masonry-item"]'));
const columnOf = (element: HTMLElement) => element.style.getPropertyValue("--masonry-item-column");
const topOf = (element: HTMLElement) => element.style.insetBlockStart;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Masonry — antd parity", () => {
  it("defaults to three columns, which is Ant Design's `columns` default", () => {
    const { container } = render(<Masonry items={tiles([10, 20, 30])} />);
    expect(root(container).style.getPropertyValue("--masonry-column-count")).toBe("3");
  });

  it("drops each tile into the SHORTEST column, in items order, and never re-seats an earlier one", () => {
    // 100 · 50 · 80 open the three columns; 10 goes under the 50, then 5 goes under the 10.
    const { container } = render(<Masonry columns={3} items={tiles([100, 50, 80, 10, 5])} />);
    const placed = items(container).map((element) => [columnOf(element), topOf(element)]);
    expect(placed).toEqual([
      ["0", "0px"],
      ["1", "0px"],
      ["2", "0px"],
      ["1", "50px"],
      ["1", "60px"],
    ]);
  });

  it("sizes the container to the TALLEST column", () => {
    const { container } = render(<Masonry columns={2} items={tiles([100, 40, 30])} />);
    // column 0 = 100, column 1 = 40 + 30 = 70.
    expect(root(container).style.blockSize).toBe("100px");
  });

  it("`MasonryItem.column` pins a tile, and an out-of-range index is clamped to the live count", () => {
    const { container } = render(
      <Masonry
        columns={3}
        items={tiles([10, 10, 10, 10], [{}, { column: 0 }, { column: 9 }, { column: -4 }])}
      />,
    );
    expect(items(container).map(columnOf)).toEqual(["0", "0", "2", "0"]);
    // The pinned tile stacked under the first one rather than opening a fresh column.
    expect(topOf(items(container)[1])).toBe("10px");
  });

  it("`children` wins over `itemRender`, and `itemRender` is handed the live index and column", () => {
    const seen: Array<{ index: number; column: number; data: unknown }> = [];
    const { container } = render(
      <Masonry
        columns={2}
        items={[
          { key: "a", height: 30, data: "A" },
          { key: "b", height: 10, data: "B", children: "own children" },
          { key: "c", height: 10, data: "C" },
        ]}
        itemRender={(item) => {
          seen.push({ index: item.index, column: item.column, data: item.data });
          return `rendered ${String(item.data)}`;
        }}
      />,
    );
    expect(items(container).map((element) => element.textContent)).toEqual([
      "rendered A",
      "own children",
      "rendered C",
    ]);
    // The first pass runs before anything is measured (every tile still at column 0); the
    // settled pass is the one that carries the packed columns. antd renders the same two passes.
    expect(seen.slice(-2)).toEqual([
      { index: 0, column: 0, data: "A" },
      { index: 2, column: 1, data: "C" },
    ]);
  });
});

describe("Masonry — reading order", () => {
  it("DOM order is items order even when the visual order is not", () => {
    const { container } = render(<Masonry columns={2} items={tiles([200, 10, 10, 10])} />);
    expect(items(container).map((element) => element.textContent)).toEqual([
      "tile 0",
      "tile 1",
      "tile 2",
      "tile 3",
    ]);
    // …while tiles 1–3 all stack in column 1, i.e. visually above the bottom of tile 0.
    expect(items(container).map(columnOf)).toEqual(["0", "1", "1", "1"]);
  });

  it("carries no ARIA: a masonry is a layout, and WAI-ARIA 1.2 has no role for one", () => {
    const { container } = render(<Masonry items={tiles([10, 10])} />);
    expect(root(container).getAttribute("role")).toBeNull();
    expect(root(container).getAttribute("aria-label")).toBeNull();
    for (const element of items(container)) {
      expect(element.getAttribute("role")).toBeNull();
    }
  });
});

describe("Masonry — gap", () => {
  it("a NAMED step is axis-aware, as it is on Flex: inline scale across, stack scale down", () => {
    const { container } = render(<Masonry gap="md" items={tiles([10])} />);
    expect(root(container).style.getPropertyValue("--masonry-gap-inline")).toBe(
      "var(--space-inline-md)",
    );
    expect(root(container).style.getPropertyValue("--masonry-gap-block")).toBe(
      "var(--space-stack-md)",
    );
  });

  it("a NUMERIC step is the raw scale on both axes, and the tuple is [inline, block]", () => {
    const { container } = render(<Masonry gap={[4, "lg"]} items={tiles([10])} />);
    expect(root(container).style.getPropertyValue("--masonry-gap-inline")).toBe("var(--space-4)");
    expect(root(container).style.getPropertyValue("--masonry-gap-block")).toBe(
      "var(--space-stack-lg)",
    );
  });

  it("omitting `gap` writes no override, so the --masonry-gap-* token defaults hold (antd's 0)", () => {
    const { container } = render(<Masonry items={tiles([10])} />);
    expect(root(container).style.getPropertyValue("--masonry-gap-inline")).toBe("");
    expect(root(container).style.getPropertyValue("--masonry-gap-block")).toBe("");
  });

  it("the packer READS the resolved row-gap back off the container rather than recomputing it", () => {
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(((element: Element) => {
      if ((element as HTMLElement).dataset?.slot === "masonry") {
        return { rowGap: "16px" } as unknown as CSSStyleDeclaration;
      }
      return real(element as Element);
    }) as typeof window.getComputedStyle);

    const { container } = render(<Masonry columns={1} gap="md" items={tiles([30, 20])} />);
    expect(topOf(items(container)[1])).toBe("46px");
    // 30 + 16 + 20 — the trailing gap belongs to no tile and comes back off the container.
    expect(root(container).style.blockSize).toBe("66px");
  });
});

describe("Masonry — responsive columns", () => {
  function matchAt(...matching: string[]) {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: matching.includes(query),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  }

  it("takes the WIDEST matching step that declares a value", () => {
    matchAt("(min-width: 40rem)", "(min-width: 48rem)");
    const { container } = render(
      <Masonry columns={{ base: 1, sm: 2, md: 3, lg: 4 }} items={tiles([10])} />,
    );
    expect(root(container).style.getPropertyValue("--masonry-column-count")).toBe("3");
  });

  it("falls back to `base` when no declared step matches", () => {
    matchAt();
    const { container } = render(<Masonry columns={{ base: 1, lg: 4 }} items={tiles([10])} />);
    expect(root(container).style.getPropertyValue("--masonry-column-count")).toBe("1");
  });

  it("an empty map is one column, and `columns={0}` is clamped to one", () => {
    matchAt();
    const { container } = render(<Masonry columns={{}} items={tiles([10])} />);
    expect(root(container).style.getPropertyValue("--masonry-column-count")).toBe("1");
    const zero = render(<Masonry columns={0} items={tiles([10])} />);
    expect(root(zero.container).style.getPropertyValue("--masonry-column-count")).toBe("1");
  });

  it("names an unknown step — antd's `xs`/`xxl` — instead of dropping it in silence", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    matchAt();
    render(
      <Masonry columns={{ base: 1, xs: 1, xxl: 6 } as unknown as number} items={tiles([10])} />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("xs, xxl"));
    expect(warn.mock.calls[0]![0]).toContain("base | sm | md | lg | xl");
  });
});

describe("Masonry — onLayoutChange", () => {
  it("reports the whole item plus its column, which is what antd's implementation hands back", () => {
    const onLayoutChange = vi.fn<(layout: MasonryLayoutEntryProp[]) => void>();
    render(
      <Masonry
        columns={2}
        items={[
          { key: "a", height: 40, data: 1 },
          { key: "b", height: 10, data: 2 },
          { key: "c", height: 10, data: 3 },
        ]}
        onLayoutChange={onLayoutChange}
      />,
    );
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange.mock.calls[0]![0]).toEqual([
      { key: "a", height: 40, data: 1, column: 0 },
      { key: "b", height: 10, data: 2, column: 1 },
      { key: "c", height: 10, data: 3, column: 1 },
    ]);
  });

  it("does not fire again while the column assignment is unchanged", () => {
    const onLayoutChange = vi.fn();
    const { rerender } = render(
      <Masonry columns={2} items={tiles([40, 10])} onLayoutChange={onLayoutChange} />,
    );
    rerender(<Masonry columns={2} items={tiles([40, 10])} onLayoutChange={onLayoutChange} />);
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
  });

  it("fires again when the column count moves a tile", () => {
    const onLayoutChange = vi.fn();
    const { rerender } = render(
      <Masonry columns={2} items={tiles([40, 10, 10])} onLayoutChange={onLayoutChange} />,
    );
    rerender(<Masonry columns={3} items={tiles([40, 10, 10])} onLayoutChange={onLayoutChange} />);
    expect(onLayoutChange).toHaveBeenCalledTimes(2);
    expect(
      onLayoutChange.mock.calls[1]![0].map((entry: MasonryLayoutEntryProp) => entry.column),
    ).toEqual([0, 1, 2]);
  });
});

describe("Masonry — fresh", () => {
  it("off, only the container is observed", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    render(<Masonry items={tiles([10, 10, 10])} />);
    expect(observe).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("on, every tile is observed too — antd's `fresh` is one ResizeObserver per item", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    render(<Masonry fresh items={tiles([10, 10, 10])} />);
    expect(observe).toHaveBeenCalledTimes(4);
    vi.unstubAllGlobals();
  });
});

describe("Masonry — API surface", () => {
  it("names `gap` when handed antd's `gutter`, and ignores the value", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Masonry {...({ gutter: 16 } as unknown as Record<string, never>)} items={tiles([10])} />,
    );
    expect(warn.mock.calls[0]![0]).toContain("`gap`");
    expect(root(container).style.getPropertyValue("--masonry-gap-inline")).toBe("");
  });

  it("forwards a ref to the container and accepts id / className", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <Masonry ref={ref} id="feed" className="probe" items={tiles([10])} />,
    );
    expect(ref.current).toBe(root(container));
    expect(ref.current?.id).toBe("feed");
    expect(ref.current?.classList.contains("probe")).toBe(true);
  });

  it("renders nothing and stays at zero height with no items", () => {
    const { container } = render(<Masonry />);
    expect(items(container)).toHaveLength(0);
    expect(root(container).style.blockSize).toBe("0px");
  });
});
