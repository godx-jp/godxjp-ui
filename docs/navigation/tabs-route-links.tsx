import { Link, useLocation } from "react-router-dom";

import { Descriptions } from "@godxjp/ui/data-display";
import { Heading, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, createSidebarLink } from "@godxjp/ui/layout";
import { Tabs } from "@godxjp/ui/navigation";

/**
 * ROUTE TABS — a settings area whose 14 sibling routes sit in one horizontal strip (gh#1364).
 *
 * Every tab is a real link: middle-click, Ctrl/⌘-click and "open in new tab" work, because the
 * strip is a `<nav>` of `<a href>` and nothing intercepts the click. The current route is the
 * `value`, derived from the router's pathname, and that tab carries `aria-current="page"`.
 *
 * The router link is passed exactly as it is to `Sidebar` / `NavList`: `createSidebarLink(Link,
 * "to")` for React Router (Inertia passes its own `<Link>`). There is no page-local CSS — the
 * line variant separates navigation from the settings content. At 390px the 14 links scroll
 * inside the strip; the overflow menu also makes hidden destinations reachable by mouse.
 */

const RouterLink = createSidebarLink(Link, "to");

const BASE = "/stores/acme/settings";

const SETTINGS_ROUTES = [
  "cart-timeout",
  "customer",
  "line",
  "payment",
  "shipping",
  "tax",
  "receipt",
  "notification",
  "staff",
  "store",
  "coupon",
  "point",
  "api",
  "audit",
].map((value) => ({ value, href: `${BASE}/${value}` }));

export default function Demo() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // The docs frame starts at "/", which is no settings route; a real app's settings layout only
  // mounts under BASE, so its own fallback is the index route.
  const active = SETTINGS_ROUTES.find((route) => pathname === route.href) ?? SETTINGS_ROUTES[0];

  return (
    <PageContainer title={t("routeTabsDocs.title")} subtitle={t("routeTabsDocs.subtitle")}>
      <Tabs
        variant="line"
        overflow="menu"
        aria-label={t("routeTabsDocs.navLabel")}
        linkComponent={RouterLink}
        value={active.value}
        items={SETTINGS_ROUTES.map(({ value, href }) => ({
          value,
          href,
          label: t(`routeTabsDocs.routes.${value}.label`),
        }))}
      />
      <Flex direction="col" gap="lg">
        <Flex direction="col" gap="xs">
          <Heading level={2}>{t(`routeTabsDocs.routes.${active.value}.label`)}</Heading>
          <Text as="p" tone="muted">
            {t(`routeTabsDocs.routes.${active.value}.summary`)}
          </Text>
        </Flex>
        <Descriptions columns={2}>
          <Descriptions.Item label={t("routeTabsDocs.configuration")}>
            {t(`routeTabsDocs.routes.${active.value}.configuration`)}
          </Descriptions.Item>
          <Descriptions.Item label={t("routeTabsDocs.scope")}>
            {t("routeTabsDocs.subtitle")}
          </Descriptions.Item>
        </Descriptions>
      </Flex>
    </PageContainer>
  );
}
