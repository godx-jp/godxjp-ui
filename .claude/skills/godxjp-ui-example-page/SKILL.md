---
name: godxjp-ui-example-page
description: BẮT BUỘC khi tạo/sửa trang ví dụ catalogue trong docs/**/*.tsx của @godxjp/ui (mỗi trang = isolate /isolate/<group>-<name>). Ép trang ví dụ phải demo component ĐẦY ĐỦ và ĐÚNG — mọi prop × union value × state × tone — bằng real primitives, đúng types/tokens, "show don't tell". Đọc TRƯỚC khi viết bất kỳ demo nào.
---

# @godxjp/ui — Example-page completeness discipline

An example page in `docs/<group>/<name>.tsx` is the component's **proof of behaviour**. Its job is
to demonstrate the component **completely** and **correctly** — not to look nice with one happy-path
instance. A strict audit of all 87 pages (mean **5.93/10**) found the same failures over and over;
these rules close them. Treat the page as **incomplete until every gate below passes**.

> **Cardinal test:** could a reader who has never seen this component learn *every* prop, *every*
> state, and *every* variant value **from this page alone, at rest, without clicking**? If not, it's
> not done.

---

## Rule #0 — Type-check against the REAL API (a render-breaking bug is not an example)

The 9 worst pages didn't *render* what their copy promised. Non-negotiable:

- **Semantic colour goes through `tone`, never `variant`.** `variant` is STRUCTURAL
  (`default | secondary | outline`). Passing `variant="success"` to Badge/Tag/StatCard/Alert/Progress
  is a TS error that silently collapses to grey.
  - 🛑 *Proof:* `feedback-alert` → 4 identical grey banners · `data-display-badge` → 5/8 colourless
    chips · `data-display-progress` → 5 identical green bars. All claimed colours; none rendered.
- **No invented union values.** Use only the values the component's type actually declares
  (Progress tone is `success | warning` only — `info`/`destructive` don't exist).
- **Match the INSTALLED library version's prop names** — `resizable-panel` used the removed
  `direction`; the prop is `orientation`. A vertical demo rendered horizontal.
- **State-object keys must match the prop type**; mount any **Provider/Router the component needs**
  or it throws at render (`query-prefetch-link` had no Router).

→ If `pnpm typecheck` isn't clean for the demo, stop. It's a bug, not a showcase.

## Rule #1 — Demonstrate every non-default STATE (the #1 gap — 50 / 87 pages)

If the type or the CSS has it, **render it**. For the component at hand, stage each that applies:
`disabled` · `error` / `aria-invalid` · `loading` / `pending` · `empty` · `readOnly` ·
`indeterminate` · `active` / `selected` · `collapsed` / `expanded` · `hover`/`focus` (note if visual only).

## Rule #2 — Make interaction-only behaviour visible AT REST (static-catalogue blindness — 25 pages)

A static screenshot must prove the behaviour:

- **Stage one instance open/active/highlighted statically** — `defaultOpen`, a seeded active item,
  a pre-filled value — so the open menu / active tab / selected row is visible without clicking.
- **Force async/lifecycle states to render** — add a **delay** in the demo's `queryFn`/`uploadFn`
  (e.g. `await sleep(1500)`) so fetching / spinning / disabled-while-pending is observable.
  **Never use an instant-resolving no-op** (`query-button-refetch` did → the spinner never shows).

## Rule #3 — Exercise the whole API surface (props under-shown — 73 pages · unions — 26 pages)

- **Every value of each structural union** — `variant`, `size`, `side`/`align`, `orientation`,
  `mode`, `type`, `titlePlacement` — not just the default.
- **Controlled AND uncontrolled** (`value` + `onValueChange` *and* `defaultValue`) when the
  component branches on them.
- **The headline / defining prop, explicitly** — `loadOptions`, `locale`, `name`, `prefetchOn`,
  `density`, `side`/`align`. The reason the component exists must be on screen.
- **The whole small API + family** — all scale steps, all swatches, **dark mode**, and **every
  exported sub-part / escape hatch**: `renderItem`, `children` composition, `*Header`/`*Description`,
  `Provider`, `Indicator`, `ScrollBar`.

## Rule #4 — Show, don't tell (WHY claimed but not shown — 15 pages)

Every WHY in the copy — *elevation, anti-reflow, container-query, responsive stacking, persistence,
draft-undo, provider-driven output* — must have a **corresponding live rendered demo**. If you can't
show it, delete the claim. (e.g. a container-query grid must be shown collapsing **in a narrow
container at a wide viewport**, not only by shrinking the window.)

## Rule #5 — Real primitives + tokens only (rule 29 · tokens — 13 pages)

- **No hand-rolled / faked controls** — no `span`/`div` pseudo-fields, fake `<table>`, raw
  `<label htmlFor>`, styled-`div` headings. Import the real `Input`/`Select`/`Label`/`DataTable`/
  heading primitive.
- **Tokens only** — no raw `hsl()`/hex, no inline `style` width/height/maxWidth, no hardcoded px
  label strings, no arbitrary `[1.7]` values with lint-disables.

## Rule #6 — Independent cards + real context

- **Each example card is an independent pattern** — its own state setter and **its own data**; never
  share one setter across cards (they read/page in lockstep otherwise).
- Place a placeholder **next to** the real component it stands in for; wrap forms in `Card` + the
  canonical `FormField` / action-bar pattern.

## Rule #7 — Copy-paste-safe & locale-correct

- **Straight ASCII quotes** in code-like labels (smart quotes break copy-paste).
- **Override `parameters.docs.source.code`** with a literal snippet for function-valued props
  (`cell`/`render`/`renderItem`) — cardinal rule 34.
- **JP demos stay fully JP**; on-screen copy must match the code and the component's own guidance.

---

## Pre-commit checklist (run before calling an example page done)

- [ ] `pnpm typecheck` clean — `tone` not `variant`, no invented union values, installed-version prop names, Provider/Router mounted
- [ ] Every non-default **state** the component supports is rendered (Rule #1)
- [ ] Interaction/async behaviour staged **visible at rest** (open/active/fetching) — Rule #2
- [ ] Every **union value** shown · controlled + uncontrolled · headline prop explicit · sub-parts/dark-mode — Rule #3
- [ ] Every **WHY claim** has a live demo — Rule #4
- [ ] **Real primitives only** (rule 29) · **tokens only** — Rule #5
- [ ] Cards independent (own state + data) · providers mounted — Rule #6
- [ ] ASCII quotes · `source.code` override for fn props · JP stays JP — Rule #7
- [ ] `pnpm audit` (ui-audit) 0 errors for the file
- [ ] Verified in the isolate view at **390 / 768 / 1280** (a static screenshot at each proves it)

## How to verify (the audit loop)

1. `pnpm preview` → open `http://localhost:6008/isolate/<group>-<name>`.
2. Screenshot at 390 / 768 / 1280 (Chrome DevTools / Playwright MCP). A behaviour you can't see in a
   screenshot isn't demonstrated — go back to Rule #2.
3. Check the console: **0 errors** (a 404 / thrown Provider error is a finding).

> Full per-page audit evidence (87 reports + screenshots + rollup) lives in `.ux-audit/` —
> `SUMMARY.md` ranks every page and lists the recurring failures this skill encodes.
