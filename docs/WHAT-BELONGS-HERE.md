# What belongs in @godxjp/ui

A design system fails in two opposite directions, and both failures are real:

- **Too narrow** — a prop is missing, so consumers are forced to work around it with a class or a
  hand-typed colour. This is the direction that is failing today: an audit of godx-chat
  (2026-09-08) found **51 defects, 42 of them caused by exactly ONE missing prop** (padding on a
  layout primitive).
- **Too broad** — it accepts every request and becomes a pile of props nobody can remember, and
  each prop freezes a piece of internal DOM into public API.

This document is the filter between those two directions. It is deliberately written as questions
that can be **answered yes or no**, not as principles to be felt.

---

## Three questions — ALL THREE must pass

### 1. Does the consumer have NO valid move at all?

Not "inconvenient". **Impossible**: every existing prop and token fails to say what needs saying,
and every remaining route is blocked by `ui-audit`.

- ✅ The design needs 12px between two elements in a ROW. The named scale reads the vertical axis,
  so `md` = 16px; rounding breaks the layout; writing `gap: 12px` is blocked by
  `no-arbitrary-spacing`. **There is no move.** → gh#401, fixed.
- ❌ "Writing `<Flex gap={3}>` is longer than `gap-3`." There is a move; it is just longer.

How to check: write the code you _want_ to write and run `ui-audit` on it. If it is green, you
already have a move.

### 2. Does it belong to the SHAPE of the component, or to the CONTENT of one screen?

The design system owns shape. The screen owns content.

- ✅ `Flex` has no padding. Every row and column in every application may need padding.
- ✅ `TableHead` has no alignment axis. Every table with a numeric column needs one.
- ❌ "The member admin table needs an 8rem role column." That is that screen.
- ❌ "The dashboard needs four stat cards side by side." That is one page's layout.

A follow-up question when in doubt: **would a second consumer hit this?** If the answer is
"probably not", it is almost always content, not shape.

### 3. Can it be expressed as a NAMED AXIS?

A prop must name an **intent**, not just open a hole.

- ✅ `pad={{ blockStart: 3 }}` — a logical axis, a step on a scale, it reads as meaning.
- ❌ `styles={{ body: {...}, header: {...} }}` — not an axis; it is a free-form hole, and it
  freezes the names of internal DOM slots into public API. See "Not worth adding" below.

---

## Four STRONG signals — one is enough to do it first

The three questions above decide _whether it belongs here_. These four signals decide _before or
after_.

### a. It blocks an ACCESSIBILITY requirement

Not negotiable, do it first.
Example we hit: the Input focus ring is 1px (lowered on purpose), which fails WCAG 2.4.11, which
asks for an indicator area equivalent to a 2px line. And `FormRoot` has no `onInvalid` hook, so
focus cannot be moved to the first invalid field — WCAG 3.3.1 / 2.4.3.

### b. It fails SILENTLY

No compile error, no red test, no warning — just wrong.
Example we hit: `AppShell` accepts both `logo` and `topbar`, but `resolvedTopbar` returns `topbar`
directly, so `logo` is **never drawn**. godx-chat passed both for months and nobody noticed.

This class of defect costs many times more than the noisy class, because nothing reports it.

### c. It is countable

A gap that produces N audit errors is a gap with a measurement, not an opinion. 42 errors from one
missing prop is a priority; one error from one missing prop may not be.

### d. It is ASYMMETRIC with what already exists

If the vertical axis has `xl` and the horizontal axis does not, the gap is almost always an
**oversight**, not a decision. Balancing it is cheap and uncontroversial.

---

## What is NOT worth adding — and why

**The layout of one specific screen.** It belongs to that screen. If three screens need it, it has
become a shape by then, and you return to question 2.

**A value used exactly once.** Do not mint a prop for it — use the escape hatch (`gapRaw`,
`padRaw`). The escape hatch leaves a `data-*-raw` attribute in the DOM, so it is countable; when
that count grows, THAT is the moment it becomes an axis worth naming.

**A free-form styling hole** (`styles={{ slot }}`, `classNames={{ slot }}`). It freezes the
internal DOM structure into public API, and the audit **cannot count it** (a style object can be
built anywhere and then spread). It also runs directly against `style: 0/289` — the consistent
position today is to give intent props, not styling holes.

**Aesthetic taste.** "Use lots of whitespace", "two accent colours are enough", "avoid the bento
grid". It cannot be verified, no gate watches it, and when it reaches an agent BEFORE the hard
rules the result is beautiful code that breaks the contract.

**Anything that only saves a few lines at the call site.** If the current path is already valid
and readable, shortening it is not the design system's job.

---

## What you OWE once it is added

A new prop is not done when it compiles. Three things are mandatory, and all three already have a
CI gate:

1. **It goes into the catalog.** Run `node scripts/gen-component-api-manifest.mjs`.
   `check:component-api-manifest` guards this. **If it is not in the catalog, agents do not know it
   exists** — and that is not hypothetical: `pad`/`padRaw` were added to the package but the
   released catalog did not have them yet, so an agent consulting the MCP by the book still
   concluded "Flex only has gap" and gave up on 21 errors it could have fixed.

2. **It has evidence covering every value branch.** `component-case-evidence.json` +
   `check:frame-coverage-ledger`. The evidence must point at a test that REALLY runs through that
   branch, not a file that is there for show.

3. **It has an example that COMPILES.** The measured cost of not checking: the `confirm-destructive`
   pattern passed `Dialog` a `mode` prop that does not exist, the DataTable guidance used
   `variant="success"` (exactly what the `status-tone-not-variant` rule forbids), and the `Input`
   example called an `onValueChange` prop that is not real. Agents copied them and wrote broken
   code.

   Those three places are fixed, and `check:doc-prop-existence` now catches that class of error.
   A note for writing docs: that gate reads every JSX snippet in `docs/**` as REAL code, so
   **quoting a wrong API as a bad example is caught too**. Describe it in words, as in the
   paragraph above, rather than pasting a complete JSX tag.

---

## A hidden, measured benefit of leaving Radix

`check:doc-prop-existence` guards the dimension "every prop used in an example must exist" — the
very class of error that makes agents copy an example and write broken code (the `mode` prop on
`Dialog`, the `onValueChange` prop on `Input`). But it **skips every component that wraps a
third-party primitive**, because for those the manifest is only a lower bound: the real props live
in Radix's types, which the generator cannot open.

Measurement (2026-09-08):

|                                                 | components that CANNOT be checked |
| ----------------------------------------------- | --------------------------------- |
| `main`                                          | **139 / 289**                     |
| `feat/v20-react-aria` (6 primitives moved over) | **126 / 289**                     |

Every primitive that leaves Radix moves `declaredIn` from `node_modules` into `src/`, and that
component **enters the checkable zone**. The first six primitives removed the barrier for 13
components.

So the change of foundation is not only a library swap. It is the only way to make the remaining
126 components guardable — and among them are `Dialog`, `Input` and `Badge`, exactly the
components the wrong examples slipped through.

## When the answer is "does not belong here"

Say so where you meet it, in code:

```tsx
/*
 * NOT a design-system concern: this width is the measurement of the member-admin
 * screen alone, not an axis of Table. If a second screen needs the same thing,
 * open an issue then.
 */
```

One line like that is worth more than an issue opened and abandoned — it tells the next person
who weighed it, and how.
