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

This is a **hard contract**, not advice. Every new/changed component, recipe, doc, or example
MUST pass every gate below. If you cannot satisfy a gate, STOP and fix the system (add the real
token/primitive/key) rather than working around it. Violations have been caught and rejected
repeatedly — treat each rule as non-negotiable.

## 0. Before you write a line — MCP-FIRST

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
> skill's **Audit Evidence Ledger** is the template; reproduce it.

- **Drive EVERY mode to its TERMINAL state — one happy path is not an audit.** A multi-state
  control has one demo card per mode for a reason: exercise each. For a Cascader that means
  selecting a **parent/intermediate** node (`changeOnSelect`), drilling to the **deepest leaf**
  under **each** `expandTrigger` (click AND hover), and toggling a `multiple` path — not just
  picking one leaf in the search card. Half the real bugs live in the modes you skipped
  (parent-click closing the panel, hover collapsing at depth 3, a node-level `disabled`/`isLeaf`).
- **Read the DevTools console — a warning is a failure.** A `<button> cannot be a descendant of
  <button>` / hydration / `act()` warning is a real defect (here: a clear `<button>` nested inside
  the trigger `<button>`). Never nest interactive elements; render the clear/affordance as a
  sibling overlay (`pointer-events-none` wrapper, `pointer-events-auto` control). The audit isn't
  done until the console is clean.
- **Hover-expand must reach the deepest level.** A column-level `onMouseLeave` that collapses
  deeper columns strands the pointer between columns and makes a depth-3 leaf unclickable. Drive
  expansion from per-node `onMouseEnter`; don't collapse on leave.
- **Multi-step selection must be re-startable from a complete state — never trapped.** Any control
  that accumulates a multi-step value (date **range**, capped multi-select, wizard, masked input):
  once the value is COMPLETE, the next interaction must let the user **start over**, not silently
  mutate one endpoint. For range mode the underlying lib (react-day-picker) defaults to
  `resetOnSelect:false`, which mutates the nearest endpoint of a complete range — the start date
  gets stuck and can never be re-picked by clicking. Wrap so range defaults to `resetOnSelect:true`
  (Calendar already does); if you call `DayPicker` directly, set it yourself.
- **Value held at rest must be visible when the surface opens.** Calendar/dropdown/combobox must
  jump to the held value (`defaultMonth` / `scrollTo` / `defaultValue`), not show today/top and hide
  an existing selection that lives elsewhere.
- **Controlled value mirrors both ways.** Text-mirroring inputs (date/range/masked) commit only on a
  VALID + COMPLETE string — a partial string must not overwrite what the user is typing; clicking in
  the popup updates both the value and the text field. Test type↔click both directions.

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

## References (read when unsure)

- `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md`, `docs/PROPS-REGISTRY.md`
- `docs/roadmap/international-standardization.md` (the i18n/a11y/vocab audit + fixes)
- godx-ui MCP: `get_rule`, `list_anti_ai_tells`, `get_component`, `get_vocab`, `get_tokens`
- Memory: `godxui-examples-absolute-rules`, `mf-godxui-compose-rules`
