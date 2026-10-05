import { describe, expect, it } from "vitest";
import { FileText, Folder } from "lucide-react";

import { CommandPalette } from "../command-palette";
import { renderWithUi, screen } from "@/test/render";

/** gh#1159 — a quick switcher's folder / file / emoji icons, before the label, decorative. */
const labels = {
  open: "Search pages",
  title: "Command palette",
  description: "Search for a page",
  placeholder: "Search…",
  empty: "No results",
  loading: "Loading",
  move: "Move",
  select: "Open",
  close: "Close",
};

const groups = [
  {
    id: "pages",
    label: "Pages",
    items: [
      { id: "folder", label: "Guides", icon: <Folder /> },
      { id: "file", label: "Setup", icon: <FileText /> },
      { id: "emoji", label: "Release", icon: "🚀" },
      { id: "plain", label: "Plain" },
    ],
  },
];

describe("CommandPaletteItem icon (gh#1159)", () => {
  it("puts a decorative icon before the label; the label stays the option's name", async () => {
    renderWithUi(
      <CommandPalette
        groups={groups}
        labels={labels}
        onSelect={() => {}}
        open
        onOpenChange={() => {}}
      />,
    );
    const guides = await screen.findByRole("option", { name: "Guides" });
    const icon = guides.querySelector(".ui-command-palette-icon");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon!.nextElementSibling).toHaveClass("ui-command-palette-label");
    expect(
      screen.getByRole("option", { name: "Release" }).querySelector(".ui-command-palette-icon"),
    ).toHaveTextContent("🚀");
    // No icon, no empty slot.
    expect(
      screen.getByRole("option", { name: "Plain" }).querySelector(".ui-command-palette-icon"),
    ).toBeNull();
  });
});
