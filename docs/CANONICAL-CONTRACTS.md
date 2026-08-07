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

## 1. `PageHeader` — **EXPORTED** (gh#255)

```ts
import { PageHeader, type PageHeaderProps } from "@godxjp/ui/layout";
```

The page title band — breadcrumbs · `<h1>` · subtitle · `meta` · `extra` — with `layout`
(`stack` | `responsive-inline`) and `loading`.

**Why exported rather than composed.** The band already existed, locked inside `PageContainer`. A
consumer could hand-build one from `Breadcrumb` + `Heading` + `Flex`, but they could **not** get
`.ui-page-header`'s token-owned geometry (row gaps, `extra` alignment, the responsive arrangement,
the `--page-header-divider` opt-in) without copying package CSS. That is the "No" branch above.

**There is exactly one implementation.** `PageContainer` renders this component. They cannot drift.

| Situation                                                                           | Use                                                              |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| The surface **is a page**                                                           | `PageContainer` (`title`/`subtitle`/`meta`/`extra`/`breadcrumb`) |
| A title band **outside a page shell** — Sheet detail, `MasterDetail` pane, tab body | `PageHeader`                                                     |
| The user **may not see the resource at all**                                        | `ErrorSurface` — never a header that leaks the resource's name   |

Two rules that are easy to get wrong:

- **Never nest `PageHeader` inside `PageContainer`** — two `<h1>`s on one page.
- **Mount a standalone `PageHeader` inside sectioning content** (`<section>`, `<article>`, a Sheet
  body). `<header>` computes to the `banner` landmark only _outside_ sectioning content, so a bare
  `<div>` wrapper next to a page's own header produces two banners and fails `landmark-unique`.
  Every real target (Sheet, `MasterDetail`'s `<section>`, a tab panel) already satisfies this.

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

## 6. `ServiceRolePanel` · `BranchScopePicker` · `PermissionMatrix` — **COMPOSE** (gh#257)

None of the three is a framework component. Recorded Gate 0 verdicts:

| Candidate           | C1  | C2  | C3  | C4  | C5  | C6  | C7  | Verdict         |
| ------------------- | --- | --- | --- | --- | --- | --- | --- | --------------- |
| `ServiceRolePanel`  | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | **Composition** |
| `BranchScopePicker` | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | **Composition** |
| `PermissionMatrix`  | ❌  | ❌  | ❌  | ➖  | ✅  | ❌  | ❌  | **Composition** |

And the follow-up question is a clean "Yes": every one is reachable from public primitives + tokens
with no package CSS.

- **`ServiceRolePanel`** → `Card` + `CardContent flush` + `<ul>` of `ListRow as="li"`, each row's
  `trailing` being a role `Select`. **Read-only / locked is a `Badge` stating the fact, never a
  disabled `Select`** — a disabled control is a dead tab stop that implies "editable later".
- **`BranchScopePicker`** → `TreeSelect` (`multiple treeCheckable showSearch
showCheckedStrategy={SHOW_PARENT}`) inside a `FormField`. This one is stronger than a Gate 0 fail:
  a hierarchical multi-select with parent/child aggregation **is** `TreeSelect`, so adding it would
  duplicate a primitive. `SHOW_PARENT` is what collapses a fully selected subtree to one chip
  instead of 42.
- **`PermissionMatrix`** → the `Table` family + `Badge`, with the sticky first column composed as
  `docs/showcase/table-sticky-columns.tsx` does (`ColumnDef` can pin only a trailing column).

**What the package DOES own** is the part every consumer would otherwise re-derive — the grant/diff
data logic, shipped as a pure, framework- and locale-neutral util:

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

Worked screens: `docs/showcase/service-role-scope.tsx`, `docs/showcase/permission-matrix.tsx`.
MCP: `get_pattern("rbac-service-roles")`.

---

## 7. `FilterBar` — **EXPORTED, and now typed** (gh#258)

`FilterBar` / `FilterBarGroup` remain the public domain-neutral names for the `Toolbar` primitives.
What changed is that child composition alone no longer has to define the bar's shape:

```tsx
<FilterBar
  search={<SearchInput value={q} onSearch={setQ} />}
  chips={applied.map((f) => ({ id: f.id, label: f.label, onRemove: () => lift(f.id) }))}
  resultCount={rows.length}
  onClear={clearAll}
  hasActiveFilters={applied.length > 0}
  actions={
    <Button variant="outline" size="sm">
      エクスポート
    </Button>
  }
>
  <FilterBarGroup label="状態" controlId="f-status">
    …
  </FilterBarGroup>
</FilterBar>
```

**Order is the contract.** DOM order is tab order, and the **bar** decides it, not each page:

```
search → filter groups (children) → applied chips → result count → reset → actions
```

Reset sits before `actions` deliberately, so "clear filters" never lands at the end of the row
beside an unrelated primary action.

What each prop buys that a plain child did not:

- **`search`** — one token-owned measure (`--filter-bar-search-width`) across every list page,
  full-width below the 640px step. As a child it kept whatever width that page happened to give it.
- **`chips`** — the chip lifecycle: a labelled group, a remove control named after _that specific_
  filter (a row of buttons all called "Remove" is unusable from a screen-reader's control list),
  and no row at all when nothing is applied. Omit a chip's `onRemove` for a filter the user may not
  lift and it renders with **no** remove control rather than a disabled one.
- **`resultCount`** — a polite live region formatted with `Intl.NumberFormat` + CLDR plurals. This
  is the accessibility point: a sighted user _sees_ the table change; this is what tells everyone
  else. Pass `0` when nothing matched; omit it only while the count is genuinely unknown.
- **`actions`** — the trailing region, ordered after the reset by the bar.

The bar still owns **no filter state**. `search` is a slot, `chips` is a rendered array,
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
