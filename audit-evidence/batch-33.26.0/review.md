# Batch 33.26.0 review and fixes

Branch: `batch/33.26.0`. Package version remains `33.25.2`. No push, release, issue closure or baseline edits.
Reviewed the complete diff against `origin/main`, including #1508, #1513, #1515 and the #1383 docs fixes. Issues were read through `gh issue view`. No CodeGraph index or connected godx-ui MCP tool was available; consulted the authoritative local component, prop, token and rule catalogs instead.

## Tracking and design decisions

| Item | Radius | Delivered change and design rationale | Acceptance |
| --- | --- | --- | --- |
| #1508 RadarChart | A/B/C/D | Replace the control-character regex and crude truncation with font-measured word/grapheme wrapping, at most two lines, full SVG titles, quiet grid/axis defaults, public geometry/type/color knobs, dedicated en/ja/vi summary, exact localized default precision. Keep the dependency-free chart focused on honest common-scale profiles. | 14 radar tests; nine individually named invalid-input cases; localized exact decimals; filtered ticks; browser labels within viewBox at sm/md/lg with Japanese/English labels and a 24px theme override. |
| Chart public contract | B/C | Remove incomplete, unrelated `showValues` and `animated` additions from Cartesian/Pie implementation, types and catalog; move radar export into chart block; register RadarChartProp; fix the layer generator so regeneration retains ChartFrame styling. | Existing Bar/Pie/Line/Area test files, props/catalog/manifest gates, generator regression test, precompiled prune smoke result. |
| #1513 Flex viewport/orientation | A/B/C/D | Listen to visual-viewport scroll as well as resize; expose the portrait footprint ratio; show all new enum values in docs. Preserve equal zero-minimum regions and directional internal scrolling, with immediate reduced-motion orientation. | 390×844 and 1366×768 browser geometry; all four rotations; focus; internal horizontal scroll; unit resize/visual-scroll/ref tests. |
| #1515 Flex material | B/D | Preserve initial role-mirror colors and tokenized grain opacity; expose grain stripe width/highlight extent; resolve etched radius locally; use the existing easing token. Neutral material stays opt-in, with theme roles controlling text, focus and boundary strokes. | Real scoped role/token overrides in Chromium; shipped light/dark AA contrast computation including overlapping grain/highlight; screenshots. |
| #1383 docs fixes | D | Review the existing sidebar/button examples using public tokens instead of winning utility classes. | Both requested filtered token-wins commands PASS. |

Framework-component review for the batch's RadarChart: C1 universal profile chart PASS; C2 reusable polar/shared-scale behavior PASS; C3 no existing primitive supplies this geometry PASS; C4 single quantitative purpose/public vocabulary PASS; C5 token-themeable/no brand PASS; C6 localized exact alternative and accessible figure PASS; C7 SVG/no extra chart dependency PASS. No additional framework components were introduced by this review.

## Tokens added by this review

Radar (14): `--radar-chart-label-inset`, `--radar-chart-plot-radius`, `--radar-chart-label-radius`, `--radar-chart-grid-alpha`, `--radar-chart-boundary-alpha`, `--radar-chart-axis-alpha`, `--radar-chart-label-font-size`, `--radar-chart-label-line-height`, `--radar-chart-tick-offset`, `--radar-chart-tick-font-size`, `--radar-chart-point-radius`, `--radar-chart-grid-color`, `--radar-chart-label-color`, `--radar-chart-grid-stroke-width`.

Flex (3): `--flex-card-size-ratio`, `--flex-felt-grain-width`, `--flex-felt-highlight-size`. Existing `--flex-etched-radius` now defaults to `initial` with `var(--radius-md)` resolved at the region. Existing felt/etched color mirrors remain `initial`, with local role fallbacks. All new tokens are imported through base.css, described in the MCP token catalog and regenerated into the published catalog. Changelog additions stay under Unreleased.

## Gates

Commands ran sequentially. Final results:

| Command | Result | Time |
| --- | --- | --- |
| `pnpm typecheck` | PASS | 4.21s |
| `pnpm typecheck:mcp` | PASS | 0.38s |
| `pnpm check:token-tiers` | PASS | 0.31s |
| `pnpm check:prop-vocabulary` | PASS | 0.28s |
| `pnpm check:mcp-sync` | PASS | 0.29s |
| `pnpm check:mcp-orphans` | PASS | 0.28s |
| `pnpm check:component-api-manifest` | PASS | 3.36s |
| `pnpm check:registry` | PASS | 0.25s |
| `pnpm check:agent-api-names` | PASS | 1.09s |
| `pnpm check:no-hardcoded-css-values` | PASS | 0.34s |
| `pnpm check:no-consumer-coupling` | PASS | 0.77s |
| `pnpm check:mcp-prop-sync` | PASS | 0.34s |
| `pnpm check:disclosure-duplication` | PASS | 0.28s |
| `pnpm preview:build` | PASS | 2.34s |
| `pnpm check:frame-contracts` | PASS | 4.69s |
| `pnpm build` | PASS | 2.22s |
| `pnpm run audit` | PASS | 1.6s |
| `pnpm typecheck:docs` | PASS | 1.1s |
| `pnpm lint` | PASS | 1.53s |
| `pnpm regen` | PASS | 4.39s |
| `pnpm regen` | PASS | 4.27s |

`pnpm run audit`: **0 errors, 96 warnings**, the same warning count as the earlier audit. Exit status is PASS; this is not a claim of zero warnings.

Frame checks against the built static preview at `http://127.0.0.1:6786`:

- `pnpm check:frame-overflow http://127.0.0.1:6786 --only charts-radar-chart`: PASS, 1 frame, 0 known overflows.
- `pnpm check:frame-overflow http://127.0.0.1:6786 --only layout-flex`: PASS, 1 frame, 0 known overflows. First run found two compact demo labels spilling 5.6px; fixed using public Text size/truncate/title APIs and reran green.
- `pnpm check:frame-token-wins http://127.0.0.1:6786 --only layout-sidebar`: PASS, 92 elements, 2 known inert tokens, 22 fixed since baseline.
- `pnpm check:frame-token-wins http://127.0.0.1:6786 --only general-button-index`: PASS, 67 elements, 0 known inert tokens, 24 fixed since baseline.

These filtered runs are PARTIAL, not release gates. No preview baseline changed. The temporary static server was stopped after screenshots. Precompiled prune smoke emits base + layout + chart-layout (see radar-pruned.css); this was an external smoke command, not a test reading dist.

## Tests and red-before evidence

All root tests ran with explicit test filenames and `--maxWorkers=2` (never a directory or full suite). Per-file results/timings are in tests.json:

- Tokens: 32 files / 827 tests PASS.
- Charts: 7 files / 57 tests PASS, including RadarChart 14, charts 10, series knobs 16, missing values 4, category click 5, datum-selection Chromium 2, category-axis helper 6.
- Flex: 3 files / 7 tests PASS (viewport 3, material 2, real-browser workspace 2).
- Style-layer manifest: 1 file / 8 tests PASS.
- MCP: explicit enumeration of its 25 test files via `cd mcp && npx vitest run --root . <files> --maxWorkers=2`: **1,768 tests PASS**.

Total: **68 files / 2,667 tests PASS**, counted once per file using the latest result; mutation runs are excluded.

Temporarily broke production implementations, ran the relevant test file, observed exit 1, then restored and reran green. red-before.log records the failures:

1. Validation bypass: each of the nine new cases fails individually — 2 axes, 7 axes, value above ceiling, negative value, NaN, missing value, zero ceiling, negative ceiling, infinite ceiling. Two earlier validation tests fail too (11 failures).
2. Raw number strings instead of Intl: localized exact-decimal row test fails.
3. Unfiltered valueTicks: positive-domain tick test fails.
4. Cartesian summary key: dedicated radar summary/maximum assertion fails.
5. Restored transition under reduced motion: both viewport browser cases fail.
6. Removed visualViewport scroll listener: visual-scroll update assertion fails.

Initial gate findings were fixed, not waived: missing RadarChart props registration; nonconforming footprint token name; generated token descriptions; ratio-only line-height rule; SVG dy rejecting unresolved CSS variables. Final runs are green.

## Rendered evidence and limits

Reviewed radar, bounded Flex and material screenshots at 390×844 and 1366×768 (six PNGs here). Typography is restrained, label/grid hierarchy is clear, and the material remains neutral. Static-preview console errors/warnings: **[]** for all four route/viewport captures (rendered-checks.json). Real-browser tests also assert an empty runtime console, immediate final matrices for 0/90/180/270, keyboard focus, and successful scoped primary/foreground and component token overrides.

Worst-case overlapping default grain/highlight leaves text and focus contrast **13.503:1 light** and **14.088:1 dark**; the committed contrast test computes the shipped themes and checks 4.5:1 text / 3:1 focus. Custom service themes remain responsible for their chosen colors.

No forbidden full suite, full overflow, contrast sweep, axe, verify:ci:static or ship:surface was run. No axe/real-AT certification is claimed. The frame-contract gate itself reports existing UNTESTED coverage; a passing contract gate does not turn that into tested coverage. Actual consumer replay artwork/business integration was not exercised in this library checkout. The incomplete Cartesian/Pie enhancements were removed because they were outside #1508 and lacked a complete public contract.
