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
});

describe("Pagination", () => {
  it("changes page on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(<Pagination current={1} total={100} pageSize={10} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /trang 2/i }));
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });

  it("renders simple mode", () => {
    renderWithUi(<Pagination simple current={2} total={50} pageSize={10} />);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });
});

describe("Steps", () => {
  it("renders step titles", () => {
    renderWithUi(
      <Steps
        current={1}
        items={[{ title: "Tạo đơn" }, { title: "Thanh toán" }, { title: "Giao hàng" }]}
      />,
    );
    expect(screen.getByText("Tạo đơn")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán")).toBeInTheDocument();
  });

  it("calls onChange when clickable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <Steps current={0} onChange={onChange} items={[{ title: "A" }, { title: "B" }]} />,
    );
    await user.click(screen.getByText("B"));
    expect(onChange).toHaveBeenCalledWith(1);
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
