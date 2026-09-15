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

## What it found on its first run

54 rows, **159 violation nodes**, on code that passed every other gate in this repository:

| nodes | rows | rule                    | what it means                                                                                                                  |
| ----: | ---: | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
|    62 |   17 | `color-contrast`        | text under 4.5:1 (SC 1.4.3)                                                                                                    |
|    28 |   16 | `target-size`           | under 24×24 with no spacing exception (SC 2.5.8) — on `Carousel`, `Attachments`, `FilterBar` and `Toolbar`, at **every** width |
|    21 |    6 | `aria-prohibited-attr`  | an `aria-*` on a role that does not allow it                                                                                   |
|    18 |    6 | `button-name`           | **a button a screen reader announces as nothing**                                                                              |
|    18 |    6 | `aria-valid-attr-value` | an `aria-*` pointing at an id that is not there                                                                                |
|    12 |    3 | `aria-conditional-attr` | an `aria-*` that is invalid in the state it is in                                                                              |

48 of those nodes are on `/isolate/**` — single components, this package's own output — and 111 on
`/showcase/**`. None of the six rules exists in `scripts/visual-audit.mjs`. The `target-size` rows
are the sharpest: our own `target-size-min` rule was running on those same frames and reporting them
clean, because it measures a painted box.

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
| full sweep                         | **3m20s** — 215 routes × 3 viewports, measured locally                              |
| sequential                         | ~55 min — the three viewport passes run concurrently, which is the whole difference |
| showcase only (`--scope=showcase`) | 30s                                                                                 |

`--shard=i/n` is in the script for the day the sweep outgrows the lane. Using it adds check-run
names, which costs nothing here because none of them is in `REQUIRED_CI_CHECK_RUNS`.

## Where it runs

`ci-browser.yml`, on push to `main` — the lane the deleted job lived in, inside CONTRACT.md L4's
five-minute budget at the measurement above. **Not** the PR lane: that file's own header lists axe
among what it deliberately excludes, at a measured 653–745s, and that decision is not reopened here.

The job is not in `REQUIRED_CI_CHECK_RUNS` (#492 removed it from the release proof map and this does
not put it back). It still protects a release through `assertCiProvenance`'s collateral rule — **any**
red check run on the SHA being published refuses the publish.

## Related

- [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md) — which frames must exist at all.
- [DEVELOPMENT.md](./DEVELOPMENT.md) §5 — the `/isolate/<id>` · `/frame/<id>` addressing.
