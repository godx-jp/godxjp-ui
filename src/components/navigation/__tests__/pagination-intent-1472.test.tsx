import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithUi, screen } from "@/test/render";
import { Pagination } from "../pagination";

describe("Pagination intent (gh#1472)", () => {
  it.each([false, true])("reports targets without changing value, simple=%s", (simple) => {
    const intent = vi.fn(),
      change = vi.fn();
    renderWithUi(
      <Pagination
        value={3}
        total={100}
        simple={simple}
        responsive={false}
        onPageIntent={intent}
        onValueChange={change}
      />,
    );
    const buttons = screen.getAllByRole("button");
    const prev = buttons[0],
      next = buttons.at(-1)!;
    for (const [button, page] of [
      [prev, 2],
      [next, 4],
    ] as const) {
      fireEvent.pointerEnter(button);
      fireEvent.focus(button);
      fireEvent.touchStart(button);
      expect(intent.mock.calls.slice(-3)).toEqual([[page], [page], [page]]);
    }
    if (!simple) {
      const page = buttons.find((b) => b.textContent === "5")!;
      fireEvent.pointerEnter(page);
      fireEvent.focus(page);
      fireEvent.touchStart(page);
      expect(intent.mock.calls.slice(-3)).toEqual([[5], [5], [5]]);
    }
    expect(change).not.toHaveBeenCalled();
  });
  it("ignores disabled and out-of-range neighbours", () => {
    const intent = vi.fn();
    const view = renderWithUi(
      <Pagination value={1} total={30} responsive={false} onPageIntent={intent} />,
    );
    fireEvent.pointerEnter(screen.getAllByRole("button")[0]);
    expect(intent).not.toHaveBeenCalled();
    view.rerender(<Pagination value={3} total={30} responsive={false} onPageIntent={intent} />);
    fireEvent.pointerEnter(screen.getAllByRole("button").at(-1)!);
    expect(intent).not.toHaveBeenCalled();
    view.rerender(
      <Pagination value={3} total={30} disabled responsive={false} onPageIntent={intent} />,
    );
    for (const button of screen.getAllByRole("button")) {
      fireEvent.pointerEnter(button);
      fireEvent.focus(button);
      fireEvent.touchStart(button);
    }
    expect(intent).not.toHaveBeenCalled();
  });
});
