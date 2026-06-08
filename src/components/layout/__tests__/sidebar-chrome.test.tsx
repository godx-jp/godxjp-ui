import { FileText } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Sidebar } from "../sidebar";

const sections = [{ items: [{ id: "x", label: "X", icon: FileText }] }];

describe("Sidebar — brand / product / footer chrome", () => {
  it("renders a brand block when brand is provided", () => {
    renderWithUi(<Sidebar sections={sections} brand={<span>BRAND</span>} activeId="x" />);
    expect(screen.getByText("BRAND")).toBeInTheDocument();
  });

  it("renders a product switcher (name + role + initial) and fires onProductClick", async () => {
    const user = userEvent.setup();
    const onProductClick = vi.fn();
    renderWithUi(
      <Sidebar
        sections={sections}
        activeId="x"
        product={{ name: "Acme", role: "管理者", color: "#123456" }}
        onProductClick={onProductClick}
      />,
    );
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("管理者")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // uppercased initial
    await user.click(screen.getByRole("button", { name: "Acme" }));
    expect(onProductClick).toHaveBeenCalled();
  });

  it("collapsed product hides the name/role meta but keeps the initial", () => {
    renderWithUi(<Sidebar sections={sections} activeId="x" collapsed product={{ name: "Acme" }} />);
    // the meta text is hidden when collapsed (the aria-label still names the button)
    expect(screen.queryByText("Acme")).toBeNull();
    expect(screen.getByRole("button", { name: "Acme" })).toBeInTheDocument();
  });

  it("renders a footer slot", () => {
    renderWithUi(<Sidebar sections={sections} activeId="x" footer={<span>FOOT</span>} />);
    expect(screen.getByText("FOOT")).toBeInTheDocument();
  });
});
