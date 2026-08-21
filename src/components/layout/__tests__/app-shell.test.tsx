import { LayoutDashboard } from "lucide-react";
import { describe, expect, it } from "vitest";

import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AppShell", () => {
  it("renders the sidebar, main and children as labelled landmarks", () => {
    const { getByRole, getByText } = renderWithUi(
      <AppShell sidebar={<nav>ナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    // <aside> = complementary, <main> = main, <header> = banner
    expect(getByRole("complementary")).toBeInTheDocument();
    expect(getByRole("main")).toHaveAttribute("tabindex", "0");
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByText("ナビ")).toBeInTheDocument();
    expect(getByText("本文")).toBeInTheDocument();
  });

  it("spans the topbar over the content only, by default", () => {
    const { container } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>}>x</AppShell>,
    );
    const root = container.querySelector(".app-root")!;
    // No attribute at all rather than data-topbar-span="content": the default arrangement is the
    // bare grid, so a consumer's CSS never has to out-specify a default marker.
    expect(root).not.toHaveAttribute("data-topbar-span");
    // Source order is the accessible order, and here the rail is what the eye reaches first.
    const regions = [...root.children].map((c) => c.tagName.toLowerCase());
    expect(regions.slice(0, 2)).toEqual(["aside", "header"]);
  });

  it('topbarSpan="full" puts the bar before the rail so focus follows the eye', () => {
    const { container } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} topbarSpan="full">
        x
      </AppShell>,
    );
    const root = container.querySelector(".app-root")!;
    expect(root).toHaveAttribute("data-topbar-span", "full");
    // The point of the prop that a grid area alone cannot deliver: with the bar rendered above the
    // rail, leaving <aside> first in source would send Tab into the sidebar while the bar sits
    // visibly above it — a focus order that contradicts the visual one (WCAG 2.4.3 / 1.3.2).
    const regions = [...root.children].map((c) => c.tagName.toLowerCase());
    expect(regions.slice(0, 2)).toEqual(["header", "aside"]);
  });

  it('topbarSpan="full" changes only the row assignment, not the landmarks', () => {
    const { getByRole, getByText } = renderWithUi(
      <AppShell sidebar={<nav>ナビ</nav>} topbarSpan="full">
        <p>本文</p>
      </AppShell>,
    );
    // Reordering regions in source is exactly the kind of change that quietly drops one.
    expect(getByRole("complementary")).toBeInTheDocument();
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByRole("main")).toHaveAttribute("tabindex", "0");
    expect(getByText("ナビ")).toBeInTheDocument();
    expect(getByText("本文")).toBeInTheDocument();
  });

  it("composes the default topbar from logo / left / right slots", () => {
    const { getByText } = renderWithUi(
      <AppShell
        sidebar={<nav>n</nav>}
        logo={<span>ロゴ</span>}
        topbarLeft={<span>左</span>}
        topbarRight={<span>右</span>}
      >
        x
      </AppShell>,
    );
    expect(getByText("ロゴ")).toBeInTheDocument();
    expect(getByText("左")).toBeInTheDocument();
    expect(getByText("右")).toBeInTheDocument();
  });

  it("a custom topbar overrides the default rail", () => {
    const { getByText, queryByText } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} topbar={<div>カスタム</div>} logo={<span>ロゴ</span>}>
        x
      </AppShell>,
    );
    expect(getByText("カスタム")).toBeInTheDocument();
    expect(queryByText("ロゴ")).toBeNull();
  });

  it("renders breadcrumb + footer slots when provided", () => {
    const { getByText, getByRole } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} breadcrumb={<div>パンくず</div>} footer={<div>フッタ</div>}>
        x
      </AppShell>,
    );
    expect(getByText("パンくず")).toBeInTheDocument();
    expect(getByRole("contentinfo")).toBeInTheDocument();
  });

  it("reflects sidebarCollapsed via a data attribute", () => {
    const { container } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} sidebarCollapsed>
        x
      </AppShell>,
    );
    expect(container.querySelector(".app-root")).toHaveAttribute("data-collapsed", "true");
  });

  it("exposes the responsive navigation strategy and keeps drawer as the default", () => {
    const { container, rerender } = renderWithUi(<AppShell sidebar={<nav>n</nav>}>x</AppShell>);
    expect(container.querySelector(".app-root")).toHaveAttribute(
      "data-responsive-navigation",
      "drawer",
    );

    rerender(
      <AppShell sidebar={<nav>n</nav>} responsiveNavigation="docked">
        x
      </AppShell>,
    );
    expect(container.querySelector(".app-root")).toHaveAttribute(
      "data-responsive-navigation",
      "docked",
    );
    expect(screen.queryByRole("button", { name: "Mở menu điều hướng" })).toBeNull();
  });

  it("owns a mobile nav drawer trigger with an accessible name (defaults to the sidebar node)", () => {
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">サイドナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    // AppShell renders its own hamburger — the mobile nav is never merely hidden (gh#165).
    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("hidden", "max-[900px]:inline-flex");
  });

  it("opens a focus-trapped drawer and returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebar={<nav aria-label="主">サイドナビ</nav>}
        mobileNav={<nav aria-label="モバイル">ドロワーナビ</nav>}
      >
        <p>本文</p>
      </AppShell>,
    );
    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    await user.click(trigger);
    // Drawer is a dialog (Sheet) with the localized title, containing the mobile nav.
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("ドロワーナビ")).toBeInTheDocument();
    // Esc closes and focus returns to the trigger (Radix Dialog focus management).
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("owns canonical drawer width, backdrop and click-out focus restoration", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebar={<nav aria-label="主">サイドナビ</nav>}
        mobileNav={<nav aria-label="モバイル">ドロワーナビ</nav>}
      >
        <p>本文</p>
      </AppShell>,
    );

    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    expect(dialog.style.getPropertyValue("--sheet-width")).toBe(
      "var(--app-shell-mobile-nav-width)",
    );
    expect(dialog).toHaveClass("app-mobile-nav-drawer");

    const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement;
    expect(overlay).toHaveClass("app-mobile-nav-overlay");
    await user.click(overlay);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("keeps the mobile drawer navigation expanded when the docked sidebar is collapsed", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell sidebar={<nav aria-label="Main">Dashboard settings</nav>} sidebarCollapsed>
        <p>Content</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Dashboard settings");
  });

  it("does not double-pad a Sidebar in the drawer at a 390px mobile viewport (gh#211)", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
    try {
      const user = userEvent.setup();
      renderWithUi(
        <AppShell
          sidebar={
            <Sidebar
              ariaLabel="主"
              activeId="dashboard"
              sections={[
                { items: [{ id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard }] },
              ]}
              onSelect={() => undefined}
            />
          }
        >
          <p>本文</p>
        </AppShell>,
      );

      await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));
      await screen.findByRole("dialog");

      const body = document.querySelector('[data-slot="sheet-body"]') as HTMLElement;
      // The drawer body's inline inset is the AppShell knob, NOT the generic 24px sheet chrome
      // inset — otherwise it stacks on the Sidebar's own --sidebar-nav-scroll-padding and every
      // nav row sits ~32px from the drawer edge on a 390px screen.
      expect(body).toHaveClass("app-mobile-nav-body", "px-[var(--app-shell-mobile-nav-inset)]");
      expect(body.className).not.toContain("px-[var(--sheet-pad-x)]");
      // Full-bleed pull-out is preserved, so the collapsed inset is measured from the drawer edge.
      expect(body.className).toContain("-mx-[var(--sheet-pad-x)]");
      // The Sidebar is the node inside that body — it owns the remaining inset.
      expect(body.querySelector(".sb-root")).not.toBeNull();
      expect(body.querySelector(".sb-nav-scroll")).not.toBeNull();
    } finally {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
      window.dispatchEvent(new Event("resize"));
    }
  });

  it("mobileNav={null} opts out — no drawer trigger is rendered", () => {
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">n</nav>} mobileNav={null}>
        x
      </AppShell>,
    );
    expect(screen.queryByRole("button", { name: "Mở menu điều hướng" })).toBeNull();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <h1>ページ</h1>
      </AppShell>,
    );
  });
});
