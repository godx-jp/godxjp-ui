# Token resolution — who overrides whom, and how to prove it

This document exists because of one complaint: _"rất nhiều chỗ cứ đè cấu hình lung tung làm ảnh
hưởng component này sang component khác"_ — configuration overriding configuration until changing
one component moves another. That is a real failure mode and prose does not settle it, so this
page is **an order, a rule, and a tool**. The tool is `scripts/explain-token.mjs`.

Nothing here is invented. Ant Design v5 settled this problem years ago and its vocabulary is used
throughout; where this package lacks one of Ant Design's layers, that is said plainly rather than
papered over with a new word.

---

## 1. The order

**Yes, the chain is what you said.** For a value at a given element, strongest first:

| #   | layer             | in this package                                                | Ant Design equivalent                      |
| --- | ----------------- | -------------------------------------------------------------- | ------------------------------------------ |
| 1   | **instance**      | `style={{ "--card-radius": "…" }}` on the element              | a component prop / `<Component style>`     |
| 2   | **nearest scope** | `[data-tenant]`, `.dark`, `[data-density]`, any region wrapper | the **nearest** `ConfigProvider theme`     |
| 3   | **global**        | `:root` in the app's own `theme.css`                           | the outermost `ConfigProvider theme.token` |
| 4   | **default**       | `:root` in `src/tokens/**`                                     | `theme.defaultAlgorithm` seed              |

There is no bespoke machinery here: a CSS custom property is resolved by the ordinary cascade, so
"nearest scope wins" is just inheritance, and "the app's `theme.css` beats the package" is just the
layer contract — **unlayered CSS outranks every `@layer`**, and everything this package ships is
layered (`docs/TOKENS.md` · The layer contract).

Between 2 and 3 there is no ambiguity to resolve: an override on a wrapper is _nearer_ to the
element than `:root`, so it wins by inheritance, not by specificity. Two scopes on the same element
are ordinary cascade — higher specificity, then later.

## 2. The four tiers — Ant Design's model, and the one layer we do not have

Ant Design v5: **Seed → Map → Alias → Component**. This package:

| Ant Design                           | here        | file                          | count |
| ------------------------------------ | ----------- | ----------------------------- | ----- |
| **Seed Token**                       | foundation  | `src/tokens/foundation.css`   | 201   |
| **Map Token** (derived by algorithm) | — _partial_ | `src/tokens/derived.css`      | —     |
| **Alias Token**                      | semantic    | `src/tokens/semantic/*.css`   | 92    |
| **Component Token**                  | component   | `src/tokens/components/*.css` | 1688  |

**The Map layer is PARTIAL, not missing** — an earlier draft of this page said "missing" and Codex
was right to reject it. `derived.css` really is a Map layer for the brand ramp: `--ring`,
`--primary-hover` and `--primary-active` are computed from `--primary` with relative colour, which
is derivation by algorithm in the sense Ant Design means. Foundation mixes seed and derived too —
the spacing steps are `calc(<n> * var(--scaling))` (`foundation.css:673`) and the shadows derive
from `--shadow-color` (`foundation.css:290`).

What is genuinely thin is its **reach**: the hover knobs are themselves `initial`, the destructive
states are authored literals (`derived.css:136`), and the `@supports not (color: hsl(from …))`
branch hands older engines literals that stop following the seed altogether (`derived.css:188`).
That last one is why `tenantTheme()` (gh#868) computes hover/pressed in JavaScript — not because
there was no algorithm layer, but because the one that exists does not survive an engine without
relative colour.

A previous draft also claimed the thin Map layer is _why_ the component tier needs 1688 tokens.
That is unsupported and has been removed: deriving defaults does not remove the need for
independently overridable component knobs, which is what most of those 1688 are.

## 3. The rule that makes the order work — and silently breaks it

`var()` substitutes **where it is declared**, not where it is read.

```css
/* BROKEN — the chain is dead at step 2 */
:root {
  --card-border-color: var(--border);
}
.ui-card {
  border-color: var(--card-border-color);
}
```

`--card-border-color` resolves against the **root's** `--border`, once. A `[data-tenant]` below
root that sets its own `--border` can never reach it: the binding already happened higher up. Step
2 of the chain exists, and for that token it does nothing.

```css
/* CORRECT — knob is `initial`, formula at the CALL SITE */
:root {
  --card-border-color: initial;
}
.ui-card {
  border-color: var(--card-border-color, hsl(var(--border)));
}
```

Now the fallback is evaluated **at `.ui-card`**, where the scope is in effect, so the tenant's
`--border` is the one that arrives — and an explicit `--card-border-color` still overrides it.

This package has paid for that distinction seven times: gh#687, gh#843, gh#848, gh#866 and others.
It is the single most common cause of "I overrode the token and nothing happened."

## 4. The tool

```
node scripts/explain-token.mjs --card-radius     # one token: every declaration, every read
node scripts/explain-token.mjs --table           # a whole family
node scripts/explain-token.mjs --audit           # every freeze, orphan and unpublished token
```

For one token it prints every declaration site — marked `root-only` or `below root` — with its
selector, its value, and whether it is a freeze; then every read and whether that read carries a
call-site fallback. If two components move together, run it on the token they share and the shared
declaration is on the screen.

**It does not compute a winner, and says so.** The first version ranked selectors into four
"cascade" buckets by regex and printed them strongest-last. Codex found that `@theme inline` and
`[dir="rtl"] .ui-actions[data-fade-in-inline]` both scored top precedence on the substring
`inline`, that `:root[data-brand="crm"]` was filed as a descendant scope, and that "strongest last"
sorted by alphabetical filename. A tool meant to settle override disputes that invents precedence
is worse than no tool. `root-only` is the one property it can prove, and it is the only one the
freeze test needs. `--audit` ends with the four things it cannot see; read them before treating a
clean run as proof.

### What `--audit` reports today

```
2090 declared · 1973 published · 641 frozen · 6 orphan reads
```

- **frozen (641)** — a root-only binding whose source is restated somewhere below root. The naive
  test ("any `:root` binding that reads a token") reports **1028**, and a list that long is one
  nobody reads; `--actions-gap: var(--space-1)` only matters because `--space-1` really is
  restated. The scoped set is derived on every run, never hand-listed — a hand-kept list is what
  went blind in gh#854. It counts **any** declaration below root, not just theme-looking scopes:
  `.ui-page-container` inside `@media (max-width: 720px)` restates `--space-section-active`
  (`layout.css:992`) while `--card-space-inset` binds it at `:root` (`card.css:6`), so below 720px
  a Card keeps the root's inset. An earlier, narrower version of this test missed exactly that.
- **orphan reads (6)** — `var(--x)` where `--x` is declared nowhere and no fallback is given.
- **unpublished (117)** — declared in CSS but absent from `agent/tokens.json`, so a consumer cannot
  discover them. From the consumer's point of view these are hard-coded. `--card-accent-color` is
  one: six call-site declarations, zero documentation.

## 5. Rules for anyone adding or changing a token

1. **Declare it in the tier it belongs to.** Component tokens go in `src/tokens/components/<name>.css`,
   named `--{component}-{part}-{property}`; `check:token-tiers` enforces the shape.
2. **A knob that mirrors a role is `initial` + a call-site fallback.** Never a `:root` binding.
   See §3. If you are unsure whether it mirrors a role, run `explain-token.mjs` on the role and see
   whether any scope restates it.
3. **Do not write another component's token from your own rule — with one qualified exception.**
   Writing `--badge-*` from a Card rule is the literal shape of "changing one component moves
   another," and that is the default answer.

   The exception is a **composition default**: a child whose geometry legitimately differs when it
   sits inside a particular parent. `control.css:313` does exactly this — a count Badge inside a
   boxed Button gets `--badge-space-y: 0` and a tighter radius, because a chip in a button is not a
   standalone status chip. That is correct, and an earlier draft of this rule would have forbidden
   it.

   To qualify, all three must hold: the boundary is **documented** at the rule; the child's tokens
   are **public**, so the relationship is inspectable; and a per-instance override on the child
   still **wins**. The descendant selector deserves scrutiny of its own — `control.css:313` reaches
   every nested Badge, not just a direct child — but that is a scoping question, not grounds to ban
   composition.

4. **Publish it.** A token absent from `agent/tokens.json` is not part of the API, whatever the
   stylesheet says. `pnpm regen` does this; `check:agent-catalog` verifies it.
5. **A consumer sets tokens, never selectors.** App CSS targeting `[data-slot]`, `[data-priority]`
   or `.ui-*` is unlayered and therefore outranks every package layer at every width, including the
   responsive re-points — which is how a page-local fix becomes a library-wide regression.
6. **A theme that makes a surface translucent owns its own `prefers-reduced-transparency` and
   `@supports not (backdrop-filter)` fallbacks.** The library cannot write them on the theme's
   behalf — it does not know what opaque colour the theme wants, and guessing at one role's own
   colour is not safe: `docs/themes/glassmorphism.css` sets `--card: 0 0% 100% / 42%`, so a fallback
   that fell back to `hsl(var(--card))` would still be 42% translucent. Both branches stay
   custom-property overrides on the theme's own selector, same shape as rule 5.

## 6. What is not yet true

The owner's second question was whether **every smallest element** is configurable. It is not, and
the measurement is in `docs/THEME-API-COVERAGE.md`. Two known shapes of failure:

- a painted property written as a literal, with no token at all;
- a property written as `var(--x)` where `--x` is unpublished — reachable in principle, invisible
  in practice.

Both are counted there per component. This page describes how resolution _works_; that one says how
far it currently _reaches_.
