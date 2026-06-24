import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { ListRow } from "../list-row";

describe("ListRow", () => {
  it("renders title + description and exposes the data-slot", () => {
    const { container } = renderWithUi(
      <ListRow title="iPhone 15" description="最終アクセス 2分前" />,
    );
    const row = container.querySelector('[data-slot="list-row"]');
    expect(row).not.toBeNull();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText("最終アクセス 2分前")).toBeInTheDocument();
  });

  it("renders leading + trailing slots only when provided", () => {
    const { container, rerender } = renderWithUi(<ListRow title="Bare" />);
    expect(container.querySelector('[data-slot="list-row-leading"]')).toBeNull();
    expect(container.querySelector('[data-slot="list-row-trailing"]')).toBeNull();

    rerender(
      <ListRow
        title="With slots"
        leading={<span data-testid="lead">●</span>}
        trailing={<button type="button">操作</button>}
      />,
    );
    expect(container.querySelector('[data-slot="list-row-leading"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "操作" })).toBeInTheDocument();
  });

  it("sets data-align only for start", () => {
    const { container, rerender } = renderWithUi(<ListRow title="Center" />);
    expect(container.querySelector('[data-slot="list-row"]')).not.toHaveAttribute("data-align");
    rerender(<ListRow title="Start" align="start" />);
    expect(container.querySelector('[data-slot="list-row"]')).toHaveAttribute(
      "data-align",
      "start",
    );
  });

  it("renders as an <li> when as='li'", () => {
    const { container } = renderWithUi(
      <ul>
        <ListRow as="li" title="Item" />
      </ul>,
    );
    expect(container.querySelector('li[data-slot="list-row"]')).not.toBeNull();
  });
});
