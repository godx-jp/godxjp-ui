import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Inbox } from "lucide-react";

import { EmptyState } from "../empty-state";

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "my-8";

/** The root by its slot — not by `role="status"`, which is opt-in since gh#1271 (`live`). */
const slot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="empty-state"]');

describe("EmptyState", () => {
  it("renders title only (no icon / description / action)", () => {
    const { container } = render(<EmptyState title="データなし" />);
    const root = slot(container);
    expect(root).toHaveTextContent("データなし");
    expect(container.querySelector(".ui-empty-state-icon")).toBeNull();
    expect(container.querySelector(".ui-empty-state-description")).toBeNull();
  });

  it("renders the icon, description and action when provided", () => {
    const { container, getByText, getByRole } = render(
      <EmptyState
        icon={Inbox}
        title="受信箱は空です"
        description="新しい仕訳はありません。"
        action={<button>更新</button>}
      />,
    );
    expect(container.querySelector(".ui-empty-state-icon")).toBeInTheDocument();
    expect(getByText("新しい仕訳はありません。")).toBeInTheDocument();
    expect(getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("forwards className to the root", () => {
    const { container } = render(<EmptyState title="x" className={CONSUMER_CLASS} />);
    expect(slot(container)).toHaveClass(CONSUMER_CLASS);
  });

  it("exposes restrained section and compact variants", () => {
    const { getByRole, rerender, container } = render(
      <EmptyState icon={Inbox} title="None" variant="section" />,
    );
    expect(slot(container)).toHaveAttribute("data-variant", "section");
    expect(getByRole("heading", { level: 3, name: "None" })).toBeInTheDocument();
    rerender(<EmptyState icon={Inbox} title="None" variant="compact" />);
    expect(slot(container)).toHaveAttribute("data-variant", "compact");
    expect(container.querySelector(".ui-empty-state-icon")).toBeNull();
  });

  it("renders the title as an <h3> by default (unchanged)", () => {
    const { getByRole } = render(<EmptyState title="データなし" />);
    const heading = getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading).toHaveClass("ui-empty-state-title");
  });

  it("renders the title at the requested `titleLevel` for a valid page outline", () => {
    const { getByRole, rerender } = render(<EmptyState title="なし" titleLevel={2} />);
    expect(getByRole("heading", { level: 2 }).tagName).toBe("H2");
    rerender(<EmptyState title="なし" titleLevel={4} />);
    expect(getByRole("heading", { level: 4 }).tagName).toBe("H4");
  });

  it("renders the title as a non-heading element via `titleAs` (section already has a heading)", () => {
    const { queryByRole, getByText } = render(
      <EmptyState variant="compact" title="保留中の招待はありません" titleAs="p" />,
    );
    expect(queryByRole("heading")).toBeNull();
    const title = getByText("保留中の招待はありません");
    expect(title.tagName).toBe("P");
    expect(title).toHaveClass("ui-empty-state-title");
  });

  it("defaults to the muted tone and reflects a semantic tone via data-tone", () => {
    const { container, rerender } = render(<EmptyState icon={Inbox} title="なし" />);
    expect(slot(container)).toHaveAttribute("data-tone", "muted");
    rerender(<EmptyState icon={Inbox} title="承認済み" tone="success" />);
    expect(slot(container)).toHaveAttribute("data-tone", "success");
  });

  // gh#1271 — a static empty state is content, not a status message (WCAG 4.1.3).
  it("is not a live region by default", () => {
    const { container, queryByRole } = render(<EmptyState title="まだ記録がありません" />);
    expect(queryByRole("status")).toBeNull();
    expect(slot(container)).not.toHaveAttribute("role");
    expect(slot(container)).not.toHaveAttribute("aria-live");
  });

  it("`live` announces it as a status — the result of a search or filter", () => {
    const { getByRole } = render(<EmptyState live title="該当する結果はありません" />);
    expect(getByRole("status")).toHaveAttribute("data-slot", "empty-state");
    expect(getByRole("status")).toHaveTextContent("該当する結果はありません");
  });
});
