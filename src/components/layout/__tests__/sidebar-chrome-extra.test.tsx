import { Boxes, FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Sidebar } from "../sidebar";

const leaf = [{ items: [{ id: "x", label: "X", icon: FileText }] }];

describe("Sidebar — product chrome edges", () => {
  it("falls back to '?' for an empty product name initial", () => {
    const { container } = renderWithUi(
      <Sidebar sections={leaf} activeId="x" product={{ name: "" }} />,
    );
    expect(container.querySelector(".sb-logo-mark")?.textContent).toBe("?");
  });

  it("omits the role/tenant line when the product has no role", () => {
    const { container } = renderWithUi(
      <Sidebar sections={leaf} activeId="x" product={{ name: "Acme" }} />,
    );
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(container.querySelector(".sb-product-tenant")).toBeNull();
  });
});

describe("Sidebar — collapsed flyout disabled child", () => {
  it("clicking a disabled child does not navigate", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const sections = [
      {
        items: [
          {
            id: "acct",
            label: "Accounting",
            icon: Boxes,
            children: [
              { id: "journals", label: "Journals", icon: FileText },
              { id: "locked", label: "Locked", icon: FileText, disabled: true },
            ],
          },
        ],
      },
    ];
    renderWithUi(<Sidebar sections={sections} collapsed activeId="journals" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Accounting" }));
    await user.click(screen.getByRole("menuitem", { name: "Locked" }));
    expect(onSelect).not.toHaveBeenCalled(); // child.disabled → skip onSelect
  });
});
