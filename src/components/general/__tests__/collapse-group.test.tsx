import { describe, expect, it, vi } from "vitest";

// Plain render: renderWithUi's rerender does not re-apply its wrapper (it would remount).
import { render } from "@/test/render";
import { CollapseGroup } from "../collapse-group";

const List = ({ items, onExited }: { items: string[]; onExited?: (k: string) => void }) => (
  <ul>
    <CollapseGroup onExited={onExited}>
      {items.map((id) => (
        <li key={id} data-id={id}>
          {id}
        </li>
      ))}
    </CollapseGroup>
  </ul>
);

const ids = (c: HTMLElement) => [...c.querySelectorAll("li")].map((li) => li.dataset.id);

describe("CollapseGroup", () => {
  it("adds no wrapper: rows stay direct children of the list", () => {
    const { container } = render(<List items={["a", "b"]} />);
    expect(container.querySelector("ul")!.children).toHaveLength(2);
    expect(ids(container)).toEqual(["a", "b"]);
  });

  it("removes a row (no animation support → at once) and reports its own key", () => {
    const onExited = vi.fn();
    const { container, rerender } = render(<List items={["a", "b", "c"]} onExited={onExited} />);
    rerender(<List items={["a", "c"]} onExited={onExited} />);
    expect(ids(container)).toEqual(["a", "c"]);
    expect(onExited).toHaveBeenCalledWith("b");
  });

  it("keeps order when rows are added at the same time", () => {
    const { container, rerender } = render(<List items={["a", "b"]} />);
    rerender(<List items={["x", "a"]} />);
    expect(ids(container)).toEqual(["x", "a"]);
  });
});
