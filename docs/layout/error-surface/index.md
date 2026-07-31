---
title: Overview
---

# Error surface — 403 / 404 / 500 / 503

A **composition pattern**, not a component. `@godxjp/ui` ships **no `ErrorSurface`**: the surface
fails the Framework-Component Test, so what the package owns is the two **shells**, the **tokens**
and this canonical body.

## Gate 0 — why there is no `<ErrorSurface mode=… status=… />` (gh#221)

| #                                               | Verdict | Reasoning                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 universal                                    | ✅ pass | Every app needs the four HTTP exception pages.                                                                                                                                                                                                                                                                        |
| C2 owns reusable behaviour                      | ❌ FAIL | It is layout + content + one button. No state, no keyboard model, no focus management, no ARIA pattern of its own — the criterion's own FAIL example ("pure static layout/visual arrangement").                                                                                                                       |
| C3 not expressible from existing primitives     | ❌ FAIL | It is expressible **today**: `EmptyState` (icon · tone · title · description · one action) + `Flex` + `Text` inside `AppShell`/`PageContainer` or `CenteredShell`. The only real gap was viewport-centred system geometry — closed with a token + `CenteredShell align`, per "add the token, not a component".        |
| C4 single responsibility + controlled-vocab API | ❌ FAIL | A `mode` prop that swaps the whole page shell is the "grab-bag with a bespoke, screen-shaped API" anti-pattern. Worse, it would **lie**: `mode="application"` cannot produce app chrome (the sidebar, nav data and user menu belong to the consumer), so one value renders a page and the other renders a bare block. |
| C5 fully token-themeable                        | ✅ pass | Every part is already token-driven.                                                                                                                                                                                                                                                                                   |
| C6 earns the international contract             | ➖      | The localized copy is the consumer's `t()` catalog either way.                                                                                                                                                                                                                                                        |
| C7 earns its bundle cost                        | ➖      | A page-shaped block shipped to every consumer for a screen each app renders four times.                                                                                                                                                                                                                               |

**ANY fail ⇒ composition pattern.** Precedent: the worked-examples table already rules a dashboard
**page layout** a composition (`AppShell` + `PageContainer` + `ResponsiveGrid`); an error page is a
page layout.

> **The mode is not a prop — the mode IS the shell you render.** `mode="application"` = put the body
> inside the `AppShell` the route already renders. `mode="system"` = render
> `<CenteredShell align="center">`. Nothing is reconstructed by the consumer, because the shell was
> never torn down.

## The canonical body (identical for all four statuses)

```tsx
<Flex direction="col" align="center" gap="sm">
  {/* compact status code */}
  <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
    {status}
  </Text>

  <EmptyState
    icon={icon} // ShieldAlert 403 · SearchX 404 · ServerCrash 500 · Wrench 503
    tone={tone} // warning 403/503 · muted 404 · destructive 500
    titleLevel={inAppShell ? 2 : 1} // page <h1> above it, or none
    title={t("errors.403.title")}
    description={t("errors.403.description")}
    action={<Button>{t("errors.403.action")}</Button>} // EXACTLY ONE — single slot
  />

  {/* optional metadata slots */}
  <Text as="p" size="xs" tone="muted" mono>
    {t("errors.requestId")}: {requestId}
  </Text>
  <Text as="p" size="sm" tone="muted">
    {t("errors.maintenance")}: {maintenanceWindow}
  </Text>
</Flex>
```

- **Exactly one recovery action** is enforced structurally: `EmptyState.action` is a _single_ slot, so
  a second CTA has nowhere to go without forking the pattern.
- **Request ID** — mono so a support correlation id can be read out or copied accurately.
- **Maintenance window** — `Intl.DateTimeFormat(locale, { dateStyle, timeStyle, timeZone }).formatRange(start, end)`
  over ISO-8601 instants and an IANA zone. Never hand-build the string.
- **Focus** — the single action is a real `Button`; it takes the standard visible focus ring and is
  reachable by `Tab` with no positive tabindex.
- **Heading order** — `titleLevel={2}` under a `PageContainer` `h1`; `titleLevel={1}` on a system page.

### Shell selection

| Status    | Shell                                                       | Why                                                                             |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 403 · 404 | the **existing** `AppShell` + `PageContainer` (route-level) | the session is valid; keep nav, topbar and breadcrumb so the user can move on   |
| 500 · 503 | `<CenteredShell align="center" width="sm">`                 | the app itself failed — nav data/session may be gone; standalone system surface |

`AuthShell` is **not** an option: it is the UNAUTHENTICATED root and imposes auth-card geometry.

## Package-owned geometry (1440 / 1024 / 390)

Nothing in the pattern needs a consumer `className`, media query or `min-h-dvh`:

| Token                                  | Default                    | Owns                                                                                                                                                                                      |
| -------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--centered-shell-column-offset-block` | `0`                        | Block offset of the centred column. `auto` (set by `align="center"`) centres it in the `100dvh` shell; collapses to `0` when content overflows, so tall copy scrolls instead of clipping. |
| `--centered-shell-width-sm\|md\|lg`    | 32/46/64rem                | System-surface measure (`width="sm"` for an error page).                                                                                                                                  |
| `--centered-shell-main-padding`        | `--space-6`                | Page gutter at every viewport.                                                                                                                                                            |
| `--empty-state-description-max-width`  | `28rem`                    | Description measure — retune per service/locale instead of forking `.ui-empty-state-description`.                                                                                         |
| `--empty-state-space-y\|-x`            | `--space-10` / `--space-6` | Vertical rhythm of the body.                                                                                                                                                              |
| `--empty-state-icon-foreground\|-tint` | role                       | Medallion glyph + fill, driven by `tone`.                                                                                                                                                 |

## SSR / Inertia exception pages

Inertia renders exception pages through a single `Error` page component that receives the HTTP
`status` as a prop (Laravel's `Handler::render()` → `Inertia::render('Error', ['status' => …])`), so
the whole pattern is one component with a status switch — **no `mode` prop, no client state**:

```tsx
// resources/js/Pages/Error.tsx
import { EmptyState } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex } from "@godxjp/ui/layout";
import { Link, router } from "@inertiajs/react";
import { SearchX, ServerCrash, ShieldAlert, Wrench } from "lucide-react";

export default function Error({
  status,
  requestId,
}: {
  status: 403 | 404 | 500 | 503;
  requestId?: string;
}) {
  const { t } = useTranslation(); // the APP's i18n — @godxjp/ui never owns product copy
  const meta = {
    403: { icon: ShieldAlert, tone: "warning" },
    404: { icon: SearchX, tone: "muted" },
    500: { icon: ServerCrash, tone: "destructive" },
    503: { icon: Wrench, tone: "warning" },
  }[status];

  const body = (
    <Flex direction="col" align="center" gap="sm">
      <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
        {status}
      </Text>
      <EmptyState
        icon={meta.icon}
        tone={meta.tone}
        titleLevel={status < 500 ? 2 : 1}
        title={t(`errors.${status}.title`)}
        description={t(`errors.${status}.description`)}
        action={
          status < 500 ? (
            <Button asChild>
              <Link href="/">{t("errors.backHome")}</Link>
            </Button>
          ) : (
            <Button onClick={() => router.reload()}>{t("errors.reload")}</Button>
          )
        }
      />
      {requestId && (
        <Text as="p" size="xs" tone="muted" mono>
          {t("errors.requestId")}: {requestId}
        </Text>
      )}
    </Flex>
  );

  // 403/404 keep the app shell: return the body and let the persistent layout wrap it.
  // 500/503 own the page: no layout, viewport-centred system surface.
  return status < 500 ? (
    body
  ) : (
    <CenteredShell align="center" width="sm">
      {body}
    </CenteredShell>
  );
}

// Persistent layout ⇒ the authenticated shell is PRESERVED across the error visit (the sidebar is
// not re-mounted, scroll and drawer state survive).
Error.layout = (page: React.ReactNode) =>
  page.props.status < 500 ? <AuthenticatedLayout>{page}</AuthenticatedLayout> : page;
```

SSR notes:

- Everything above renders on the server: the pattern has **no client state, no effects, no portals**,
  so `@inertiajs/react/server` (or any RSC/SSR renderer) emits the full markup — an error page must
  never depend on hydration to be readable.
- Format the maintenance window from an **ISO-8601 string sent by the server** plus an explicit
  `timeZone`; do not rely on the server's local zone, or SSR and client output diverge and React
  logs a hydration mismatch.
- A 500 page must not import the app's data providers/query client — the failure may be inside them.
  `CenteredShell` + `EmptyState` are pure presentational primitives with no provider requirement.

## Anti-patterns

- ❌ Rebuilding nav/topbar on the 403/404 page — render the body inside the shell you already have.
- ❌ `AuthShell` for a system error (unauthenticated root, auth-card measure).
- ❌ Two CTAs ("Retry" + "Contact support") — one recovery action; put support contact in the
  description or the footer.
- ❌ `className="min-h-dvh flex items-center"` — that geometry is `CenteredShell align="center"`.
- ❌ A hand-built maintenance string (`"18:00 - 20:00 JST"`) — use `Intl` + IANA.
