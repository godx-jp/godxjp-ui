import { FileText, Plus } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { Button } from "../../general/button";
import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";

/**
 * gh#1185 — the rail's ONE primary action ("New issue"), above the scrolling nav. It is not the
 * `brand` slot, it never scrolls with the nav, and it reads the EFFECTIVE collapsed value: the
 * docked collapsed rail gets the icon-only control, the drawer (which never collapses) the full one.
 */
const sections = [{ items: [{ id: "dashboard", label: "ダッシュボード", icon: FileText }] }];

function action(collapsed: boolean) {
  return collapsed ? (
    <Button size="sm" aria-label="課題の追加">
      <Plus />
    </Button>
  ) : (
    <Button size="sm">課題の追加（全幅）</Button>
  );
}

describe("Sidebar action slot (gh#1185)", () => {
  it("sits between the header and the scrolling nav, outside the scroll area", () => {
    const { container } = renderWithUi(
      <Sidebar
        activeId="dashboard"
        sections={sections}
        brand={<span>ロゴ</span>}
        action={<Button>課題の追加</Button>}
      />,
    );
    const root = container.querySelector(".sb-root")!;
    const children = [...root.children];
    const slot = root.querySelector('[data-slot="sidebar-action"]')!;
    const nav = root.querySelector(".sb-nav-scroll")!;
    expect(slot).toHaveTextContent("課題の追加");
    expect(nav.contains(slot)).toBe(false);
    expect(children.indexOf(slot)).toBeGreaterThan(0);
    expect(children.indexOf(slot)).toBeLessThan(children.indexOf(nav));
  });

  it("gives the docked collapsed rail the icon-only control and the drawer the full one", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebarCollapsed
        sidebar={<Sidebar activeId="dashboard" sections={sections} collapsed action={action} />}
      >
        <p>本文</p>
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: "課題の追加" })).toBeInTheDocument();
    expect(screen.queryByText("課題の追加（全幅）")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText("課題の追加（全幅）")).toBeInTheDocument();
  });

  it("draws no row when there is no action", () => {
    const { container } = renderWithUi(<Sidebar activeId="dashboard" sections={sections} />);
    expect(container.querySelector('[data-slot="sidebar-action"]')).toBeNull();
  });
});
