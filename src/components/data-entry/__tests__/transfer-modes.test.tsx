import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "NV-001", description: "Osaka" },
  { key: "b", title: "NV-002", description: "HCM" },
  { key: "c", title: "NV-003", description: "HCM", disabled: true },
];

describe("Transfer — disabled / titles / single toggle", () => {
  it("disabled: every checkbox and move button is disabled", () => {
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={vi.fn()} disabled />);
    screen.getAllByRole("checkbox").forEach((cb) => expect(cb).toBeDisabled());
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });

  it("renders custom panel titles", () => {
    renderWithUi(
      <Transfer
        dataSource={DATA}
        targetKeys={["b"]}
        onValueChange={vi.fn()}
        titles={["未割当", "割当済み"]}
      />,
    );
    expect(screen.getByText("未割当")).toBeInTheDocument();
    expect(screen.getByText("割当済み")).toBeInTheDocument();
  });

  it("toggling a single source item then moving it right fires onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={onValueChange} />);
    // check NV-001's row checkbox (not select-all). The row is no longer a <label> around the box
    // — a label inside a label is invalid — so the row text names it by reference instead, which
    // makes the row the checkbox's accessible name.
    const rowCheckbox = screen.getByRole("checkbox", { name: /NV-001/ });
    await user.click(rowCheckbox);
    // now the move-right button (the only enabled move button) is active
    const moveBtn = screen.getAllByRole("button").find((b) => !(b as HTMLButtonElement).disabled);
    await user.click(moveBtn!);
    expect(onValueChange).toHaveBeenCalledWith(["a"], "right", ["a"]);
  });

  it("a disabled item's checkbox cannot be toggled", () => {
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} onValueChange={vi.fn()} />);
    const disabledRow = screen.getByRole("checkbox", { name: /NV-003/ });
    expect(disabledRow).toBeDisabled();
  });
});
