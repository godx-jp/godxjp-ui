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
        /\.ui-page-container--ghost \.ui-page-header \{\s*border-bottom: none;\s*padding-bottom: 0;/,
      );
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
      // Re-examined when the ground knob landed and deliberately left alone. A TRANSPARENT band has
      // no inside for an inset to breathe; the container's --space-section-active gap already
      // separates it from the header and the body; and under `fill` every pixel of band height is
      // taken straight from the scroll viewport this slot exists to protect. A theme that PAINTS or
      // RULES the band sets the inset in the same declaration — which is why `pad-block` sits beside
      // `background` in the token file rather than being folded into the band's rule.
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
