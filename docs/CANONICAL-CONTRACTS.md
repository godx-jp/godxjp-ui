# Canonical contracts — the answer to "does @godxjp/ui have an X?"

A consumer design spec names a component (`PageHeader`, `Banner`, `SocialLinks`,
`OrganizationChoiceList`, `ServiceRolePanel`, `BranchScopePicker`, `PermissionMatrix`,
`FilterBar`). This document records, per name, **what the package actually ships** and — when the
answer is "compose it" — **exactly which primitives + tokens**, so a consumer never re-authors
package geometry locally and an agent never invents an API that does not exist.

It is the formal half of gh#255 · gh#256 · gh#257 · gh#258, all of which asked for the same thing:
_either export it, or document the canonical public replacement._

> **How the call is made.** Every candidate runs the **Framework-Component Test**
> (`docs/COMPOSITION-VS-COMPONENT.md`, cardinal rule #46) — all 7 criteria. ALL pass → it may be a
> framework component. ANY fails → it is a composition pattern.
>
> **But a FAIL is not the end of the analysis.** gh#251 is the scar tissue here: `ErrorSurface`
> failed the test, shipped as a docs composition, and the consumer was left stranded — _a consumer
> cannot import a docs page_. So the test is followed by one more question:
>
> **Can the consumer reach the package's own geometry and behaviour through PUBLIC routes
> (primitives + tokens) without writing package CSS?**
>
> - **Yes** → composition. Document it here and in the MCP, and add any missing token.
> - **No** → the package has a gap. Close it with an export or a token — never by telling the
>   consumer to fork.

---

## 1. `PageHeader` — **`PageContainer`'s embedded header IS the DXS PageHeader** (gh#255)

```ts
import { PageContainer, type PageContainerProps } from "@godxjp/ui/layout";
```

There is **no standalone `PageHeader` export**. The canonical page title band — breadcrumbs ·
`<h1>` · subtitle · status/meta (`status`) · actions (`extra`) — lives on **one renderer**:
`PageContainer`'s embedded header, with `headerLayout` (`stack` | `responsive-inline`),
`breadcrumbLabel` (the landmark-unique override), `measure` and `headerLoading` (skeleton title
band + `aria-busy`, keeping the `<h1>` in the document with an sr-only name so the heading outline
never disappears mid-load).

**Why one renderer rather than a lifted export.** The band's geometry is token-owned
(`.ui-page-header`, `--page-header-status-gap`, the placeholder measures) and every page mounts it
through `PageContainer`, so a second mount point would be a second `<h1>` waiting to happen. A
title band outside a full page shell (a Sheet detail, a `MasterDetail` pane, a tab body) is a
COMPOSITION of `Breadcrumb` + heading text + `Flex` at section level — it should NOT be an `<h1>`.

| Situation                                    | Use                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| The surface **is a page**                    | `PageContainer` (`title`/`subtitle`/`status`/`extra`/`breadcrumb`)        |
| A title band **inside** a pane/sheet/tab     | Compose at section level — never a second `<h1>` / `PageContainer` header |
| The user **may not see the resource at all** | `ErrorSurface` — never a header that leaks the resource's name            |

`denied` / `error` are deliberately **not** states of the band — see the table above.

---

## 2. `Banner` — **EXPORTED** as the page-level `Alert` (gh#255)

```ts
import { Banner, type BannerProps } from "@godxjp/ui/feedback";
```

`Banner` **is** `Alert` locked to `variant="banner"`: square, edge-to-edge, ruled on the block-end
edge, measured by the `--banner-*` tokens. Same tones, same icon defaults, same
assertive/polite role split, same actions grid, same dismiss control. `Banner.Title` **is**
`AlertTitle` — the same element, not a parallel family.

It is an alias, not a second implementation, for the same reason `FilterBar` is an alias of
`Toolbar`: a banner and an inline alert are one object at two measures, and duplicating the tone
mapping and dismiss behaviour is exactly what the no-duplication rule forbids.

| Scope of the message                                                  | Use                                         |
| --------------------------------------------------------------------- | ------------------------------------------- |
| The page or the whole app (maintenance, trial expiry, read-only mode) | `Banner` above the header, or in `AppShell` |
| One section / card / form                                             | `Alert` inside that section                 |
| One field                                                             | `FormField` `error`                         |
| Transient ("saved")                                                   | `toast()`                                   |
| The user may not see the page at all                                  | `ErrorSurface`                              |

Retheme through tokens, never a wrapper class: `--banner-radius`, `--banner-border-width`,
`--banner-border-block-end-width`, `--banner-space-block`, `--banner-space-inline`,
`--banner-dismiss-space-offset`. Never stack two banners.

---

## 3. `AuthShell preset="registration"` — **EXPORTED** (gh#256)

```tsx
<AuthShell variant="canonical" preset="registration" brand={…} footer={…}>
```

The 360px sign-up measure with a 15px inline gutter at 390px — the same page rhythm as
`preset="login"`, so sign-in → sign-up never jumps on a phone. It carries the full password form
**and** the pending-email confirmation state with no consumer geometry CSS.

Two things make it structurally distinct from every other preset, and both are load-bearing:

1. **It is the only START-aligned preset.** A sign-up card is the tallest surface in the
   hosted-identity set (name · email · password · confirm · strength · consent · submit ·
   providers). A vertically _centred_ tall card overflows **above the scroll origin** on a short
   viewport, putting its first field permanently out of reach.
2. **It is the only preset with its own footer-clearance knob**, so the legal/consent footer never
   sits flush against the submit button at the end of a long scroll.

Geometry knobs: `--auth-shell-registration-{card-max-width, main-padding-block-start,
main-padding-block-start-mobile, main-padding-inline, main-padding-inline-mobile,
main-padding-block-end, main-padding-block-end-mobile, card-stack-gap}`.

Worked screen: `docs/layout/auth-shell-registration.tsx`.

---

## 4. `SocialLinks` — **COMPOSE** (gh#256)

There is no `SocialLinks` component, and none is planned.

```tsx
<AuthDivider label="または" />
<Flex direction="col" gap="sm">
  {providers.map((p) => (
    <Button key={p.id} variant="outline" disabled={submitting} onClick={p.start}>
      <p.Icon aria-hidden="true" />
      {p.label}
    </Button>
  ))}
</Flex>
```

**Why.** It owns no behaviour: each provider is a plain action the app points at its own OAuth
start URL. A framework component would have to invent _which_ providers a product offers, in what
order, and what consent they imply — product decisions the package must not make. `disabled` and
`loading` are the `Button`'s own props; there is no provider-specific API to learn.

---

## 5. `OrganizationChoiceList` — **COMPOSE** (gh#256)

```tsx
<Card>
  <CardHeader>…</CardHeader>
  <CardContent flush>
    <ul>
      {orgs.map((org) => (
        <ListRow
          as="li"
          key={org.id}
          leading={<Avatar>…</Avatar>}
          title={org.name}
          description={org.role}
          trailing={
            <Button variant="ghost" size="sm">
              選択
            </Button>
          }
        />
      ))}
    </ul>
  </CardContent>
</Card>
```

`CardContent flush` is what produces shared row dividers instead of a card outline per row.

States — all existing exports, no bespoke markup:

| State             | Use                                                      |
| ----------------- | -------------------------------------------------------- |
| loading           | `Skeleton` rows at the settled row height                |
| empty             | `EmptyState`                                             |
| error             | `Alert tone="destructive"` + a retry action              |
| permission-denied | `Alert tone="warning"` (section) / `ErrorSurface` (page) |
| disabled row      | the row's own `Button disabled`                          |

Worked screens: `docs/layout/auth-shell-context.tsx`, `docs/layout/auth-shell-registration.tsx`.

---

## 6. `ServiceRolePanel` · `BranchScopePicker` · `PermissionMatrix` — **EXPORTED** (gh#257)

All three compositions were promoted to public exports — the composition-first Gate 0 verdict was
revisited when consumers kept re-authoring the same states and geometry:

```ts
import { ServiceRolePanel } from "@godxjp/ui/layout";
import { BranchScopePicker } from "@godxjp/ui/data-entry";
import { PermissionMatrix } from "@godxjp/ui/data-display";
```

- **`ServiceRolePanel`** — the master/detail role rail: role list (name, description, member
  count, `locked` badge), selection, delete confirmation, plus the full #216 lifecycle
  (loading → denied → error → empty). Domain data is 100% consumer-supplied.
- **`BranchScopePicker`** — the "all branches vs selected branches" scope control: radio pair +
  searchable branch checklist with CLDR-pluralized selection count and the lifecycle states.
- **`PermissionMatrix`** — the role × permission grid: sticky permission column, shape-encoded
  ✓/— cells (never colour-only), optional editable checkbox mode, two-role compare with a
  差分のみ filter, and the #216 lifecycle states.

**What the package ALSO owns** is the part every consumer would otherwise re-derive — the
grant/diff data logic, shipped as a pure, framework- and locale-neutral util:

```ts
import {
  grantKey,
  hasGrant,
  rolesDifferOnPermission,
  visibleRows,
  countGrants,
  countDifferences,
} from "@godxjp/ui/lib/permission-grid";
```

Layout the role list beside the editor with `MasterDetail` — it owns the tracks, the gap and the
stacking threshold as tokens, so the page carries no `grid-template-columns` and no media query at
1440 / 1024 / 390. Destructive changes go through `AlertDialog variant="destructive"` (add
`challenge` for type-to-confirm).

Worked screens: `docs/layout/service-role-panel.tsx`, `docs/data-entry/branch-scope-picker.tsx`,
`docs/data-display/permission-matrix.tsx`, `docs/showcase/permission-matrix.tsx`.

---

## 7. `FilterBar` — **EXPORTED, and now typed** (gh#258)

`FilterBar` / `FilterBarGroup` remain the public domain-neutral names for the `Toolbar` primitives.
What changed is that child composition alone no longer has to define the bar's shape:

```tsx
<FilterBar
  search={{ value: q, onValueChange: setQ, placeholder: "Search records" }}
  filters={[
    {
      value: "status",
      label: "状態",
      options: STATUS_OPTIONS,
      selected: status,
      onSelectedChange: setStatus,
    },
  ]}
  chips={applied.map((f) => ({ value: f.value, label: f.label }))}
  onChipRemove={lift}
  resultCount={rows.length}
  onClear={clearAll}
  hasActiveFilters={applied.length > 0}
  actions={
    <Button variant="outline" size="sm">
      エクスポート
    </Button>
  }
/>
```

**Order is the contract.** DOM order is tab order, and the **bar** decides it, not each page:

```
search → typed filters → children (custom composition filters) → reset → actions
  → applied-chips row → result-count / error line
```

Reset sits before `actions` deliberately, so "clear filters" never lands at the end of the row
beside an unrelated primary action.

What each prop buys that a plain child did not:

- **`search`** — the canonical `SearchInput` at one token-owned measure
  (`--filter-bar-search-width`) across every list page, full-width below the 640px step.
  Controlled through the `value`/`defaultValue`/`onValueChange` triad; `onSearch` mirrors the
  debounced-term callback.
- **`filters`** — labelled, domain-neutral `Select` filters whose visible `label` is the control's
  real `<label htmlFor>` (WCAG 2.5.3 / 1.3.1), at the `--filter-bar-filter-width` measure.
- **`chips`** — the chip lifecycle: a labelled row, a remove control named after _that specific_
  filter (a row of buttons all called "Remove" is unusable from a screen-reader's control list),
  and no row at all when nothing is applied. Remove = `onChipRemove(value)`; clear-all = `onClear`.
- **`resultCount`** — a polite live region formatted with `Intl.NumberFormat` + CLDR plurals. This
  is the accessibility point: a sighted user _sees_ the table change; this is what tells everyone
  else. `0` is the rendered empty state, not "hidden".
- **`actions`** — the trailing region, ordered after the reset by the bar.
- **`loading` / `disabled` / `error`** — `aria-busy` on the strip, a model-wide disable, and a
  `role="alert"` error line replacing the count.

The bar still owns **no filter state**. `search`/`filters`/`chips` are rendered consumer data,
`resultCount` is a number you computed. It owns placement, measure, ordering, keyboard order and
announcement — nothing else.

Every region is opt-in: a bar built the old way (`children` + `onClear`) emits none of them and is
geometrically unchanged.

Worked screen: `docs/navigation/filter-bar.tsx`.

---

## Adding to this document

Any future "does the package have an X?" answer belongs here, with: the Gate 0 verdict, the
public-route question, and — for a composition — the exact primitives, the token knobs, and the
state table. If the honest answer is "the consumer cannot reach it publicly", that is a package
gap: fix the library, never patch the consumer app.
