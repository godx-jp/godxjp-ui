--- title: Overview ---

# Error surface — 403 / 404 / 500 / 503

`ErrorSurface` is a **package-owned, importable component** (`@godxjp/ui/layout`). It owns the four HTTP exception pages every application ships, including their responsive geometry, so no app re-implements them from a generic `Card` in the wrong shell.

```tsx
import { ErrorSurface } from "@godxjp/ui/layout";
```

## History — why this is a component (gh#221 → gh#251)

#221 first shipped this surface as a **documentation-only composition pattern**: the
Framework-Component Test was run, it was judged a composition, and the package shipped two shells,
some tokens and a docs page instead of an export. That was wrong in outcome, and #251 is the proof:
**a consumer cannot `import` a docs page.** A clean install of 18.5.0 exposed no `ErrorSurface`, so
DXS Platform was still forced to compose `AuthShell` + a generic `Card` behind a consumer-local
`.canonical-auth-card` — exactly what the API-first rule forbids. The consumer requirement settles
the question: the surface ships as a real export.

Two things that analysis got right are preserved verbatim in the component's design:

- **A component cannot manufacture the application shell.** Nav sections, product identity and the user menu are consumer-owned data. So `mode="application"` does not build chrome — it defines _where the surface goes_ (see below), and the surface renders only its own block. - **Exactly one recovery action** stays structural — one slot, extras dropped.

## `mode` is the shell contract, not a skin

| `mode`          | Status    | What the component renders                                          | What you provide                                                     |
| --------------- | --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `"application"` | 403 · 404 | **Only the surface block.** No shell, no landmark, no page geometry | The `AppShell` (usually + `PageContainer`) the route already renders |
| `"system"`      | 500 · 503 | **The whole page** — `CenteredShell align="center"` + the surface   | Nothing. No `min-h-dvh`, no flex-centring class, no media query      |

> **`mode="application"` means "this is what you put in AppShell's children".** The session is
> valid, so the sidebar, topbar and breadcrumb stay mounted and the user can navigate away. The
> surface never reconstructs them.
>
> **`mode="system"` means "the app itself failed".** Session and nav data may be gone, so the
> surface owns the page. `AuthShell` is never an option: it is the UNAUTHENTICATED root and imposes
> auth-card geometry.

## API

```tsx
<ErrorSurface
  mode="application" | "system"     // required — the shell contract above
  status={403 | 404 | 500 | 503}    // required — drives the default icon + tone
  title={t("errors.403.title")}     // required — consumer-owned copy
  description={t("errors.403.body")}
  action={<Button>{t("errors.backHome")}</Button>}  // required — EXACTLY ONE

  // optional semantic metadata slots (each renders as a <dt>/<dd> pair)
  requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
  permission="reports.view"
  organization="Acme KK"
  maintenance={{ start, end, timeZone, progress }}  // ISO-8601 + IANA + 0–100

  // optional overrides / system-mode slots
  icon={LifeBuoy} tone="warning" titleLevel={2}
  brand={<Logo glyph="G" />} footer={<Text size="xs">2026 GodX</Text>} width="sm"
  id className ref
/>
```

- **`status` is the input, not a lookup you write.** It selects the icon (`ShieldAlert` 403 ·
  `SearchX` 404 · `ServerCrash` 500 · `Wrench` 503) and the tone (`warning` 403/503 · `muted` 404 ·
  `destructive` 500). Override either only for a truer product glyph, never to recolour a severity.
- **`action` is exactly one.** A single slot is the enforcement; pass a fragment with two buttons
  and only the first renders, with a development-time error. Support contact belongs in
  `description`, not in a second CTA.
- **`titleLevel` defaults per mode** — `2` in `application` (a `PageContainer` `h1` sits above),
  `1` in `system` (the surface IS the page). Override only to fit a deeper outline.
- **Product copy stays consumer-owned.** `title` / `description` / `action` come from the app's own
  `t()`. The surface localizes only its OWN metadata labels ("Request ID", "Required permission",
  "Organization", "Scheduled maintenance", "Maintenance progress").

## Metadata slots — semantic, not sentences

Each slot renders a real `<dt>`/`<dd>` pair inside a `<dl>`, so the label↔value relationship
survives for a screen reader instead of collapsing into a colon in a paragraph. Omit them all and
the list is not rendered at all.

| Slot                    | Why it exists                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requestId`             | Support correlation id. Mono + tabular so it can be read out or copied accurately.                                                                                               |
| `permission`            | The missing role (403). Distinguishes "you need a role" from a generic refusal.                                                                                                  |
| `organization`          | The tenant the request was scoped to. Distinguishes a wrong-workspace 403 from a missing-role one.                                                                               |
| `maintenance.start/end` | ISO-8601 instants + an IANA `timeZone`, formatted by `Intl.DateTimeFormat(...).formatRange()`. The visible text is CLDR; `<time dateTime>` keeps the machine-readable ISO value. |
| `maintenance.progress`  | 0–100, rendered as a labelled `Progress` meter with an `Intl.NumberFormat` percent name — never colour-only.                                                                     |

**Never hand-build a window** (`"18:00 - 20:00 JST"`): it cannot localize. **Never derive
`progress` from the client clock**: SSR and hydration would disagree, and an exception page must be
readable before hydration.

## Accessibility

- **Status code is announced as a phrase.** The visible digits are `aria-hidden`; an `sr-only`
  sibling carries "HTTP status 403", because a bare "403" is read as the cardinal number
  "four hundred three".
- **Heading order stays valid** by default in both modes (see `titleLevel` above).
- The single action is a real `Button`: standard visible focus ring, reachable by `Tab`, no
  positive tabindex.
- Verified at **0 axe violations** for all four statuses, in both shells, with metadata, and under
  `dir="rtl"` (`src/components/layout/__tests__/error-surface.a11y.test.tsx`).

## Package-owned geometry (1440 / 1024 / 390)

No consumer `className`, media query or `min-h-dvh` is needed at any viewport.

| Token                                   | Default                   | Owns                                                                                                                                                                   |
| --------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--error-surface-max-width`             | `32rem`                   | Measure of the whole surface block, in BOTH modes — so a long ja/vi headline wraps readably even inside a wide `PageContainer`.                                        |
| `--error-surface-gap`                   | `--space-3`               | Rhythm between status code, body, metadata list and progress meter.                                                                                                    |
| `--error-surface-padding-block`         | `--space-10`              | Block padding at the desktop steps (1440 / 1024).                                                                                                                      |
| `--error-surface-padding-block-compact` | `--space-6`               | Block padding below the narrow step (the 390 case).                                                                                                                    |
| `--error-surface-meta-gap` / `-row-gap` | `--space-1` / `--space-2` | Metadata row rhythm and the label↔value gap inside one row.                                                                                                            |
| `--error-surface-meta-border`           | `none`                    | Divider above the metadata block. **Quiet by default (rule #44)** — a service opts in with `1px solid hsl(var(--border))`.                                             |
| `--error-surface-progress-max-width`    | `18rem`                   | Progress meter measure, so it reads as metadata rather than as the page's primary content.                                                                             |
| `--centered-shell-column-offset-block`  | `0` (`auto` when centred) | `system` mode only. `align="center"` centres the column in the `100dvh` shell; auto offsets collapse when content overflows, so tall copy scrolls instead of clipping. |
| `--empty-state-description-max-width`   | `28rem`                   | Description measure — retune per service/locale instead of forking `.ui-empty-state-description`.                                                                      |

The narrow step is a **container query on the surface's own width**, not a viewport query (the
SplitPane precedent, gh#165): the surface compacts correctly whether the squeeze came from a 390px
phone or from an application shell with an expanded sidebar. Below the step, metadata rows stack
label-over-value instead of wrapping into a ragged two-column shape.

## SSR / Inertia exception pages

The surface has **no state, no effects and no portals**, so it renders fully server-side. Inertia
delivers every exception through one `Error` page component that receives the HTTP `status`
(Laravel `Handler::render()` → `Inertia::render('Error', ['status' => …])`), which maps onto
`ErrorSurface` with a single expression:

````tsx
// resources/js/Pages/Error.tsx
import { Button, Logo } from "@godxjp/ui/general";
import { ErrorSurface } from "@godxjp/ui/layout";
import { Link, router } from "@inertiajs/react";

export default function Error({ status, requestId, }: { status: 403 | 404 | 500 | 503; requestId?: string; }) { const { t } = useTranslation(); // the APP's i18n — @godxjp/ui never owns product copy const isSystem = status >= 500;

return ( <ErrorSurface mode={isSystem ? "system" : "application"} status={status} title={t(`errors.${status}.title`)} description={t(`errors.${status}.description`)} requestId={requestId} {...(isSystem ? { brand: <Logo glyph="G" /> } : {})} action={ isSystem ? ( <Button onClick={() => router.reload()}>{t("errors.reload")}</Button> ) : ( <Button asChild> <Link href="/">{t("errors.backHome")}</Link> </Button> ) } /> ); }

// Persistent layout ⇒ 403/404 keep the authenticated shell (the sidebar is not re-mounted, scroll // and drawer state survive); 500/503 render standalone, because the surface owns the page. Error.layout = (page: React.ReactNode) => page.props.status < 500 ? <AuthenticatedLayout>{page}</AuthenticatedLayout> : page; ```

SSR notes:

- Send the maintenance window as **ISO-8601 from the server** with an explicit `timeZone`. Relying on the server's local zone makes SSR and client output diverge and React logs a hydration mismatch. - A 500 page must not import the app's data providers/query client — the failure may be inside them. `ErrorSurface` needs no provider beyond the `AppProvider` that supplies the locale.

## Anti-patterns

## The composition underneath

`ErrorSurface` composes real primitives (`EmptyState` · `Text` · `Progress` · `CenteredShell`) and adds no bespoke markup you could not inspect. For a status outside the supported four, compose the same body by hand — that composition is pinned by `src/components/layout/__tests__/error-surface-pattern.test.tsx`, so it cannot break from underneath.
````
