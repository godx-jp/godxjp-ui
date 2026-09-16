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
them took it to **12 rows / 19 nodes**:

| rule                    | first run | now | what it was                                                                                                                              |
| ----------------------- | --------: | --: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `color-contrast`        |        62 |  13 | text under 4.5:1 (SC 1.4.3)                                                                                                              |
| `target-size`           |        28 |   1 | under 24×24 (SC 2.5.8) — `Carousel` dots, `SearchInput`'s clear button, `Attachments`' file input                                        |
| `aria-prohibited-attr`  |        21 |   0 | `Badge`'s `aria-label` on a `generic` div — the name was dropped by every screen reader                                                  |
| `button-name`           |        18 |   0 | **`Select`'s trigger is `role="combobox"`, which cannot be named by its contents** — every unlabelled Select shipped a nameless combobox |
| `aria-valid-attr-value` |        18 |   3 | `aria-controls` pointing at ids that do not exist                                                                                        |
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

## What is still open, and why each one is not a quick fix

| rows | what                                                                                                                     | why it is still here                                                                                                                                                                                                                                                                                   |
| ---: | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|    3 | `foundation-colors` · `--success-foreground` on `--success` (2.18:1), `--attention-foreground` on `--attention` (3.32:1) | A PALETTE decision. These pairs fail AA as text, and changing either moves every solid success/attention surface in every consumer — an owner-level call, not a fix to slip into a PR.                                                                                                                 |
|    3 | `case6-agency-handy` · a SELECTED `ToggleGroupItem` paints `--foreground` over `--primary` (2.45:1)                      | `.ui-toggle[data-state="on"]` sets `color: hsl(var(--primary-foreground))`, the rule is in the built CSS, its `background` half applies and its `color` half does not. Cause not yet found; measured, not guessed.                                                                                     |
|    3 | `table-view-tabs` · a `Tab`'s `aria-controls` points at a `tabpanel` that is never rendered                              | The showcase uses `Tabs` as a filter ribbon with no `TabsContent`. A `tab` with no panel is invalid ARIA whatever the attribute says, so the real answer is either a "no panels" mode for `Tabs` or `Segmented` in the showcase — a design decision either way.                                        |
|    2 | `futurelastic-web` @320/@375 · white ghost buttons read as 1.01:1                                                        | A dark tenant whose sticky navbar paints `hsl(var(--background) / 0.8)`. axe cannot resolve a semi-transparent background and falls back to the nearest opaque ancestor, which at 320 is the light isolate page. Probably a false positive — but "probably" is not a measurement, so it stays visible. |
|    1 | `table-bulk-actions` @375 · `target-size`                                                                                | Not yet diagnosed.                                                                                                                                                                                                                                                                                     |

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
