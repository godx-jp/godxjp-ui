# Per-frame accessibility CI — `check:frame-axe`

One ruler, run in the repository that owns the CSS.

## Why it exists (gh#643)

`scripts/visual-audit.mjs` carries **eight** rules. A consumer's nightly runs `@axe-core/playwright`
with **68**. Six of our eight are design-language opinions with no axe equivalent —
`oversaturated-accent`, `sibling-card-gap`, `row-content-starved`, `emoji-rendered`,
`alert-controls-misplaced`, `css-layers-missing` — and a design system **should** own those. The
other sixty (names, roles, `aria-*`, contrast, focus order, target size) were checked **nowhere in
this repository**, and only in a consumer that cannot fix the CSS, because the CSS is here.

gh#639 is what that costs. A topbar shipped; every gate here said green; `target-size` failed in
`godx-jp/id`'s nightly at 320px. And our own `target-size-min` could not have caught it at any
threshold — it measures a **painted box**, and that failure was an **obscured** target (axe:
`partiallyObscured`, 8×28). Two rulers, and the disagreement only ever surfaces downstream.

## What it does

```bash
pnpm check:frame-axe                       # every frame, 3 viewports
pnpm check:frame-axe -- --update           # rewrite the baseline
pnpm check:frame-axe -- --scope=showcase   # the 30 whole-page frames only, 30s
pnpm check:frame-axe -- /isolate/layout-topbar   # one route, while fixing
```

|           |                                                                                   |
| --------- | --------------------------------------------------------------------------------- |
| tool      | `@axe-core/playwright`                                                            |
| tags      | `wcag2a` · `wcag2aa` · `wcag21aa` · `wcag22aa` — **the consumer's set, verbatim** |
| routes    | every `/isolate/<id>` in `window.__STORY_MANIFEST__` + every `/showcase/<id>`     |
| viewports | 1440×900 · 375×667 · **320×568**                                                  |

320 is not decoration: it is WCAG 2.2 SC 1.4.10's reflow width, it is the width the consumer's
nightly runs, and it is the width gh#639 failed at while 390 passed.

Showcases are included on purpose. They are the only frames here shaped like a real screen — a whole
page, a landmark tree, a focus order — which is precisely the class the component frames cannot
reach and the consumer has been carrying alone.

## What it found on its first run — and what came of it

54 rows, **159 violation nodes**, on code that passed every other gate in this repository. Fixing
them took it to **12 rows / 19 nodes**, and then to **0**:

| rule                    | first run | now | what it was                                                                                                                              |
| ----------------------- | --------: | --: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `color-contrast`        |        62 |   0 | text under 4.5:1 (SC 1.4.3)                                                                                                              |
| `target-size`           |        28 |   0 | under 24×24 (SC 2.5.8) — `Carousel` dots, `SearchInput`'s clear button, `Attachments`' file input                                        |
| `aria-prohibited-attr`  |        21 |   0 | `Badge`'s `aria-label` on a `generic` div — the name was dropped by every screen reader                                                  |
| `button-name`           |        18 |   0 | **`Select`'s trigger is `role="combobox"`, which cannot be named by its contents** — every unlabelled Select shipped a nameless combobox |
| `aria-valid-attr-value` |        18 |   0 | `aria-controls` pointing at ids that do not exist                                                                                        |
| `aria-conditional-attr` |        12 |   0 | `aria-expanded` on a `<tr>`, which only a `treegrid` row may carry                                                                       |

Four of those were LIBRARY defects, not demo slips — `Badge`, `Select`, `Carousel`, `SearchInput` —
and the fifth produced a new vocabulary member: `tone="inherit"` on `Text` / `Heading` / `Title` /
`Activity` / `Separator`, because every other tone is an absolute token and there was no way to put
text on a coloured surface without fighting it.

The `target-size` rows are the sharpest point about two rulers. Our own `target-size-min` was
running on those same frames and reporting them clean, because it measures a painted box. And the
fix axe wants is not the fix the standard wants: a centred `::after` genuinely makes the target
24×24 — `docs/MEASUREMENT-CONTRACT.md` records that under `expanders` — but axe reads
`getBoundingClientRect()`, which cannot see a pseudo-element. Both fixes were tried; the boxes had
to grow.

## The last twelve rows, and what each one turned out to be

The table above is what the sweep found; this is what the remaining 12 rows / 19 nodes turned out
to be once each was measured rather than reasoned about. The rows are kept, with the verdict this
file used to carry quoted back, because four of the five were wrong: two had no diagnosis at all
and two had one the measurement contradicted — and in both of those the guess pointed AWAY from
this package.

| rows | what                                                                                                   | the measurement, and where it was fixed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---: | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    3 | `foundation-colors` · `--success-foreground` on `--success`, `--attention-foreground` on `--attention` | Called "a PALETTE decision, an owner-level call". It was not the palette: the FILL was fine and the INK was wrong. Two of the light theme's eight fills carried a near-white ink their own lightness cannot support (2.19:1 / 3.32:1) while the sibling `--warning` had always used the near-black one on the equally pale 山吹, and the DARK theme already flipped both. `src/tokens/foundation.css`: ink only — success 2.19 → **7.08**, attention 3.32 → **4.68**. Guarded by `__tests__/status-fill-contrast.test.ts`.                                                                                                                           |
|    3 | `case6-agency-handy` · a SELECTED `ToggleGroupItem` paints `--foreground` over `--primary`             | "Cause not yet found." Found, with `CSS.getMatchedStylesForNode`: the demo wrote `text-[var(--font-size-xs)]`, and Tailwind v4 reads a bare `var()` in `text-*` as a COLOUR — it compiled to `color: var(--font-size-xs)` in the UTILITIES layer, an invalid colour that clobbered the component's own `color: hsl(var(--primary-foreground))` in `components` and left the trigger inheriting the page ink. The component rule was right all along. Demo fix (`text-[length:var(…)]`, 10 sites in `docs/`), plus the count pill: the hand-rolled `Text` at `opacity-70` measured 2.15:1 and `ToggleGroupItem`'s own `count` prop inverts to 6.32:1. |
|    3 | `table-view-tabs` · a `Tab`'s `aria-controls` points at a `tabpanel` that is never rendered            | A LIBRARY defect, and the composition is published: `Tabs` / `TabsList` / `TabsTrigger` are three separate exports, nothing in their types asks for a fourth, and the attribute could not be overridden (`withDomProps` puts RAC's props after the caller's). `TabsContent` now registers its value and a trigger claims a panel only when one is declared. No new public prop. `__tests__/tabs-panel-reference-643.test.tsx`.                                                                                                                                                                                                                       |
|    2 | `futurelastic-web` @320/@375 · white ghost buttons read as 1.01:1                                      | "Probably a false positive." It was not. The tenant's `.fl-navbar-inner` was a fixed-height flex row with no wrap, so at 320 its content ran to **x=569.6 inside a 320px nav** — the links painted outside the navbar's own box, over the page behind it. A WCAG 2.2 SC 1.4.10 reflow failure reported by the contrast rule, because that is what an overflowing element looks like from the outside. Demo CSS + `Flex wrap`.                                                                                                                                                                                                                        |
|    1 | `table-bulk-actions` @375 · `target-size`                                                              | "Not yet diagnosed." The left cluster carried `min-w-0 flex-1` — "squeeze me to nothing" — over children that refuse to shrink, so its box shrank to 113.6px while its content ran to x=462 and painted 一括承認 (264.6→360.2) under 解除 (272.3→341.0), leaving 19.2×30.2 unobscured against SC 2.5.8's 24×24. Demo: `wrap`, and no `min-w-0`.                                                                                                                                                                                                                                                                                                      |

Two of the five were library defects and three were genuine demo slips — a different split from the
first sweep, where four of five were the library's. Which is the point of writing the number down
next to each one: "it is the demo" and "it is the palette" are both cheap to say and neither
survived a measurement here.

## The baseline is a debt ledger, not an allowlist

The package did not start compliant, and a gate that fails the whole build on its first day gets
deleted rather than obeyed. `frame-axe-baseline.json` records what was already failing when the gate
landed, keyed one row per `(route, viewport, rule)`:

```
"/isolate/layout-topbar @320 target-size": { "count": 2, "help": "…" }
```

The gate fails on a key that is **not** in the baseline, and on a baselined key whose `count`
**grows**. A key that stops firing is reported so it can be dropped.

- **Delete rows as you fix them.** `--update` rewrites the file; the diff is the review.
- **Never add a row by hand to turn a red build green.** That is the one move this file exists to
  make visible.

## What this gate does NOT do — stated, not hidden

The gate deleted in #492 did three things this one does not, and each is a real gap:

1. **No overlay scope.** It scans the frame as rendered. A menu, dialog, listbox or popover that is
   closed at rest is never measured, so `aria-hidden-focus` and friends stay outside its field of
   view. The old gate opened one overlay per frame from a `data-axe-open` attribute; that attribute
   was removed from the demos along with the gate and would have to come back.
2. **No chrome/component split.** The old gate held the preview toolbar to zero violations and
   allowlisted the component scope separately. `/isolate/**` renders the demo alone, so there is
   little chrome to separate — but `/showcase/**` is scanned whole.
3. **No per-rule severity.** Every WCAG-tagged rule is treated alike.

## Determinism

Two consecutive sweeps of identical code first disagreed on five `color-contrast` rows: a fade-in
caught mid-flight renders text at partial opacity and axe scores whatever it finds. A gate that
disagrees with itself gets ignored, so each page is pinned before the scan —
`reducedMotion: "reduce"`, an injected stylesheet zeroing every animation and transition duration,
and `document.fonts.ready` (web fonts change glyph geometry, which changes which boxes overlap,
which changes what `color-contrast` resolves a background to). Two sweeps after that: identical.

## Cost

|                                    |                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| full sweep                         | **3m20s** locally · **12m01s** on the self-hosted runner — 215 routes × 3 viewports |
| sequential                         | ~55 min — the three viewport passes run concurrently, which is the whole difference |
| showcase only (`--scope=showcase`) | 30s                                                                                 |

`--shard=i/n` is in the script for the day the sweep outgrows the lane. Using it adds check-run
names, which costs nothing here because none of them is in `REQUIRED_CI_CHECK_RUNS`.

## Where it runs

Two lanes, split on a **measurement taken on the runner, not on a laptop**:

| lane                                                              | what                                      | when                                                           | measured                               |
| ----------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| `ci-browser.yml` · `Per-frame axe (showcases, WCAG 2.2 AA)`       | `--scope=showcase` — 30 whole-page frames | every push to `main`                                           | 30s locally                            |
| `ci-browser-full.yml` · `Per-frame axe (all frames, WCAG 2.2 AA)` | the full 215-route sweep                  | nightly, `workflow_dispatch`, or a `run-browser` label on a PR | **12m01s on the pool** (3m20s locally) |

The full sweep went into the merge lane first, on the local 3m20s. On the pool's runner the same
job took **12m01s** — three times the local wall clock and more than twice CONTRACT.md L4's
five-minute budget for that whole lane. So the merge lane keeps the showcases, which are the only
frames here shaped like the screens a consumer ships, and the wide matrix moved to the lane this
repository already reserves for wide matrices.

**Not** the PR lane: that file's own header lists axe among what it deliberately excludes, at a
measured 653–745s, and that decision is not reopened here.

The job is not in `REQUIRED_CI_CHECK_RUNS` (#492 removed it from the release proof map and this does
not put it back). It still protects a release through `assertCiProvenance`'s collateral rule — **any**
red check run on the SHA being published refuses the publish.

## Related

- [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md) — which frames must exist at all.
- [DEVELOPMENT.md](./DEVELOPMENT.md) §5 — the `/isolate/<id>` · `/frame/<id>` addressing.
