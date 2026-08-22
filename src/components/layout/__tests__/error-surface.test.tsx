/**
 * ErrorSurface — package-owned semantic exception surface (gh#221, gh#251).
 *
 * gh#251 was a REGRESSION of shape, not of styling: the 403/404/500/503 surface had been delivered
 * as a docs-only composition pattern, and a consumer cannot `import` a docs page. These tests pin
 * the IMPORTABLE contract that replaced it:
 *
 *  - `mode="application"` renders as the BODY of the AppShell the route already provides — the
 *    chrome is PRESERVED and never reconstructed by the surface;
 *  - `mode="system"` owns viewport-centred full-page geometry via CenteredShell align="center";
 *  - EXACTLY ONE recovery action, enforced structurally (extras dropped + a dev error);
 *  - semantic metadata slots (request id · permission · organization · maintenance window/progress)
 *    as real <dt>/<dd> pairs, with Intl/CLDR formatting and an ISO-8601 <time dateTime>;
 *  - valid heading order per mode, and the status code announced as "HTTP status 403";
 *  - `ref` forwarded to the surface element.
 */
import type * as React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Home, LifeBuoy } from "lucide-react";

import { AppProvider } from "../../../app/app-provider";
import { AppShell } from "../app-shell";
import { ErrorSurface } from "../error-surface";
import { PageContainer } from "../page-container";
import { Sidebar } from "../sidebar";
import { Button } from "../../general/button";
import { renderWithUi } from "@/test/render";

/** The metadata LABELS are library-owned, so a locale-pinned harness is required to assert them. */
function renderLocalized(ui: React.ReactElement, locale: "en" | "ja" | "vi") {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    ),
  });
}

/** ISO-8601 instants + an IANA zone — never a hand-built date string. */
const WINDOW_START = "2026-08-02T18:00:00Z";
const WINDOW_END = "2026-08-02T20:00:00Z";
const TIME_ZONE = "Asia/Tokyo";

function expectedWindow(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).formatRange(new Date(WINDOW_START), new Date(WINDOW_END));
}

describe("ErrorSurface — application mode (403 / 404)", () => {
  it("renders as the AppShell BODY and PRESERVES the shell chrome it is placed in", () => {
    const { getAllByRole, getByRole } = renderWithUi(
      <AppShell
        sidebar={
          <Sidebar
            activeId="reports"
            sections={[{ items: [{ id: "reports", label: "Reports", icon: Home }] }]}
          />
        }
        topbarRight={<Button variant="ghost">Account</Button>}
      >
        <PageContainer title="Reports">
          <ErrorSurface
            mode="application"
            status={403}
            title="You do not have access to this page"
            description="Ask a workspace administrator to grant you the Reports role."
            action={<Button>Back to dashboard</Button>}
          />
        </PageContainer>
      </AppShell>,
    );

    // The surface never manufactures navigation: the route's own chrome survives untouched.
    expect(getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(getAllByRole("banner").length).toBeGreaterThan(0);
    expect(getByRole("button", { name: "Account" })).toBeInTheDocument();

    // Heading order stays valid: the PageContainer owns the h1, the surface title is the h2.
    expect(getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(
      getByRole("heading", { level: 2, name: "You do not have access to this page" }),
    ).toBeInTheDocument();
  });

  it("does NOT render a system page shell (no second main landmark, no centred column)", () => {
    const { container } = renderWithUi(
      <ErrorSurface
        mode="application"
        status={404}
        title="Page not found"
        action={<Button>Back to dashboard</Button>}
      />,
    );

    expect(container.querySelector(".ui-centered-shell")).toBeNull();
    expect(container.querySelector("main")).toBeNull();
    expect(container.querySelector('[data-slot="error-surface"]')).toHaveAttribute(
      "data-mode",
      "application",
    );
  });

  it("ignores the system-only brand slot in application mode", () => {
    const { queryByText } = renderWithUi(
      <ErrorSurface
        mode="application"
        status={403}
        title="Forbidden"
        brand={<span>GodX</span>}
        action={<Button>Back</Button>}
      />,
    );
    expect(queryByText("GodX")).toBeNull();
  });
});

describe("ErrorSurface — system mode (500 / 503)", () => {
  it("owns package-owned viewport-centred full-page geometry", () => {
    const { container, getByRole } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={500}
        title="Something went wrong"
        description="An unexpected error occurred. Our team has been notified."
        action={<Button>Reload</Button>}
      />,
    );

    const column = container.querySelector(".ui-centered-shell-column");
    expect(column).toHaveAttribute("data-align", "center");
    // Default measure is the `sm` system-surface tier — no consumer className, no min-h-dvh.
    expect(column).toHaveAttribute("data-width", "sm");
    expect(container.querySelector('[role="banner"]')).toBeNull();
    // The surface IS the page, so its title is the h1.
    expect(getByRole("heading", { level: 1, name: "Something went wrong" })).toBeInTheDocument();
  });

  it("renders the optional brand + footer slots and honours the width tier", () => {
    const { container, getByText } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={503}
        width="md"
        brand={<span>GodX</span>}
        footer={<span>2026 GodX</span>}
        title="Service temporarily unavailable"
        action={<Button>Reload</Button>}
      />,
    );

    expect(container.querySelector(".ui-centered-shell-column")).toHaveAttribute(
      "data-width",
      "md",
    );
    expect(getByText("GodX")).toBeInTheDocument();
    expect(container.querySelector(".ui-centered-shell-footer")).toHaveTextContent("2026 GodX");
  });
});

describe("ErrorSurface — exactly one recovery action", () => {
  it("renders the single action and forwards it as a real focusable control", () => {
    const { getAllByRole } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={500}
        title="Something went wrong"
        action={<Button>Reload</Button>}
      />,
    );

    const actions = getAllByRole("button");
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveAccessibleName("Reload");
    actions[0].focus();
    expect(actions[0]).toHaveFocus();
    expect(actions[0]).not.toHaveAttribute("tabindex");
  });

  it("DROPS extra actions (fragment escape hatch) and reports it in development", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getAllByRole } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={500}
        title="Something went wrong"
        action={
          <>
            <Button>Reload</Button>
            <Button variant="outline">Contact support</Button>
          </>
        }
      />,
    );

    const actions = getAllByRole("button");
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveAccessibleName("Reload");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("EXACTLY ONE recovery action"));

    error.mockRestore();
  });
});

describe("ErrorSurface — semantic metadata slots", () => {
  it("exposes request id, permission and organization as real dt/dd pairs", () => {
    const { container, getByText } = renderLocalized(
      <ErrorSurface
        mode="application"
        status={403}
        title="Forbidden"
        requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
        permission="reports.view"
        organization="Acme KK"
        action={<Button>Back</Button>}
      />,
      "en",
    );

    // Label↔value stays machine-readable — never one run-on paragraph with a colon.
    expect(container.querySelectorAll(".ui-error-surface-meta-row")).toHaveLength(3);
    expect(getByText("Request ID").tagName).toBe("DT");
    expect(getByText("01J9Z0M7Q2K5S7WQ3T5N8V2H4B").tagName).toBe("DD");
    expect(getByText("Required permission").tagName).toBe("DT");
    expect(getByText("reports.view").tagName).toBe("DD");
    expect(getByText("Organization").tagName).toBe("DT");
    expect(getByText("Acme KK").tagName).toBe("DD");
  });

  it("renders no metadata list at all when every slot is omitted", () => {
    const { container } = renderWithUi(
      <ErrorSurface mode="system" status={500} title="Failed" action={<Button>Reload</Button>} />,
    );
    expect(container.querySelector(".ui-error-surface-meta")).toBeNull();
    expect(container.querySelector(".ui-error-surface-progress")).toBeNull();
  });

  it.each(["en", "ja", "vi"] as const)(
    "formats the maintenance window with Intl/CLDR + an IANA zone in %s",
    (locale) => {
      const { container } = renderLocalized(
        <ErrorSurface
          mode="system"
          status={503}
          title="Service temporarily unavailable"
          maintenance={{ start: WINDOW_START, end: WINDOW_END, timeZone: TIME_ZONE }}
          action={<Button>Reload</Button>}
        />,
        locale,
      );

      const time = container.querySelector("time");
      // The MACHINE-readable value is always the ISO-8601 instant.
      expect(time).toHaveAttribute("datetime", WINDOW_START);
      // Compared on raw textContent: CLDR range formatting uses narrow no-break spaces that
      // testing-library's whitespace normalization would collapse.
      expect(time?.textContent).toBe(expectedWindow(locale));
      expect(time?.textContent).not.toBe(`${WINDOW_START} - ${WINDOW_END}`);
    },
  );

  it("formats a single instant when the window has no published end", () => {
    const { container } = renderLocalized(
      <ErrorSurface
        mode="system"
        status={503}
        title="Service temporarily unavailable"
        maintenance={{ start: WINDOW_START, timeZone: TIME_ZONE }}
        action={<Button>Reload</Button>}
      />,
      "en",
    );

    const expected = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: TIME_ZONE,
    }).format(new Date(WINDOW_START));
    expect(container.querySelector("time")?.textContent).toBe(expected);
  });

  it("falls back to the raw input instead of printing 'Invalid Date' on the error page", () => {
    const { container } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={503}
        title="Service temporarily unavailable"
        maintenance={{ start: "not-an-instant" }}
        action={<Button>Reload</Button>}
      />,
    );
    expect(container.querySelector("time")?.textContent).toBe("not-an-instant");
    expect(container.textContent).not.toContain("Invalid Date");
  });

  it("renders maintenance progress as a labelled, Intl-percent-formatted progressbar", () => {
    const { getByRole } = renderLocalized(
      <ErrorSurface
        mode="system"
        status={503}
        title="Service temporarily unavailable"
        maintenance={{ start: WINDOW_START, end: WINDOW_END, timeZone: TIME_ZONE, progress: 40 }}
        action={<Button>Reload</Button>}
      />,
      "en",
    );

    const meter = getByRole("progressbar");
    expect(meter).toHaveAttribute("aria-valuenow", "40");
    expect(meter).toHaveAccessibleName(
      `Maintenance progress ${new Intl.NumberFormat("en", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(0.4)}`,
    );
  });
});

describe("ErrorSurface — status semantics and API contract", () => {
  it.each([400, 403, 404, 500, 503] as const)(
    "announces status %i as a phrase, not a bare cardinal number",
    (status) => {
      const { container } = renderLocalized(
        <ErrorSurface
          mode="system"
          status={status}
          title="Error"
          action={<Button>Reload</Button>}
        />,
        "en",
      );

      const code = container.querySelector(".ui-error-surface-status");
      expect(code?.querySelector('[aria-hidden="true"]')).toHaveTextContent(String(status));
      expect(code?.querySelector(".sr-only")).toHaveTextContent(`HTTP status ${status}`);
      expect(container.querySelector('[data-slot="error-surface"]')).toHaveAttribute(
        "data-status",
        String(status),
      );
    },
  );

  it("derives icon + tone from the status and lets both be overridden", () => {
    const { container: defaulted } = renderWithUi(
      <ErrorSurface mode="system" status={500} title="Failed" action={<Button>Reload</Button>} />,
    );
    expect(defaulted.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
      "data-tone",
      "destructive",
    );

    const { container: overridden } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={500}
        tone="warning"
        icon={LifeBuoy}
        title="Failed"
        action={<Button>Reload</Button>}
      />,
    );
    expect(overridden.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
      "data-tone",
      "warning",
    );
  });

  it("honours an explicit titleLevel override for a nested outline", () => {
    const { getByRole } = renderWithUi(
      <ErrorSurface
        mode="application"
        status={404}
        titleLevel={3}
        title="Page not found"
        action={<Button>Back</Button>}
      />,
    );
    expect(getByRole("heading", { level: 3, name: "Page not found" })).toBeInTheDocument();
  });

  it("forwards `ref`, `id` and `className` to the surface element in BOTH modes", () => {
    const applicationRef = { current: null as HTMLDivElement | null };
    const { container: application } = renderWithUi(
      <ErrorSurface
        ref={applicationRef}
        id="app-error"
        className="custom"
        mode="application"
        status={403}
        title="Forbidden"
        action={<Button>Back</Button>}
      />,
    );
    expect(applicationRef.current).toBe(application.querySelector("#app-error"));
    expect(applicationRef.current).toHaveClass("ui-error-surface", "custom");

    const systemRef = { current: null as HTMLDivElement | null };
    renderWithUi(
      <ErrorSurface
        ref={systemRef}
        id="system-error"
        mode="system"
        status={503}
        title="Unavailable"
        action={<Button>Reload</Button>}
      />,
    );
    expect(systemRef.current).toHaveAttribute("data-slot", "error-surface");
    expect(systemRef.current).toHaveAttribute("data-mode", "system");
  });

  it("uses logical CSS only — no physical direction classes leak into the markup", () => {
    const { container } = renderWithUi(
      <ErrorSurface
        mode="system"
        status={500}
        title="Failed"
        requestId="01J9Z0"
        action={<Button>Reload</Button>}
      />,
    );
    const classNames = [...container.querySelectorAll<HTMLElement>("*")]
      .map((node) => node.className)
      .filter((value): value is string => typeof value === "string")
      .join(" ");
    expect(classNames).not.toMatch(/\b(?:ml|mr|pl|pr)-/);
    expect(classNames).not.toMatch(/\b(?:left|right)-/);
  });
});
