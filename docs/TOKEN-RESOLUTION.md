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

**The Map layer is the one we do not really have.** Ant Design derives a whole gradient
(`colorPrimaryBg`, `colorPrimaryHover`, `colorPrimaryActive`, …) from one seed by a documented
_algorithm_, so a brand sets one colour and ten follow. Here, `derived.css` does a little of that —
`--ring`, `--primary-hover`, `--primary-active` hang off `--primary` — and everything else is
declared by hand. That is why `tenantTheme()` (gh#868) had to compute hover/pressed in JavaScript:
there was no algorithm layer to ask.

This is worth naming as a gap rather than a design. A missing Map layer is why the component tier
is **1688 tokens**: without derivation, every variation must be declared.

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

For one token it prints each declaration site with its **rank** (1–4 above), the selector, the
value, and whether that site is a freeze; then every place the token is read and whether the read
carries a call-site fallback. That is the trace: if two components move together, run it on the
token they share and the shared declaration is on the screen.

### What `--audit` reports today

```
2090 declared · 1973 published · 580 frozen · 6 orphan reads
118 tokens are restated in some scope below root
```

- **frozen (580)** — a `:root` binding whose source _is_ restated in some scope. The naive test
  ("any `:root` binding") reports **1028**, and a finding list that long is one nobody reads;
  `--actions-gap: var(--space-1)` only matters because `--space-1` really is restated by the scale
  scope. The intersection is the signal, and it is derived on every run, never hand-listed — a
  hand-kept list is what went blind in gh#854.
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
3. **Never write a component's token from another component's rule.** That is the literal shape of
   "changing one component moves another." A component owns the tokens with its own prefix; if two
   need to agree, they share a _semantic_ token, and the agreement is declared in the semantic tier
   where both can see it.
4. **Publish it.** A token absent from `agent/tokens.json` is not part of the API, whatever the
   stylesheet says. `pnpm regen` does this; `check:agent-catalog` verifies it.
5. **A consumer sets tokens, never selectors.** App CSS targeting `[data-slot]`, `[data-priority]`
   or `.ui-*` is unlayered and therefore outranks every package layer at every width, including the
   responsive re-points — which is how a page-local fix becomes a library-wide regression.

## 6. What is not yet true

The owner's second question was whether **every smallest element** is configurable. It is not, and
the measurement is in `docs/THEME-API-COVERAGE.md`. Two known shapes of failure:

- a painted property written as a literal, with no token at all;
- a property written as `var(--x)` where `--x` is unpublished — reachable in principle, invisible
  in practice.

Both are counted there per component. This page describes how resolution _works_; that one says how
far it currently _reaches_.
