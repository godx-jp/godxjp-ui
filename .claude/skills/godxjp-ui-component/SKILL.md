---
name: godxjp-ui-component
description: >-
  MANDATORY before creating or changing ANY @godxjp/ui component, recipe, doc, or example.
  Enforces: real @godxjp/ui primitives only (no invented/hand-rolled/faked, no raw HTML controls),
  MCP-first, no duplication, and full international standards — i18n (Intl/CLDR/ISO/IANA/BCP-47),
  accessibility (WAI-ARIA APG + WCAG 2.2 AA), RTL, and the controlled-vocabulary API. Read this
  FIRST; do not skip a single gate.
---

# Building a @godxjp/ui component — the discipline

> 🛠️ **AUDIENCE: CORE** — governs building/changing **@godxjp/ui itself** (the library `src/`,
> its docs, its MCP catalog). An app-dev building *with* the library does NOT use this skill —
> they use the MCP (`list_consumer_skills` / `route_consumer_task`). Full CORE↔CONSUMER map:
> `.claude/skills/README.md`.

**This is the MASTER core skill — follow it FIRST, then chain in order:**
`godxjp-ui-component` (this — correctness contract) → **godxjp-ui-interaction-feel** (state-truthful
behaviours for any stateful control) → **godxjp-ui-behavioral-test** (drive in a real browser, then
codify as user-event tests) → **godxjp-ui-example-page** (a complete docs page + the Audit Evidence
Ledger) → **godxjp-ui-best-ux** (taste / dxs-kintai) → **godxjp-ui-mcp-catalog-sync** (keep the MCP
catalog + tests in sync). Single source of truth: this skill owns *real-primitives / no-raw-HTML /
MCP-first / no-duplication*; the others point here for that.

**DO / DON'T (quick gate — full rules below):**

| ✅ DO | ⛔ DON'T |
|---|---|
| Consult the `godxjp-ui` MCP first (`get_component`, `search_components`, `get_rule`, `get_vocab`, `get_tokens`) | Guess a prop name/shape, or re-create what a primitive already does (`Select` = searchable/async) |
| Compose real installable primitives fully (`CardContent` for padding) | Invent/hand-roll/fake a component, or use raw `<input>/<select>/<button>/<textarea>/<table>` |
| Route every string + `aria-label` through `t()`; format via `Intl`/CLDR | Hardcode EN/JA, hand-build number/currency/date, ship emoji flags |
| Implement the WAI-ARIA APG pattern + add a `*.a11y.test.tsx` (0 axe) | Colour-only state, missing accessible name, positive tabindex, keyboard traps |
| Logical CSS only (`ms-/me-/ps-/pe-`, `start-/end-`) | Physical `ml-/mr-/pl-/pr-/left-/right-` |
| Controlled triad `value`/`defaultValue`/`onValueChange`; `size ∈ xs\|sm\|md\|lg`; `tone` for status | `size="default"`, bespoke `current`/`onChange`, missing `defaultValue` |
| Size from the `--control-height` tier | Literal `height`/`width` or `calc(var(--control-height) ± …)` |
| Verify stateful controls by hand in a real browser, console clean | Self-certify a half-driven happy path; ship with a console warning |

This is a **hard contract**, not advice. Every new/changed component, recipe, doc, or example
MUST pass every gate below. If you cannot satisfy a gate, STOP and fix the system (add the real
token/primitive/key) rather than working around it. Violations have been caught and rejected
repeatedly — treat each rule as non-negotiable.

## 0. GATE 0 — Framework component or composition pattern? (decide FIRST, every time)

**Before MCP-first, before a single line:** decide whether the thing you are about to build even
belongs in `src/components/`. Run the **Framework-Component Test** in
`docs/COMPOSITION-VS-COMPONENT.md` and record the verdict for **all 7 criteria** (C1 universal ·
C2 owns reusable behavior · C3 not composable from existing primitives+tokens · C4 single
responsibility + controlled-vocab API · C5 fully token-themeable, zero baked brand · C6 earns the
i18n/a11y contract · C7 earns its bundle cost).

- **ALL 7 pass** → it may be a framework component → continue with this contract.
- **ANY fails** → it is a **composition pattern**. STOP. Do NOT add it to `src/components/`. Build it
  from existing primitives + token overrides (global / scoped `[data-tenant]` / per-region role
  scoping) in the app or a `docs/` showcase; if a token is missing, ADD THE TOKEN, not a component.

A marketing **Hero / Navbar / Footer / Pricing**, a dashboard **page layout**, an **icon
medallion** — all FAIL the test and are compositions (build from `Card`/`Button`/`Text`/`Avatar`/
`ResponsiveGrid`/`Flex` + tokens). **When in doubt, compose.** You must publish the C1–C7 ledger in
your reply for any new `src/components/**` addition; a reviewer rejects additions without it.

## 0b. Before you write a line — MCP-FIRST

- Consult the **`godxjp-ui` MCP** first, every time: `search_components` (right group, not just
  one), `get_component <Name>` for the exact prop API + example + cardinal rules,
  `list_primitives`, `get_rule` / `list_anti_ai_tells`, `get_vocab`, `get_tokens`. **Never guess a
  prop name or shape.**
- Ask: **does this already exist?** A searchable/async single-select is `Select` (`showSearch` /
  `loadOptions`) — there is no Combobox/SearchSelect/CountrySelect/Autocomplete. The four i18n
  pickers are one `AppSettingPicker kind=…`. **Do not re-create what a primitive already does.**
  (We deleted 8 redundant components for this reason — "ko được phép trùng".)

## 1. Compose ONLY real, installable modules

- **NEVER invent or hand-roll a component.** No local wrapper components, no `./_kit`, no
  `ReviewPage`/`DashboardShell`/`Board`/`Cell`. A consumer copies the example; if it imports a
  module local to us, it is BROKEN. Inline real JSX; static ids, not `useId` IIFEs.
- **NEVER fake the design** with styled `<div>`s (`<div style={{fontSize:20,fontWeight:500}}>`).
  If the system lacks the real thing, BUILD IT IN THE LIBRARY FIRST, then showcase the real element.
- **NEVER use raw HTML controls**: no `<select>`, `<input>`, `<button>`, `<textarea>`, hand-rolled
  `<table>`. Use `Select`, `Input`/`SearchInput`, `Button`, `Textarea`, `DataTable`, `Checkbox`,
  `RadioGroup`, `Switch`, etc. (Only allowed raw `<select>`: a hidden
  `aria-hidden tabIndex={-1} className="sr-only"` e2e mirror paired with a visible godx control.)
- **Compose primitives FULLY** — padding → `CardContent` (never `p-4` on a bare `Card`); empty rows →
  `DataTable`'s built-in empty / `EmptyState`; a table on a page → `<Card><CardContent flush>
<DataTable/></CardContent></Card>` in a default padded `PageContainer` (NOT `variant="flush"`).

## 2. International standards — MANDATORY on every component

### 2a. i18n / localization (Intl + CLDR)

- **Every user-facing string AND every `aria-label`/`sr-only` text goes through `t("…")`** with keys
  in `src/i18n/messages/{en,vi,ja}.json`. Zero hardcoded English/Japanese in components.
- **Format via `Intl` with the active locale** (`getSyncedLocale()` / `useTranslation().locale`),
  never hand-built: numbers/currency → `Intl.NumberFormat` (currency = ISO 4217, minor units from
  `resolvedOptions()`, NOT a hardcoded list); bytes → `Intl.NumberFormat` `unit` style; dates/times
  → the date subsystem (`Intl.DateTimeFormat`, IANA tz, ISO-8601 `yyyy-MM-dd`); lists →
  `Intl.ListFormat`; relative → `Intl.RelativeTimeFormat`; names → `Intl.DisplayNames`
  (countries by ISO 3166-1 alpha-2, languages by BCP-47).
- **Plurals** via CLDR category maps (`{ one, other }`) selected by `Intl.PluralRules` — never a
  single template for counted nouns ("1 items" is a bug).
- **No emoji flags** (broken on Windows/Linux) — derive country names from `Intl.DisplayNames`.

### 2b. Accessibility — WAI-ARIA APG + WCAG 2.2 AA

- Implement the **APG pattern** for what you build: correct role/landmark; `aria-current`,
  `aria-expanded`, `aria-selected`, `aria-sort`, `aria-busy` + `aria-live`, `aria-activedescendant`,
  `aria-errormessage` + `aria-invalid` as applicable.
- **Keyboard**: roving tabindex for toolbars/radiogroups/listboxes/trees; arrows + Home/End;
  Enter/Space activate; Esc closes; visible focus; no positive tabindex; no keyboard traps.
- **Forms**: label association (`htmlFor`/`id`), `aria-describedby` for helper, error announced.
- **WCAG**: ≥24×24px targets (2.5.8); never colour-only state (1.4.1 — add `sr-only` status text);
  icon-only buttons need an accessible name; decorative icons `aria-hidden`.
- **Add a `*.a11y.test.tsx`** using `expectNoA11yViolations` (vitest-axe). It MUST pass 0 violations.
- Prefer Radix/cmdk/vaul for interactive primitives — they ship correct ARIA; audit only your
  hand-rolled parts.

### 2c. RTL / bidi

- **Logical CSS only**: `ms-/me-/ps-/pe-`, `start-/end-`, `border-s/e`, `rounded-s/e`,
  `text-start/end`. NEVER physical `ml-/mr-/pl-/pr-/left-/right-/rounded-l/r`. AppProvider sets
  `<html dir>` from the locale; your component must flip correctly.

### 2d. API / naming vocabulary (controlled vocabulary)

- **Controlled triad**: `value` / `defaultValue` / `onValueChange` (support uncontrolled via
  `defaultValue`); overlays use `open`/`defaultOpen`/`onOpenChange`; Radix bool uses
  `checked`/`onCheckedChange` or `pressed`/`onPressedChange`. No bespoke `current`/`onChange` for
  state, no value-last callbacks.
- **`size` = `xs | sm | md | lg`** — never `"default"`. Positive booleans (`disabled`, `required`,
  `loading` — not `isX`). Status intent = `tone`.
- **Forward `ref`, spread `...props`, accept `className` + `id`** on controls. Export `XProp` and
  `XProp as XProps`; put the type in `src/props/components/*.prop.ts` and **register it in
  `src/props/registry.ts`** mapping to vocabulary entries.

### 2e. Stateful interaction correctness — verify by hand in a real browser

A control that holds state is not done when it renders correctly; it is done when it **behaves**
correctly under real click/type/tab. Static screenshots hide behavioral bugs — drive the component
in a real browser (Chrome DevTools MCP) before declaring it correct.

> **Forcing rule (no self-certified partial pass).** Before you claim a stateful component works,
> you MUST, in your reply, list every interactive mode/prop by name and the evidence you drove each
> to its terminal state, AND quote the DevTools console (errors + warnings). Driving one happy path
> and declaring victory is the documented failure mode (a Cascader shipped with a parent that
> couldn't drill, a hover that died at depth 3, and a `<button>`-in-`<button>` console error — all
> because only the search card was tested). A blank or "looks fine" = not done. The example-page
> skill's **Audit Evidence Ledger** is the template; reproduce it. For the *refined* expected
> behaviours (parent checkbox aggregation/indeterminate, reset-on-complete, value-at-rest,
> hover-intent, no nested interactive controls), consult **godxjp-ui-interaction-feel**.

- **Drive EVERY mode to its TERMINAL state — one happy path is not an audit.** A multi-state
  control has one demo card per mode for a reason: exercise each. For a Cascader that means
  selecting a **parent/intermediate** node (`changeOnSelect`), drilling to the **deepest leaf**
  under **each** `expandTrigger` (click AND hover), and toggling a `multiple` path — not just
  picking one leaf in the search card. Half the real bugs live in the modes you skipped
  (parent-click closing the panel, hover collapsing at depth 3, a node-level `disabled`/`isLeaf`).
- **Read the DevTools console — a warning is a failure.** A `<button> cannot be a descendant of
  <button>` / hydration / `act()` warning is a real defect. Never nest interactive elements; render
  the clear/affordance as a sibling overlay (`pointer-events-none` wrapper, `pointer-events-auto`
  control). The audit isn't done until the console is clean. (No-nested-interactive fix detail:
  [[godxjp-ui-interaction-feel]] §8.)
- **The refined state-truthful behaviours are owned by [[godxjp-ui-interaction-feel]] — don't
  re-document them here.** Parent-checkbox aggregation/indeterminate, hover-intent that reaches the
  deepest leaf, multi-step **reset-on-complete** (range → `resetOnSelect:true`), **value-at-rest
  visible on open** (`defaultMonth`/`scrollTo`/`defaultValue`), controlled **type↔click mirroring**:
  each is catalogued there as expectation · how-it-fails · how-to-verify. Read it, then drive every
  one that applies to what you're building.

## 3. Tokens

- Semantic tokens only (`text-muted-foreground`, `bg-destructive`, `border-border`, Badge variants).
  Never raw palette. `npm run audit` (ui:audit) MUST be 0 errors / 0 warnings.
- **Control height is a SYSTEM decision, never a primitive one.** A control's box
  height/width comes from the `--control-height` tier (and its official steps
  `--control-height-{xs,sm,lg}`) — which is density-aware. NEVER bake in a size:
  no literal `height: 2rem` / `2.25rem`, and no ad-hoc `calc(var(--control-height) ± …)`
  (that silently re-derives a tier and drifts out of sync with siblings on the same
  row — the bug that made Pagination's size-changer taller than its page buttons).
  Want a smaller control? That is the **app's** call via the `size` prop / `className`,
  not something the primitive hardcodes. Guarded by `pnpm check:control-sizing`
  (error on ad-hoc offsets, warn on literal control-box heights).

## 4. Catalog + docs

- Add a **`mcp/src/data/components.ts`** entry (props/usage/useCases/related/example/rules) — guarded
  by `check:mcp-sync` (no drift) + `check:mcp-orphans` (every public component catalogued).
- Add a **docs page** under `docs/<group>/` that is a REAL screen / recipe (AppShell + PageContainer
  - canonical primitives), composed of real `@godxjp/ui` only. Flat file for Overview-only; folder +
    `examples/` for real use-cases. Example pages are full screens, never bare Card snippets.

## 5. Verify before you call it done — ALL must be green

```
pnpm typecheck && pnpm lint && pnpm run audit \
  && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans \
  && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports \
  && pnpm preview:build && pnpm test     # incl. your *.a11y.test.tsx (0 axe violations)
```

Run `vendor`-style formatting (`pnpm exec prettier --write`) before committing.

## Forbidden — instant reject

- A raw `<input>/<select>/<button>/<textarea>/<table>`, or a faked styled-div component.
- A hardcoded English/Japanese label or `aria-label` not routed through `t()`.
- `Intl`-less number/currency/date formatting, or a hand-maintained currency/locale/country list.
- Physical direction classes (`ml-/mr-/pl-/pr-/left-/right-`).
- `size="default"`, `current`/`onChange` for controlled state, missing `defaultValue`.
- A control sized with a literal `height`/`width` or `calc(var(--control-height) ± …)`
  instead of a `--control-height` tier token.
- A stateful multi-step control that traps the user in a complete state (range mode left on
  `resetOnSelect:false` so the start can't be re-picked; held value hidden on open; partial text
  overwriting a controlled mirror). Verify by hand in a real browser, not by screenshot.
- A new component that duplicates a `Select`/existing primitive capability.
- Shipping without an a11y test, an MCP entry, or a registry entry.

## Self-track checklist (tick every box before you call it done)

- [ ] **MCP-first**: checked `get_component`/`search_components`/`get_rule`/`get_vocab`/`get_tokens`; confirmed it doesn't already exist (no duplication)
- [ ] **Real primitives only** — no invented/hand-rolled/faked component, no raw HTML control; composed fully (`CardContent`, `DataTable`, `EmptyState`)
- [ ] **i18n** — every string + `aria-label` via `t()`; numbers/currency/dates/lists/names/plurals via `Intl`/CLDR; no emoji flags
- [ ] **a11y** — APG roles/aria/keyboard/focus; ≥24px targets; never colour-only; **`*.a11y.test.tsx` passes 0 axe violations**
- [ ] **RTL** — logical CSS only; flips correctly under `dir="rtl"`
- [ ] **Vocabulary API** — `value`/`defaultValue`/`onValueChange` (+ uncontrolled); `size ∈ xs\|sm\|md\|lg`; positive booleans; `tone` for status; `ref` forwarded; `XProp` exported + **registered in `src/props/registry.ts`**
- [ ] **Tokens** — semantic only; control box from the `--control-height` tier (no literal height/`calc`)
- [ ] **Stateful correctness** — drove EVERY mode to terminal state in a real browser, console clean; refined behaviours per [[godxjp-ui-interaction-feel]]; codified via [[godxjp-ui-behavioral-test]]
- [ ] **Catalog + docs** — added `mcp/src/data/components.ts` entry + a real-screen docs page ([[godxjp-ui-example-page]]); see [[godxjp-ui-mcp-catalog-sync]]
- [ ] **Verify suite ALL green**: `pnpm typecheck && pnpm lint && pnpm run audit && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports && pnpm preview:build && pnpm test`

## References (read when unsure)

- `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md`, `docs/PROPS-REGISTRY.md`
- `docs/roadmap/international-standardization.md` (the i18n/a11y/vocab audit + fixes)
- godx-ui MCP: `get_rule`, `list_anti_ai_tells`, `get_component`, `get_vocab`, `get_tokens`
- Memory: `godxui-examples-absolute-rules`, `mf-godxui-compose-rules`
