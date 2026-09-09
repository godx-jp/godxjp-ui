import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Transfer } from "../transfer";

const items = Array.from({ length: 5 }, (_, index) => ({
  key: String(index),
  title: `Account ${index}`,
  disabled: index === 1,
}));

describe("Transfer assignment lifecycle", () => {
  it("selects only visible enabled rows and reports uncontrolled selection", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const selection = vi.fn();
    const { container } = renderWithUi(
      <form>
        <Transfer
          name="accounts[]"
          dataSource={items}
          pagination={{ pageSize: 2 }}
          onValueChange={change}
          onSelectChange={selection}
        />
      </form>,
    );
    expect(screen.queryByRole("checkbox", { name: "Account 2" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /Chọn tất cả.*nguồn/i }));
    expect(selection).toHaveBeenLastCalledWith(["0"], []);
    await user.click(screen.getByRole("button", { name: "Chuyển sang đích" }));
    expect(change).toHaveBeenLastCalledWith(["0"], "right", ["0"]);
    expect(new FormData(container.querySelector("form")!).getAll("accounts[]")).toEqual(["0"]);
  });

  it("select-all respects filtered rows without clearing hidden selections", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithUi(<Transfer dataSource={items} showSearch onValueChange={change} />);
    await user.click(screen.getByRole("checkbox", { name: "Account 0" }));
    await user.type(screen.getAllByRole("searchbox")[0], "Account 2");
    await user.click(screen.getByRole("checkbox", { name: /Chọn tất cả.*nguồn/i }));
    await user.click(screen.getByRole("button", { name: "Chuyển sang đích" }));
    expect(change).toHaveBeenLastCalledWith(["0", "2"], "right", ["0", "2"]);
  });

  it("read-only keeps native values and disabled omits them", () => {
    const { container, rerender } = renderWithUi(
      <form>
        <Transfer name="accounts[]" dataSource={items} defaultValue={["0"]} readOnly />
      </form>,
    );
    expect(screen.getByRole("checkbox", { name: "Account 0" })).toBeDisabled();
    expect(new FormData(container.querySelector("form")!).getAll("accounts[]")).toEqual(["0"]);
    rerender(
      <form>
        <Transfer name="accounts[]" dataSource={items} defaultValue={["0"]} disabled />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).getAll("accounts[]")).toEqual([]);
  });
});
