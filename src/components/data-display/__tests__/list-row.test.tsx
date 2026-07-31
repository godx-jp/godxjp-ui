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

  // ── #224 · overflow behaviour is SEMANTIC (a documented prop), not consumer CSS ──────────
  it("truncates by default and wraps (no truncate) with overflow='wrap'", () => {
    const { container, rerender } = renderWithUi(
      <ListRow title="Truncated" description="secondary" />,
    );
    const row = () => container.querySelector('[data-slot="list-row"]')!;
    const texts = () => Array.from(container.querySelectorAll('[data-slot="text"]'));
    expect(row()).not.toHaveAttribute("data-overflow");
    expect(texts()).toHaveLength(2);
    for (const text of texts()) expect(text).toHaveAttribute("data-truncate");

    rerender(<ListRow title="Wrapped" description="secondary" overflow="wrap" />);
    expect(row()).toHaveAttribute("data-overflow", "wrap");
    for (const text of texts()) expect(text).not.toHaveAttribute("data-truncate");
  });

  // ── #225 · unread is a SEMANTIC state: dot + accessible text + tokenized surface ─────────
  it("renders no indicator gutter when `unread` is omitted", () => {
    const { container } = renderWithUi(<ListRow title="No read state" />);
    expect(container.querySelector('[data-slot="list-row-indicator"]')).toBeNull();
    expect(container.querySelector('[data-slot="list-row"]')).not.toHaveAttribute("data-unread");
  });

  it("marks unread rows with data-unread and localized sr-only text (never colour alone)", () => {
    // renderWithUi defaults to the `vi` locale — the indicator text comes from t(), not hardcoded.
    const { container } = renderWithUi(<ListRow unread title="Chưa đọc" />);
    expect(container.querySelector('[data-slot="list-row"]')).toHaveAttribute("data-unread", "");
    const indicator = container.querySelector('[data-slot="list-row-indicator"]');
    expect(indicator).not.toBeNull();
    expect(indicator).toHaveTextContent("Chưa đọc");
    expect(indicator!.querySelector(".sr-only")).not.toBeNull();
  });

  it("keeps the indicator gutter on read rows and announces the read state", () => {
    const { container } = renderWithUi(<ListRow unread={false} title="Đã đọc" />);
    const row = container.querySelector('[data-slot="list-row"]');
    expect(row).not.toHaveAttribute("data-unread");
    const indicator = container.querySelector('[data-slot="list-row-indicator"]');
    expect(indicator).not.toBeNull();
    expect(indicator).toHaveTextContent("Đã đọc");
  });

  it("renders the indicator BEFORE leading and body so SR announce state, then the title", () => {
    const { container } = renderWithUi(
      <ListRow unread leading={<span data-testid="lead">●</span>} title="Tiêu đề" />,
    );
    const slots = Array.from(container.querySelectorAll("[data-slot]"))
      .map((node) => node.getAttribute("data-slot"))
      .filter((slot) => slot!.startsWith("list-row"));
    expect(slots).toEqual(["list-row", "list-row-indicator", "list-row-leading", "list-row-body"]);
  });
});
