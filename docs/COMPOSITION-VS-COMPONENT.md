# Composition pattern vs Framework component — the decision contract

> **Cardinal rule:** before ANY new thing is added to `src/components/`, it MUST pass the
> **Framework-Component Test** below — _all_ criteria, no exceptions. If it fails even one, it is a
> **composition pattern**: build it from existing primitives + tokens in the app/showcase, and do
> **not** add it to the framework. **When in doubt, compose.** The framework stays lean; brand- and
> screen-specific UI lives where it belongs — in the consumer app (or a `docs/` showcase), as a
> composition of real primitives configured by tokens.

This document defines the two concepts precisely, gives the mandatory test, and lists worked examples so the call is never a matter of taste.

---

## 1. The two concepts

### Framework component (`src/components/**`)

A **reusable, behavior-bearing primitive** that ships in the `@godxjp/ui` bundle and is imported by many consumer apps. It encapsulates interaction, state, accessibility and a controlled API that must NOT be re-implemented per app. Examples: `Button`, `Select`, `DataTable`, `Dialog`, `Calendar`, `Switch`, `Combobox` (= `Select showSearch`), `StatCard`.

### Composition pattern (consumer app, or a `docs/` showcase)

A **specific arrangement of existing primitives** for a specific screen, domain or brand — a dashboard layout, a marketing **Hero**, a **Navbar**, a **Footer**, a pricing section, a settings page. It has **no reusable behavior of its own**: it is layout + content + token configuration over real components. It is brand/design-specific and is **expressible today** by composing `Card`, `Button`, `Text`, `ResponsiveGrid`, `Flex`, `Badge`, `Avatar`, … + token overrides (incl. scoped `[data-tenant]` / per-region role scoping).

> A Claude Design's marketing landing page (Hero / Services / CTA / Footer) is the canonical
> composition case: it is reproduced 100% from **token configuration + real primitives**, with zero
> new framework components. See `docs/showcase/acme-website.tsx`.

---

## 2. The Framework-Component Test (MANDATORY — all 7 must pass)

Before creating OR proposing a framework component, evaluate **every** criterion and record the verdict. **Allowed only if ALL are `PASS`.** Any `FAIL` ⇒ it is a composition pattern; use existing components instead.

| #                                                                 | Criterion                                                                                                                      | PASS means                                                            | FAIL means (→ compose)                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **C1. Universal, not design-specific**                            | Needed by many apps across domains; not a recreation of one design's block.                                                    | A generic capability (a select, a table, a date picker).              | "ACME Hero", "AcmePricingTable", "this dashboard's header".              |
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
| `ServiceLauncherCard`                                   | ➖  | ❌  | ❌  | ✅  | ✅  | ➖  | ➖  | **Composition by the test — RETAINED as a recorded exception** (gh#814)  |
| `MegaMenu`                                              | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ➖  | **Framework component** — the instructive contrast with Hero, below      |
| Marketing **Hero**                                      | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — section, static, composable, brand-specific            |
| **Navbar** / **Footer**                                 | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — layout of `Text`/`Button`/`Flex`                       |
| **PricingTable** / feature grid                         | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | **Composition** — `ResponsiveGrid` + `Card`                              |
| Dashboard **page layout**                               | ❌  | ❌  | ❌  | ❌  | ➖  | ❌  | ❌  | **Composition** — `AppShell` + `PageContainer` + `ResponsiveGrid`        |
| "Icon medallion"                                        | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | **Composition** — `Avatar` (square) + a Lucide glyph                     |
| **Section** / **Band** (full-bleed + measured column)   | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | **Composition** — `<section>` + `Flex measure` + `pad`; see §3.1         |

`✅ pass · ❌ fail · ➖ borderline`. **StatCard** is the instructive borderline: C2 is weak (it owns little behavior), but it is a universal KPI tile with a controlled API, fully tokenized, broadly reused — so it earns its place. A **Hero** fails six of seven; it is unambiguously a composition.

**MegaMenu is the instructive PASS, and it is in this table because it sits next to Navbar.** A
Navbar fails every criterion; a megamenu is the same bar with behaviour bolted through it, and that
one difference flips the verdict. **C2** is the whole case: a roving tabindex across the top-level
items, `aria-expanded`/`aria-controls` per trigger, hover intent (a diagonal pointer path toward the
panel must not close it), `Escape` closing and returning focus to its trigger, Tab-out and
outside-click closing, and close-on-route-change. None of that is layout. **C3** is the one people
get wrong: `DropdownMenu` looks like the answer and is the WRONG primitive, not an awkward one — it
is react-aria-components `Menu`, i.e. `role="menu"` / `role="menuitem"`, which announces a set of
site links as a desktop application menu and takes Tab out of the widget. The APG says so itself in
its Disclosure Navigation example. A recipe over `DropdownMenu` would therefore ship the classic
megamenu accessibility defect, which is exactly the case C3 is asking about. **C7 is the weak
one** — marked ➖ deliberately: this is a JP business-software library, and a marketing megamenu is
not in every consumer's build. It is kept because the same disclosure bar is what an admin console
with several product areas needs, and because the cost is one file with no new dependency (no
`@radix-ui/react-navigation-menu`, no animation runtime). Compare `StatCard`, whose borderline is
C2 rather than C7.

**ServiceLauncherCard is the ONE recorded exception, and it is recorded so that it stays one.** It shipped before the test was run against it, and when the test was run it came back with two hard FAILs: **C2** — no state, no keyboard handling, no focus management, its only ARIA three static attributes — and **C3** — its own imports are `Card` + `CardContent` + `Badge` + a Lucide glyph, so "could I build this right now from primitives?" is yes. By §2 that makes it a composition pattern. It is kept anyway because `src/components/layout/app-launcher.tsx` consumes it: it is an internal building block of a component that **does** pass, so the question was never "should it exist" but "should it be PUBLIC", and removing a public export is breaking. Keeping it public was the cheaper call and the ledger lives on gh#814 and at the top of `src/components/data-display/service-launcher-card.tsx`. **Consumers should compose `Card` + `Badge` for a service tile** — reach for `ServiceLauncherCard` only to match `AppLauncher`'s own tiles — and this row is not precedent for adding another static tile to `src/components/`.

### 3.1 "Full-bleed outside, measured column inside" — the case that was answered with a PROP (gh#839)

This row exists because the question it settles was asked the other way round, and the right answer
turned out to be neither "add a component" nor "do nothing".

**A `Section` component is refused, and it is refused for Hero's reasons.** It owns no state, no
keyboard, no focus and no ARIA a `<section aria-labelledby>` does not already have (**C2**); it is
`<section>` + `Flex` + padding + a max-width, i.e. buildable today (**C3**); its API would be the
grab-bag `band` / `measure` / `glow` / `surface` / `bleed` that **C4** names by name; and a JP
business-software library would be shipping a marketing band to every consumer (**C7**). One
criterion of seven passes. Nothing about that is close.

**But "do nothing" was also refused, and that is the part worth remembering.** The doctrine's own
remedy for a composition is a TOKEN (§4.3), and `--page-measure-wide` shipped in 28.8.0 — so on
paper the gap was already closed. It was not. A token is only closed when something can READ it,
and three unrelated pages had each hand-written the identical four declarations to do so:
`docs/showcase/marketing-page.tsx` as an inline `style` constant, `acme-website.tsx` as `.tx-shell`,
`futurelastic-web.tsx` as `.fl-shell` — one shape, three spellings, two of them page-local CSS
classes on the pages whose entire claim is that they need none. `docs/TOKENS.md` calls a value that
appears in more than one place tier 1, and the same logic reads on a SHAPE.

**The third move is a prop on a primitive that already passes the test.** `Flex measure` (narrow |
medium | wide) centres the box and caps it at `var(--page-measure-*)`; it adds no gutter, because
`pad` owns that. A full-bleed band is now `<section>` — carrying the edge-to-edge paint — around one
`<Flex direction="col" measure="wide" pad={{ inline: 6, block: 20 }}>`. Measured on
`marketing-page.tsx`: seven bands, 7 inline `style` spreads and 3 `CSSProperties` constants gone,
the metric that page defends (0 bespoke classes, 0 raw px/rem literals) unchanged at 0/0, and the
geometry byte-identical (1440: section 1440px, column 1152px, band 96/80px, gutter 24px).

**`PageContainer measure="wide"` stays refused, and for the original reason.** A marketing page is
full-bleed `<section>`s; `PageContainer` owns page padding and a header/toolbar/footer scaffold, so
the two pages that are the prop's proof still cannot consume it. The prop went to the primitive
those pages CAN put inside a `<section>`, which is the distinction the earlier deferral was missing
rather than a reversal of it.

**The rule this leaves behind:** when a composition repeats a shape, ask whether an existing
primitive is missing ONE AXIS before you ask whether a new component is missing. A component that
fails C1–C7 and a prop that closes the same gap are not the same proposal, and the test above is
only asking about the first.

---

## 4. How to build a composition pattern correctly

1. **Real primitives only.** Compose `Card`/`Button`/`Text`/`ResponsiveGrid`/`Flex`/`Avatar`/… — never hand-roll a control or fake a primitive with a styled `<div>`. 2. **Sections are layout, not components.** A `<section>`/`<header>`/`<footer>` wrapper that arranges primitives is allowed — it is plain layout, not a faked primitive. 3. **Resolve every visual gap with a TOKEN.** A navy hero, a glass card, a brand glow, display type → a token override (global `:root`, scoped `[data-tenant]`, or **per-region role scoping** `[data-tenant] .region { --card: navy; --foreground: white; … }`). If the token doesn't exist, **add the token to the framework** (extensibility), never bake a value into the composition. 4. **Live in the app, or a `docs/` showcase** — never `src/components/`.

> The whole point of the token-extensibility work (scoped theming, glow / tint / gradient / focus,
> display type, dual-font, role-scoping) is so that **a composition pattern can reach 100% design
> fidelity from tokens alone** — which is exactly why almost nothing new needs to become a framework
> component.

---

## 5. The mandatory gate (enforced)

This contract is wired into the build/skill gates:

- **`godxjp-ui-component` skill, Gate 0** — the FIRST gate before writing any component is the Framework-Component Test.
