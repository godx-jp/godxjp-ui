import { FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";

/**
 * `brand` follows the EFFECTIVE collapsed state, so a consumer stops needing a second hand-built
 * Sidebar for the drawer — and therefore stops passing the `mobileNav` override that silently
 * turns off the drawer's `navRail` strip.
 */

const sections = [{ items: [{ id: "dashboard", label: "ダッシュボード", icon: FileText }] }];

function brand(collapsed: boolean) {
  return <span>{collapsed ? "GX" : "GoDX コンソール"}</span>;
}

describe("Sidebar brand slot follows the nav surface", () => {
  it("renders the collapsed lockup docked and the full lockup in the drawer, from ONE node", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebarCollapsed
        sidebar={<Sidebar activeId="dashboard" sections={sections} collapsed brand={brand} />}
      >
        <p>本文</p>
      </AppShell>,
    );

    // Docked: collapsed === true, so the short mark.
    expect(screen.getByText("GX")).toBeInTheDocument();
    expect(screen.queryByText("GoDX コンソール")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));

    // Drawer: collapse is a desktop answer, so the full lockup — no second Sidebar built for it.
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText("GoDX コンソール")).toBeInTheDocument();
  });

  it("still accepts a plain node, unchanged", () => {
    renderWithUi(
      <AppShell sidebar={<Sidebar activeId="dashboard" sections={sections} brand={<span>固定</span>} />}>
        <p>本文</p>
      </AppShell>,
    );

    expect(screen.getByText("固定")).toBeInTheDocument();
  });

  it("lets the navRail reach the drawer, because no mobileNav override is needed", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebarCollapsed
        navRail={<nav aria-label="組織">レール</nav>}
        sidebar={<Sidebar activeId="dashboard" sections={sections} collapsed brand={brand} />}
      >
        <p>本文</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));

    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText("レール")).toBeInTheDocument();
    expect(within(drawer).getByText("GoDX コンソール")).toBeInTheDocument();
  });
});
