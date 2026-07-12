import { Boxes, FileText, LayoutDashboard } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Sidebar, SidebarItem, SidebarSection } from "../sidebar";

const sections = [
  {
    items: [
      {
        id: "accounting",
        label: "Accounting",
        icon: Boxes,
        children: [
          { id: "journals", label: "Journals", icon: FileText },
          { id: "trial-balance", label: "Trial balance", icon: FileText },
        ],
      },
      { id: "settings", label: "Settings", icon: FileText },
    ],
  },
];

describe("Sidebar submenu", () => {
  it("renders a collapsible group and marks the parent active when a child is active", () => {
    renderWithUi(
      <Sidebar activeId="trial-balance" sections={sections} onSelect={() => undefined} />,
    );
    // Parent group trigger reads active because a descendant is active.
    const trigger = screen.getByRole("button", { name: /accounting/i });
    expect(trigger).toHaveAttribute("data-active", "true");
    // The active child is shown (group auto-opens) and marked current.
    const child = screen.getByRole("button", { name: "Trial balance" });
    expect(child).toHaveAttribute("aria-current", "page");
  });

  it("reveals a newly-active child after navigation (route-synchronized expansion)", () => {
    // A route that is NOT inside the group → the group is collapsed, child hidden.
    const { rerender } = renderWithUi(
      <Sidebar activeId="settings" sections={sections} onSelect={() => undefined} />,
    );
    expect(screen.queryByRole("button", { name: "Journals" })).toBeNull();
    // Navigating into a child route must OPEN the group and reveal the now-active child (gh#165 —
    // the old `defaultOpen` only set mount-time state and left the child hidden).
    rerender(<Sidebar activeId="journals" sections={sections} onSelect={() => undefined} />);
    const child = screen.getByRole("button", { name: "Journals" });
    expect(child).toHaveAttribute("aria-current", "page");
  });

  it("navigates when a submenu child is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Sidebar activeId="trial-balance" sections={sections} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Journals" }));
    expect(onSelect).toHaveBeenCalledWith("journals");
  });

  it("collapsed: a leaf keeps its label and clicking a group opens its submenu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Sidebar activeId="settings" sections={sections} onSelect={onSelect} collapsed />);
    // Collapsed leaf keeps an accessible name so the rail is usable (hover shows it as a tooltip).
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    // Clicking a collapsed group opens its portaled submenu menu (not on hover).
    await user.click(screen.getByRole("button", { name: "Accounting" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Journals" }));
    expect(onSelect).toHaveBeenCalledWith("journals");
  });

  it("merges renderItem's element as the row WITHOUT a nested interactive element", () => {
    renderWithUi(
      <Sidebar
        activeId="settings"
        sections={sections}
        onSelect={() => undefined}
        renderItem={(item) => <a href={`/${item.id}`}>Custom {item.label}</a>}
      />,
    );

    // The consumer's <a> IS the row (Slot merges the row class + active state onto it) — it is a
    // link, not wrapped in a <button>, so there is no nested interactive element (gh#165).
    const link = screen.getByRole("link", { name: "Custom Settings" });
    expect(link).toHaveClass("sb-nav-item");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("href", "/settings");
    expect(link.querySelector("button")).toBeNull();
    expect(screen.queryByRole("button", { name: "Custom Settings" })).toBeNull();
  });

  it("renders an item.href row as a real anchor (no nested button)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Sidebar activeId="reports" onSelect={onSelect}>
        <SidebarSection label="Links">
          <SidebarItem
            item={{ id: "reports", label: "Reports", icon: FileText, href: "/reports" }}
            active
            onActivate={onSelect}
          />
        </SidebarSection>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveAttribute("href", "/reports");
    expect(link).toHaveAttribute("aria-current", "page");
    await user.click(link);
    expect(onSelect).toHaveBeenCalledWith("reports");
  });

  it("renders custom children instead of sections", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderWithUi(
      <Sidebar activeId="custom" onSelect={onSelect}>
        <SidebarSection label="Custom Section">
          <SidebarItem
            item={{ id: "custom", label: "Custom item", icon: LayoutDashboard }}
            active={false}
            onActivate={onSelect}
          />
        </SidebarSection>
      </Sidebar>,
    );

    await user.click(screen.getByRole("button", { name: "Custom item" }));
    expect(onSelect).toHaveBeenCalledWith("custom");
  });
});
