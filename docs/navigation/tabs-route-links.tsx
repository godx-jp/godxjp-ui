import { Link, useLocation } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { PageContainer, createSidebarLink } from "@godxjp/ui/layout";
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
 * hand-rolled `inline-flex rounded-lg bg-muted p-1` strip of `Link` pills this replaces is the
 * default `Tabs` variant, and at 390px the 14 tabs scroll inside the strip instead of widening
 * the page.
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
        aria-label={t("routeTabsDocs.navLabel")}
        linkComponent={RouterLink}
        value={active.value}
        items={SETTINGS_ROUTES.map(({ value, href }) => ({
          value,
          href,
          label: t(`routeTabsDocs.routes.${value}.label`),
        }))}
      />
      <Card>
        <CardHeader>
          <CardTitle as="h2">{t(`routeTabsDocs.routes.${active.value}.label`)}</CardTitle>
          <CardDescription>{t(`routeTabsDocs.routes.${active.value}.summary`)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Text as="p" tone="muted">
            {active.href}
          </Text>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
