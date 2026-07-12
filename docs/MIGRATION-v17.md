# Migrating to `@godxjp/ui` v17

v17 is a **major** release. It ships one breaking change (`Flex` default direction), a set of new
primitives that replace patterns consumers used to hand-roll in CSS, and a safer default for
query-error rendering. `@godxjp/ui` and its catalog `@godxjp/ui-mcp` publish in lockstep — always
install the **same** version of both (17.0.x ↔ 17.0.x).

- **Minimum:** `@godxjp/ui@^17.0.0` (current: 17.0.1)
- **Catalog:** `@godxjp/ui-mcp@^17.0.0` (agents/MCP consumers)
- One breaking change: [`Flex` defaults to `row`](#1-breaking-flex-defaults-to-row)
- Everything else is additive or a safer default you can opt back out of.

---

## 1. BREAKING: `Flex` defaults to `row`

`<Flex>` now follows the CSS-standard default `direction="row"`. Previously it defaulted to `col`.

```tsx
// v16: this stacked vertically (implicit col)
<Flex gap="sm">
  <Label />
  <Input />
</Flex>

// v17: the SAME markup now lays out horizontally (row).
// If you wanted a vertical stack, say so explicitly:
<Flex direction="col" gap="sm">
  <Label />
  <Input />
</Flex>
```

### How to migrate

Audit every `<Flex>` that does **not** pass `direction=`:

1. If it already carries a horizontal signature — `align="center"`, `justify="between"/"end"`,
   `wrap`, `truncate` + `min-w-0`, or inline icon-and-text children — it **intended a row**. Leave
   it; v17 now matches that intent (several such cases were silently mis-rendering as a column
   under v16).
2. If its children are a **vertical stack** (form fields, card sections, a list of blocks) — add
   `direction="col"`.
3. When in doubt, add `direction="col"`: that reproduces the v16 default exactly, so it is the
   zero-visual-change choice.

> Tip: `grep -rn '<Flex' src | grep -v direction` to find the candidates, then classify each by the
> rule above. In practice most direction-less `Flex` uses already carry a row signature.

---

## 2. New primitives — stop hand-rolling these in CSS

v17 promotes three patterns that consumers previously re-implemented with bespoke CSS classes into
first-class primitives. Delete the custom classes and compose the primitive instead.

### 2.1 `AuthShell` — centered auth/login page shell

Replaces hand-rolled `.auth-shell-*` / `.ui-auth-scope` classes.

```tsx
import { AuthShell } from "@godxjp/ui/layout";

<AuthShell
  brand={<Logo />} // top bar
  footer={<LegalLinks />} // bottom bar
>
  <Card>…the login form…</Card> {/* centered main, over min-h-dvh */}
</AuthShell>;
```

`AuthShell` scopes the comfortable control tier (44px, the WCAG touch-target floor) and a larger
auth heading through `--auth-shell-*` tokens — retheme via those tokens, not by forking CSS. To pin
the card width to a brand value, set the token once (e.g. `--auth-shell-card-max-width`) rather than
adding a wrapper class.

### 2.2 `Reveal` — entrance motion

Replaces hand-rolled `@keyframes` + `.app-reveal` / `.d1..d6` stagger classes.

```tsx
import { Reveal } from '@godxjp/ui/general';

<Reveal delay={0}>{<Heading/>}</Reveal>
<Reveal delay={1}>{<Field/>}</Reveal>
<Reveal delay={2}>{<Actions/>}</Reveal>
```

- `delay` is an **ordinal** `0..6` (an index into the motion ladder) — never a raw millisecond.
- Reads the DS motion tokens (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`,
  `--reveal-stagger-step`), supports `asChild`, and honours `prefers-reduced-motion` (no animation,
  content stays visible, no layout shift).

### 2.3 `EmptyState` `tone` — semantic medallion

Replaces hand-rolled `.ui-success-state` overrides of `--empty-state-icon-*`.

```tsx
<EmptyState tone="success" icon={CheckCircle} title="Device approved" />
```

`tone` ∈ `muted | success | warning | destructive | info` (default `muted`). It tints the icon
medallion from the matching role token. `EmptyState` also gained `page | section | compact` variants
for context-appropriate visual weight.

### 2.4 Content padding inside a flush card

There is no `.ui-card-inset` class. When a `Card` needs full-bleed content (a `DataTable`) **and** a
padded region, use a non-flush `<CardContent>` for the padded part instead of a custom inset class:

```tsx
// before: <CardContent flush> … <div className="ui-card-inset"> … </div>
<CardContent>
  <Flex direction="col" gap="lg">
    …grouped content…
  </Flex>
</CardContent>
```

---

## 3. Safer query errors (behavioural change, opt-out available)

`DataState` and `Alert.QueryError` now classify errors by cause via `classifyQueryError` and render
a **localized, cause-specific** message. The raw backend/token/stack text is **no longer shown by
default** — a deliberate security improvement (no raw-error leakage into the UI).

| Cause                                                 | Behaviour                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `transient` / network / 5xx                           | safe "try again" message **+ Retry**                         |
| `auth` (401 / expired token)                          | routes to session renewal via `onAuthError` (no blind retry) |
| `forbidden` / `notFound` / `validation` (403/404/422) | cause-aware message, **no** blind retry                      |

### If your tests or UI relied on the raw message

- Don't assert on `error.message` text (`'boom'`) — assert the error region (`role="alert"`) and,
  for a transient error, the Retry control. Assert the **absence** of raw text if you're proving no
  leakage.
- Need a domain-specific message (e.g. a 422 field error)? Pass a custom `errorRenderer`.
- Need 401 recovery? Pass `onAuthError` (`DataState`) / `onAuthAction` (`Alert.QueryError`).
- Want the old always-Retry behaviour for a cause? Opt in with `showRetry`.
- New exports for branching your own UI: `classifyQueryError` / `isRetryableQueryError` from
  `@godxjp/ui/query` (categories: `auth | forbidden | notFound | validation | transient | unknown`).

`DataState` also now distinguishes a **disabled/unstarted** query (`enabled:false` →
`isPending` + `fetchStatus:'idle'`) from active loading — pass a `prerequisite` slot for
tenant/org-gated queries so they never flash a skeleton. A background refetch keeps existing content
on screen (polite `sr-only` busy status) instead of flashing the skeleton over resolved data.

## 4. `Select` — safe empty/async states

- A static data-driven `Select` with **no options** now disables itself (no blank popover).
- An async `Select` (`loadOptions`) treats loading / no-options / error as distinct states: a
  rejected loader shows its own error affordance (no unhandled rejection, no "no results" masquerade)
  and the panel carries `aria-busy` while fetching. Override the default message with `errorMessage`.

## 5. `AppSettingPicker` — icon-only trigger

`appearance` prop (`"labeled" | "icon"`, default `"labeled"`). `appearance="icon"` is a first-class
icon-only topbar trigger (e.g. a globe locale switcher) — it keeps the localized `aria-label`, so an
icon-only trigger can never ship without an accessible name.

---

## 6. Consumer-agnostic guarantee

v17 removed every embedded downstream-consumer/product name from the library's source, catalog,
skills, and showcases (they now use the library's own "reference design" language or a neutral
fictitious `Acme`). A CI gate — `check:no-consumer-coupling` — keeps it that way: library source may
not name a specific consumer/deployment or bake in a locale/currency/timezone literal. If you are
extending the library and hit that gate, use a neutral/fictitious name or route the value through
`Intl`/CLDR — never a customer's name.

---

## 7. Upgrade checklist

- [ ] Bump `@godxjp/ui` **and** `@godxjp/ui-mcp` to `^17.0.0` together (lockstep).
- [ ] Audit direction-less `<Flex>` (§1); add `direction="col"` to vertical stacks.
- [ ] Replace `.auth-shell-*` / `.ui-auth-scope` → `<AuthShell>` (§2.1).
- [ ] Replace `.app-reveal` / `.d1..d6` + `@keyframes` → `<Reveal delay>` (§2.2).
- [ ] Replace `.ui-success-state` → `<EmptyState tone="success">` (§2.3); `.ui-card-inset` → non-flush `<CardContent>` (§2.4).
- [ ] Update error-path tests to the safe classified behaviour; wire `onAuthError` for 401 (§3).
- [ ] Delete the now-dead custom classes from your global CSS once `grep` shows zero references.
- [ ] Build + run your test suite; there are no type-level breaks beyond the `Flex` layout shift.

See [CHANGELOG.md](../CHANGELOG.md) `[17.0.0]` / `[17.0.1]` for the full itemized list.
