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
    ],
  },
];

describe("Sidebar — collapsed group flyout", () => {
  it("opens a group flyout, marks the active child and navigates on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(<Sidebar sections={sections} collapsed activeId="journals" onSelect={onSelect} />);
    // the collapsed group renders as an icon button
    await user.click(screen.getByRole("button", { name: "Accounting" }));
    // flyout menu opens with the children as menuitems
    const active = screen.getByRole("menuitem", { name: "Journals" });
    expect(active).toHaveAttribute("data-active", "true"); // activeId matches
    await user.click(screen.getByRole("menuitem", { name: "Trial balance" }));
    expect(onSelect).toHaveBeenCalledWith("trial-balance");
  });
});
