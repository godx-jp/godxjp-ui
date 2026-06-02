import { Boxes, FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Sidebar } from "../sidebar";

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
});
