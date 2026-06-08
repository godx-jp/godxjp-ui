import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

import { TreeList } from "../tree-list";
import type { TreeListItem } from "../tree-list";

const ITEMS: TreeListItem[] = [
  { id: "root", title: "勘定科目", badge: "12" },
  { id: "child", title: "現金", description: "Cash on hand", depth: 1 },
  { id: "active", title: "売掛金", depth: 1, active: true },
];

describe("TreeList", () => {
  it("renders one list item per entry", () => {
    renderWithUi(<TreeList items={ITEMS} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("勘定科目")).toBeInTheDocument();
    expect(screen.getByText("現金")).toBeInTheDocument();
  });

  it("defaults depth to 0 and reflects an explicit depth", () => {
    renderWithUi(<TreeList items={ITEMS} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-depth", "0");
    expect(items[1]).toHaveAttribute("data-depth", "1");
  });

  it("marks the active item with aria-current, data-active and an sr-only prefix", () => {
    renderWithUi(<TreeList items={ITEMS} />);
    const activeItem = screen.getByText("売掛金").closest("li")!;
    expect(activeItem).toHaveAttribute("aria-current", "true");
    expect(activeItem).toHaveAttribute("data-active", "true");
    expect(activeItem).toHaveTextContent("Current:");
  });

  it("does not mark inactive items as current", () => {
    renderWithUi(<TreeList items={ITEMS} />);
    const inactive = screen.getByText("現金").closest("li")!;
    expect(inactive).not.toHaveAttribute("aria-current");
    expect(inactive).not.toHaveAttribute("data-active");
  });

  it("renders description and badge only when provided", () => {
    renderWithUi(<TreeList items={ITEMS} />);
    // child 現金 has a description; root 勘定科目 has none
    expect(screen.getByText("Cash on hand")).toBeInTheDocument();
    const rootItem = screen.getByText("勘定科目").closest("li")!;
    expect(rootItem.querySelector(".ui-tree-item-description")).toBeNull();
    // root carries the badge; 現金 does not
    expect(rootItem.querySelector(".ui-badge, [data-slot='badge']")).not.toBeNull();
    const cashItem = screen.getByText("現金").closest("li")!;
    expect(cashItem.querySelector(".ui-badge, [data-slot='badge']")).toBeNull();
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(<TreeList items={ITEMS} />);
  });
});
