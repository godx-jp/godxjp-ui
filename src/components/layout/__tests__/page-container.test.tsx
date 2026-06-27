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
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CRM" })).toHaveAttribute("href", "/crm");
    expect(nav).toHaveTextContent("Detail");
  });

  it("applies density class on root", () => {
    const { container } = renderWithUi(<PageContainer title="Compact" density="compact" />);
    expect(container.firstChild).toHaveClass("ui-density-compact");
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
      <PageContainer title="Form" stickyFooter footerReveal="onScroll" footer={<Button>Save</Button>}>
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
      <PageContainer title="Form" stickyFooter footerReveal="onScroll" footer={<Button>Save</Button>}>
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
      <PageContainer title="Form" stickyFooter footerReveal="onScroll" footer={<Button>Save</Button>}>
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
      <PageContainer
        title="Detail"
        breadcrumb={[{ label: "Root" }, { label: "Leaf" }]}
      />,
    );
    // first item has no `to` → rendered as span, not a link
    expect(screen.queryByRole("link", { name: "Root" })).toBeNull();
    expect(screen.getByText("Root")).toBeInTheDocument();
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
