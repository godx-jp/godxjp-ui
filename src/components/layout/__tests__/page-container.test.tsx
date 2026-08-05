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
        /\.ui-page-container\[data-measure="medium"\] \.ui-page-header,\s*\.ui-page-container\[data-measure="medium"\] \.ui-page-body \{\s*max-inline-size: var\(--page-measure-medium\);/,
      );
      expect(layoutCss).toMatch(
        /\.ui-page-container\[data-measure="narrow"\] \.ui-page-header,\s*\.ui-page-container\[data-measure="narrow"\] \.ui-page-body \{\s*max-inline-size: var\(--page-measure-narrow\);/,
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
