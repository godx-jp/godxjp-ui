# Composition pattern vs Framework component — the decision contract

> **Cardinal rule:** before ANY new thing is added to `src/components/`, it MUST pass the
> **Framework-Component Test** below — _all_ criteria, no exceptions. If it fails even one, it is a
> **composition pattern**: build it from existing primitives + tokens in the app/showcase, and do
> **not** add it to the framework. **When in doubt, compose.** The framework stays lean; brand- and
> screen-specific UI lives where it belongs — in the consumer app (or a `docs/` showcase), as a
> composition of real primitives configured by tokens.

This document defines the two concepts precisely, gives the mandatory test, and lists worked
examples so the call is never a matter of taste.

---

## 1. The two concepts

### Framework component (`src/components/**`)

A **reusable, behavior-bearing primitive** that ships in the `@godxjp/ui` bundle and is imported by
many consumer apps. It encapsulates interaction, state, accessibility and a controlled API that must
NOT be re-implemented per app. Examples: `Button`, `Select`, `DataTable`, `Dialog`, `Calendar`,
`Switch`, `Combobox` (= `Select showSearch`), `StatCard`. Every one of these owns non-trivial
behavior or a11y, generalizes across domains, and is fully token-themeable. They pay their bundle
cost because _everyone_ uses them.

### Composition pattern (consumer app, or a `docs/` showcase)

A **specific arrangement of existing primitives** for a specific screen, domain or brand — a
dashboard layout, a marketing **Hero**, a **Navbar**, a **Footer**, a pricing section, a settings
page. It has **no reusable behavior of its own**: it is layout + content + token configuration over
real components. It is brand/design-specific and is **expressible today** by composing `Card`,
`Button`, `Text`, `ResponsiveGrid`, `Flex`, `Badge`, `Avatar`, … + token overrides (incl. scoped
`[data-tenant]` / per-region role scoping). It must **never** be baked into `src/components/` — that
would bloat every consumer's bundle with one design's one-off block.

> A Claude Design's marketing landing page (Hero / Services / CTA / Footer) is the canonical
> composition case: it is reproduced 100% from **token configuration + real primitives**, with zero
> new framework components. See `docs/showcase/tiximax-website.tsx`.

---

## 2. The Framework-Component Test (MANDATORY — all 7 must pass)

Before creating OR proposing a framework component, evaluate **every** criterion and record the
verdict. **Allowed only if ALL are `PASS`.** Any `FAIL` ⇒ it is a composition pattern; use existing
components instead.

| #                                                                 | Criterion                                                                                                                      | PASS means                                                            | FAIL means (→ compose)                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **C1. Universal, not design-specific**                            | Needed by many apps across domains; not a recreation of one design's block.                                                    | A generic capability (a select, a table, a date picker).              | "TIXIMAX Hero", "AcmePricingTable", "this dashboard's header".           |
| **C2. Encapsulates reusable BEHAVIOR**                            | Owns non-trivial state / keyboard / focus / ARIA that must not be re-implemented per app.                                      | Listbox navigation, dialog focus-trap, table sort/select, async load. | Pure static layout/visual arrangement (a hero, a footer, a banner).      |
| **C3. Not expressible by composing existing primitives + tokens** | You genuinely cannot build it from `Card`/`Button`/`Text`/`Grid`/`Flex`/… + token overrides.                                   | A new interaction primitive with no existing equivalent.              | You _can_ build it today from primitives + tokens (then you must).       |
| **C4. Single responsibility + controlled-vocabulary API**         | One job; maps to `value`/`defaultValue`/`onValueChange`, `size ∈ xs\|sm\|md\|lg`, `tone`, etc.; generalizes beyond one screen. | `Select`, `Switch`, `Pagination`.                                     | A grab-bag "Section"/"Block"/"Layout" with a bespoke, screen-shaped API. |
| **C5. Fully token-themeable, zero baked brand**                   | Appearance is 100% token-driven; works for every brand with no code change.                                                    | Reads `hsl(var(--…))` / semantic tokens only.                         | Needs baked colors / raw hex / per-brand styling to look right.          |
| **C6. Earns the international contract**                          | Broad reuse justifies the full i18n (`t()`/`Intl`) + WAI-ARIA APG + WCAG 2.2 AA + RTL + a11y-test + MCP-catalog cost.          | A control everyone uses and that needs correct ARIA.                  | A one-off where that cost is pure overhead.                              |
| **C7. Earns its bundle cost**                                     | Broadly used ⇒ worth shipping to _every_ consumer.                                                                             | Used across most apps.                                                | Used by one app / one design ⇒ it belongs in that app.                   |

> **Heuristic shortcuts** (a single one is usually enough to send it to composition):
>
> - "Could I build this **right now** from existing primitives + token overrides?" → **yes ⇒ compose** (C3).
> - "Is the name a **proper noun / screen name / brand block** (Hero, Navbar, Footer, Pricing,
>   DashboardHeader)?" → **yes ⇒ compose** (C1).
> - "Does it own **any real behavior**, or is it just **layout + content + color**?" → layout only ⇒ **compose** (C2).

### Decision flow

```
new UI need
  │
  ├─ Does an existing primitive already cover it? ───────────── yes → USE IT (no new code)
  │        (Select = searchable/async; AppShell/PageContainer = chrome; DataTable = grids)
  │
  ├─ Run the Framework-Component Test (C1–C7).
  │        ├─ ALL pass → it MAY be a framework component
  │        │             → follow the full `godxjp-ui-component` contract (i18n/a11y/vocab/
  │        │               tokens/test/MCP/registry) before merging into src/components/.
  │        └─ ANY fail → it is a COMPOSITION PATTERN
  │                      → build it from existing primitives + tokens in the app (or a docs/
  │                        showcase). Resolve any visual gap with a TOKEN, never a baked value.
  │                        NEVER add it to src/components/.
  │
  └─ If a token is missing to express it → ADD THE TOKEN (extensibility), not a component.
```

---

## 3. Worked examples

| Thing                                                   | C1  | C2  | C3  | C4  | C5  | C6  | C7  | Verdict                                                                  |
| ------------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------------------------ |
| `Select` (incl. search/async)                           | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | **Framework component**                                                  |
| `DataTable`, `Dialog`, `Calendar`, `Switch`, `Combobox` | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | **Framework component**                                                  |
| `StatCard` (+ `icon`)                                   | ✅  | ➖  | ✅  | ✅  | ✅  | ✅  | ✅  | **Framework component** (a reusable KPI tile with a stable API + tokens) |
| Marketing **Hero**                                      | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — section, static, composable, brand-specific            |
| **Navbar** / **Footer**                                 | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — layout of `Text`/`Button`/`Flex`                       |
| **PricingTable** / feature grid                         | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — `ResponsiveGrid` + `Card`                              |
| Dashboard **page layout**                               | ❌  | ❌  | ❌  | ❌  | ➖  | ❌  | ❌  | **Composition** — `AppShell` + `PageContainer` + `ResponsiveGrid`        |
| "Icon medallion"                                        | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | **Composition** — `Avatar` (square) + a Lucide glyph                     |

`✅ pass · ❌ fail · ➖ borderline`. **StatCard** is the instructive borderline: C2 is weak (it owns
little behavior), but it is a universal KPI tile with a controlled API, fully tokenized, broadly
reused — so it earns its place. A **Hero** fails six of seven; it is unambiguously a composition.

---

## 4. How to build a composition pattern correctly

1. **Real primitives only.** Compose `Card`/`Button`/`Text`/`ResponsiveGrid`/`Flex`/`Avatar`/… —
   never hand-roll a control or fake a primitive with a styled `<div>`.
2. **Sections are layout, not components.** A `<section>`/`<header>`/`<footer>` wrapper that arranges
   primitives is allowed — it is plain layout, not a faked primitive.
3. **Resolve every visual gap with a TOKEN.** A navy hero, a glass card, a brand glow, display type
   → a token override (global `:root`, scoped `[data-tenant]`, or **per-region role scoping**
   `[data-tenant] .region { --card: navy; --foreground: white; … }`). If the token doesn't exist,
   **add the token to the framework** (extensibility), never bake a value into the composition.
4. **Live in the app, or a `docs/` showcase** — never `src/components/`.

> The whole point of the token-extensibility work (scoped theming, glow / tint / gradient / focus,
> display type, dual-font, role-scoping) is so that **a composition pattern can reach 100% design
> fidelity from tokens alone** — which is exactly why almost nothing new needs to become a framework
> component.

---

## 5. The mandatory gate (enforced)

This contract is wired into the build/skill gates:

- **`godxjp-ui-component` skill, Gate 0** — the FIRST gate before writing any component is the
  Framework-Component Test. You must record the C1–C7 verdict; any FAIL stops the work and redirects
  to composition.
- **CLAUDE.md cardinal rule #46** — references this document as the hard gate.
- A reviewer will reject a `src/components/**` addition that did not publish a passing C1–C7 ledger.
