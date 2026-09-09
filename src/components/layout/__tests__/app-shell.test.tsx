import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LayoutDashboard } from "lucide-react";
import { describe, expect, it } from "vitest";

import { AppShell } from "../app-shell";
import { Sidebar } from "../sidebar";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";
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

  describe("navRail — the second navigation column", () => {
    it("adds no track at all when the slot is empty", () => {
      const { container } = renderWithUi(<AppShell sidebar={<nav>n</nav>}>x</AppShell>);
      const root = container.querySelector(".app-root")!;
      // Absent, not `data-nav-rail="false"`: the two-column shell is the bare grid, so a
      // consumer's CSS never has to out-specify a default marker.
      expect(root).not.toHaveAttribute("data-nav-rail");
      expect(container.querySelector(".app-nav-rail")).toBeNull();
    });

    it("publishes the track and renders the rail as its own labelled landmark", () => {
      const { container, getByText, getAllByRole } = renderWithUi(
        <AppShell sidebar={<nav>ナビ</nav>} navRail={<nav>レール</nav>}>
          x
        </AppShell>,
      );
      expect(container.querySelector(".app-root")).toHaveAttribute("data-nav-rail");
      expect(getByText("レール")).toBeInTheDocument();
      // TWO complementary landmarks, and ARIA requires them to be tellable apart by name. The
      // shipped consumer attempt at this shape got its landmark count wrong; the shell owns it now.
      const complementary = getAllByRole("complementary");
      expect(complementary).toHaveLength(2);
      const names = complementary.map((el) => el.getAttribute("aria-label"));
      expect(new Set(names).size).toBe(2);
      expect(names.every((n) => n && n.length > 0)).toBe(true);
    });

    it("names the rail from the DS by default, and lets the consumer override", () => {
      // Deliberately NOT a required prop: the sidebar gets a default name, and two columns of the
      // same rank must behave the same way rather than one throwing at runtime.
      const { container, rerender } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} navRail={<nav>r</nav>}>
          x
        </AppShell>,
      );
      const railName = () => container.querySelector(".app-nav-rail")!.getAttribute("aria-label");
      expect(railName()).toBeTruthy();
      rerender(
        <AppShell sidebar={<nav>n</nav>} navRail={<nav>r</nav>} navRailLabel="組織">
          x
        </AppShell>,
      );
      expect(railName()).toBe("組織");
    });

    it("puts the rail before the sidebar in source, and both after a full-width bar", () => {
      // Source order IS focus order. The rail is the leftmost column, so it leads under the
      // default span; under `full` the bar sits visibly above both and must lead instead.
      const { container, rerender } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} navRail={<nav>r</nav>} logo={<span>L</span>}>
          x
        </AppShell>,
      );
      const order = () =>
        [...container.querySelector(".app-root")!.children].map((c) => c.className.split(" ")[0]);
      expect(order().slice(0, 3)).toEqual(["app-nav-rail", "app-sidebar", "app-topbar"]);
      rerender(
        <AppShell
          sidebar={<nav>n</nav>}
          navRail={<nav>r</nav>}
          logo={<span>L</span>}
          topbarSpan="full"
        >
          x
        </AppShell>,
      );
      expect(order().slice(0, 3)).toEqual(["app-topbar", "app-nav-rail", "app-sidebar"]);
    });

    it("carries the rail into the mobile drawer alongside the sidebar", async () => {
      // BOTH docked columns are hidden below 900px. A `sidebar`-only drawer default would delete
      // every app-level destination the rail carries — reachable on a laptop, gone on a phone.
      const { getByRole } = renderWithUi(
        <AppShell sidebar={<nav>サイド項目</nav>} navRail={<nav>レール項目</nav>}>
          x
        </AppShell>,
      );
      await userEvent.click(getByRole("button", { name: /navigation|ナビ|menu|điều hướng/i }));
      const drawer = await screen.findByRole("dialog");
      expect(within(drawer).getByText("レール項目")).toBeInTheDocument();
      expect(within(drawer).getByText("サイド項目")).toBeInTheDocument();
    });

    it("still honours an explicit mobileNav, and opting out with null", () => {
      const { container } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} navRail={<nav>r</nav>} mobileNav={null}>
          x
        </AppShell>,
      );
      // `null` means "navigation lives elsewhere" — no trigger, but the rail track still exists.
      expect(container.querySelector(".app-mobile-nav-trigger")).toBeNull();
      expect(container.querySelector(".app-nav-rail")).not.toBeNull();
    });

    it("composes with sidebarCollapsed without collapsing the rail's own markup", () => {
      const { container } = renderWithUi(
        <AppShell sidebar={<nav>n</nav>} navRail={<nav>レール</nav>} sidebarCollapsed>
          x
        </AppShell>,
      );
      const root = container.querySelector(".app-root")!;
      expect(root).toHaveAttribute("data-collapsed", "true");
      expect(root).toHaveAttribute("data-nav-rail");
      // Collapse is a track-width question answered in CSS; the rail's content is untouched.
      expect(container.querySelector(".app-nav-rail")!.textContent).toBe("レール");
    });

    it("has no axe violations with both navigation columns present", async () => {
      // Two `complementary` landmarks in one page is exactly the shape axe's `landmark-unique`
      // rule polices, so this is the case worth running through it.
      await expectNoA11yViolations(
        <AppShell
          sidebar={<nav aria-label="セクション">ナビ</nav>}
          navRail={<nav aria-label="ワークスペース">レール</nav>}
          logo={<span>L</span>}
        >
          <h1>ページ</h1>
        </AppShell>,
      );
    });
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

  it("a custom topbar replaces the default rail but KEEPS the logo", () => {
    const { getByText } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} topbar={<div>カスタム</div>} logo={<span>ロゴ</span>}>
        x
      </AppShell>,
    );
    expect(getByText("カスタム")).toBeInTheDocument();
    // The logo is part of the shell's chrome, not one of the bar's content slots. This case used
    // to assert the opposite — that a custom `topbar` swallowed it — which pinned a real defect in
    // place: two consumer apps passed both props and rendered no brand at all for months, with no
    // error and no warning, because the bar still had other content and looked right.
    expect(getByText("ロゴ")).toBeInTheDocument();
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
    // AppShell renders its own hamburger — the mobile nav is never merely hidden.
    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });

    expect(trigger).toBeInTheDocument();
    // Việc ẩn hiện do CSS sở hữu trọn vẹn, KHÔNG phải utility. Trước đây nút mang
    // `hidden max-[900px]:inline-flex`, mà Tailwind biên dịch max-[900px] thành `width < 900px`
    // trong khi luật CSS dùng `width <= 56.25rem`, tức bao gồm cả 900. Vì utility nằm sau
    // components nên đúng ở 900px thanh bên đã ẩn còn nút chưa hiện: một khe chết rộng 1px.
    expect(trigger).toHaveClass("app-mobile-nav-trigger");
    expect(trigger.className).not.toContain("max-[");
    expect(trigger.className.split(/\s+/)).not.toContain("hidden");
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

  it("builds its own drawer trigger as a BAR CELL, not a Button (the rule it states to consumers)", () => {
    // A Button in a bar is a --control-height pill floating in a taller strip, with its own hover
    // fill and its own focus ring — the shell was doing it on the ONE control that is the only
    // navigation a phone has (measured 40x28 in a 48px bar, still 28 when the coarse-pointer bar
    // grows to 56). `.ui-topbar-item` stretches to the bar instead.
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );

    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    expect(trigger).toHaveClass("ui-topbar-item");
    expect(trigger.className).not.toMatch(/\bui-button\b/);
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
      // with no route to navigation at all — worse than the double chrome this state fixes.
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

    it("brings the bar back at narrow widths without ever restating the row template as a literal", () => {
      expect(narrowCss).not.toBe("");
      expect(declarationsFor(narrowCss, '.app-root[data-topbar="none"] > .app-topbar')).toMatch(
        /display:\s*flex;/,
      );
      // The trap this file has already paid for once: the deleted 768px block re-declared
      // grid-template-rows with a `3rem` LITERAL and defeated --app-shell-bar-height below 768px
      // only. A rail on a block edge legitimately restates the rows here (its fourth row has to go
      // with the hidden rail), so the rule is about the VALUES, not about the property appearing.
      for (const rows of narrowCss.matchAll(/grid-template-rows:([^;]+);/g)) {
        expect(rows[1]).not.toMatch(/\d+(\.\d+)?(px|rem|em)/);
        expect(rows[1]).toMatch(/var\(--app-shell-bar-height\)/);
      }
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

  it("keeps the drawer open when the tap opens something instead of going somewhere", async () => {
    /*
     * Reported from a phone: tapping the organization switcher in the drawer's rail closed the
     * whole drawer, taking the panel it had just opened with it (the panel is portalled, so the
     * drawer's dismissal reaches it).
     *
     * The close rule shipped as "any button except `.sb-nav-group-trigger`" — the only disclosure
     * the drawer had at the time. It now reads the attributes a control must carry anyway for
     * assistive tech, so every future overlay trigger is covered the day it is added rather than
     * the day someone remembers to add its class here.
     */
    const user = userEvent.setup();

    renderWithUi(
      <AppShell
        sidebar={
          <div>
            <button type="button" aria-haspopup="dialog" aria-expanded="false">
              Switch organization
            </button>
            <a href="/reports">Reports</a>
          </div>
        }
      >
        <p>body</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch organization" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // A destination still closes it — that is the mobile pattern this rule exists for.
    await user.click(screen.getByRole("link", { name: "Reports" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("gives the drawer the same two columns the docked shell has, when a rail exists", async () => {
    /*
     * Stacked, the rail sat above the section list with an empty band between them, and it forced
     * a choice neither answer survives: honour `collapsed` and the whole drawer is anonymous
     * glyphs; drop it and the rail's app switcher becomes a second full-width list you cannot tell
     * from the sections beneath it. Two columns dissolve that — the rail is narrow again, so it
     * keeps `collapsed`, and only the section column is told it is a drawer.
     */
    const user = userEvent.setup();

    renderWithUi(
      <AppShell
        navRail={
          <Sidebar
            aria-label="Apps"
            activeId="general"
            collapsed
            sections={[
              { items: [{ id: "general", label: "General", href: "/", icon: LayoutDashboard }] },
            ]}
          />
        }
        sidebar={
          <Sidebar
            aria-label="Sections"
            activeId="reports"
            collapsed
            sections={[
              {
                items: [
                  { id: "reports", label: "Reports", href: "/reports", icon: LayoutDashboard },
                ],
              },
            ]}
          />
        }
        sidebarCollapsed
      >
        <p>body</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    const drawer = await screen.findByRole("dialog");

    const rail = drawer.querySelector(".app-mobile-nav-rail");
    const sections = drawer.querySelector(".app-mobile-nav-sections");
    expect(rail).not.toBeNull();
    expect(sections).not.toBeNull();

    // The rail is a narrow column again, so its own answer stands.
    expect(rail!.querySelector('.sb-root[data-collapsed="true"]')).not.toBeNull();
    // The section column is the drawer proper, and a drawer shows labels.
    expect(sections!.querySelector('.sb-root[data-collapsed="true"]')).toBeNull();
    expect(within(sections as HTMLElement).getByText("Reports")).toBeVisible();
  });

  it("does not carry a desktop collapse into the mobile drawer", async () => {
    /*
     * `collapsed` trades labels for horizontal room in a DOCKED column. The drawer has no such
     * pressure, and below the breakpoint it is the only navigation there is — so honouring the
     * desktop answer there leaves the user with nothing but glyphs.
     *
     * Measured in a consumer before this: sidebar collapsed at 1280px, resized to 393px, drawer
     * opened — organization mark plus five unlabelled icons, no text anywhere. That repo's own
     * browser test is named "desktop sidebar collapse stays independent from the mobile navigation
     * drawer" and had been asserting exactly this the whole time.
     */
    const user = userEvent.setup();
    const sidebar = (
      <Sidebar
        aria-label="Sections"
        activeId="reports"
        collapsed
        sections={[
          { items: [{ id: "reports", label: "Reports", href: "/reports", icon: LayoutDashboard }] },
        ]}
      />
    );

    renderWithUi(
      <AppShell sidebar={sidebar} sidebarCollapsed>
        <p>body</p>
      </AppShell>,
    );

    // Docked: the consumer's own answer stands, so the rail stays a rail.
    expect(document.querySelector('.app-sidebar .sb-root[data-collapsed="true"]')).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /menu/i }));
    const drawer = await screen.findByRole("dialog");

    expect(within(drawer).getByText("Reports")).toBeVisible();
    expect(drawer.querySelector('.sb-root[data-collapsed="true"]')).toBeNull();
  });
});

describe("AppShell without a sidebar", () => {
  it.each([undefined, null, false])("omits the empty navigation landmark for %s", (sidebar) => {
    const { queryByRole, getByRole } = renderWithUi(
      <AppShell sidebar={sidebar} logo="Workspace" topbar="Utilities" sidebarCollapsed>
        <p>Dashboard</p>
      </AppShell>,
    );
    expect(queryByRole("complementary")).toBeNull();
    expect(getByRole("banner")).toHaveTextContent("Workspace");
    expect(getByRole("banner")).toHaveTextContent("Utilities");
    expect(getByRole("main")).toHaveTextContent("Dashboard");
    expect(queryByRole("button", { name: /menu|navigation/i })).toBeNull();
  });

  it("keeps an independent rail and restores the sidebar when supplied", () => {
    const { getAllByRole, rerender } = renderWithUi(
      <AppShell navRail={<nav>Applications</nav>}>Dashboard</AppShell>,
    );
    expect(getAllByRole("complementary")).toHaveLength(1);
    rerender(
      <AppShell navRail={<nav>Applications</nav>} sidebar={<nav>Project</nav>}>
        Issues
      </AppShell>,
    );
    expect(getAllByRole("complementary")).toHaveLength(2);
  });

  it("has no accessibility violations without a sidebar", async () => {
    await expectNoA11yViolations(
      <AppShell topbar="Workspace">
        <h1>Dashboard</h1>
      </AppShell>,
    );
  });
});
