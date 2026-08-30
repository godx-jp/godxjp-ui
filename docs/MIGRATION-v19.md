# Migrating to `@godxjp/ui` v19

v19 is a major, but the surface that breaks a **compile** is small: one removed prop and four
renamed tokens. The part worth reading is the second half — several defaults moved by a few
pixels, deliberately, and a design that pinned itself against the old numbers will notice.

Nothing here is a rename for tidiness. Every entry below is either a prop that never worked, a
name that failed the repo's own guard, or an accessibility failure that had to be corrected.

---

## 1. Compile-breaking

### `Card` / `StatCard` — the `size` prop is gone

```diff
- <Card size="compact">
+ <Card density="tight">
```

It shipped in the v6 snapshot with **empty** cva variants (`md: ""`, `compact: ""`) and emitted
`data-size`, but no rule in `card-layout.css` ever matched that attribute. It was inert at every
density for its whole life — a consumer measured it as byte-identical geometry with and without
it. Meanwhile the props table listed it and the StatCard guidance told people to write it.

Card sizing is `density` (`tight` 12px · base 16px · `cozy` 20px), which is implemented and
measured. A second sizing axis would only duplicate it, so the prop is removed rather than
implemented. Passing it now raises a type error.

### Four focus-ring tokens: `-opacity` → `-alpha`

```diff
- --toggle-focus-ring-opacity
- --time-input-focus-ring-opacity
- --sidebar-user-focus-ring-opacity
- --topbar-icon-focus-ring-opacity
+ --toggle-focus-ring-alpha
+ --time-input-focus-ring-alpha
+ --sidebar-user-focus-ring-alpha
+ --topbar-icon-focus-ring-alpha
```

Values are unchanged. These four shipped in 18.15.x with a suffix outside the repo's own property
vocabulary, so `check:token-tiers` had been failing on `main` ever since — silently, because the
release path took a shortcut around it. Renaming was chosen over widening the guard: adding a
second synonym for one concept is exactly what cardinal rules #44/#45 exist to prevent.

**Only override these if your theme sets them.** They are per-component knobs, not roles.

---

## 2. Not breaking, but you will SEE it

These changed on purpose, and each one is an accessibility or alignment fix rather than taste.
If your design has pixel-pinned screenshots, expect diffs here and nowhere else.

| What                         | Before           | After                          | Why                                                                                                                            |
| ---------------------------- | ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `Button size="xs"` height    | 20px             | **24px**                       | 20px is under WCAG 2.2 SC 2.5.8's 24×24 minimum target size, while `size="icon-xs"` beside it already rendered 24px and passed |
| `--input` (control boundary) | 1.46:1           | **3.47:1** light / 3.88:1 dark | a field's 1px edge is the only thing saying "you may type here"; it failed WCAG 2.2 SC 1.4.11                                  |
| `AppShell` top-bar inset     | 16px             | **24px**                       | the shell's bar and the page's content sit on one row and never lined up; the page gutter now owns that axis                   |
| Sidebar nav label            | 13px             | **12.47px**                    | it sat between two steps of the type scale, so every nav row was off the system's type rhythm                                  |
| Auth divider / footer label  | 11px             | **11.107px**                   | same, snapped to `--font-size-2xs`                                                                                             |
| Button counter pill          | translucent tint | **opaque role fills**          | the tint measured 3.64–4.32:1 depending on variant and hover, under SC 1.4.3's 4.5:1 for small text                            |
| NavigationMenu chevron       | 14.4px           | **14px**                       | 14.4px is off the whole-pixel grid, so the stroke landed on half pixels                                                        |

`--input` is decoupled from `--border` now. If your theme sets `--input: var(--border)` you
re-open the contrast bug — set it to its own value held to 3:1 against your surfaces.

### Tenant themes

If you copied a showcase theme, re-check your `--input`. The three shipped showcases were
demonstrating the very defect being fixed (1.46–1.65:1) and have been recomputed against their own
surfaces.

---

## 3. Explicitly NOT breaking

**`@tanstack/react-table` 8 → 9.** The exported `ColumnDef<T>` was always this repo's own
`ColumnDefProp<T>`, never TanStack's, so nothing in DataTable's public API moved. v9 constrains its
row type to `Record<string, any> | Array<any>` and an `interface` has no index signature — a naive
migration would have broken `DataTable<Order>` for every consumer whose row is an interface. An
internal `T & Record<string, unknown>` bridge satisfies that constraint while staying a subtype of
`T`, so `row.original`, `getRowId` and `onRowClick` still speak your type.

**`AuthDivider`.** Now a thin preset over `Separator label` rather than a parallel implementation.
Public API, `data-slot="auth-divider"` and the a11y contract are unchanged. Only the internal
`.ui-auth-divider-{rule,label}` classes are gone — if you styled those directly, target
`.ui-separator-{rule,label}`.

**Every icon token.** All 30+ now read the new `--icon-size-*` scale, at their existing resolved
values, verified across default / compact / comfortable density and inside `.ui-scale-fixed`. Old
names remain.

---

## 4. New things worth adopting

- **`--icon-size-2xs … -4xl`** — the icon axis finally has a named scale (fixed whole-pixel steps,
  not a ratio: icons must land on whole pixels to stay crisp, text has hinting). For a value off
  the scale, set the component's own `--*-icon-size` at the call site; it wins by inheritance
  proximity, so no `!important` and no global override.
- **`Activity`** — the looping counterpart to `Reveal`, for "someone is typing" affordances.
  `announce` defaults to **off**: a live region on a socket-fed flicker floods a screen reader.
- **`Separator label`**, **`Avatar presence`**, **`Textarea autoGrow`**, **`ScrollArea anchor="bottom"`**,
  **`Toggle count`**, **`PageContainer toolbar` / `headerScale`**, **`SplitPane aside={null}`** —
  all from a consumer building a chat screen and finding the library had no legitimate route.

---

## 5. If something looks wrong

Run `pnpm run audit` in your app. The MCP catalogue also carries a
`no-off-scale-token-value` rule now, so an agent working in your codebase will flag a token that
declares a raw length on an axis that has a scale — and tell you the three legitimate routes,
including declaring an off-grid value with a `scale-exempt:` comment rather than hiding it.
