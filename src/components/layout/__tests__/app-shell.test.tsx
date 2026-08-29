import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
    const { container } = renderWithUi(<AppShell sidebar={<nav>n</nav>}>x</AppShell>);
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

  /*
   * NO TOP BAR AT ALL — `topbar`, `topbarLeft`, `topbarRight` and `logo` every one omitted, for a
   * shell whose PAGE owns the top row (chat, mail, an IDE). An empty bar is not free: the grid
   * reserves --app-shell-bar-height and the <header> paints a border over hsl(var(--card)), so the
   * page's own header lands on a SECOND row of chrome. jsdom runs no layout and evaluates no media
   * query, so the DOM half is asserted here and the geometry half against the CSS SOURCE — the
   * same split `topbarSpan` and the responsive-geometry suite already use.
   */
  describe("no top bar (all four bar slots omitted)", () => {
    const shellCss = readFileSync(
      resolve(process.cwd(), "src/styles/shell-layout.css"),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");

    /** Body of the block opened by `pattern`, brace-matched so a nested rule cannot truncate it. */
    const bodyOf = (css: string, pattern: RegExp): string => {
      const open = new RegExp(pattern.source, "g");
      if (!open.exec(css)) return "";
      let depth = 1;
      let index = open.lastIndex;
      while (index < css.length && depth > 0) {
        if (css[index] === "{") depth += 1;
        else if (css[index] === "}") depth -= 1;
        index += 1;
      }
      return css.slice(open.lastIndex, index - 1);
    };

    // THE one AppShell breakpoint (900px), and everything outside it — a rule for the same
    // selector exists on both sides, so the two halves have to be read apart.
    const narrowCss = bodyOf(shellCss, /@media \(width <= 56\.25rem\) \{/);
    const wideCss = shellCss.replace(narrowCss, "");

    /** Declarations of every rule in `css` whose selector LIST contains `selector` exactly. */
    const declarationsFor = (css: string, selector: string): string => {
      const blocks: string[] = [];
      const rule = /([^{}]*)\{([^{}]*)\}/g;
      let match: RegExpExecArray | null;
      while ((match = rule.exec(css)) !== null) {
        if (
          match[1]
            .split(",")
            .map((part) => part.trim())
            .includes(selector)
        ) {
          blocks.push(match[2]);
        }
      }
      return blocks.join("\n");
    };

    it("renders NO header at all, and publishes the state as one attribute", () => {
      const { container, queryByRole } = renderWithUi(
        // mobileNav={null} — no drawer either, so nothing is left for a bar to carry.
        <AppShell sidebar={<nav aria-label="主">ナビ</nav>} mobileNav={null}>
          <p>本文</p>
        </AppShell>,
      );
      expect(container.querySelector(".app-topbar")).toBeNull();
      expect(queryByRole("banner")).toBeNull();
      // One attribute on the grid element itself — not a `:has()` on whatever the consumer nested
      // inside — so the row geometry is decided by CSS alone.
      expect(container.querySelector(".app-root")).toHaveAttribute("data-topbar", "none");
      // The rest of the shell is untouched: rail and main are still landmarks.
      expect(queryByRole("complementary")).toBeInTheDocument();
      expect(queryByRole("main")).toBeInTheDocument();
    });

    it("keeps the bar the moment ANY one slot is passed, and emits no attribute then", () => {
      const { container, getByRole, getByText } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} logo={<span>ロゴ</span>}>
          x
        </AppShell>,
      );
      expect(container.querySelector(".app-topbar")).not.toBeNull();
      expect(getByRole("banner")).toBeInTheDocument();
      expect(getByText("ロゴ")).toBeInTheDocument();
      // Present-when-on, absent-when-off (rule #44): the default arrangement carries no marker, so
      // no consumer rule has to out-specify one.
      expect(container.querySelector(".app-root")).not.toHaveAttribute("data-topbar");
    });

    it("still renders the header for the drawer trigger ALONE — navigation is never unreachable", () => {
      const { container } = renderWithUi(
        // Default responsiveNavigation="drawer" with a sidebar → the drawer exists.
        <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
          <p>本文</p>
        </AppShell>,
      );
      const bar = container.querySelector(".app-topbar");
      // Below 900px the docked rail is hidden; dropping the bar there too would leave the shell
      // with no route to navigation at all — worse than the double chrome this state fixes (gh#165).
      expect(bar).not.toBeNull();
      expect(screen.getByRole("button", { name: "Mở menu điều hướng" })).toBeInTheDocument();
      // …and NOTHING else: no auto-built rail, so the bar carries no chrome of its own.
      expect(bar!.querySelector(".app-topbar-rail")).toBeNull();
      expect(bar!.children).toHaveLength(1);
      // The attribute does not soften for the drawer — CSS, not React, decides where that header
      // is allowed to occupy a row.
      expect(container.querySelector(".app-root")).toHaveAttribute("data-topbar", "none");
    });

    it("collapses the grid row to `auto`, and hides the drawer-only header above the breakpoint", () => {
      // Default: a fixed, token-sized bar row.
      expect(declarationsFor(wideCss, ".app-root")).toMatch(
        /grid-template-rows:\s*var\(--app-shell-bar-height\) minmax\(0, 1fr\) auto;/,
      );
      // Bar-less: `auto`, not a `0` literal — that is what lets ONE attribute serve every branch
      // (absent header → 0, display:none header → 0, narrow header → its own min-height).
      const barless = declarationsFor(wideCss, '.app-root[data-topbar="none"]');
      expect(barless).toMatch(/grid-template-rows:\s*auto minmax\(0, 1fr\) auto;/);
      expect(barless).not.toMatch(/grid-template-rows:\s*0/);
      // The header that survives for the hamburger is taken out of the layout by `display: none`
      // — which removes its border and its card background with it, not merely its height.
      const drawerOnlyBar = declarationsFor(wideCss, '.app-root[data-topbar="none"] > .app-topbar');
      expect(drawerOnlyBar).toMatch(/display:\s*none;/);
      expect(drawerOnlyBar).toMatch(/min-height:\s*var\(--app-shell-bar-height\);/);
    });

    it("brings the bar back at narrow widths WITHOUT restating the row template", () => {
      expect(narrowCss).not.toBe("");
      expect(declarationsFor(narrowCss, '.app-root[data-topbar="none"] > .app-topbar')).toMatch(
        /display:\s*flex;/,
      );
      // The trap this file has already paid for once (gh#213): the deleted 768px block re-declared
      // grid-template-rows with a `3rem` literal and defeated --app-shell-bar-height below 768px
      // only. The `auto` row sizes itself from the header's min-height, so nothing may restate it.
      expect(narrowCss).not.toMatch(/grid-template-rows:/);
      expect(shellCss).not.toMatch(/grid-template-rows:\s*3rem/);
    });

    it('keeps the row at 0 when topbarSpan="full" is combined with it', () => {
      const { container } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} topbarSpan="full" mobileNav={null}>
          x
        </AppShell>,
      );
      const root = container.querySelector(".app-root")!;
      expect(root).toHaveAttribute("data-topbar", "none");
      expect(root).toHaveAttribute("data-topbar-span", "full");
      expect(container.querySelector(".app-topbar")).toBeNull();
      // `full` re-declares grid-template-AREAS only, so it inherits the collapsed row template and
      // its named-but-empty "topbar topbar" row measures 0 as well. Restating rows there would
      // resurrect the empty band exactly in the arrangement that spans the whole window.
      const full = declarationsFor(shellCss, '.app-root[data-topbar-span="full"]');
      expect(full).toMatch(/grid-template-areas:/);
      expect(full).not.toMatch(/grid-template-rows:/);
    });

    it("has no axe violations without a bar", async () => {
      await expectNoA11yViolations(
        <AppShell sidebar={<nav aria-label="主">ナビ</nav>} mobileNav={null}>
          <h1>ページ</h1>
        </AppShell>,
      );
    });
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <h1>ページ</h1>
      </AppShell>,
    );
  });
});
