# Layout-bug audit

Scope: every primitive `.tsx` + every story in `src/stories/`, all CSS in
`src/styles/`, plus `.storybook/preview.css`. Goal: catch every
structural bug in the same families as the three already fixed
(SVG-as-block, `.sb-stage` column-stretch, `.breadcrumb-crumb` missing
inline-flex).

Bugs below are present in the code — not speculative.

## Bug class A — primitive without inline-flex context

### A1. `.tab` (TabsTrigger) has no flex / align-items

- **Symbol** `src/styles/shell.css:274` —
  `.tab { padding: var(--spacing-2) var(--spacing-3); font-size: var(--text-sm); color: var(--muted-foreground); border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; user-select: none; }`
- **Symptom** Every `TabsTrigger` whose children are `<Icon /> Label`
  renders the icon and text on the page without aligning them — Radix
  emits a native `<button>` (inline-block by default), so the SVG sits
  on the text baseline instead of the optical center. Visible in
  `stories/Tabs.stories.tsx`:
  - `WithIcons` (lines 152-185)
  - `WithBadges` (lines 187-223) — icon + text + `<Badge>` jam together
  - `Vertical` (lines 269-323)
  - `Nested` (lines 368-404)
  - `AllVariants` "With icons" / "With badges" panels (lines 430-456)
  - `SettingsPage` (lines 481-595) — security tab even has
    `<ShieldCheck /> Security <Badge>1</Badge>` triple-stack
- **Fix** Replace the `.tab` selector with:
  ```css
  .tab { display: inline-flex; align-items: center; gap: var(--spacing-1); padding: var(--spacing-2) var(--spacing-3); font-size: var(--text-sm); color: var(--muted-foreground); border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; user-select: none; }
  ```
  Same shape as the breadcrumb-crumb fix that just shipped.

### A2. `.sb-product` children — icon + meta + caret not laid out

- **Symbol** `src/components/shell/Sidebar.tsx:83` emits
  `<span className="sb-product-meta col flex-1 min-w-0" style={{ display: "flex" }}>` —
  there is no `.sb-product-meta` rule in `shell.css`, so the
  flex-1 + min-w-0 utilities are doing nothing in a non-Tailwind
  consumer; the inline `display: flex` saves it only because it is
  inline.
- **Symptom** The product name + tenant role line in the sidebar brand
  chip relies on Tailwind utilities (`flex-1`, `min-w-0`, `shrink-0`)
  that the umbrella CSS doesn't ship. Combined with the missing
  `.sb-product-meta`, the meta column has no defined direction outside
  of Tailwind contexts.
- **Fix** Add to `shell.css`:
  ```css
  .sb-product-meta { display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden; }
  ```
  And drop the inline `style={{ display: "flex" }}` + the Tailwind
  utilities from Sidebar.tsx line 83-84 (rule 12 — every visual lives
  in shell.css).

## Bug class B — flex column stretch

### B1. `.dialog-footer` is `flex-direction: column-reverse` with no `align-items`

- **Symbol** `src/styles/shell.css:554` —
  ```css
  .dialog-footer {
    display: flex;
    flex-direction: column-reverse;
    gap: var(--spacing-2);
    margin-top: var(--spacing-4);
  }
  ```
- **Symptom** Same exact shape as the `.sb-stage` bug. `<DialogFooter>`
  / `<AlertDialogFooter>` containing `<Button>` (inline-flex) children
  stretches every button to the dialog's full width because default
  `align-items: stretch` applies on a column flex container. shadcn's
  source has the responsive variant `flex flex-col-reverse sm:flex-row
  sm:justify-end` — this port dropped the desktop row + the
  align-items. Visible in every Dialog story
  (`stories/Dialog.stories.tsx` lines 75, 102, 149, 185, 218, 254, 300,
  362) and every AlertDialog story
  (`stories/AlertDialog.stories.tsx` lines 77, 116, 155, 193, 224, 256).
- **Fix** Replace with the responsive shape consumers expect:
  ```css
  .dialog-footer {
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: var(--spacing-2);
    margin-top: var(--spacing-4);
  }
  @media (min-width: 640px) {
    .dialog-footer { flex-direction: row; align-items: center; justify-content: flex-end; }
  }
  ```
  Drop `align-items: stretch` if the intent was always inline
  desktop-only — but at minimum add the row variant so two-button
  Confirm/Cancel rows don't render as a stretched vertical stack on
  desktop.

### B2. Sidebar story `SidebarFrame` is `flex-direction: column` without `align-items`

- **Symbol** `src/stories/Sidebar.stories.tsx:93-110` —
  ```tsx
  <div
    data-collapsed={collapsed}
    style={{
      display: "flex",
      flexDirection: "column",
      width: …, height: 560, background: …,
      borderRight: …, overflow: "hidden",
    }}
  >
    {children}
  </div>
  ```
- **Symptom** The frame stretches every sidebar internal section
  vertically to the frame width — fine for `.sb-section` blocks
  (block-shaped) but the frame has no `min-height: 0` either, so
  scrollable inner regions (the nav-items overflow) clip oddly when
  there are many items (`ManySections` story, lines 187-223).
- **Fix** Add `alignItems: "stretch"` is already the default, but for
  the bug-shape (column stretch), the frame's children are blocks —
  not inline-flex — so this story is OK in practice. Keep an eye on
  the `WithFooter` story (line 273): `footer` slot is a flex row that
  also has `flex-direction: column-reverse` inheritance issues only if
  the consumer wraps it in another column.

  Mitigation: not a bug today; pin parity test if Tabs-style triggers
  are added to the sidebar story later.

## Bug class C — corner anchor

### C1. `corner()` helper places an inline-flex Badge in an absolute span — no width constraint

- **Symbol** `src/stories/Badge.stories.tsx:124-130`
  ```ts
  function corner(): React.CSSProperties {
    return { position: "absolute", top: -6, right: -6 };
  }
  ```
  Used on `OnButton`, `OnAvatar`, `OnIcon`, `NotificationDot` stories
  (lines 138-200, 246-270).
- **Symptom** The wrapping `<span style={corner()}>` is `position:
  absolute` with only `top` + `right` — it sizes to content, which is
  correct for a Badge alone. But when `<Badge variant="error">5</Badge>`
  is the child and the badge itself is `display: inline-flex` (correct
  per `.badge` rule line 226) with `padding: 1px 8px`, the resulting
  pill is fine.

  The real subtle bug: the anchored `<span>` has no `display`, so it
  defaults to `inline`. Inline elements with `position: absolute`
  become "in-flow position absolute" — Firefox renders them, but
  alignment quirks appear when the absolute child has `inline-flex`
  display itself (the parent inline span swallows whitespace, content
  alignment differs by browser).
- **Fix** Tighten the helper:
  ```ts
  function corner(): React.CSSProperties {
    return { position: "absolute", top: -6, right: -6, display: "inline-flex" };
  }
  ```
  Adds an explicit display context so the absolute child's box model
  is deterministic across browsers; doesn't change the visual.

### C2. `.tb-bell-dot` and `.me-icon-btn .ind` use absolute position with no width box

- **Symbol** `src/styles/shell.css:1376` and `:1301` —
  ```css
  .tb-bell-dot { position: absolute; top: var(--spacing-1); right: var(--spacing-1); width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--attention); pointer-events: none; }
  .me-icon-btn .ind { position: absolute; top: var(--spacing-2); right: var(--spacing-2); width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--attention); }
  ```
  Both define explicit width/height, so they size correctly.
- **Fix** Not a bug — both have explicit pixel boxes, so the corner
  anchor pattern works here. (Listed for completeness because the
  audit prompt called out the family.)

## Bug class D — emitted class without CSS rule

### D1. Input emits 11 classes that don't exist in shell.css

- **Symbol** `src/components/primitives/Input.tsx:84-115` builds class
  names that are nowhere in `src/styles/shell.css`:
  - `.input-shell` (line 85)
  - `.input-shell-grouped` (line 88)
  - `.input-size-small` / `.input-size-large` (line 38-42, applied
    inline; class names "input-size-small" / "input-size-large" are
    never defined as CSS rules)
  - `.input-status-error` / `.input-status-warning` (lines 44-48,
    same — class names never defined)
  - `.input-affix` (line 92, 100)
  - `.input-inner` (line 96)
  - `.input-group` (line 107)
  - `.input-addon` (line 109, 113)
- **Symptom** Every `<Input>` with a `prefix` / `suffix` / `addonBefore`
  / `addonAfter` / `size="small"` / `size="large"` / `status="error"` /
  `status="warning"` renders with **zero styling** for the wrapper +
  affix + addon — they fall back to anonymous `<div>` / `<span>`
  defaults. The native `<input>` keeps its `.input` class but the
  focus ring is supposed to live on `.input-shell` (per the JSDoc),
  so focus state is completely missing on slotted inputs.

  Visible in every story under `stories/Input.stories.tsx`:
  - `Sizes` (lines 99-109) — `small` / `large` look identical to
    `default`
  - `StatusStates` (lines 111-150) — error / warning styling missing
  - `WithPrefix` / `WithSuffix` / `PasswordToggle` / `WithAddons`
    (lines 175-243) — the prefix/suffix/addon slots render unstyled
  - `LoginForm` (lines 276-318) — the live login form

  Also `Textarea` emits `.textarea-with-count` (line 205) and
  `.textarea-count` (line 207) — both undefined; the showCount count
  has no styling.
- **Fix** Add the missing rules. Minimal repair (copy the shapes from
  the JSDoc intent + tokens):
  ```css
  .input-shell { display: inline-flex; align-items: center; gap: var(--spacing-2); width: 100%; height: var(--density-element); padding: 0 var(--spacing-3); border: 1px solid var(--input); border-radius: var(--radius-md); background: var(--input-background); color: var(--foreground); font-size: var(--text-sm); }
  .input-shell:focus-within { outline: 2px solid var(--ring); outline-offset: -1px; border-color: transparent; }
  .input-shell .input-inner { flex: 1; min-width: 0; border: 0; background: transparent; color: inherit; font-size: inherit; outline: 0; padding: 0; }
  .input-shell .input-affix { display: inline-flex; align-items: center; color: var(--muted-foreground); flex-shrink: 0; }

  .input-size-small, .input-shell.input-size-small { height: var(--density-element-sm); font-size: var(--text-xs); }
  .input-size-large, .input-shell.input-size-large { height: var(--density-element-lg); font-size: var(--text-base); }

  .input-status-error, .input-shell.input-status-error { border-color: var(--destructive); }
  .input-status-warning, .input-shell.input-status-warning { border-color: var(--warning); }
  .input-status-error:focus, .input-shell.input-status-error:focus-within { outline-color: var(--destructive); }
  .input-status-warning:focus, .input-shell.input-status-warning:focus-within { outline-color: var(--warning); }

  .input-group { display: inline-flex; align-items: stretch; width: 100%; }
  .input-group .input-addon { display: inline-flex; align-items: center; padding: 0 var(--spacing-3); background: var(--surface-2); border: 1px solid var(--input); color: var(--muted-foreground); font-size: var(--text-sm); }
  .input-group .input-addon:first-child { border-right: 0; border-top-left-radius: var(--radius-md); border-bottom-left-radius: var(--radius-md); }
  .input-group .input-addon:last-child  { border-left: 0;  border-top-right-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md); }
  .input-group .input-shell, .input-group .input { border-radius: 0; }
  .input-group .input-shell:first-child, .input-group .input:first-child { border-top-left-radius: var(--radius-md); border-bottom-left-radius: var(--radius-md); }
  .input-group .input-shell:last-child,  .input-group .input:last-child  { border-top-right-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md); }
  .input-shell-grouped { border-radius: 0; }

  .textarea-with-count { position: relative; display: block; }
  .textarea-with-count .textarea-count { position: absolute; bottom: var(--spacing-2); right: var(--spacing-3); font-size: var(--text-2xs); color: var(--muted-foreground); pointer-events: none; }
  ```

### D2. Toaster emits `.toaster` and seven `.toast*` variants that don't exist

- **Symbol** `src/components/primitives/toaster.tsx:13-29` declares
  classes that are missing from `shell.css`:
  - `.toaster` (line 60 — wraps the sonner host)
  - `.toast` (sonner default — used as base by 6 variants)
  - `.toast--success` / `.toast--error` / `.toast--info` /
    `.toast--warning` / `.toast--loading` / `.toast--default`
    (lines 21-26 — the per-variant chip)
- **Symptom** The toast host has no class styling — it inherits
  sonner's `unstyled: true` default (line 62), which means NO bg,
  NO border, NO shadow, NO color. Toasts show up as plain unstyled
  text-on-canvas in every variant. Visible in
  `stories/Toaster.stories.tsx`: `Default`, `Variants`, every
  composition.

  The `.toast-content`, `.toast-title`, `.toast-description`,
  `.toast-icon`, `.toast-loader`, `.toast-btn`, `.toast-close` rules
  DO exist (shell.css:977-1035), so the inner pieces would render —
  but the surrounding chip has no surface.
- **Fix** Add to `shell.css`:
  ```css
  .toaster { font-family: var(--font-sans-jp); }
  .toast { position: relative; display: flex; align-items: flex-start; gap: var(--spacing-3); width: min(360px, calc(100vw - var(--spacing-6))); padding: var(--spacing-3) var(--spacing-4); background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); font-size: var(--text-sm); }
  .toast--success { border-color: color-mix(in oklch, var(--success) 40%, var(--border)); }
  .toast--success .toast-icon { color: var(--success); }
  .toast--error { border-color: color-mix(in oklch, var(--destructive) 40%, var(--border)); }
  .toast--error .toast-icon { color: var(--destructive); }
  .toast--warning { border-color: color-mix(in oklch, var(--warning) 40%, var(--border)); }
  .toast--warning .toast-icon { color: var(--warning); }
  .toast--info { border-color: color-mix(in oklch, var(--info) 40%, var(--border)); }
  .toast--info .toast-icon { color: var(--info); }
  .toast--loading .toast-icon { color: var(--muted-foreground); }
  .toast--default { /* base */ }
  ```

### D3. Sidebar emits `.sb-product-meta` which has no CSS rule

- **Symbol** `src/components/shell/Sidebar.tsx:83` —
  `className="sb-product-meta col flex-1 min-w-0"` with no
  `.sb-product-meta` selector anywhere in `shell.css`.
- **Symptom** See A2 above — same finding.
- **Fix** See A2 above — add the rule.

## Bug class E — missing min-width / nowrap

### E1. `.sb-product-name` truncates without ellipsis

- **Symbol** `src/styles/shell.css:33` —
  `.sb-product-name { font-weight: 500; font-size: var(--text-sm); white-space: nowrap; overflow: hidden; }`
- **Symptom** Has `white-space: nowrap` + `overflow: hidden` but no
  `text-overflow: ellipsis`. A long product name (e.g. "プロジェクト
  五月 — Sandbox Labs Tokyo") gets hard-clipped mid-character instead
  of showing "…". Also no `min-width: 0` so when the parent
  `.sb-product` (flex row) gets tight, the name may not shrink at all
  in Safari (Safari historically needs `min-width: 0` for shrink).
- **Fix**
  ```css
  .sb-product-name { font-weight: 500; font-size: var(--text-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  ```

### E2. `.sb-nav-item .sb-label` missing `white-space: nowrap` + `min-width: 0`

- **Symbol** `src/styles/shell.css:53` —
  `.sb-nav-item .sb-label { flex: 1; overflow: hidden; text-overflow: ellipsis; text-align: left; }`
- **Symptom** `text-overflow: ellipsis` only works when text can't
  wrap. Without `white-space: nowrap` a long label
  ("プロジェクト管理 — 月次ダッシュボード") wraps onto two lines inside
  the 28-px-tall row (visible in `stories/Sidebar.stories.tsx`
  `ManySections` story when an item label is long, and in collapsed
  → expanded transitions).
  Also missing `min-width: 0` so Safari may not shrink.
- **Fix**
  ```css
  .sb-nav-item .sb-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
  ```

### E3. `.tag-label` ellipsis without `min-width: 0` on the flex parent

- **Symbol** `src/styles/shell.css:1114` —
  `.tag-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`
  The parent `.tag` (line 1111) is `inline-flex; max-width: 100%`.
- **Symptom** The label has nowrap+ellipsis but no `min-width: 0`
  on itself and no `flex: 1` either — when a Tag has an icon + a
  long label, the label's natural width pushes out of the `max-width:
  100%` constraint instead of shrinking to fit. Visible in
  `stories/Tag.stories.tsx` `WithIcon` if any of the example labels
  were longer; latent bug.
- **Fix**
  ```css
  .tag-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  ```

### E4. `.tb-chip` `max-width: 240px` without `min-width: 0` on children

- **Symbol** `src/styles/shell.css:77` —
  `.tb-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px 4px 6px; … max-width: 240px; min-width: 0; … }`
  The chip itself has `min-width: 0`. Children:
  - `.tb-chip-icon` `flex-shrink: 0` (good)
  - `.tb-chip-label` `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` — but no `flex: 1` or `min-width: 0` (line 85)
  - `.tb-chip-caret` `flex-shrink: 0` (good)
- **Symptom** Same family as E3. A long project name in the topbar
  chip — visible in `stories/Topbar.stories.tsx` `TenantVariantKintai`
  story (line 172-186) — pushes out of `max-width: 240px` instead of
  ellipsizing because `.tb-chip-label` has no `flex` value.
- **Fix**
  ```css
  .tb-chip-label { flex: 1; min-width: 0; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  ```

## Bug class F — inline button drift

### F1. None — every `<button>` that ships an inline icon uses `.btn` (inline-flex) or wraps the icon in a flex container.

- Audited every Button-rendering story (`stories/Button.stories.tsx`,
  `stories/Tabs.stories.tsx`, `stories/DropdownMenu.stories.tsx`,
  `stories/AppShell.stories.tsx`) — every `<Button>` rendering icon +
  text inherits `.btn { display: inline-flex; align-items: center;
  gap: var(--spacing-2); }` from `shell.css:192`. ✔
- Bare `<button>` elements in the codebase: `tb-icon-btn` (display:
  grid place-items: center, good), `tb-search` (flex/center, good),
  `tb-chip` (inline-flex, good), `tb-org-btn` (flex/center, good),
  `me-icon-btn` (grid place-items, good), `me-context` (flex/center,
  good), `sb-product` (flex/center, good), `sb-nav-item` (flex/center,
  good).
- The one exception is `.tab` — covered in A1.
- The `tag-close` `<button>` (`shell.css:1115` — line height 1, font
  size 13px, no display) renders the bare × character; baseline drift
  could occur but the character has only ascender, so visually fine.
  Listed as low priority.

## Summary

- Total findings: **9** real, **2** noted-low-priority.
- Highest-impact fixes (top 5):
  1. **D1 — Input wrapper classes missing**: every slotted `<Input>`
     (prefix, suffix, addons, size, status) and `Textarea showCount`
     renders unstyled. Add 11 missing rules to `shell.css` — this is
     by far the largest gap, affecting every login form, filter bar,
     and validation flow.
  2. **A1 — `.tab` not inline-flex**: every `<TabsTrigger>` with an
     icon + label looks broken in every story; the Settings tabs
     pattern (icon + label + badge) is unusable today. Add
     `display: inline-flex; align-items: center; gap: var(--spacing-1);`.
  3. **D2 — Toaster `.toast` + variants missing**: every toast in the
     system has no surface. Add the seven missing variant rules.
  4. **B1 — `.dialog-footer` stretches buttons to dialog width**: every
     Dialog / AlertDialog footer renders buttons stacked + full-width
     on desktop. Add the `@media (min-width: 640px)` row-direction
     override (shadcn parity).
  5. **E2 — `.sb-nav-item .sb-label` missing `white-space: nowrap`**:
     long sidebar labels wrap onto two lines and break the 28-px row
     height. One-line fix.

Plus the smaller cleanups (A2 / D3 → add `.sb-product-meta`, E1 →
`text-overflow: ellipsis` on `.sb-product-name`, E3 / E4 → `min-width:
0` + `flex: 1` on `.tag-label` and `.tb-chip-label`, C1 → tighten the
`corner()` helper) — all minor, all one-line.
