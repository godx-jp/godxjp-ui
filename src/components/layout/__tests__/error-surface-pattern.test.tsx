/**
 * ERROR SURFACE — composition-pattern contract test (gh#221).
 *
 * `@godxjp/ui` deliberately ships NO `ErrorSurface` component: the 403/404/500/503 surface failed
 * Gate 0 of docs/COMPOSITION-VS-COMPONENT.md (it owns no behaviour and is expressible today from
 * `EmptyState` + `Flex` + `Text` + `Button` inside the shell the page already renders). This test
 * pins the CANONICAL composition documented in docs/layout/error-surface/ and in the MCP
 * `error-pages` pattern, so a refactor of those primitives can never silently break the four
 * exception pages a consumer builds from them.
 *
 * What is pinned here:
 *  - application mode (403/404) PRESERVES the authenticated AppShell chrome (nav + banner survive);
 *  - system mode (500/503) owns viewport-centred full-page geometry via CenteredShell align="center";
 *  - EXACTLY ONE recovery action (the single `action` slot IS the enforcement);
 *  - a compact status code, an optional request ID and an optional maintenance window as
 *    metadata slots;
 *  - valid heading order in both modes (h1 page title → h2 surface title / h1 surface title);
 *  - `Intl.DateTimeFormat` maintenance formatting in en / ja / vi with an IANA time zone.
 */
import { describe, expect, it } from "vitest";
import { Home, ShieldAlert } from "lucide-react";

import { AppShell } from "../app-shell";
import { CenteredShell } from "../centered-shell";
import { PageContainer } from "../page-container";
import { Flex } from "../flex";
import { Sidebar } from "../sidebar";
import { EmptyState } from "../../data-display/empty-state";
import { Button } from "../../general/button";
import { Text } from "../../general/typography";
import { renderWithUi } from "@/test/render";

/** Consumer-owned copy — in a real app every string comes from the app's own `t()`. */
const COPY = {
  en: {
    title: "Service temporarily unavailable",
    description: "We are performing scheduled maintenance. Please try again shortly.",
    action: "Reload",
    requestId: "Request ID",
    maintenance: "Scheduled maintenance",
  },
  ja: {
    title: "サービスを一時的にご利用いただけません",
    description: "計画メンテナンスを実施しています。しばらくしてから再度お試しください。",
    action: "再読み込み",
    requestId: "リクエスト ID",
    maintenance: "計画メンテナンス",
  },
  vi: {
    title: "Dịch vụ tạm thời không khả dụng",
    description: "Chúng tôi đang bảo trì theo lịch. Vui lòng thử lại sau ít phút.",
    action: "Tải lại",
    requestId: "Mã yêu cầu",
    maintenance: "Bảo trì theo lịch",
  },
} as const;

/** ISO-8601 instants + an IANA zone — never a hand-built date string. */
const WINDOW_START = "2026-08-02T18:00:00Z";
const WINDOW_END = "2026-08-02T20:00:00Z";
const TIME_ZONE = "Asia/Tokyo";

function formatWindow(locale: keyof typeof COPY): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).formatRange(new Date(WINDOW_START), new Date(WINDOW_END));
}

describe("error surface — composition pattern (gh#221)", () => {
  it("application mode (403) preserves the authenticated app shell around the error body", () => {
    const { getAllByRole, getByRole, getByText } = renderWithUi(
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
          <Flex direction="col" align="center" gap="sm">
            <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
              403
            </Text>
            <EmptyState
              icon={ShieldAlert}
              tone="warning"
              titleLevel={2}
              title="You do not have access to this page"
              description="Ask a workspace administrator to grant you the Reports role."
              action={<Button>Back to dashboard</Button>}
            />
          </Flex>
        </PageContainer>
      </AppShell>,
    );

    // The shell chrome SURVIVES the error — no navigation is reconstructed by the page.
    expect(getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(getAllByRole("banner").length).toBeGreaterThan(0);
    expect(getAllByRole("main").length).toBeGreaterThan(0);
    expect(getByRole("button", { name: "Account" })).toBeInTheDocument();

    // Compact status code + a single recovery action inside the preserved shell.
    expect(getByText("403")).toBeInTheDocument();
    expect(getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(
      getByRole("heading", { level: 2, name: "You do not have access to this page" }),
    ).toBeInTheDocument();
  });

  it("enforces EXACTLY ONE recovery action through EmptyState's single `action` slot", () => {
    const { getAllByRole } = renderWithUi(
      <Flex direction="col" align="center" gap="sm">
        <Text as="p" size="sm" tone="muted" mono tabular>
          404
        </Text>
        <EmptyState
          titleLevel={2}
          title="Page not found"
          description="The page you requested no longer exists."
          action={<Button>Back to dashboard</Button>}
        />
      </Flex>,
    );
    // One slot ⇒ one action. A second CTA has nowhere to go without forking the pattern.
    const actions = getAllByRole("button");
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveAccessibleName("Back to dashboard");
  });

  it("system mode (500) owns viewport-centred full-page geometry and exposes the request ID", () => {
    const { container, getByRole, getByText } = renderWithUi(
      <CenteredShell align="center" width="sm">
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            500
          </Text>
          <EmptyState
            titleLevel={1}
            tone="destructive"
            title="Something went wrong"
            description="An unexpected error occurred. Our team has been notified."
            action={<Button>Reload</Button>}
          />
          <Text as="p" size="xs" tone="muted" mono>
            Request ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B
          </Text>
        </Flex>
      </CenteredShell>,
    );

    const column = container.querySelector(".ui-centered-shell-column");
    expect(column).toHaveAttribute("data-align", "center");
    expect(column).toHaveAttribute("data-width", "sm");
    // A system page has no app chrome to preserve — no banner, no nav.
    expect(container.querySelector('[role="banner"]')).toBeNull();
    expect(getByRole("heading", { level: 1, name: "Something went wrong" })).toBeInTheDocument();
    expect(getByText("Request ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B")).toBeInTheDocument();
  });

  it.each(["en", "ja", "vi"] as const)(
    "system mode (503) renders the localized copy + an Intl-formatted maintenance window in %s",
    (locale) => {
      const copy = COPY[locale];
      const maintenanceWindow = formatWindow(locale);
      const { container, getByRole } = renderWithUi(
        <CenteredShell align="center" width="sm">
          <Flex direction="col" align="center" gap="sm">
            <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
              503
            </Text>
            <EmptyState
              titleLevel={1}
              tone="warning"
              title={copy.title}
              description={copy.description}
              action={<Button>{copy.action}</Button>}
            />
            <Text as="p" size="sm" tone="muted">
              {`${copy.maintenance}: ${maintenanceWindow}`}
            </Text>
          </Flex>
        </CenteredShell>,
      );

      expect(getByRole("heading", { level: 1, name: copy.title })).toBeInTheDocument();
      expect(getByRole("button", { name: copy.action })).toBeInTheDocument();
      // Compared on raw textContent: CLDR range formatting uses narrow no-break spaces that
      // testing-library's whitespace normalization would collapse.
      expect(container.textContent).toContain(`${copy.maintenance}: ${maintenanceWindow}`);
      // The window is CLDR-formatted for the locale, never a hand-built string.
      expect(maintenanceWindow).not.toBe(`${WINDOW_START} - ${WINDOW_END}`);
    },
  );

  it("keeps the single recovery action keyboard-focusable (visible focus, no positive tabindex)", () => {
    const { getByRole } = renderWithUi(
      <CenteredShell align="center" width="sm">
        <EmptyState titleLevel={1} title="Something went wrong" action={<Button>Reload</Button>} />
      </CenteredShell>,
    );
    const action = getByRole("button", { name: "Reload" });
    action.focus();
    expect(action).toHaveFocus();
    expect(action).not.toHaveAttribute("tabindex");
  });
});
