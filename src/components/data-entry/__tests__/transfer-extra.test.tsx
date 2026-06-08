import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "AA" },
  { key: "b", title: "BB" },
  { key: "c", title: "CC", disabled: true },
];

const selectAlls = () =>
  screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-label"));
const rowCheckbox = (title: string) =>
  screen.getAllByRole("checkbox").find((c) => c.closest("label")?.textContent?.includes(title))!;

describe("Transfer — source select-all + move right", () => {
  it("select-all on the source moves every enabled item to the target", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={onValueChange} />);
    const sourceSelectAll = selectAlls().find((c) => !(c as HTMLButtonElement).disabled)!;
    await user.click(sourceSelectAll);
    const moveRight = screen.getAllByRole("button")[0]; // first chevron = move-right
    await user.click(moveRight);
    expect(onValueChange).toHaveBeenCalledWith(
      expect.arrayContaining(["a", "b"]),
      "right",
      expect.arrayContaining(["a", "b"]),
    );
  });
});

describe("Transfer — controlled selection", () => {
  it("emits onSelectChange (cleared) after a controlled move", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSelectChange = vi.fn();
    renderWithUi(
      <Transfer
        dataSource={DATA}
        targetKeys={[]}
        selectedKeys={[["a"], []]}
        onValueChange={onValueChange}
        onSelectChange={onSelectChange}
      />,
    );
    await user.click(screen.getAllByRole("button")[0]); // move-right (a is pre-selected)
    expect(onValueChange).toHaveBeenCalledWith(["a"], "right", ["a"]);
    expect(onSelectChange).toHaveBeenCalledWith([], []); // selection cleared on the source side
  });
});

describe("Transfer — toggle off + oneWay", () => {
  it("unchecking a selected row removes it from the selection", async () => {
    const user = userEvent.setup();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={vi.fn()} />);
    const cb = rowCheckbox("AA");
    await user.click(cb);
    expect(cb).toBeChecked();
    await user.click(cb); // toggle off → filter branch
    expect(cb).not.toBeChecked();
  });

  it("oneWay hides the move-left control", () => {
    renderWithUi(<Transfer dataSource={DATA} targetKeys={["a"]} oneWay onValueChange={vi.fn()} />);
    // only the move-right chevron remains (the panels' select-alls are checkboxes)
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
