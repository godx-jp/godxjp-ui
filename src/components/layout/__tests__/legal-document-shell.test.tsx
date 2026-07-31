import type * as React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { LegalDocumentShell } from "../legal-document-shell";
import type { LegalDocumentSectionProp } from "../../../props/components/layout.prop";
import { renderWithUi } from "@/test/render";

const SECTIONS: LegalDocumentSectionProp[] = [
  { id: "acceptance", title: "1. Acceptance of terms", content: <p>You accept these terms.</p> },
  { id: "accounts", title: "2. Accounts", content: <p>You are responsible for your account.</p> },
  { id: "data", title: "3. Data retention", content: <p>We retain records for 7 years.</p> },
];

function renderLocalized(ui: React.ReactElement, locale: "en" | "ja" | "vi") {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    ),
  });
}

/** Drive the scroll spy: capture the IO callback + observed nodes, then fire entries by hand. */
function stubIntersectionObserver() {
  const state = {
    callback: null as IntersectionObserverCallback | null,
    observed: [] as Element[],
    disconnected: false,
    options: undefined as IntersectionObserverInit | undefined,
  };

  class MockIO {
    constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      state.callback = cb;
      state.options = options;
    }
    observe(element: Element) {
      state.observed.push(element);
    }
    unobserve() {}
    disconnect() {
      state.disconnected = true;
    }
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIO as unknown as typeof IntersectionObserver);
  return state;
}

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = "";
});

describe("LegalDocumentShell", () => {
  it("renders article / nav / section landmarks with REAL anchors to each section", () => {
    renderWithUi(<LegalDocumentShell title="Terms of Service" sections={SECTIONS} />);

    // <article> named by the <h1>.
    expect(screen.getByRole("article", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeInTheDocument();

    // A NAMED contents nav (landmark-unique) holding one real anchor per section.
    const nav = screen.getByRole("navigation", { name: "Mục lục" });
    for (const section of SECTIONS) {
      const link = screen.getByRole("link", { name: section.title });
      expect(nav).toContainElement(link);
      expect(link).toHaveAttribute("href", `#${section.id}`);
      // The section is a real, focusable, labelled region with the same id as the anchor target.
      const heading = screen.getByRole("heading", { level: 2, name: section.title });
      const element = document.getElementById(section.id);
      expect(element?.tagName).toBe("SECTION");
      expect(element).toContainElement(heading);
      expect(element).toHaveAttribute("tabindex", "-1");
    }
  });

  it("marks the first section active by default and never signals it by colour alone", () => {
    renderWithUi(<LegalDocumentShell title="Terms" sections={SECTIONS} />);

    const first = screen.getByRole("link", { name: SECTIONS[0]!.title });
    expect(first).toHaveAttribute("aria-current", "location");
    expect(first).toHaveAttribute("data-active");

    expect(screen.getByRole("link", { name: SECTIONS[1]!.title })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("honours defaultActiveSection and moves the marker on activation (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onActiveSectionChange = vi.fn();
    renderWithUi(
      <LegalDocumentShell
        title="Terms"
        sections={SECTIONS}
        defaultActiveSection="accounts"
        onActiveSectionChange={onActiveSectionChange}
      />,
    );

    expect(screen.getByRole("link", { name: SECTIONS[1]!.title })).toHaveAttribute(
      "aria-current",
      "location",
    );

    await user.click(screen.getByRole("link", { name: SECTIONS[2]!.title }));

    expect(onActiveSectionChange).toHaveBeenCalledWith("data");
    expect(screen.getByRole("link", { name: SECTIONS[2]!.title })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: SECTIONS[1]!.title })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("stays controlled when activeSection is supplied — the consumer owns the state", async () => {
    const user = userEvent.setup();
    const onActiveSectionChange = vi.fn();
    renderWithUi(
      <LegalDocumentShell
        title="Terms"
        sections={SECTIONS}
        activeSection="acceptance"
        onActiveSectionChange={onActiveSectionChange}
      />,
    );

    await user.click(screen.getByRole("link", { name: SECTIONS[2]!.title }));

    expect(onActiveSectionChange).toHaveBeenCalledWith("data");
    // The prop still wins — no internal state leak.
    expect(screen.getByRole("link", { name: SECTIONS[0]!.title })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: SECTIONS[2]!.title })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("navigates by hash, scrolls with the section offset, and hands focus to the section", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    renderWithUi(<LegalDocumentShell title="Terms" sections={SECTIONS} />);
    await user.click(screen.getByRole("link", { name: SECTIONS[2]!.title }));

    expect(window.location.hash).toBe("#data");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    // Keyboard/screen-reader users land INSIDE the section, not back at the top of the page.
    expect(document.activeElement).toBe(document.getElementById("data"));
  });

  it("degrades the smooth scroll to an instant jump under prefers-reduced-motion", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }));

    renderWithUi(<LegalDocumentShell title="Terms" sections={SECTIONS} />);
    await user.click(screen.getByRole("link", { name: SECTIONS[1]!.title }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("selects the deep-linked section when the URL already carries its hash", () => {
    window.location.hash = "#data";
    const onActiveSectionChange = vi.fn();

    renderWithUi(
      <LegalDocumentShell
        title="Terms"
        sections={SECTIONS}
        onActiveSectionChange={onActiveSectionChange}
      />,
    );

    expect(onActiveSectionChange).toHaveBeenCalledWith("data");
    expect(screen.getByRole("link", { name: SECTIONS[2]!.title })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("tracks the reader with a scroll spy and keeps document order when sections overlap", () => {
    const io = stubIntersectionObserver();
    const onActiveSectionChange = vi.fn();

    renderWithUi(
      <LegalDocumentShell
        title="Terms"
        sections={SECTIONS}
        onActiveSectionChange={onActiveSectionChange}
      />,
    );

    expect(io.observed).toHaveLength(SECTIONS.length);
    expect(io.options?.rootMargin).toBe("-10% 0px -75% 0px");

    const entryFor = (id: string, isIntersecting: boolean) =>
      ({
        target: document.getElementById(id) as Element,
        isIntersecting,
      }) as IntersectionObserverEntry;

    // The reader scrolls onto section 3.
    act(() => io.callback?.([entryFor("data", true)], {} as IntersectionObserver));
    expect(onActiveSectionChange).toHaveBeenLastCalledWith("data");
    expect(screen.getByRole("link", { name: SECTIONS[2]!.title })).toHaveAttribute(
      "aria-current",
      "location",
    );

    // Two short sections share the band → the earlier one in DOCUMENT order wins.
    act(() =>
      io.callback?.(
        [entryFor("accounts", true), entryFor("data", true)],
        {} as IntersectionObserver,
      ),
    );
    expect(onActiveSectionChange).toHaveBeenLastCalledWith("accounts");
  });

  it("formats effectiveDate with Intl.DateTimeFormat and keeps the ISO value machine-readable", () => {
    const { unmount } = renderLocalized(
      <LegalDocumentShell
        title="Terms"
        version="2.4"
        effectiveDate="2026-04-01"
        sections={SECTIONS}
      />,
      "en",
    );

    const time = document.querySelector("time");
    expect(time).toHaveAttribute("datetime", "2026-04-01");
    expect(time).toHaveTextContent("Effective April 1, 2026");
    expect(screen.getByText("Version 2.4")).toBeInTheDocument();
    unmount();

    renderLocalized(
      <LegalDocumentShell title="利用規約" effectiveDate="2026-04-01" sections={SECTIONS} />,
      "ja",
    );
    expect(document.querySelector("time")).toHaveTextContent("施行日 2026年4月1日");
  });

  it("renders the contentsLabel override, the documentNavigation slot and the footerAction slot", () => {
    renderWithUi(
      <LegalDocumentShell
        title="Privacy Policy"
        contentsLabel="On this page"
        sections={SECTIONS}
        documentNavigation={<a href="/legal/terms">Terms</a>}
        footerAction={<button type="button">Accept</button>}
      />,
    );

    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
  });

  it("forwards ref to the container-query scope root", () => {
    const ref = { current: null as HTMLDivElement | null };
    renderWithUi(<LegalDocumentShell ref={ref} title="Terms" sections={SECTIONS} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("ui-legal-document-scope");
  });
});
