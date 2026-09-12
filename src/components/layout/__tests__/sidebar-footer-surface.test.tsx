import { FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";

/**
 * `footer` follows the EFFECTIVE collapsed state, exactly like `brand` (see
 * sidebar-brand-surface.test.tsx). Both slots live INSIDE the collapsible rail, so both need the
 * value the rows actually render with — and a consumer node is built outside this component and
 * cannot see it. Before gh#516 the footer had no correct move at all: reading the consumer's own
 * `collapsed` renders a glyph-only footer in the full-width drawer, building a second Sidebar for
 * `AppShell.mobileNav` is the override that turns `railInDrawer` off, and doing neither leaves the
 * expanded footer to reflow inside a 64px rail (measured 255x66 docked -> 63x111 collapsed).
 */

const sections = [{ items: [{ id: "dashboard", label: "ダッシュボード", icon: FileText }] }];

function footer(collapsed: boolean) {
  return <span>{collapsed ? "山" : "山田 太郎 · オンライン"}</span>;
}

describe("Sidebar footer slot follows the nav surface", () => {
  it("renders the collapsed lockup docked and the full lockup in the drawer, from ONE node", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebarCollapsed
        sidebar={<Sidebar activeId="dashboard" sections={sections} collapsed footer={footer} />}
      >
        <p>本文</p>
      </AppShell>,
    );

    // Docked: collapsed === true, so the short lockup.
    expect(screen.getByText("山")).toBeInTheDocument();
    expect(screen.queryByText("山田 太郎 · オンライン")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));

    // Drawer: collapse is a desktop answer, so the full lockup — from the SAME Sidebar node.
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText("山田 太郎 · オンライン")).toBeInTheDocument();
  });

  it("still accepts a plain node, unchanged", () => {
    const { container } = renderWithUi(
      <AppShell
        sidebar={<Sidebar activeId="dashboard" sections={sections} footer={<span>固定</span>} />}
      >
        <p>本文</p>
      </AppShell>,
    );

    expect(screen.getByText("固定")).toBeInTheDocument();
    expect(container.querySelector(".sb-footer")).toHaveTextContent("固定");
  });

  it("draws NO footer chrome when the function returns nothing for this surface", () => {
    // `.sb-footer` carries a top border and 8px of padding. A function that decides the rail is
    // too narrow for a footer must be able to say so without leaving an empty ruled strip behind.
    const { container } = renderWithUi(
      <AppShell
        sidebarCollapsed
        sidebar={
          <Sidebar
            activeId="dashboard"
            sections={sections}
            collapsed
            footer={(collapsed) => (collapsed ? null : <span>フッタ</span>)}
          />
        }
      >
        <p>本文</p>
      </AppShell>,
    );

    expect(container.querySelector(".app-sidebar .sb-footer")).toBeNull();
  });
});
