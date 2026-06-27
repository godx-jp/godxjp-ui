import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Pagination } from "../pagination";
import { buildPageRange } from "../pagination-utils";
import { Steps } from "../steps";
import { Tabs } from "../tabs";

describe("buildPageRange", () => {
  it("returns all pages when total is small", () => {
    expect(buildPageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("inserts ellipsis for large totals", () => {
    expect(buildPageRange(5, 20)).toContain("ellipsis");
    expect(buildPageRange(5, 20)[0]).toBe(1);
    expect(buildPageRange(5, 20).at(-1)).toBe(20);
  });

  it("returns an empty list when there are no pages", () => {
    expect(buildPageRange(1, 0)).toEqual([]);
  });

  it("returns the single page when total is 1", () => {
    expect(buildPageRange(1, 1)).toEqual([1]);
  });

  it("near the start: right ellipsis only, no left ellipsis", () => {
    // current=1 → left=1, right=2; left>2 is false so 2..left is filled (none),
    // right<totalPages-1 is true so a trailing ellipsis appears before the last page.
    const range = buildPageRange(1, 20);
    expect(range[0]).toBe(1);
    expect(range).toEqual([1, 2, "ellipsis", 20]);
  });

  it("near the end: left ellipsis only, last pages spelled out", () => {
    // current=20 → showRightEllipsis false so pages right+1..totalPages-1 are spelled out
    // (exercises the trailing fill loop) and the leading ellipsis collapses the early pages.
    const range = buildPageRange(20, 20);
    expect(range[0]).toBe(1);
    expect(range).toContain("ellipsis");
    expect(range.indexOf("ellipsis")).toBe(1);
    expect(range).toEqual([1, "ellipsis", 19, 20]);
  });

  it("in the middle: ellipsis on both sides", () => {
    const range = buildPageRange(10, 20);
    expect(range).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });

  it("widens the window with a larger siblingCount", () => {
    expect(buildPageRange(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });
});

describe("Pagination", () => {
  it("changes page on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderWithUi(<Pagination value={1} total={100} pageSize={10} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: /trang 2/i }));
    expect(onValueChange).toHaveBeenCalledWith(2, 10);
  });

  it("renders simple mode", () => {
    renderWithUi(<Pagination simple value={2} total={50} pageSize={10} />);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });
});

describe("Steps", () => {
  it("renders step titles", () => {
    renderWithUi(
      <Steps
        value={1}
        items={[{ title: "Tạo đơn" }, { title: "Thanh toán" }, { title: "Giao hàng" }]}
      />,
    );
    expect(screen.getByText("Tạo đơn")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán")).toBeInTheDocument();
  });

  it("calls onValueChange when clickable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Steps value={0} onValueChange={onValueChange} items={[{ title: "A" }, { title: "B" }]} />,
    );
    await user.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith(1);
  });
});

describe("Tabs", () => {
  it("switches panels via items API", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Tabs
        defaultValue="orders"
        items={[
          { value: "orders", label: "Đơn hàng", content: "Panel đơn" },
          { value: "shipments", label: "Kiện hàng", content: "Panel kiện" },
        ]}
      />,
    );
    expect(screen.getByText("Panel đơn")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Kiện hàng" }));
    expect(screen.getByText("Panel kiện")).toBeInTheDocument();
  });
});
