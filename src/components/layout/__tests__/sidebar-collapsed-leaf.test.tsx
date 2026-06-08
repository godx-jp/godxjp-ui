import { FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Sidebar } from "../sidebar";

describe("Sidebar — collapsed leaf navigation", () => {
  it("clicking a collapsed leaf icon navigates via onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Sidebar
        sections={[{ items: [{ id: "dash", label: "ダッシュボード", icon: FileText }] }]}
        collapsed
        activeId=""
        onSelect={onSelect}
      />,
    );
    // a collapsed leaf renders as an icon button (no children → not a flyout)
    await user.click(screen.getByRole("button", { name: "ダッシュボード" }));
    expect(onSelect).toHaveBeenCalledWith("dash"); // !hasChildren && !disabled → onSelect
  });
});
