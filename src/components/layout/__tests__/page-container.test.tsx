import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderWithUi, screen } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { PageContainer } from "../page-container";
import { Button } from "../../general/button";

describe("PageContainer", () => {
  it("renders title as h1", () => {
    renderWithUi(<PageContainer title="Customers" />);
    expect(screen.getByRole("heading", { level: 1, name: "Customers" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderWithUi(<PageContainer title="Customers" subtitle="CRM list" />);
    expect(screen.getByText("CRM list")).toHaveClass("ui-page-subtitle");
  });

  it("renders extra slot in header row", () => {
    renderWithUi(<PageContainer title="Customers" extra={<Button>Create</Button>} />);
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    renderWithUi(<PageContainer title="Edit" footer={<Button>Save</Button>} />);
    expect(screen.getByRole("contentinfo")).toContainElement(
      screen.getByRole("button", { name: "Save" }),
    );
  });

  it("renders breadcrumb trail with links", () => {
    renderWithUi(
      <PageContainer
        title="Detail"
        breadcrumb={[
          { label: "CRM", to: "/crm" },
          { label: "Customers", to: "/crm/customers" },
          { label: "Detail" },
        ]}
      />,
    );
    // Accessible name is now localized via t() (test harness defaultLocale="vi") — not asserted
    // here (see the breadcrumbAriaLabel override test below for that contract); a single nav
    // landmark is unambiguous without a name filter.
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("href", "/crm");
    expect(nav).toHaveTextContent("Detail");
  });

  it("breadcrumbAriaLabel overrides the default localized nav name (landmark-unique, gh#157)", () => {
    renderWithUi(
      <PageContainer
        title="Detail"
        breadcrumb={[{ label: "CRM", to: "/crm" }, { label: "Detail" }]}
        breadcrumbAriaLabel="Custom breadcrumb name"
      />,
    );
    expect(screen.getByRole("navigation", { name: "Custom breadcrumb name" })).toBeInTheDocument();
  });

  it("applies density class on root", () => {
    const { container } = renderWithUi(<PageContainer title="Compact" density="compact" />);
    expect(container.firstChild).toHaveClass("ui-density-compact");
  });

  it("emits a stable whole-page collection preset contract", () => {
    const { container, rerender } = renderWithUi(<PageContainer title="Default" />);
    expect(container.firstChild).toHaveAttribute("data-preset", "default");

    rerender(<PageContainer title="Organizations" preset="admin-collection" />);
    expect(container.firstChild).toHaveAttribute("data-preset", "admin-collection");
  });

  it("emits no density class by default — inherits the global density axis", () => {
    // Unset density must NOT pin ui-density-default; otherwise it would override a
    // :root[data-density] axis set app-wide via AppProvider.
    const { container } = renderWithUi(<PageContainer title="Inherit" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toMatch(/ui-density-/);
  });

  it("applies variant modifier class", () => {
    const { container } = renderWithUi(<PageContainer title="List" variant="flush" />);
    expect(container.firstChild).toHaveClass("ui-page-container--flush");
  });

  it("applies sticky footer modifier when enabled", () => {
    const { container } = renderWithUi(<PageContainer title="Form" stickyFooter />);
    expect(container.firstChild).toHaveClass("ui-page-container--sticky-footer");
  });

  it("does not stretch the body by default (top-packed, no fill — gh#103)", () => {
    // Default page must NOT carry the fill modifier; the body stays content-height
    // so short pages leave no stretched void below the content.
    const { container } = renderWithUi(
      <PageContainer title="Detail">
        <p>Short content</p>
      </PageContainer>,
    );
    expect(container.firstChild).not.toHaveClass("ui-page-container--fill");
  });

  it("applies fill modifier when fill is enabled", () => {
    const { container } = renderWithUi(
      <PageContainer title="Inbox" fill>
        <p>Full-height content</p>
      </PageContainer>,
    );
    expect(container.firstChild).toHaveClass("ui-page-container--fill");
  });

  it("applies reveal-footer modifier only for footerReveal=onScroll with a sticky footer", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="Form"
        stickyFooter
        footerReveal="onScroll"
        footer={<Button>Save</Button>}
      >
        <p>Body</p>
      </PageContainer>,
    );
    // mounted (footer present) but not revealed at the top — no data-revealed yet
    expect(container.firstChild).toHaveClass("ui-page-container--reveal-footer");
    expect(container.firstChild).not.toHaveAttribute("data-revealed");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("does not add the reveal modifier for the default footerReveal=always", () => {
    const { container } = renderWithUi(
      <PageContainer title="Form" stickyFooter footer={<Button>Save</Button>}>
        <p>Body</p>
      </PageContainer>,
    );
    expect(container.firstChild).not.toHaveClass("ui-page-container--reveal-footer");
  });

  it("renders children in page body", () => {
    renderWithUi(
      <PageContainer title="Page">
        <p>Body content</p>
      </PageContainer>,
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("reveals the sticky footer once the header scrolls out of the viewport (IntersectionObserver)", () => {
    // Drive the useFooterReveal IntersectionObserver: capture the callback and the
    // observed header, then simulate it leaving the scroll viewport.
    let ioCallback: IntersectionObserverCallback | null = null;
    let observedEl: Element | null = null;
    const disconnect = vi.fn();
    class MockIO {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe(el: Element) {
        observedEl = el;
      }
      disconnect = disconnect;
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    }
    vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);

    const { container, unmount } = renderWithUi(
      <PageContainer
        title="Form"
        stickyFooter
        footerReveal="onScroll"
        footer={<Button>Save</Button>}
      >
        <p>Body</p>
      </PageContainer>,
    );

    expect(ioCallback).toBeInstanceOf(Function);
    expect(observedEl).toBe(container.querySelector("header"));
    // header not intersecting → footer revealed
    act(() => {
      ioCallback!(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(container.firstChild).toHaveAttribute("data-revealed", "true");

    // header back in view → revealed clears
    act(() => {
      ioCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(container.firstChild).not.toHaveAttribute("data-revealed");

    unmount();
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("walks up to the nearest scrollable ancestor as the observer root", () => {
    // Give the header an ancestor with overflowY:auto so scrollParent returns it
    // (exercises the scrollParent while-loop and the overflow branch).
    let root: Element | Document | null | undefined;
    class MockIO {
      constructor(_cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
        root = opts?.root;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      rootMargin = "";
      thresholds = [];
    }
    vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);

    const scroller = document.createElement("div");
    scroller.style.overflowY = "auto";
    document.body.appendChild(scroller);
    renderWithUi(
      <PageContainer
        title="Form"
        stickyFooter
        footerReveal="onScroll"
        footer={<Button>Save</Button>}
      >
        <p>Body</p>
      </PageContainer>,
      { container: scroller },
    );
    expect(root).toBe(scroller);

    scroller.remove();
    vi.unstubAllGlobals();
  });

  it("does not set up an observer when the footer is absent even with onScroll", () => {
    const ctor = vi.fn();
    class MockIO {
      constructor(cb: IntersectionObserverCallback) {
        ctor(cb);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    }
    vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);
    renderWithUi(<PageContainer title="No footer" stickyFooter footerReveal="onScroll" />);
    expect(ctor).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("renders the inset slot", () => {
    renderWithUi(
      <PageContainer.Inset className="extra">
        <p>Inset body</p>
      </PageContainer.Inset>,
    );
    const inset = screen.getByText("Inset body").parentElement;
    expect(inset).toHaveClass("ui-page-container-inset", "extra");
  });

  it("renders a breadcrumb item without a link as plain text", () => {
    renderWithUi(
      <PageContainer title="Detail" breadcrumb={[{ label: "Root" }, { label: "Leaf" }]} />,
    );
    // first item has no `to` → rendered as span, not a link
    expect(screen.queryByRole("link", { name: "Root" })).toBeNull();
    expect(screen.getByText("Root")).toBeInTheDocument();
  });

  /*
   * Responsive inline header arrangement (gh#231). jsdom has no layout engine and evaluates no
   * media query, so the geometry is asserted here as a DOM + CSS contract; the live numbers were
   * measured in Chromium against this exact stylesheet at 390px (reported on the issue):
   *
   *   headerLayout="stack" (default) → extra wraps BELOW the subtitle, at x=16
   *   headerLayout="responsive-inline" → extra stays on the title row, at x=198 / 176px wide
   */
  describe("headerLayout (gh#231)", () => {
    const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
    const layoutTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/semantic/layout.css"),
      "utf8",
    );

    it("keeps the historical stacked arrangement by default", () => {
      const { container } = renderWithUi(
        <PageContainer title="Members" subtitle="All members" extra={<Button>Search</Button>} />,
      );

      expect(container.querySelector("header")).toHaveAttribute("data-layout", "stack");
      // `stack` matches no rule in the stylesheet — the default geometry is literally untouched.
      expect(layoutCss).not.toMatch(/\[data-layout="stack"\]/);
    });

    it("opts into the inline arrangement", () => {
      const { container } = renderWithUi(
        <PageContainer
          title="Members"
          subtitle="All members"
          headerLayout="responsive-inline"
          extra={<Button>Search</Button>}
        />,
      );

      expect(container.querySelector("header")).toHaveAttribute("data-layout", "responsive-inline");
      // The title band is addressable, so it can absorb the space `extra` no longer takes.
      expect(container.querySelector(".ui-page-header-heading")).toContainElement(
        screen.getByRole("heading", { level: 1, name: "Members" }),
      );
    });

    it("owns the inline extra measure as a token, scoped to the compact range", () => {
      expect(layoutTokens).toMatch(/--page-header-extra-measure:\s*11rem/);
      expect(layoutCss).toMatch(
        /@media \(max-width: 639\.98px\) \{[\s\S]*?\[data-layout="responsive-inline"\] \.ui-page-header-extra \{[^}]*inline-size:\s*var\(--page-header-extra-measure\)/,
      );
      // No raw pixel measure — the knob is the only route.
      expect(layoutCss).not.toMatch(/inline-size:\s*\d+px/);
    });

    it("has no a11y violations in the inline arrangement", async () => {
      await expectNoA11yViolations(
        <PageContainer
          title="Members"
          subtitle="All members"
          headerLayout="responsive-inline"
          extra={<Button>Search</Button>}
        >
          <p>Body content</p>
        </PageContainer>,
      );
    });
  });

  /*
   * Bounded page measure (gh#245 notification feed / gh#247 invitations inbox). jsdom has no
   * layout engine, so the geometry is asserted here as a DOM + stylesheet + token contract; the
   * live numbers were measured in headless Chromium against this exact stylesheet (reported on
   * both issues):
   *
   *   measure="default" 1440 → header 1440 / body content 1392 (unbounded, unchanged)
   *   measure="medium"  1440 → header 768 / body 768 → 720px VISIBLE surface, header extra and
   *                            the body card share the end edge (both at x=744 in the isolate)
   *   measure="medium"  1024 → 720px surface (identical — the cap binds at both desktop steps)
   *   measure="medium"   390 → 358px surface (nothing binds; the 16px compact gutter is intact)
   *   measure="narrow"  1440 → 624px surface (the historical variant="narrow" body width)
   */
  describe("measure (gh#245, gh#247)", () => {
    const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
    const layoutTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/semantic/layout.css"),
      "utf8",
    );

    it("is unbounded by default, and the default matches NO rule in the stylesheet", () => {
      const { container } = renderWithUi(
        <PageContainer title="Notifications" extra={<Button>Mark all read</Button>}>
          <p>Feed</p>
        </PageContainer>,
      );

      expect(container.firstChild).toHaveAttribute("data-measure", "default");
      // The inert-default contract: an existing page emits the attribute but matches no selector,
      // so its geometry is literally untouched (same precedent as data-layout="stack", gh#231).
      expect(layoutCss).not.toMatch(/\[data-measure="default"\]/);
    });

    it("opts into the medium measure", () => {
      const { container } = renderWithUi(
        <PageContainer
          title="Notifications"
          measure="medium"
          extra={<Button>Mark all read</Button>}
        >
          <p>Feed</p>
        </PageContainer>,
      );
      expect(container.firstChild).toHaveAttribute("data-measure", "medium");
    });

    it("caps the HEADER and the BODY together — not the body alone like variant='narrow'", () => {
      // The whole point of the axis (gh#245): variant="narrow" leaves the header action at the
      // page edge because only .ui-page-body is capped.
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-measure="medium"\] \.ui-page-header,\s*\.ui-page-container\[data-measure="medium"\] \.ui-page-toolbar,\s*\.ui-page-container\[data-measure="medium"\] \.ui-page-body \{\s*max-inline-size: var\(--page-measure-medium\);/,
      );
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-measure="narrow"\] \.ui-page-header,\s*\.ui-page-container\[data-measure="narrow"\] \.ui-page-toolbar,\s*\.ui-page-container\[data-measure="narrow"\] \.ui-page-body \{\s*max-inline-size: var\(--page-measure-narrow\);/,
      );
      // Legacy variant stays body-only — untouched, so existing pages do not move.
      expect(layoutCss).toMatch(
        /\.ui-page-container--narrow \.ui-page-body \{\s*max-width: 42rem;/,
      );
    });

    it("owns both measures as tokens — no raw pixel measure in the stylesheet", () => {
      expect(layoutTokens).toMatch(/--page-measure-narrow:\s*42rem/);
      expect(layoutTokens).toMatch(/--page-measure-medium:\s*48rem/);
      // The measure rules never hard-code a length; the token is the only route (rule #45).
      expect(layoutCss).not.toMatch(/max-inline-size:\s*\d+(?:\.\d+)?(?:px|rem)/);
    });

    it("uses the logical inline axis so the measure flips under RTL", () => {
      // max-inline-size (not max-width) keeps the cap on the inline axis, and the flex column's
      // cross-axis start is the inline start — so the bounded page hugs the correct edge in `rtl`.
      expect(layoutCss).not.toMatch(/\[data-measure="[a-z]+"\][^{]*\{[^}]*max-width:/);
    });

    it("is orthogonal to variant and headerLayout — the canonical quiet feed composes", () => {
      // gh#245: ghost owned the quiet header rhythm but could not also be measure-bounded,
      // because chrome and measure were ONE variant axis. Three independent props now.
      const { container } = renderWithUi(
        <PageContainer
          title="Notifications"
          variant="ghost"
          measure="medium"
          headerLayout="responsive-inline"
          extra={<Button>Mark all read</Button>}
        >
          <p>Feed</p>
        </PageContainer>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("ui-page-container--ghost");
      expect(root).toHaveAttribute("data-measure", "medium");
      expect(container.querySelector("header")).toHaveAttribute("data-layout", "responsive-inline");
    });

    it("keeps the header quiet by default — the divider stays a service opt-in (rule #44)", () => {
      // No new chrome token was needed for gh#245's "quiet header": the divider already defaults
      // to the quietest state and is read through a token, and ghost drops the header pad too.
      expect(layoutTokens).toMatch(/--page-header-divider:\s*none;/);
      expect(layoutCss).toMatch(/border-bottom: var\(--page-header-divider\);/);
      expect(layoutCss).toMatch(
        /\.ui-page-container--ghost \.ui-page-header \{\s*border-bottom: var\(--page-header-divider, none\);\s*padding-bottom: 0;/,
      );
    });

    it("ghost silences an INHERITED header divider, never an explicit one", () => {
      // The same bug the toolbar band already had, one element up. Hard-setting `none` here threw
      // away an EXPLICIT `--page-header-divider` as well as the nothing it meant to block, so a
      // service could opt its page chrome into a rule and a ghost page would still refuse to draw
      // it. Measured against a consumer chat design: the design carries TWO rules in the top chrome
      // (channel head y=47, work band y=88) and the app rendered ONE (y=133) — the missing y=47 is
      // this declaration eating the divider the service had already turned on. Re-declaring the
      // property from the SAME knob with a `none` fallback keeps "nothing inherits in" while
      // letting the opt-in through, and the default (--page-header-divider: none) is byte-identical
      // to the hard-set version.
      const ghostHeader =
        layoutCss.match(/\.ui-page-container--ghost \.ui-page-header \{[^}]*\}/)?.[0] ?? "";
      expect(ghostHeader).toMatch(/border-bottom: var\(--page-header-divider, none\);/);
      expect(ghostHeader).not.toMatch(/border-bottom: none;/);
      // Header and band answer the question the same way — one page chrome, not two policies.
      const ghostBand =
        layoutCss.match(/\.ui-page-container--ghost \.ui-page-toolbar \{[^}]*\}/)?.[0] ?? "";
      expect(ghostBand).toMatch(/border-block-end: var\(--page-toolbar-divider, none\);/);
    });

    it("does NOT touch ghost's padding-bottom: 0 — that half really is the quiet one", () => {
      // The two halves of the ghost header rule are different kinds of decision. The pad answers
      // "how loud is this chrome", no token mediates it, and it is the half a quiet page actually
      // wants; only the border half was ever a policy about someone else's opt-in. A fix to one
      // must not drift into the other.
      const ghostHeader =
        layoutCss.match(/\.ui-page-container--ghost \.ui-page-header \{[^}]*\}/)?.[0] ?? "";
      expect(ghostHeader).toMatch(/padding-bottom: 0;/);
      expect(ghostHeader).not.toMatch(/padding-bottom: var\(/);
      // …and the non-ghost header still takes the token-owned pad, so ghost is the only page that
      // drops it.
      expect(layoutCss).toMatch(/padding-bottom: var\(--page-header-pad-bottom\);/);
    });

    it("has no a11y violations in the bounded quiet feed composition", async () => {
      await expectNoA11yViolations(
        <PageContainer
          title="Notifications"
          subtitle="Unread first"
          variant="ghost"
          measure="medium"
          headerLayout="responsive-inline"
          extra={<Button>Mark all read</Button>}
        >
          <p>Feed content</p>
        </PageContainer>,
      );
    });
  });

  /*
   * `toolbar` — the FIXED chrome band between the header and the body. jsdom runs no layout and
   * evaluates no media query, so the geometry is asserted the way `headerLayout` / `measure`
   * already are: DOM order here, and the CSS SOURCE for everything a layout engine would decide.
   * What the source has to prove is that the band is OUTSIDE the `fill` scroll viewport — the
   * whole reason the slot exists, instead of a call-site `position: sticky` strip.
   */
  describe("toolbar", () => {
    const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
    const layoutTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/semantic/layout.css"),
      "utf8",
    );

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

    /** The band's own rule — several blocks mention `.ui-page-toolbar`, only this one IS it. */
    const toolbarBand = layoutCss.match(/\n {2}\.ui-page-toolbar \{[^}]*\}/)?.[0] ?? "";
    // The compact step re-decides the container's spacing tokens, so it has to be read apart.
    const compactCss = bodyOf(layoutCss, /@media \(max-width: 720px\) \{/);

    it("renders NOTHING when the prop is omitted — no element, no gap", () => {
      const { container } = renderWithUi(
        <PageContainer title="Channel">
          <p>Transcript</p>
        </PageContainer>,
      );
      expect(container.querySelector(".ui-page-toolbar")).toBeNull();
      // The container's children are exactly header + body: no empty wrapper is emitted, so the
      // flex column gains no extra gap on a page that never passes a toolbar.
      const root = container.firstChild as HTMLElement;
      expect([...root.children].map((el) => el.className)).toEqual([
        "ui-page-header",
        "ui-page-body",
      ]);
    });

    it("renders the band BETWEEN the header and the body, in that DOM order", () => {
      const { container } = renderWithUi(
        <PageContainer
          title="Channel"
          toolbar={<Button>Unread</Button>}
          footer={<Button>Send</Button>}
        >
          <p>Transcript</p>
        </PageContainer>,
      );
      const root = container.firstChild as HTMLElement;
      const order = [...root.children].map((el) =>
        el.tagName === "HEADER" || el.tagName === "FOOTER"
          ? el.tagName.toLowerCase()
          : el.className,
      );
      expect(order).toEqual(["header", "ui-page-toolbar", "ui-page-body", "footer"]);
      expect(container.querySelector(".ui-page-toolbar")).toContainElement(
        screen.getByRole("button", { name: "Unread" }),
      );
    });

    it("stays OUT of the fill scroll viewport — flex: none, and the scroller is the body alone", () => {
      // The contract this slot exists for: with `fill` the BODY owns overflow, so the band is a
      // plain flex item beside it and content can never travel underneath. A `position: sticky`
      // strip inside the scroller cannot give that.
      expect(layoutCss).toMatch(/\.ui-page-toolbar \{\s*flex: none;/);
      expect(layoutCss).toMatch(
        /\.ui-page-container--fill \.ui-page-body \{\s*flex: 1;\s*min-height: 0;\s*overflow-y: auto;/,
      );
      // The band declares no overflow and no sticky positioning of its own.
      const band = layoutCss.match(/\n {2}\.ui-page-toolbar \{[^}]*\}/)?.[0] ?? "";
      expect(band).not.toMatch(/position:|overflow/);
    });

    it("takes the page gutters and the measure cap from the SAME rules as the header and body", () => {
      // One source for all three bands is what keeps them flush at both edges — the alternative
      // (a private toolbar gutter knob) is exactly how a strip drifts off the title's axis.
      expect(layoutCss).toMatch(
        /\.ui-page-header,\s*\.ui-page-toolbar,\s*\.ui-page-body,\s*\.ui-page-footer \{\s*padding-inline-start: var\(--space-page-active-x\);/,
      );
      const { container } = renderWithUi(
        <PageContainer title="Feed" measure="medium" toolbar={<Button>Filter</Button>}>
          <p>Body</p>
        </PageContainer>,
      );
      expect(container.firstChild).toHaveAttribute("data-measure", "medium");
    });

    it("goes full-bleed under variant='flush', where PageContainer.Inset re-aligns its content", () => {
      expect(layoutCss).toMatch(
        /\.ui-page-container--flush \.ui-page-toolbar,\s*\.ui-page-container--flush \.ui-page-body \{\s*padding-inline-start: 0;/,
      );
      const { container } = renderWithUi(
        <PageContainer
          variant="flush"
          title="Entries"
          toolbar={
            <PageContainer.Inset>
              <Button>Approved</Button>
            </PageContainer.Inset>
          }
        >
          <p>Table</p>
        </PageContainer>,
      );
      expect(container.querySelector(".ui-page-toolbar > .ui-page-container-inset")).not.toBeNull();
    });

    it("owns its inset and rule as tokens, both quiet by default (rule #44)", () => {
      expect(layoutTokens).toMatch(/--page-toolbar-pad-block:\s*0px;/);
      // `initial` + a CALL-SITE fallback, so a scoped override of the header divider still
      // reaches the band (a `:root` binding would freeze it) — docs/TOKENS.md.
      expect(layoutTokens).toMatch(/--page-toolbar-divider:\s*initial;/);
      expect(layoutCss).toMatch(
        /border-block-end: var\(--page-toolbar-divider, var\(--page-header-divider\)\);/,
      );
      // ghost is the quiet chrome variant — it must silence the INHERITED rule, and only that.
      // It re-declares the property with a `none` fallback rather than hard-setting `none`, so a
      // theme that explicitly opts the band into a rule still gets one. See the dedicated case.
      expect(layoutCss).toMatch(
        /\.ui-page-container--ghost \.ui-page-toolbar \{\s*border-block-end: var\(--page-toolbar-divider, none\);/,
      );
    });

    it("paints its GROUND from a token that is silent by default", () => {
      // The hole this closes: the band had a divider knob and an inset knob but NO ground knob, so
      // a design that puts the strip on the card surface left the call site with `bg-card` — the
      // hand-laid page chrome the slot exists to abolish. Default `transparent` means the band
      // renders exactly as it did before the knob existed (rule #44).
      expect(layoutTokens).toMatch(/--page-toolbar-background:\s*transparent;/);
      const band = layoutCss.match(/\n {2}\.ui-page-toolbar \{[^}]*\}/)?.[0] ?? "";
      expect(band).toMatch(/background: var\(--page-toolbar-background\);/);
      // NO fallback in the var(): the token is bound at :root (its default is a plain keyword, not
      // another role token), so a theme declaration is the only thing that can decide the ground.
      expect(band).not.toMatch(/var\(--page-toolbar-background,/);
      // …and no literal colour anywhere in the band's own rule (rule #44/#46).
      expect(band).not.toMatch(/hsl\(|rgb\(|#[0-9a-f]{3}/i);
    });

    it("routes the ground, the inset and the rule through tokens ALONE — no second declaration", () => {
      // The guard that keeps the knobs real: if any other block (flush, ghost, measure, the 720px
      // step) also declared a background or a padding on the band, a theme override would silently
      // lose to it and the call site would be back to utilities.
      const toolbarRules = [...layoutCss.matchAll(/[^{}]*\.ui-page-toolbar[^{}]*\{([^}]*)\}/g)].map(
        (match) => match[1],
      );
      expect(toolbarRules.length).toBeGreaterThan(1);
      const backgroundDeclarations = toolbarRules.filter((body) =>
        /(^|[\s;])background/.test(body),
      );
      expect(backgroundDeclarations).toEqual([
        expect.stringContaining("background: var(--page-toolbar-background);"),
      ]);
      const paddingBlockDeclarations = toolbarRules.filter((body) => /padding-block:/.test(body));
      expect(paddingBlockDeclarations).toEqual([
        expect.stringContaining("padding-block: var(--page-toolbar-pad-block);"),
      ]);
    });

    it("keeps --page-toolbar-pad-block at 0 — the DECISION, not an oversight", () => {
      // Re-examined when the ground knob landed, and again when the band went flush, and left alone
      // both times. A TRANSPARENT band is not a surface and has no inside for an inset to breathe;
      // under `fill` every pixel of band height is taken straight from the scroll viewport this slot
      // exists to protect. A theme that PAINTS or RULES the band sets the inset in the same
      // declaration — which is why `pad-block` sits beside `background` in the token file rather than
      // being folded into the band's rule. It is now the band's ONLY breathing room: the outside is
      // flush by contract (see the flush cases below), so this knob is where the air comes from.
      expect(layoutTokens).toMatch(/--page-toolbar-pad-block:\s*0px;/);
      expect(layoutTokens).toMatch(
        /--page-toolbar-background:[\s\S]{0,80}--page-toolbar-pad-block:[\s\S]{0,80}--page-toolbar-divider:/,
      );
      // The band renders with NO inline style and NO extra class, so a page that never themes it is
      // byte-identical to the pre-knob DOM.
      const { container } = renderWithUi(
        <PageContainer title="Channel" toolbar={<Button>Unread</Button>}>
          <p>Transcript</p>
        </PageContainer>,
      );
      const band = container.querySelector(".ui-page-toolbar")!;
      expect(band.getAttribute("class")).toBe("ui-page-toolbar");
      expect(band.hasAttribute("style")).toBe(false);
    });

    it("sits FLUSH against the band above and the band below — chrome is attached, not floating", () => {
      // The hole a consumer chat screen measured (1512×805): header 24/69 · band 85/134 · body
      // 150/685 — 16px of nothing on EACH side of the one element whose job is to divide. The band
      // carries a ground and a bottom rule, so floating it between two voids made the rule separate
      // nothing and cost 32px of transcript. The container's gap is right for a document page and
      // wrong for chrome, so the band cancels it from ITSELF: one declaration, and the rhythm every
      // toolbar-less page depends on is untouched.
      expect(toolbarBand).toMatch(/margin-block: calc\(-1 \* var\(--page-band-gap\)\);/);
      // …and the gap it cancels is the very number the container spaces by — read from one
      // variable, never restated as a length here (rule #46).
      expect(layoutCss).toMatch(
        /\.ui-page-container \{\s*--page-band-gap: var\(--space-section-active\);[\s\S]*?gap: var\(--page-band-gap\);/,
      );
      expect(toolbarBand).not.toMatch(/margin-block:[^;]*\d+(?:px|rem)/);
    });

    it("tracks the gap through EVERY scope that re-decides it — ghost, the 720px step, the preset", () => {
      // Why the number goes through a variable instead of `calc(-1 * var(--space-section-active))`
      // straight in the band's rule: three separate scopes re-decide the container's gap, and a
      // hard-coded negation would only LOOK right today, because --space-stack-md and
      // --space-section-active both resolve to 16px. Retune --space-section in a service theme and
      // a ghost page's band would overlap or float by the difference, silently.
      //
      // ghost swaps the gap token outright — it must do that by moving --page-band-gap, not by
      // re-declaring `gap`, or the band would cancel a gap the container is no longer using.
      expect(layoutCss).toMatch(
        /\.ui-page-container--ghost \{\s*--page-band-gap: var\(--space-stack-md\);\s*\}/,
      );
      expect(layoutCss).not.toMatch(/\.ui-page-container--ghost \{\s*gap:/);
      // The 720px step and the admin-collection preset both move --space-section-active ON THE
      // CONTAINER, so --page-band-gap re-resolves there and the band's margin follows by
      // inheritance. Neither one may restate a gap or a band margin of its own.
      expect(compactCss).toMatch(/\.ui-page-container \{[^}]*--space-section-active:/);
      expect(compactCss).not.toMatch(/--page-band-gap|\.ui-page-toolbar/);
      const presetRule =
        layoutCss.match(/\.ui-page-container\[data-preset="admin-collection"\] \{[^}]*\}/)?.[0] ??
        "";
      expect(presetRule).toMatch(/--space-section-active: var\(--admin-collection-section-gap\);/);
      expect(presetRule).not.toMatch(/gap:/);
      // Exactly one band cancels the gap. The header, the body and the footer keep the container's
      // rhythm — a page of three document blocks is what that rhythm is FOR.
      const rules = layoutCss.replace(/\/\*[\s\S]*?\*\//g, "");
      const cancelling = [...rules.matchAll(/margin-block[^;]*calc\(-1 \*/g)].map((match) => {
        const open = rules.lastIndexOf("{", match.index);
        return rules.slice(rules.lastIndexOf("}", open) + 1, open).trim();
      });
      expect(cancelling).toEqual([".ui-page-toolbar"]);
    });

    it("does not eat the page's own bottom padding when the band has nothing under it", () => {
      // The band is never the first child (the header always renders) but it CAN be the last —
      // `toolbar` with no `children`. There is no gap under a last flex item to cancel, so an
      // unguarded negation would pull the page's bottom padding in by a whole gap instead.
      expect(layoutCss).toMatch(/\.ui-page-toolbar:last-child \{\s*margin-block-end: 0;\s*\}/);
      const { container } = renderWithUi(
        <PageContainer title="Channel" toolbar={<Button>Unread</Button>} />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.lastElementChild).toHaveClass("ui-page-toolbar");
    });

    it("leaves the body↔footer gap ALONE — a known hole, and a deliberate one", () => {
      // Measured on the same chat page: body ends 684, 16px of air, the footer's hairline at 700,
      // its own 16px inset, composer at 717. Symmetric — a rule with equal air on both sides reads
      // as a separator, which is the opposite of the toolbar's defect (a painted band adrift in a
      // void). The footer is also the SHARED slot every form's Save/Cancel bar lands in, and its
      // 16px inset is a plain `padding-top`, not a knob a service could turn back up. So the chat
      // composer keeps 16px above it; closing that gap is a separate decision with a far wider
      // blast radius than one chrome band.
      // `.ui-page-footer` also closes the shared page-gutter group above; the rule that draws the
      // band is the one carrying the border.
      const footerRule =
        layoutCss.match(/\n {2}\.ui-page-footer \{[^}]*border-top[^}]*\}/)?.[0] ?? "";
      expect(footerRule).toMatch(/padding-top: var\(--space-stack-md\);/);
      expect(footerRule).toMatch(/border-top: var\(--page-footer-divider,/);
      expect(footerRule).not.toMatch(/margin-block/);
    });

    it("puts the footer's rule on the SAME contract as the other two bands — a token, not a literal", () => {
      // The third chrome band was the odd one out: the header reads --page-header-divider and the
      // band reads --page-toolbar-divider, but the footer's line was a hard-copied literal, so a
      // page could not turn it off at all. Measured on a consumer chat screen, where the composer
      // lives in this slot and is itself a bordered Card: a pixel diff against the design caught a
      // 100%-wide rule at y=701 that the design does not have — the shell's line stacked on the
      // Card's own.
      const footerRule =
        layoutCss.match(/\n {2}\.ui-page-footer \{[^}]*border-top[^}]*\}/)?.[0] ?? "";
      expect(footerRule).toMatch(
        /border-top: var\(--page-footer-divider, 1px solid hsl\(var\(--border\)\)\);/,
      );
      expect(footerRule).not.toMatch(/border-top: 1px solid/);
      // `initial` at the semantic tier, beside the other two, so a scoped [data-tenant]/.dark
      // override still reaches it — a `:root` binding would freeze it (docs/TOKENS.md).
      expect(layoutTokens).toMatch(/--page-footer-divider:\s*initial;/);
      expect(layoutTokens).toMatch(
        /--page-toolbar-divider:\s*initial;[\s\S]{0,1400}--page-footer-divider:\s*initial;/,
      );
      // All three bands now answer the same way: a knob, resolved at the CALL SITE with a fallback.
      expect(layoutCss).toMatch(/border-bottom: var\(--page-header-divider\);/);
      expect(layoutCss).toMatch(
        /border-block-end: var\(--page-toolbar-divider, var\(--page-header-divider\)\);/,
      );
    });

    it("keeps the footer's DEFAULT a rule — the one chrome knob that is loud by default", () => {
      // The other two default to silence; this one must not, and the reason is not symmetry but
      // behaviour: `footer` is the shared slot a form's Save/Cancel bar lands in, where the line
      // separating the actions from the content is what every existing page already draws. The old
      // literal is the fallback VERBATIM, so an unset token is byte-identical to the hard-coded
      // version, and `--page-footer-divider: none` is the opt-OUT (a chat composer that already
      // carries its own Card frame).
      expect(layoutTokens).toMatch(/--page-header-divider: none;/);
      expect(layoutTokens).toMatch(/--page-toolbar-divider:\s*initial;/);
      const footerRule =
        layoutCss.match(/\n {2}\.ui-page-footer \{[^}]*border-top[^}]*\}/)?.[0] ?? "";
      // The fallback is the OLD literal, verbatim — that is what makes "unset" byte-identical.
      expect(footerRule).toContain(
        "border-top: var(--page-footer-divider, 1px solid hsl(var(--border)));",
      );
    });

    it("ghost silences the INHERITED rule, not an explicit one, and leaves the GROUND alone", () => {
      // ghost is the quiet chrome WEIGHT — dividers and pads. A ground is a surface decision the
      // theme made; a variant must not undo it, or a chat page could not be both quiet and painted.
      //
      // The rule half is the same promise, one step finer. Hard-setting `none` here silenced an
      // EXPLICIT `--page-toolbar-divider` as well as the `--page-header-divider` the band would
      // otherwise inherit — so a theme could paint the band but never rule it, and the two knobs
      // disagreed about who ghost outranks. Re-declaring the property with a `none` FALLBACK keeps
      // "nothing inherits in" while letting the opt-in through. A chat shell needs exactly that:
      // a quiet header, and a workflow band that reads as its own surface above the transcript.
      const ghostRule =
        layoutCss.match(/\.ui-page-container--ghost \.ui-page-toolbar \{[^}]*\}/)?.[0] ?? "";
      expect(ghostRule).toMatch(/border-block-end: var\(--page-toolbar-divider, none\);/);
      expect(ghostRule).not.toMatch(/border-block-end: none;/);
      expect(ghostRule).not.toMatch(/background/);
    });

    it("has no a11y violations with a toolbar band on a filled page", async () => {
      await expectNoA11yViolations(
        <PageContainer
          fill
          title="Channel"
          toolbar={<Button>Unread</Button>}
          footer={<Button>Send</Button>}
          stickyFooter
        >
          <p>Transcript</p>
        </PageContainer>,
      );
    });
  });

  /*
   * `headerScale` — is the page's top row a DOCUMENT TITLE or the surface's own CHROME (a chat
   * channel, a mail thread, an IDE tab)? jsdom runs no layout and evaluates no media query, so the
   * type step is asserted the way `measure` / `toolbar` already are: the DOM contract here, and the
   * CSS SOURCE for everything a cascade would decide. The one thing this axis must NEVER do — turn
   * the `<h1>` into something smaller in the outline — is checked in the DOM, where it is real.
   */
  describe("headerScale", () => {
    const layoutCss = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
    const layoutTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/semantic/layout.css"),
      "utf8",
    );

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

    // THE responsive type step (720px) — a rule for `.ui-page-title` exists on both sides of it,
    // so the two halves have to be read apart.
    const compactCss = bodyOf(layoutCss, /@media \(max-width: 720px\) \{/);

    // THE row step (640px) — the FIRST `min-width: 640px` block in the file is the header row's,
    // and it is where `align-items` on the row is decided, so the chrome exception lives there too.
    const rowCss = bodyOf(layoutCss, /@media \(min-width: 640px\) \{/);

    it("emits NO attribute by default — an existing page is byte-identical", () => {
      const { container } = renderWithUi(<PageContainer title="Invoice INV-2041" />);
      const root = container.firstChild as HTMLElement;
      expect(root).not.toHaveAttribute("data-header-scale");
      // Present-when-on, absent-when-off (rule #44): no consumer selector has to out-specify a
      // marker that means "nothing changed".
      renderWithUi(<PageContainer title="Explicit" headerScale="document" />);
      expect(document.querySelectorAll(".ui-page-container[data-header-scale]")).toHaveLength(0);
      // …and the default title still reads the DOCUMENT step, from the token, in the base rule.
      expect(layoutCss).toMatch(/\.ui-page-title \{\s*font-size: var\(--page-title-font-size\);/);
    });

    it("publishes chrome as one attribute, and the title takes the CHROME token", () => {
      const { container } = renderWithUi(
        <PageContainer headerScale="chrome" title="# accounting" />,
      );
      expect(container.firstChild).toHaveAttribute("data-header-scale", "chrome");
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-title \{\s*font-size: var\(--page-title-font-size-chrome\);\s*\}/,
      );
      // Type is a token, never a literal (rule #46), and the chrome step is the BODY step.
      expect(layoutTokens).toMatch(/--page-title-font-size-chrome:\s*var\(--heading-h3\);/);
      expect(layoutCss).not.toMatch(/--page-title-font-size-chrome:\s*\d/);
    });

    it("keeps the <h1> an <h1> — the outline is never downgraded", () => {
      renderWithUi(<PageContainer headerScale="chrome" title="# accounting" />);
      const heading = screen.getByRole("heading", { level: 1, name: "# accounting" });
      expect(heading.tagName).toBe("H1");
      expect(heading).toHaveClass("ui-page-title");
      // The rule moves the type step and NOTHING else: no heading swap, no weight/colour change
      // that would make the row read as body text rather than a (quiet) heading.
      const chromeRule =
        layoutCss.match(
          /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-title \{[^}]*\}/,
        )?.[0] ?? "";
      expect(chromeRule).toMatch(/font-size:/);
      expect(chromeRule).not.toMatch(/font-weight:|color:|display:|line-height:/);
    });

    /*
     * The other half of the same fact: chrome sits ON the frame's edge. The container opens every
     * page with --space-page-active-y, which is a document's top margin — measured on a consumer
     * chat screen those 24px pushed an otherwise correctly-sized channel head from y=0 to y=24 and
     * took the same 24px off the transcript viewport (design 617px, app 587px). jsdom runs no
     * layout, so the geometry is asserted from the CSS SOURCE, exactly as the type step above is.
     */
    it("opens a chrome page flush with the frame, from a token, block-start only", () => {
      const paddingRule =
        layoutCss.match(/\.ui-page-container\[data-header-scale="chrome"\] \{[^}]*\}/)?.[0] ?? "";
      expect(paddingRule).toMatch(/padding-block-start: var\(--page-pad-block-start-chrome\);/);
      // Flush IS the quiet state for chrome, and it is a knob rather than a literal (rule #44).
      expect(layoutTokens).toMatch(/--page-pad-block-start-chrome:\s*0px;/);
      expect(layoutCss).not.toMatch(/--page-pad-block-start-chrome:/);
      // A document page is untouched: the shorthand still owns the default page on BOTH blocks.
      expect(layoutCss).toMatch(
        /\.ui-page-container \{[^}]*padding: var\(--space-page-active-y\) 0;/,
      );
      // `headerScale` names the HEADER, so it may speak for the top edge only. The block-end
      // belongs to `stickyFooter`, which zeroes it for its own reason — a longhand here is what
      // keeps the two axes composable instead of one silently overwriting the other.
      expect(paddingRule).not.toMatch(/padding-block-end|padding-bottom|padding:/);
      expect(layoutCss).toMatch(/\.ui-page-container--sticky-footer \{[^}]*padding-block-end: 0;/);
      // Same specificity argument as the type step: the 720px block re-declares the TOKEN
      // (--space-page-active-y), never this padding, so the flush edge holds at every width.
      expect(compactCss).not.toMatch(/padding-block-start/);
    });

    /*
     * The BAND-HEIGHT half of the same fact (gh#331). A document header is content-height, which
     * is right — a title is as tall as the title is. Chrome is furniture, and furniture has a band
     * that things centre INTO; without one, the band's vertical centre is a function of its own
     * copy. Measured in Chromium on /isolate/layout-page-container: 42.02px with an `extra`
     * control, 40.38px without, so nothing in the page could ever be aligned to it. jsdom runs no
     * layout, so the mechanism is asserted from the CSS SOURCE like every other half above; the
     * numbers came from a real engine.
     */
    it("gives the chrome band a height knob, quiet by default (gh#331)", () => {
      const bandRule =
        layoutCss.match(
          /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-header \{[^}]*\}/,
        )?.[0] ?? "";
      expect(bandRule).toMatch(/min-block-size: var\(--page-header-min-block-size-chrome\);/);
      // The floor alone would only add dead air under top-packed content; centring is the half
      // that makes it useful, and it is inert while the knob is `auto` (a column whose min IS its
      // content height has nothing to distribute).
      expect(bandRule).toMatch(/justify-content: center;/);
      // Quiet default (rule #44): `auto` is no floor at all, so every page shipped before this
      // token — document AND chrome — is byte-identical. The knob is a token, never a literal.
      expect(layoutTokens).toMatch(/--page-header-min-block-size-chrome:\s*auto;/);
      expect(layoutCss).not.toMatch(/--page-header-min-block-size-chrome:/);
      // A MIN, never a height: a taller `extra` must still fit rather than overflow its band.
      expect(bandRule).not.toMatch(/(?<!min-)block-size:|height:/);
      // The band-height axis has ONE owner, and it is the shell bar — the value a service writes
      // to put its page chrome on the same band. --centered-shell-bar-height already reads it.
      expect(layoutTokens).toMatch(/--app-shell-bar-height/);
      // Only `headerScale="chrome"` engages it: a document page emits no attribute and matches
      // nothing here, and the 720px block re-declares tokens, never these properties.
      expect(compactCss).not.toMatch(/min-block-size|justify-content/);
    });

    it("does NOT break the 720px document step — and is not pulled back UP by it", () => {
      expect(compactCss).not.toBe("");
      // The existing responsive step is untouched: a document page still steps down to h2 <=720px.
      expect(compactCss).toMatch(
        /\.ui-page-title \{\s*font-size: var\(--page-title-font-size-compact\);/,
      );
      // That step is BIGGER than the chrome step (h2 18px vs h3 14px), so a chrome header would
      // SWELL on a phone if the compact rule won. It cannot: the compact rule's selector is the
      // bare class (0,1,0) while the chrome rule is compounded with the container attribute
      // (0,2,0), which out-ranks it at any source position. The media block must therefore never
      // restate the chrome case — if it did, this axis would silently become viewport-dependent.
      expect(compactCss).not.toMatch(/data-header-scale/);
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-title/,
      );
      expect(layoutTokens).toMatch(/--page-title-font-size-compact: var\(--heading-h2\);/);
    });

    it("composes with ghost, measure and the toolbar band rather than replacing them", () => {
      // Separate props because chrome WEIGHT (ghost: no divider, no header bottom pad) and what the
      // title MEANS are separate questions — the chat surface wants both, a quiet feed only ghost.
      const { container } = renderWithUi(
        <PageContainer
          fill
          headerScale="chrome"
          variant="ghost"
          measure="medium"
          title="# accounting"
          toolbar={<Button>Unread</Button>}
        >
          <p>Transcript</p>
        </PageContainer>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-header-scale", "chrome");
      expect(root).toHaveAttribute("data-measure", "medium");
      expect(root).toHaveClass("ui-page-container--ghost", "ui-page-container--fill");
      expect(container.querySelector(".ui-page-toolbar")).not.toBeNull();
    });

    /*
     * Third consequence of the same fact: the line UNDER a chrome title is a caption on that
     * chrome, so it drops two steps of the golden scale. It shipped at --font-size-base, the
     * IDENTICAL step the chrome title takes — same size is not a hierarchy — and because the step
     * drives the line box (14px × 1.7 = 23.8px vs 11px × 1.7 = 18.9px) the band was also spending
     * ~5px of the transcript's room on it. Measured on the reference chat screen: design subtitle
     * line 14px, app 24px.
     */
    it("drops the subtitle two steps, through its own token", () => {
      const { container } = renderWithUi(
        <PageContainer headerScale="chrome" title="# accounting" subtitle="Sổ sách và hoá đơn" />,
      );
      expect(container.querySelector(".ui-page-subtitle")?.textContent).toBe("Sổ sách và hoá đơn");
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-subtitle \{\s*font-size: var\(--page-subtitle-font-size-chrome\);\s*\}/,
      );
      // A step of the shared golden scale, never a literal (rule #46) — and a SEPARATE knob that
      // sits beside the two document steps rather than redefining either of them.
      expect(layoutTokens).toMatch(/--page-subtitle-font-size-chrome:\s*var\(--font-size-2xs\);/);
      expect(layoutCss).not.toMatch(/--page-subtitle-font-size-chrome:/);
      expect(layoutTokens).toMatch(/--page-subtitle-font-size: var\(--font-size-base\);/);
      expect(layoutTokens).toMatch(/--page-subtitle-font-size-compact: var\(--font-size-sm\);/);
      // Type only. --line-height-body still owns the rhythm, so a wrapped JA/VI purpose line stays
      // readable at the smaller step; colour/weight belong to the base rule for both scales.
      const chromeSubtitleRule =
        layoutCss.match(
          /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-subtitle \{[^}]*\}/,
        )?.[0] ?? "";
      expect(chromeSubtitleRule).toMatch(/font-size:/);
      expect(chromeSubtitleRule).not.toMatch(/line-height:|color:|font-weight:|margin/);
    });

    it("out-ranks the 720px subtitle step instead of being overwritten by it", () => {
      // The compact step is already a COMPOUND selector (0,2,0) — unlike the bare `.ui-page-title`
      // — so the chrome rule only wins by carrying the container attribute on top of its own class.
      expect(compactCss).toMatch(
        /\.ui-page-header \.ui-page-subtitle \{\s*font-size: var\(--page-subtitle-font-size-compact\);/,
      );
      expect(compactCss).not.toMatch(/data-header-scale/);
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-subtitle/,
      );
      // Both halves of the responsive document step survive untouched.
      expect(compactCss).toMatch(
        /\.ui-page-title \{\s*font-size: var\(--page-title-font-size-compact\);/,
      );
    });

    /*
     * The second consequence: a chrome band's actions sit on the bar's MIDDLE. `align-items:
     * flex-start` is right for a document (actions on the first line of a tall <h1>) and wrong for
     * a bar with no tall heading — measured 8.65px of it on the reference chat screen, the icons
     * centred at y=14 against a 45.3px row whose title block centres at y=22.65.
     */
    it("centres the extra cluster on the bar, only where the row IS a row", () => {
      const { container } = renderWithUi(
        <PageContainer
          headerScale="chrome"
          title="# accounting"
          extra={<Button aria-label="Search">S</Button>}
        />,
      );
      expect(container.querySelector(".ui-page-header-extra")).not.toBeNull();
      // `align-self` on the extra box, not `align-items` on the row: the heading keeps the stretch
      // it has today, and the two alignments stay independent axes.
      expect(rowCss).toMatch(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-header-extra \{\s*align-self: center;\s*\}/,
      );
      // …and the document row it composes with is untouched.
      expect(rowCss).toMatch(
        /\.ui-page-header-row \{[^}]*flex-direction: row;[^}]*align-items: flex-start;/,
      );
      // Below 640px the row is a COLUMN: there the cross axis is horizontal, so the very same
      // declaration would centre `extra` sideways and release the full-width stretch the base rule
      // gives it. It must therefore live INSIDE the row block and nowhere else.
      const chromeExtraRules = layoutCss.match(
        /\.ui-page-container\[data-header-scale="chrome"\] \.ui-page-header-extra/g,
      );
      expect(chromeExtraRules).toHaveLength(1);
      expect(layoutCss).toMatch(
        /\.ui-page-header-row \{\s*display: flex;\s*flex-direction: column;\s*align-items: stretch;/,
      );
      expect(compactCss).not.toMatch(/align-self/);
    });

    it("has no a11y violations on a chrome-scaled chat page", async () => {
      await expectNoA11yViolations(
        <PageContainer
          fill
          headerScale="chrome"
          variant="ghost"
          title="# accounting"
          toolbar={<Button>Unread</Button>}
          footer={<Button>Send</Button>}
          stickyFooter
        >
          <p>Transcript</p>
        </PageContainer>,
      );
    });
  });

  it("has no a11y violations with header, body, and footer", async () => {
    await expectNoA11yViolations(
      <PageContainer
        title="Detail"
        subtitle="A short page"
        extra={<Button>Create</Button>}
        footer={<Button>Save</Button>}
      >
        <p>Body content</p>
      </PageContainer>,
    );
  });
});
