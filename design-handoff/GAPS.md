# Visual gap audit

Side-by-side compare of the Claude Design handoff (`design-handoff/godx-admin/project/*`) vs the current `@godxjp/ui` source (`src/styles/*`, `src/components/{primitives,shell}/*`). Quoted declarations come straight from those files.

Legend:
- **MATCH** = change current to the handoff value.
- **EXTEND** = handoff has a class / token current is missing; add it.
- **KEEP**  = effectively the same; no change.

Note on scope: the handoff defines THREE shell variants — `.app-root` (forge / dev workspace, sidebar 256px / header 48px / `--text-sm` rows), `.app-root.console` (console portal, sidebar 220px / header 56px / `font-size:14px` rows), and `.app-root.me` (me portal, same dims as console but rounded-pill chips + warmer hero). The current package ships ONE shell (`.app-root` only) tuned to a hybrid that mostly matches none of the three. Most gaps below stem from that.

## A. Tokens

| Token | Handoff value | Current value | Action |
|---|---|---|---|
| `--sidebar-width` | `16rem` (256px) — `tokens.css:137` | `13rem` (208px) — `theme.css:112` | MATCH → `--sidebar-width: 16rem`. Note current has comment `/* 208px — design jZUk parity */`, but handoff says 256px. Console + me variants both want **220px** (`console.css:5`, `me.css:9`) — see Item I below for variant tokens. |
| `--header-height` | `3rem` (48px) — `tokens.css:136` | `3rem` (48px) — `theme.css:111` | KEEP. But console + me use **56px** (`console.css:6`, `me.css:10`) via local override — see Item I. |
| `--brand` default | `oklch(60% 0.137 163)` declared inside `[data-tenant="godx"]` only — `tokens-ext.css:42` | Same — `theme.css:263` | KEEP. (Implication: without `data-tenant="godx"` on `<html>`, `var(--brand)` is undefined → `.sb-logo-mark`, `.avatar.brand`, `.auth-art` paint with no background. Storybook stories likely fail this.) |
| `--font-mono` | Not defined; `me-shell.jsx:31` and `shell.jsx:241,417` reference `var(--font-mono)` — handoff bug, but live code uses inline `ui-monospace, SFMono-Regular, Menlo, monospace` literals everywhere | Not defined either | EXTEND → add `--font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;` in `:root` and replace inline literals across `shell.css` (8+ sites). Otherwise me.css's `.me-user-email`, `.identity-email`, etc. resolve to no font-family. |
| `--text-sm` | `0.8125rem` (13px) | `0.8125rem` (13px) | KEEP. |
| `--text-base` | `0.875rem` (14px) | `0.875rem` (14px) | KEEP. |
| `--radius` | `0.375rem` (6px) | `0.375rem` (6px) | KEEP. Console + me variants want **8–14px** locally on cards / sidebar items — see Item B / F. |
| `body { font-feature-settings: "palt" }` | Set in `tokens-ext.css:121` | Set in `base.css:21` | KEEP. |

## B. Sidebar (.app-sidebar / .sb-*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.app-root` columns | `grid-template-columns: var(--sidebar-width) 1fr` with `--sidebar-width: 16rem` → **256px** (`tokens-ext.css:137`+`tokens.css:137`) | Same grid; `--sidebar-width: 13rem` → **208px** (`theme.css:112`, `shell.css:11`) | MATCH → set `--sidebar-width: 16rem`. |
| `.sb-product` height | `height: var(--header-height)` = **48px**, `padding: 0 var(--spacing-4)` (`tokens-ext.css:151`) | Same — `shell.css:27` | KEEP. |
| `.sb-logo-mark` | `width: 24px; height: 24px; border-radius: 6px; background: var(--brand); color: var(--primary-foreground); font-weight: 700; font-size: 12px` (`tokens-ext.css:153`) | Identical — `shell.css:31` | KEEP. |
| `.sb-product-name` | `font-weight: 500; font-size: var(--text-sm)` (`tokens-ext.css:154`) | Identical — `shell.css:33` | KEEP. |
| `.sb-nav-item` (default shell) | `height: var(--density-element-sm)` = **28px**, `padding: 0 var(--spacing-2)` (8px), `font-size: var(--text-sm)` = 13px, `gap: var(--spacing-2)` (`tokens-ext.css:161`) | Identical — `shell.css:45` | KEEP. |
| `.sb-nav-item[data-active]` | `background: var(--sidebar-active-bg); color: var(--sidebar-active-fg); font-weight: 500` where `--sidebar-active-bg: oklch(95% 0.02 240)` (very pale primary tint) and `--sidebar-active-fg: var(--primary)` (`tokens-ext.css:16,17,163`) | Same — `shell.css:49`+`theme.css:196-197` | KEEP. **But me variant overrides** to `background: color-mix(in oklch, var(--primary) 10%, transparent); color: var(--primary)` and adds a separate `:hover` rule at 14% — see Item I. |
| `.sb-product-meta` (the column wrapping name + tenant) | Inline `style={{ display: 'flex', minWidth: 0, flex: 1 }}` (`shell.jsx:195`) and used by `Sidebar.tsx:84` | `.sb-product-meta` class doesn't exist in `shell.css`; only inline styles in `Sidebar.tsx` carry it | EXTEND → add `.sb-product-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }` so the Tailwind utility soup (`col flex-1 min-w-0`) in `Sidebar.tsx:83-85` can be replaced by a single class (rule 15 — no Tailwind re-encoding tokens). |
| `.sb-section` padding | `padding: var(--spacing-3) var(--spacing-2)` = 12px 8px (`tokens-ext.css:157`) | Identical — `shell.css:37` | KEEP. |
| `.sb-section-label` | `font-size: var(--text-2xs)` = 11px, `letter-spacing: 0.06em`, `text-transform: uppercase`, `padding: 0 var(--spacing-2) var(--spacing-1)` (`tokens-ext.css:159`) | Identical — `shell.css:41` | KEEP. |
| `.sb-nav` gap | `gap: 1px` (tight stacking) (`tokens-ext.css:160`) | Identical — `shell.css:43` | KEEP. |
| `.sb-nav-item .sb-badge` | `background: var(--surface-3); color: var(--muted-foreground); font-size: var(--text-2xs); padding: 1px 6px; border-radius: var(--radius-full)` (`tokens-ext.css:166`) | Identical — `shell.css:55` | KEEP. |
| `.sb-nav-item[data-active] .sb-badge` | `background: color-mix(in oklch, var(--primary) 18%, transparent); color: var(--primary)` (`tokens-ext.css:167`) | Identical — `shell.css:57` | KEEP. |
| `.sb-icon` width | `width: 16px; height: 16px` (`tokens-ext.css:164`) | Identical — `shell.css:51` | KEEP. |
| `.sb-brand` (alternative top slot used by me + console) | `display: flex; align-items: center; gap: var(--spacing-2); height: var(--header-height); padding: 0 var(--spacing-4); border-bottom: 1px solid var(--sidebar-border)` — `shell.css:1035` already has this. Handoff uses 56px header in me/console so it overrides to `height: 56px; padding: 0 16px` (`me.css:18-21`, `console.css:14-17`). | `shell.css:1035` matches base shape. No variant heights baked in. | KEEP base; see Item I for variant heights. |
| `.sb-brand-avatar` | base shell uses `width: 28px; height: 28px; border-radius: var(--radius-md); background: color-mix(in oklch, var(--primary) 22%, transparent)` (`shell.css:1037`). Handoff me variant: `width: 32px; height: 32px; border-radius: 99px; background: var(--primary); color: var(--primary-foreground); font-weight: 700; font-size: 12px` (`me.css:22-29`) | `shell.css:1037` matches base | KEEP base. See Item I for me variant. |
| `.sb-footer` | `margin-top: auto; border-top: 1px solid var(--sidebar-border); padding: var(--spacing-3) var(--spacing-2)` (`tokens-ext.css:177`) | Identical — `shell.css:69` | KEEP. |
| Collapsed `.sb-nav-item` | `justify-content: center; padding: 0; width: var(--density-element-sm); margin: 0 auto` (`tokens-ext.css:174`) | Identical — `shell.css:65` | KEEP. |

## C. Topbar (.app-topbar / .tb-*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.app-topbar` | `background: var(--topbar-bg); border-bottom: 1px solid var(--topbar-border); padding: 0 var(--spacing-4); gap: var(--spacing-3)` (`tokens-ext.css:147`) | Identical — `shell.css:23` | KEEP. |
| `.tb-chip` | `padding: 4px 8px 4px 6px; border-radius: var(--radius-md); border: 1px solid transparent; background: transparent; font-size: var(--text-sm); max-width: 240px; transition: background .12s, border-color .12s` (`tokens-ext.css:185`) | Identical — `shell.css:77` | KEEP. |
| `.tb-chip-icon` | `width: 18px; height: 18px; border-radius: 4px; color: var(--primary-foreground); font-weight: 700; font-size: 10px` (`tokens-ext.css:188`) | Identical — `shell.css:83` | KEEP. |
| `.tb-chip-sep` | `color: var(--muted-foreground); user-select: none; padding: 0 1px` (`tokens-ext.css:192`) | Identical — `shell.css:91` | KEEP. |
| `.tb-chip-route` | `color: var(--muted-foreground); padding: 4px 6px; font-size: var(--text-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (`tokens-ext.css:193`) | Identical — `shell.css:93` | KEEP. |
| `.tb-search` | `width: 320px; height: var(--density-element-sm) (28px); padding: 0 var(--spacing-2); border: 1px solid var(--input); border-radius: var(--radius-md); background: var(--input-background); color: var(--muted-foreground); font-size: var(--text-sm)` (`tokens-ext.css:220`) | Identical — `shell.css:138` | KEEP. |
| `.tb-icon-btn` | `width: var(--density-element-sm) (28px); height: var(--density-element-sm); border-radius: var(--radius-md); color: var(--muted-foreground); background: transparent; border: 0` (`tokens-ext.css:226`) | Identical — `shell.css:146` | KEEP. (Console variant overrides to 36×36 / radius 8px — Item I.) |
| `.tb-breadcrumb` | `display: flex; align-items: center; gap: var(--spacing-1); font-size: var(--text-sm); color: var(--muted-foreground); flex: 1; min-width: 0` (`tokens-ext.css:180`) | Identical — `shell.css:71` | KEEP. |
| Topbar Avatar at right edge | `<Avatar name="Satoshi F" brand />` rendered directly in topbar after `tb-icon-btn`s (`shell.jsx:366`) | `Topbar.tsx` renders no avatar — host page supplies an avatar via `rightSlot`. Stories likely don't pass one → topbar looks empty on the right. | EXTEND → either add an `avatar` prop to `Topbar` or document `rightSlot` consistently in stories; otherwise topbar stories show only the search box + 1 icon. |
| Topbar notification dot | `<span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: "var(--attention)", borderRadius: 99 }}/>` inline in `shell.jsx:364` | Not represented — `Topbar.tsx` has no notification button at all | EXTEND → if Storybook is supposed to show "Topbar with notification" parity, the notification button + dot is part of the visual reference. Add a `notifications` slot or a dedicated `tb-bell-dot` element with class-based positioning. |

## D. Badge (.badge / .badge-*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.badge` base | `display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: var(--radius-full); font-size: var(--text-2xs); font-weight: 500; line-height: 1.5; border: 1px solid transparent` (`tokens-ext.css:266`) | Identical — `shell.css:208` | KEEP. |
| `.badge .dot` | `width: 6px; height: 6px; border-radius: 99px` (`tokens-ext.css:267`) | Identical — `shell.css:210` | KEEP. |
| `.badge-success/warning/info/error/attention` | `background: color-mix(in oklch, var(--<role>) 14-18%, transparent); color: color-mix(in oklch, var(--<role>) 80%, var(--foreground))` (`tokens-ext.css:268-279`) | Identical — `shell.css:212-230` | KEEP. |
| `.badge-neutral` | `background: var(--surface-3); color: var(--muted-foreground)` (`tokens-ext.css:278`) | Identical — `shell.css:232` | KEEP. |
| `.badge-outline` | `background: transparent; border-color: var(--border); color: var(--muted-foreground)` (`tokens-ext.css:280`) | Identical — `shell.css:236` | KEEP. |
| Default dot rendering | Handoff `<Badge>` renders dot **by default** (`ui-kit.jsx:116`: `dot = true`) | Current `<Badge>` default `dot = false` (`Badge.tsx:40`) | MATCH → change `Badge.tsx:40` default to `dot = true`. This single change drives a large share of "looks different from the design" because every badge in design mockups shows a colored dot; in current Storybook, dot-less variants are the default sample. |

## E. Avatar (.avatar / .avatar.brand)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.avatar` | `width: 28px; height: 28px; border-radius: 99px; background: var(--surface-3); display: grid; place-items: center; font-size: var(--text-xs); font-weight: 600; color: var(--foreground); flex-shrink: 0` (`tokens-ext.css:230`) | Identical — `shell.css:152` | KEEP. |
| `.avatar.brand` | `background: var(--brand); color: var(--primary-foreground)` (`tokens-ext.css:231`) | Identical — `shell.css:154` | KEEP — but only renders correctly when `data-tenant="<x>"` is set on `<html>` so `--brand` resolves; otherwise transparent. See A. |
| Initials extraction | `(name || "?").split(/\s+/).map(s => s[0]).slice(0,2).join("").toUpperCase()` (`ui-kit.jsx:125`) | Current `Avatar.tsx` does **not** auto-extract initials from a `name` prop — caller must pass children manually. | EXTEND → add an optional `name?: string` prop to `Avatar.tsx` that, when present and no `src`/`icon`/`children`, computes initials with the same regex. Otherwise stories using `<Avatar name="Satoshi F" brand />` (handoff shape) silently render blank. |
| `variant="brand"` ↔ Tailwind `brand` flag | `cx("avatar", brand && "brand")` (`ui-kit.jsx:126`) | `cn("avatar", isBrand && "brand", className)` where `isBrand = variant === "brand"` (`Avatar.tsx:82`) | KEEP — semantically equivalent. |
| Default size | 28×28 (default token resolves to `SIZE_PX.default = 28`) — `Avatar.tsx:42-46` | Same | KEEP. |
| Size token `sm` | Handoff `.avatar-sm` from `console.css:375` is `width: 26px; height: 26px; font-size: 10px`. Current `Avatar.tsx` `sm` = 24px. | Slight mismatch (24 vs 26) | KEEP (current 24px is a reasonable scale step; only the console layout needs 26px and that's a layout-level override anyway). |

## F. Card (.card / .card-*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.card` | `background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: var(--density-card)` (`tokens-ext.css:240`) | Identical — `shell.css:166` | KEEP. |
| `.card-header` | `display: flex; align-items: center; gap: var(--spacing-2); margin-bottom: var(--spacing-3); padding-bottom: var(--spacing-3); border-bottom: 1px solid var(--border)` (`tokens-ext.css:241`) | Identical — `shell.css:168` | KEEP. |
| `.card-header-title-group` | Handoff doesn't define this class — header is single flex row of `card-title` + `card-subtitle` inline (no wrapping group). | `Card.tsx:83` wraps title+subtitle in `<div className="card-header-title-group">` but **no CSS rule for that class exists in `shell.css`** → it falls back to a `<div>` with no styles, which still works since the parent `.card-header` is `display: flex`. | EXTEND → add `.card-header-title-group { display: flex; flex-direction: column; gap: var(--spacing-1); min-width: 0; flex: 1; }` so subtitle wraps under title with a tight gap (current behaviour: subtitle sits to the RIGHT of title because both are flex children of `.card-header`). This is one of the most visible "doesn't look like the design" gaps. |
| `.card-header-extra` | Handoff uses `.page-actions { margin-left: auto }` (`tokens-ext.css:238`) on the right-hand actions; no `.card-header-extra` class exists in handoff. | `Card.tsx:90` wraps `extra` in `<div className="card-header-extra">` — also undefined in `shell.css`. | EXTEND → add `.card-header-extra { margin-left: auto; display: flex; gap: var(--spacing-2); align-items: center; flex-shrink: 0; }`. |
| `.card-body` | Handoff has no explicit `.card-body` class — content is direct child of `.card`. | `Card.tsx:94` wraps children in `<div className="card-body">` — also undefined in `shell.css`. | EXTEND → either remove the wrapper from `Card.tsx` (simpler, matches handoff) OR add `.card-body { display: flex; flex-direction: column; gap: var(--spacing-3); }`. Match the handoff: remove the wrapper unless stories rely on it. |
| `.card-actions` | Handoff has no `.card-actions`; uses `.danger-row`, `.invitation-foot` etc. for footer-shaped affordances. | `Card.tsx:96` renders `<div className="card-actions">` — undefined in `shell.css`. | EXTEND → add `.card-actions { padding-top: var(--spacing-3); border-top: 1px solid var(--border); margin-top: var(--spacing-3); display: flex; gap: var(--spacing-2); justify-content: flex-end; }`. |
| `.card-size-small` | Not in handoff. | Referenced from `Card.tsx:45` — undefined in `shell.css`. | EXTEND → add `.card-size-small { padding: calc(var(--density-card) * 0.625); }` (matches Ant's small card density step). |
| `.card-variant-filled` / `.card-variant-borderless` | Not in handoff. | Referenced from `Card.tsx:51-53` — undefined in `shell.css`. | EXTEND → add `.card-variant-filled { background: var(--surface-2); border-color: transparent; }` and `.card-variant-borderless { background: transparent; border: 0; padding: 0; }`. |
| `.card-hoverable` | Handoff equivalent (`.prod-card:hover { border-color: var(--muted-foreground); box-shadow: var(--shadow-sm); }`, `console.css:169`) is applied to a specific class, not a `hoverable` modifier on `.card`. | Referenced from `Card.tsx:75` — undefined in `shell.css`. | EXTEND → add `.card-hoverable { transition: border-color .15s, box-shadow .15s; cursor: pointer; } .card-hoverable:hover { border-color: var(--muted-foreground); box-shadow: var(--shadow-sm); }`. |
| `.card-title` | `font-size: var(--text-base); font-weight: 500; margin: 0` (`tokens-ext.css:242`) | Identical — `shell.css:170` | KEEP. |

## G. Button (.btn / .btn-*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.btn` | `display: inline-flex; align-items: center; justify-content: center; gap: var(--spacing-2); height: var(--density-element); padding: 0 var(--spacing-3); border-radius: var(--radius-md); border: 1px solid transparent; font-size: var(--text-sm); font-weight: 500; line-height: 1; transition: background var(--transition-fast), border-color var(--transition-fast); white-space: nowrap` (`tokens-ext.css:245`) | Identical — `shell.css:174` | KEEP. |
| `.btn:focus-visible` | `outline: 2px solid var(--ring); outline-offset: 2px` (`tokens-ext.css:246`) | Identical — `shell.css:176` | KEEP. |
| `.btn-primary` (BASE, light tenant) | `background: var(--primary); color: var(--primary-foreground)` (`tokens-ext.css:247`) | Same — `shell.css:178` | KEEP. |
| `.btn-primary` (CONSOLE override) | `background: oklch(20% 0.006 60); color: white; border: 0` — i.e. **near-black**, not the SmartHR blue (`console.css:207`). `:hover` `oklch(28% ...)`. This is the "ink button" Linear / Vercel look the console mockups use. | Current has no scoped override — every `.btn-primary` is blue. | EXTEND → add the console scoped rule: `.app-root.console .btn-primary, .console-primary { background: oklch(20% 0.006 60); color: var(--background); border: 0; } .app-root.console .btn-primary:hover { background: oklch(28% 0.006 60); }` — OR introduce a `<Button variant="ink">` for the dark-button style and use it in console mockups. Without this, console Storybook screens show "wrong colored buttons" front and centre. |
| `.btn-secondary` | `background: var(--surface-1); color: var(--foreground); border-color: var(--border)` (`tokens-ext.css:249`) | Identical — `shell.css:182` | KEEP. |
| `.btn-ghost` | `background: transparent; color: var(--foreground)` (`tokens-ext.css:251`) | Identical — `shell.css:186` | KEEP. |
| `.btn-danger` | `background: var(--destructive); color: var(--destructive-foreground)` (`tokens-ext.css:253`) | Identical — `shell.css:190` | KEEP. |
| `.btn-sm` | `height: var(--density-element-sm); padding: 0 var(--spacing-2); font-size: var(--text-xs)` (`tokens-ext.css:255`) | Identical — `shell.css:194` | KEEP. |
| `.btn-lg` | `height: var(--density-element-lg); padding: 0 var(--spacing-4)` (`tokens-ext.css:256`) | Identical — `shell.css:196` | KEEP. |

## H. Layout containers (.app-shell, .app-main, .page-content*)

| Element | Handoff CSS | Current CSS | Action |
|---|---|---|---|
| `.app-root` grid | `display: grid; grid-template-columns: var(--sidebar-width) 1fr; grid-template-rows: var(--header-height) 1fr; grid-template-areas: "sidebar topbar" "sidebar main"; height: 100vh; background: var(--surface-2)` (`tokens-ext.css:135`) | Identical — `shell.css:9` | KEEP. |
| Collapsed root | `grid-template-columns: var(--sidebar-collapsed-width) 1fr` (`tokens-ext.css:144`) | Identical — `shell.css:19` | KEEP. |
| `.app-main` | `grid-area: main; overflow: auto` (`tokens-ext.css:148`) | Identical — `shell.css:25` | KEEP. |
| `.app-root.console` / `.app-root.me` shell variants | Define their own grid + 56px header (`console.css:4-9`, `me.css:8-13`) | Not present in `src/styles/shell.css` | EXTEND → see Item I. Without these, the Storybook "Console portal" + "Me portal" composites can't approximate the live screen. |
| `.page` (legacy) | `padding: var(--spacing-6); max-width: var(--container-max-width); margin: 0 auto` (`tokens-ext.css:234`) | Identical — `shell.css:156` | KEEP. |
| `.page-header`, `.page-title`, `.page-actions` | Handoff defines (`tokens-ext.css:235-238`) | Identical — `shell.css:158-164` | KEEP. |
| `.page-content` family | Not in handoff CSS; current implementation is `@godxjp/ui`-original (`shell.css:1049-1077`). | Present — `shell.css:1049` | KEEP. (See Item J for "extra current chrome".) |
| `.page-content-title` | Current: `font-size: var(--text-2xl, 1.5rem); font-weight: 600; line-height: 1.2` (`shell.css:1067`) | The closest handoff analogue (`.ds-hero-title`, `console.css:141`) is `font-size: 24px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.3`. Handoff `.page-title` (legacy `.page`) is `font-size: var(--density-page-title); font-weight: 500; letter-spacing: -0.01em` = 20px @ 500 weight. | MATCH → change `.page-content-title` weight from `600` to `500` and add `letter-spacing: -0.01em`. The 600 weight makes page titles look heavier than every other heading on the page (which is uniformly 500), so this is one of the visible "off-vibe" deltas. |

## I. Primitives present in handoff but absent / weaker in current

These are entirely-missing classes / variants. Each row = "EXTEND".

| Concept | Where handoff defines it | Current state | Recommended class set |
|---|---|---|---|
| **Console portal shell** | `console.css:4-131` | Missing entirely | Add: `.app-root.console { grid-template-columns: 220px 1fr; grid-template-rows: 56px 1fr; background: var(--background); }` + the `.console-sidebar .sb-*` overrides (`.sb-brand` height 56px / padding 16px, `.sb-brand-mark` 32px square, `.sb-brand-version` mono chip, `.sb-nav-item` height 38px / radius 8px / font-size 14px, `.sb-sub` indent 22px). Without this the Storybook "Console" stories visibly diverge from `console.html`. |
| **Me portal shell** | `me.css:8-81` | Missing entirely | Add: `.app-root.me { grid-template-columns: 220px 1fr; grid-template-rows: 56px 1fr; background: var(--background); }` + `.me-sidebar .sb-brand-avatar { width: 32px; height: 32px; border-radius: 99px; background: var(--primary); color: var(--primary-foreground); font-weight: 700; }`, `.me-sidebar .sb-nav-item[data-active] { background: color-mix(in oklch, var(--primary) 10%, transparent); color: var(--primary); font-weight: 500; }`, `.me-sidebar .sb-badge { background: color-mix(in oklch, var(--attention) 16%, transparent); color: var(--attention); }`. |
| **Console topbar** (`.tb-org`, `.tb-org-btn`, `.tb-search-wrap`, `.tb-user`) | `console.css:62-131` | Missing | Add the pill-style org button, 480px search wrap, 36×36 icon buttons, vertical-divider user block. |
| **Me topbar** (`.me-context`, `.me-context-pill`, `.me-search`, `.me-icon-btn`, `.me-user`) | `me.css:84-161` | Missing | Add the pill context chip (`border-radius: 99px`, `background: var(--surface-2)`), 360px search with 36px icon button, indicator dot on bell. |
| **Org / product card** (`.prod-card`, `.prod-sticker`, `.prod-body`, `.prod-meta`) | `console.css:161-205` | Missing | Add 10px-radius row card used on the console dashboard's "Products" list. Most visible storybook gap — no equivalent today. |
| **KPI / stat card** (`.stat-card`, `.stat-head`, `.stat-label`, `.stat-icon`, `.stat-value`) | `console.css:217-240` | Current ships `.kpi` family (`shell.css:262`) with a different shape (`flex-direction: column; gap: var(--spacing-1)`); handoff console mockups use `.stat-card` (28px stat value, 10px-radius card, icon box top-right). | EXTEND → add `.stat-card` as a separate primitive (alias `<Card variant="stat">` or new `<StatCard>` shell component) OR re-align `.kpi-value` to `font-size: 28px; letter-spacing: -0.02em` and add a `.kpi-icon` slot. |
| **Overview tile** (`.ov-tile`, `.ov-tile-icon`, `.ov-tile-val`, `.ov-tile-label`) | `console.css:255-275` | Missing | Add the tappable tile used on the console "Overview" dashboard (transform-translate-on-hover). |
| **Hero** (`.me-hero`, `.me-hero-avatar`, `.me-hero-stats`) | `me.css:170-218` | Missing | Add the personal-page hero card (56×56 avatar, 28px gap, vertical-divider stats group). |
| **Invite / attention banner** (`.invite-banner`) | `me.css:221-239` | Missing | Add: `border: 1px solid color-mix(in oklch, var(--attention) 35%, var(--border)); background: color-mix(in oklch, var(--attention) 6%, var(--card)); border-radius: 12px; padding: 16px 20px;` with icon-square + body. |
| **Segmented toolbar** (`.toolbar`, `.seg`, `.seg button`, `.seg button.on`) | `console.css:289-313` | Missing | Add the inline segmented-control (pill background, current item gets shadow-sm + card bg). |
| **Brand swatch grid** (`.brand-grid`, `.brand-card`, `.brand-swatch`, `.brand-init`) | `console.css:326-349` | Missing | Add the org-brand thumbnail grid used in console "Brands" page. |
| **Activity log line** (`.activity-list`, `.activity-item`, `.activity-icon.{auth,payslip,invite,privacy,security}`) | `me.css:403-426` | Missing | Add the 4-col `60px 28px 1fr auto` grid row with semantic-tinted icon square (`color-mix` against role tokens). Different from current `.log-line` (which is mono code-log style). |
| **Identity block** (`.identity-card`, `.identity-avatar`, `.identity-name`, `.identity-kana`, `.identity-email`, `.identity-badges`) | `me.css:429-456` | Missing | Add the centered profile card with 96px avatar + camera-edit affordance. |
| **Toggle switch** (`.switch[data-on]`) | `me.css:379-400` — pure-CSS 32×18 with `::after` thumb | Current has `.switch-root` Radix-shaped (`shell.css:715`) with 44×22 dims. Two different switch elements. | KEEP both. They serve different scopes (form-control vs decorative). Note that handoff me.css `.switch` differs from current `.switch-root` in size — that's intentional. |
| **Modal full-pattern** (`.modal-shade`, `.modal-card`, `.modal-head`, `.modal-body`, `.modal-foot`) | `console.css:425-453` | Current has Radix `.dialog-content` (`shell.css:508`) at 28rem max-width / radius-lg. Handoff `.modal-card` uses radius **14px** and `width: min(680px, 96vw)`, with a foot band on `--surface-2`. | EXTEND → either widen `.dialog-content` defaults or add a `<Dialog size="wide">` variant. |
| **Wizard steps** (`.invite-steps`, `.invite-step`, `.invite-step-bub`) | `console.css:455-475` | Missing | Add the dot-bubble-and-line wizard header. |
| **Picker tile** (`.picker`, `.picker.on`, `.picker-check`) | `console.css:486-514` | Missing | Add the radio-card pattern (border tints primary on selection, primary-square check). |
| **Diff hunk** (`.diff`, `.diff-row.add/.del/.ctx`) | `tokens-ext.css:317-325` | Present — `shell.css:286-302` | KEEP. |
| **Kanban + issue card** | `tokens-ext.css:328-335` | Present — `shell.css:304-318` | KEEP. |
| **Wiki TOC + prose** | `tokens-ext.css:338-353` | Present — `shell.css:320-348` | KEEP. |
| **Sparkline + Donut** SVG primitives | `ui-kit.jsx:81-113` | CSS classes present (`.spark`, `.donut`) but no React components shipped from `@godxjp/ui` | EXTEND → add `<Sparkline data={...}/>` and `<Donut value={...}/>` to `src/components/primitives/` (or `charts/`). They're tiny SVG components and used across handoff dashboards. Their absence is why dashboard stories look blank. |
| **`<Avatar name="..." />` initials auto-extract** | `ui-kit.jsx:124-127` | Missing — see Item E | EXTEND. |
| **Default-on `Badge` dot** | `ui-kit.jsx:117` (`dot = true`) | `Badge.tsx:40` defaults `dot = false` | MATCH — change default. |
| **Top-bar bell with attention dot** | `shell.jsx:362-365` | Missing — see Item C | EXTEND. |
| **Auth shell with art** (`.auth-shell`, `.auth-card`, `.auth-art`) | `tokens-ext.css:376-384` | Present — `shell.css:386-392`. Note: handoff `.auth-art::after` uses `radial-gradient(circle at 20% 80%, color-mix(in oklch, white 10%, transparent), transparent 50%)`. Current is the same. | KEEP. |

## J. Classes in current shell.css that DON'T appear in handoff

(Candidates for KEEP / additive — these are `@godxjp/ui`-original primitives shipping past what the handoff covers. None are wrong; none are visible-from-design "deltas". Listed so the implementation agent doesn't accidentally delete them while trying to "match the handoff".)

| Class | Source | Recommendation |
|---|---|---|
| `.app-topbar-rail`, `.app-topbar-logo`, `.app-topbar-left`, `.app-topbar-spacer`, `.app-topbar-right` | `shell.css:1019-1027` | KEEP — internal `AppShell.tsx` rail composition. Handoff uses inline flex; this is the `@godxjp/ui` formalisation. |
| `.app-breadcrumb`, `.app-footer`, `.app-root:has(> .app-footer)` | `shell.css:1029-1033` | KEEP — `AppShell` slots. |
| `.sb-brand`, `.sb-brand-avatar`, `.sb-brand-text`, `.sb-brand-name`, `.sb-brand-sub` | `shell.css:1035-1043` | KEEP — already matches console/me variants' base shape; just needs the per-variant overrides from Item I. |
| `.page-content*` family (header / titlebar / titlegroup / subtitle / extra / tabs / body / footer) | `shell.css:1049-1077` | KEEP — `PageContent` composition layer. Adjust `.page-content-title` weight per H. |
| `.statistic`, `.statistic-value`, `.statistic-prefix/suffix`, `.statistic-number` | `shell.css:1080-1084` | KEEP — Ant-style Statistic primitive. |
| `.empty`, `.empty-image`, `.empty-description`, `.empty-footer` | `shell.css:1087-1090` | KEEP — Empty primitive. |
| `.tag`, `.tag-borderless`, `.tag-icon`, `.tag-label`, `.tag-close` | `shell.css:1093-1098` | KEEP — Tag primitive (distinct from `.chip`). |
| `.descriptions*` family | `shell.css:1101-1116` | KEEP — Ant-style Descriptions. |
| `.skeleton` | `shell.css:402-407` | KEEP — Skeleton primitive. |
| `.breadcrumb`, `.breadcrumb-crumb`, `a.breadcrumb-crumb`, `.breadcrumb-sep` | `shell.css:409-419` | KEEP — Breadcrumb primitive (handoff uses `.tb-breadcrumb .crumb` inline; this is the standalone version). |
| `.floating-panel`, `.popover-content`, `.dropdown-menu-content`, `.dropdown-menu-item`, `.dropdown-menu-separator`, `.dropdown-menu-label`, `.dropdown-menu-shortcut`, `.dropdown-menu-item[data-variant=destructive]`, `.dropdown-menu-item[data-inset]` | `shell.css:423-498` | KEEP — Radix-bound popover/menu primitives. |
| `.dialog-overlay`, `.dialog-content`, `.dialog-header`, `.dialog-footer`, `.dialog-title`, `.dialog-description` | `shell.css:500-556` | KEEP — Radix Dialog. (Note width gap with handoff `.modal-card` per Item I.) |
| `.sheet-overlay`, `.sheet-content[data-side]` | `shell.css:558-626` | KEEP — Radix Sheet. |
| `.select-*` family | `shell.css:628-713` | KEEP — Radix Select. |
| `.switch-root`, `.switch-thumb` | `shell.css:715-756` | KEEP — Radix Switch (form control; distinct from `.switch` decorative variant in me.css). |
| `.checkbox-root`, `.checkbox-indicator`, `.checkbox-glyph-*` | `shell.css:758-811` | KEEP — Radix Checkbox. |
| `.table-scroll` | `shell.css:813-817` | KEEP. |
| `.calendar`, `.rdp-*` | `shell.css:819-876` | KEEP — react-day-picker theming. |
| `.time-input` | `shell.css:878-896` | KEEP. |
| `.combobox-*` family | `shell.css:898-957` | KEEP — cmdk Combobox. |
| `.toast-*` family | `shell.css:959-1017` | KEEP — sonner Toaster. |
| `.card-body`, `.card-header-title-group`, `.card-header-extra`, `.card-actions`, `.card-size-small`, `.card-variant-filled`, `.card-variant-borderless`, `.card-hoverable` | Referenced by `Card.tsx` but **undefined in `shell.css`** | EXTEND (per Item F) — these are missing rules, not legitimate "extra current chrome". |

---

## Top-10 visual deltas to close first

Ordered by ratio of visible-impact to effort.

1. **Set `--brand` default at `:root`.** Today `--brand` is only defined inside `[data-tenant="<x>"]`. Storybook usually mounts without a tenant attribute, so every `.sb-logo-mark`, `.avatar.brand`, `.auth-art`, and `.sb-brand-avatar` paints with no background. Add `--brand: oklch(60% 0.137 163);` to the unscoped `:root` in `theme.css`. Single-line fix; transforms half the chrome stories instantly.
2. **Flip `Badge` default `dot` to `true`.** `Badge.tsx:40` defaults `dot = false`; handoff defaults to `true` (`ui-kit.jsx:116`). One-char change in TS; design-system stories suddenly look like the design.
3. **Add the four missing `.card-*` rules: `card-body`, `card-header-title-group`, `card-header-extra`, `card-actions`.** These classes are emitted by `Card.tsx` but have no CSS; the subtitle floats next to the title instead of beneath it, and actions don't right-align. Visible in every card story.
4. **Restore `--sidebar-width: 16rem`** (256px) per handoff `tokens.css:137`. Current 13rem (208px) makes JA labels truncate and crowds the brand chip + chevron. The comment in `theme.css:112` (`"design jZUk parity"`) refers to a different snapshot of the design; the canonical handoff in this PR's `design-handoff/` is 256px.
5. **Add `.app-root.console` + `.console-sidebar .sb-*` + `.console-topbar .tb-*` overrides** (sidebar 220 / header 56 / nav-item 38px / radius 8px / black `btn-primary`). Without these the console portal can't be approximated in Storybook regardless of how the primitives look.
6. **Add `.app-root.me` + `.me-sidebar .sb-*` + `.me-topbar .me-*` overrides** (sidebar 220 / header 56 / pill context chip / 36px icon buttons / circular brand avatar). Same justification as #5 for the personal portal.
7. **Add `<Avatar name="..." />` initials auto-extraction.** Handoff samples and likely Storybook stories use `<Avatar name="Satoshi F" brand />`; current renders a blank pill because no children are passed. Tiny addition; large visible improvement.
8. **Change `.page-content-title` from `font-weight: 600; line-height: 1.2` to `font-weight: 500; letter-spacing: -0.01em` to match handoff `.page-title` / `.ds-hero-title`** (`tokens-ext.css:236`, `console.css:141-143`). Every page-level heading in current Storybook reads as "bold + heavy" against the 500-weight rest of the type scale. Single rule edit.
9. **Add `.prod-card` / `.stat-card` / `.ov-tile` / `.me-hero` / `.invite-banner` classes** (`console.css:161-275`, `me.css:170-239`). These are the building blocks that make the "dashboard" screens recognizable. Five small CSS rules total.
10. **Add the missing topbar bell + dot rendering** (handoff `shell.jsx:362-365`) so the right edge of the topbar isn't visually empty in default stories — even a small `notifications?` slot or a dedicated `<Topbar.Bell hasUnread />` subcomponent closes the perceptual gap.

After 1–4 land, the rest is bulk-add work — not judgement calls. 5–10 are mechanical translations from the handoff CSS files quoted above.
