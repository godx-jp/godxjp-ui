import { Boxes, FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { Sidebar } from "../sidebar";

/**
 * gh#1493 — the rail drew only two clickable levels under a section heading: a child's own
 * `children` were dropped, so 人事 → 労務 → 算定基礎届 could not be reached and consumers had to
 * flatten a task tree. A child with children is now a group one level down, on the expanded rail
 * and in the collapsed-rail flyout.
 */
const sections = [
  {
    label: "人事",
    items: [
      {
        id: "hr",
        label: "Employees",
        icon: Boxes,
        children: [
          { id: "roster", label: "Roster", href: "/hr/roster" },
          {
            id: "labour",
            label: "Labour",
            children: [
              { id: "santei", label: "Standard remuneration", href: "/hr/labour/santei" },
              { id: "insurance", label: "Social insurance", href: "/hr/labour/insurance" },
            ],
          },
        ],
      },
      { id: "home", label: "Home", icon: FileText, href: "/" },
    ],
  },
];

describe("Sidebar — three clickable levels under a section (gh#1493)", () => {
  it("renders a grandchild as a link, marks it aria-current and opens both ancestors", () => {
    renderWithUi(<Sidebar sections={sections} activeId="santei" />);
    const leaf = screen.getByRole("link", { name: "Standard remuneration" });
    expect(leaf).toHaveAttribute("aria-current", "page");
    expect(leaf).toHaveAttribute("href", "/hr/labour/santei");
    // Both ancestors read active and are expanded, so the active page is visible on arrival.
    for (const name of ["Employees", "Labour"]) {
      const trigger = screen.getByRole("button", { name });
      expect(trigger).toHaveAttribute("data-active", "true");
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    }
    // The level-2 group trigger is a sub-row, like its leaf siblings.
    expect(screen.getByRole("button", { name: "Labour" })).toHaveClass("sb-nav-item--sub");
  });

  it("a level-3 row is reachable by expanding its group, and reports its selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Sidebar sections={sections} activeId="home" onSelect={onSelect} />);
    expect(screen.queryByRole("link", { name: "Social insurance" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Employees" }));
    await user.click(screen.getByRole("button", { name: "Labour" }));
    await user.click(screen.getByRole("link", { name: "Social insurance" }));
    expect(onSelect).toHaveBeenCalledWith("insurance");
  });

  it("a leaf child with no children is still a plain sub-row link (negative case)", () => {
    renderWithUi(<Sidebar sections={sections} activeId="roster" />);
    const roster = screen.getByRole("link", { name: "Roster" });
    expect(roster).toHaveAttribute("aria-current", "page");
    expect(roster).toHaveClass("sb-nav-item--sub");
    expect(screen.queryByRole("button", { name: "Roster" })).toBeNull();
  });

  it("the collapsed-rail flyout lists grandchildren under a labelled group", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Sidebar sections={sections} collapsed activeId="santei" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Employees" }));
    const group = screen.getByRole("group", { name: "Labour" });
    const leaf = within(group).getByRole("menuitem", { name: "Standard remuneration" });
    expect(leaf).toHaveAttribute("aria-current", "page");
    await user.click(within(group).getByRole("menuitem", { name: "Social insurance" }));
    expect(onSelect).toHaveBeenCalledWith("insurance");
  });
});
