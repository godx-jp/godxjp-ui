# Per-frame accessibility & coverage CI

Executable gates for the `/frame/**` contract suite (issues **#157** + **#163**). They render
every catalog frame in real Chromium and hold the line on accessibility, responsive geometry
and contract coverage. Static checks (`audit:examples`, source regexes) cannot see rendered
colour/layout/ARIA — these gates do.

## The three gates

| Script                        | `pnpm`                 | Drives                                                                          | Blocking?                                                                |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/check-frame-axe.mjs` | `check:frame-axe`      | axe over **every frame** at desktop 1440×900 + mobile-sm 375×667                | **Preview-chrome: yes.** Component/demo: allowlisted (regression = fail) |
| `scripts/frame-geometry.mjs`  | `check:frame-geometry` | overflow + clipped-control sweep across **320·375·390·768·1024·1280·1440·1920** | Allowlisted (regression = fail)                                          |
| `scripts/frame-coverage.mjs`  | `check:frame-coverage` | component-inventory ↔ frame ↔ contract-axis cross-check (browser-free)          | Report-only (`--strict` fails on any zero-frame component)               |

CI: `.github/workflows/frame-a11y.yml` — coverage + axe on every PR; geometry on `main` + nightly.

This doc covers `check:frame-axe` end to end (why it exists, the two scopes, how to run and
regenerate it locally, and — as a reference for the next contributor — how every category of
violation in the original #157 audit was root-caused and fixed). `check:frame-geometry` works
identically for responsive overflow (see its own header comment); `check:frame-coverage` is
covered briefly at the end and fully in [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md).

## Why a per-frame gate, not the old hand-picked checks

Before #157, accessibility was checked two ways, both blind to most of the catalog:

- `check:contrast` (`scripts/check-contrast.mjs`) — a hand-picked set of ~6 pages checked for
  WCAG-AA text contrast. It never saw the other ~100 component frames.
- `audit:examples` (`pnpm audit docs`) — a static source-regex linter. It can catch a hard-coded
  hex value but cannot see what actually renders: computed contrast, DOM landmark structure,
  focus order, or anything a Radix portal produces at runtime.

`check:frame-axe` instead renders **every** `/frame/:id` contract example (the same catalog the
docs preview serves) in a real headless browser and runs [axe-core](https://github.com/dequelabs/axe-core)
against the actual DOM — the same class of audit that originally filed #157 (199/200 serious runs
against the whole catalog), now wired in as a standing CI gate instead of a one-off sweep.

## Chrome vs component: two independently-tracked scopes

`check:frame-axe` runs axe **twice** per frame/viewport:

- **Preview chrome** = the zoom / dimension **toolbar** (`.demo-block-toolbar`,
  `preview/src/demo-block.tsx`). We own this. It **must be 0** — a chrome violation fails the
  build. The dominant violation in the original audit (199/200 _serious_ runs) was the `100%`
  zoom preset at **3.93:1** contrast; it is fixed (`#0b57d0` on `#e8f0fe` ≈ 5.5:1) so chrome is
  AA-clean.
- **Component / demo** = _everything except the toolbar_ — the rendered example **and its Radix
  portals** (Dialog / Popover / Sheet / Toast mount on `document.body`, outside the frame box, so
  scoping by "exclude the toolbar" — not "include the frame box" — keeps portaled demo violations
  attributed to the component, never to chrome). Owned by the per-component agents. Tracked
  against a machine-readable baseline.

This separation means component fixes are tracked independently and never mask a chrome
regression, and a component fix can never accidentally get credited to "chrome is clean."

## The component allowlist — and how it shrinks to zero

`scripts/frame-axe.baseline.json` is the allowlist of **pre-existing** component violations, keyed
`frame → [axe-rule-id]` — the **set of violation types** still firing on each frame (union across
desktop + mobile). We key on rule _presence_, not exact node counts, because axe counts jitter
run-to-run as a Radix portal (Dialog/Popover/Sheet) opens or closes — an exact-count gate would be
flaky. `--update-baseline` unions **two passes** by default (`AXE_RUNS`) so an
intermittently-mounted overlay is captured. The gate itself:

- **fails** if a frame gains a rule **not** in its baseline set (a genuinely new violation type);
- **passes** rule sets equal to or a subset of baseline, printing exactly what remains (nothing hidden);
- prints a **↓ shrink hint** whenever a baseline rule stops firing (a component agent fixed it).

The baseline can **only shrink**. As each component-semantics PR merges (issue #157's per-component
work), re-snapshot so the ceiling drops and can never grow back:

```sh
git pull                                   # get the merged component fixes
pnpm check:frame-axe --update-baseline     # re-snapshot: rule sets only shrink
git add scripts/frame-axe.baseline.json && git commit -m "chore(a11y): tighten frame-axe baseline"
```

When every component frame is clean, `frame-axe.baseline.json` becomes `{ "component": {} }` and
the gate is fully green with **zero** allowlisted violations — the exit criterion for #157. There
is **no blanket suppression**: a documented axe false positive would be an explicit per-rule entry
with a comment, never a mute.

**Current state (baseline `generatedAt: 2026-07-13`):** the allowlist holds **12 frames / 7
distinct axe rules** (down from **101 frames** in the original #157 audit sweep). `0` chrome
violations, `0` regressions. See [Remaining baseline debt](#remaining-baseline-debt--the-12-frames)
below for exactly what's left and the path to zero.

## Running it locally

### Prerequisites

`playwright` and `@axe-core/playwright` are **optional peers** — `check:frame-axe` detects a
missing/unbuilt peer and skips with a warning instead of failing the build (so a browser-less
environment, e.g. a docs-only contributor, never gets blocked). To actually run it:

```sh
pnpm install
pnpm exec playwright install chromium        # local dev — downloads Playwright's managed Chromium
# CI uses: pnpm exec playwright install --with-deps chromium (adds OS-level deps)
```

`frame-harness.mjs` looks for a Chromium binary at `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, defaulting to
a **CI-only** path (`/opt/pw-browsers/chromium-1228/chrome-linux64/chrome`). That path won't exist
on a laptop — when it's absent the harness falls back to Playwright's own managed browser (from
`playwright install` above), so a plain local checkout works without setting anything.

### Commands

| Command                                             | What it does                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm check:frame-axe`                              | The gate: 1 pass over every frame × 2 viewports, compares to the baseline, exits non-zero on fail |
| `AXE_FRAMES_LIMIT=8 pnpm check:frame-axe`           | Quick local smoke — only the first 8 frames (manifest order)                                      |
| `pnpm check:frame-axe --format json`                | Machine-readable result on stdout (same exit-code semantics) — no colored human report            |
| `pnpm check:frame-axe --update-baseline`            | Regenerate the allowlist (2-pass union by default) — see below                                    |
| `AXE_RUNS=3 pnpm check:frame-axe --update-baseline` | More union passes, for a component with flaky portal timing                                       |
| `pnpm check:frame-axe http://localhost:6008`        | Point at an already-running preview instead of building+serving one                               |

If no preview server answers at the base URL (`http://localhost:6008` by default), the script
builds one itself: `pnpm preview:build` then serves the static output with `vite preview`
(`ensurePreviewServer` in `scripts/frame-harness.mjs`) — deterministic and stable under a long
headless sweep, unlike the dev server's per-request recompilation. If a `pnpm preview` dev server
(or a remote base) is already reachable, it's reused as-is and never rebuilt.

### Reading the output

Terminal report (human mode) has two blocks:

```
Preview-chrome axe (blocking — must be 0):
  ✓ 0 chrome violations across all 107 frame(s).

Component/demo axe (allowlisted — baseline may only shrink):
  47 component violation node(s) remaining across 12 frame(s).
  ✓ no new component violation types (rule-set within baseline).
```

- A **red `✗ <rule>`** under chrome is always blocking.
- A **red `✗ N NEW violation-type(s) not in baseline`** under component means a frame gained a
  rule the baseline didn't have — that's the actual CI failure mode for a component regression.
- A **yellow `↓ shrink hint`** means a baseline rule no longer fires anywhere it's listed — free
  baseline tightening available via `--update-baseline`.

### Evidence JSON

Every non-`--update-baseline` run writes `audit-evidence/frame-axe/frame-axe-results.json`
(gitignored — a CI artifact, uploaded by `frame-a11y.yml` under the `frame-axe-evidence` name).
Shape:

```jsonc
{
  "generatedAt": "2026-07-13T00:45:34.614Z",
  "base": "http://localhost:6008",
  "summary": {
    "status": "ok", // "ok" | "fail"
    "frames": 107,
    "viewports": ["desktop", "mobile"],
    "chromeViolations": 0, // total chrome violation NODE count
    "componentViolations": 47, // total component violation NODE count (reporting only)
    "componentRegressions": 0, // rules present now but not in the baseline
    "infrastructureErrors": 0, // frames that failed to load / axe crashed
  },
  "chrome": {/* rule → { impact, nodes, frames: ["<frameId>@<viewport>", …] } */},
  "componentCurrent": {/* frameId → viewport → ruleId → node count, this run */},
  "regressions": [/* { frame, rule } — new rules, the actual gate failure */],
  "shrinkHints": [/* { frame, rule } — baseline rules that no longer fire */],
  "infraErrors": [/* { frame, viewport, message } */],
  "results": [/* per-frame { id, viewports: { desktop: { chrome, component }, mobile: {…} } } */],
}
```

Node counts are recorded for triage but are **not** what the gate compares — the gate compares
rule _presence_ per frame (`currentRules` vs `baseline.component[frame]`), because node counts
jitter with portal open/close timing (see "The component allowlist" above). The evidence file does
**not** carry the underlying axe `nodes[].any[].data` (e.g. the exact contrast ratio or CSS
selector) — `scan()` in `check-frame-axe.mjs` only keeps `{ id, impact, nodes: v.nodes.length }`.
To see the raw axe payload for a specific violation while triaging, run `@axe-core/playwright`
directly against `http://localhost:6008/frame/<id>` in a small throwaway script, or use the
Playwright Inspector / browser devtools with the `axe-core` extension against the same URL.

### Regenerating / shrinking the baseline after a component fix

1. Fix the root cause in the component (or the docs demo, if the violation is demo-content-only —
   see the categories below for which is which).
2. `pnpm check:frame-axe --update-baseline` — re-snapshots every frame's current rule set (2-pass
   union). Frames that are now clean are **removed** from the JSON entirely; frames whose rule set
   shrank keep only what still fires.
3. `git diff scripts/frame-axe.baseline.json` — confirm the diff is a **strict shrink** (no rule
   should reappear on a frame that previously didn't have it — if one does, you introduced a new
   violation, not fixed an old one).
4. Commit the baseline alongside the fix in the same PR.

`AXE_FRAMES_LIMIT` + `--update-baseline` together only touch the frames actually run — the merge
logic in `check-frame-axe.mjs` overwrites `runFrameIds` and leaves every other frame's baseline
entry untouched, so a scoped re-snapshot (e.g. after fixing just `Select`) never silently drops
unrelated frames from the allowlist.

## Violation categories & how each was root-caused (reference)

The original #157 audit's 101-frame baseline collapsed to 12 through structural fixes, not
whack-a-mole per-frame patches. Each category below is a pattern — recognize it the next time a
new frame trips the same rule.

| Category                                   | axe rule(s)                                                                     | Root cause                                                                                                                                                                                                                                                                                                                                                                                            | Fix pattern                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Heading order**                          | `heading-order`                                                                 | Every docs demo nests `PageContainer`'s `<h1>` directly around sibling `<Card>` sections whose `CardTitle` defaulted to `level={3}` (`<h3>`) — skipping `<h2>` (91 frames).                                                                                                                                                                                                                           | AST codemod bumped every **top-level** `CardTitle` to `level={2}`; nested Card-in-Card titles correctly kept the `h3` default (`CardTitle`'s own jsdoc already documents this contract). Commit `030e82a`.                                                                                                                                                                                          |
| **Landmark — main**                        | `landmark-one-main`, `landmark-no-duplicate-main`, `landmark-main-is-top-level` | `preview/src/frame-main.tsx` hardcoded a `<main>` around every frame. A story that renders its own page shell (`AppShell`/`AuthShell`, which already emit their own `<main>`) got a nested/duplicate main. Story metadata can't disambiguate — every catalog entry defaults to `layout: "fullscreen"` regardless of content.                                                                          | `FrameLandmark` (`preview/src/frame-main.tsx`) detects it **after mount**: `useLayoutEffect` checks `node.querySelector('main, [role="main"]')` — stays a plain `<div>` if the subtree already owns a main, otherwise renders the real `<main>` **tag** itself (not `role="main"` — several axe landmark checks walk ancestors by native tag name, not computed role). Commit `030e82a`, `281c8d4`. |
| **Landmark — banner (chrome)**             | `landmark-no-duplicate-banner`                                                  | The demo toolbar was a candidate `<header>`, which resolves to an implicit `banner` landmark whenever the rendered story also provides its own (`AppShell` demos).                                                                                                                                                                                                                                    | `demo-block.tsx`'s toolbar is a plain `<div className="demo-block-toolbar">`, never a `<header>` — it's preview chrome, not page banner content (see the comment right above it in the file).                                                                                                                                                                                                       |
| **Landmark — uniqueness**                  | `landmark-unique`                                                               | `Pagination`, `Breadcrumb` (standalone + `PageContainer`'s built-in slot), and `Carousel` each hardcoded ONE localized `aria-label` with no override. Fine for a real screen (one instance); the component-gallery docs stack several instances of the same component on one page, so same-role + same-name landmarks become indistinguishable in a screen-reader landmark list (WCAG 2.4.1 / 1.3.1). | Added an `aria-label` override prop (`PaginationProp`, `BreadcrumbProps`, `PageContainer`'s `breadcrumbAriaLabel`); every repeated docs instance now passes a distinguishing label. Also fixed `PageContainer`'s breadcrumb slot to route its label through `t()` instead of a hardcoded English `"Breadcrumb"` literal (an i18n-contract bug found in the same pass). Commit `741ccf5`.            |
| **Scrollable region focusable**            | `scrollable-region-focusable`                                                   | An `overflow: auto`/`overflow-x: auto` container was in the tab order for mouse users but unreachable by keyboard (WCAG 2.1.1). Hit three places: `.demo-block-canvas`/`.demo-block-frame` (the preview harness's own scroll wrappers), and the `Table` primitive's/`DataTable`'s/`ScrollArea`'s overflow wrappers.                                                                                   | Add `tabIndex={0}` to the scrolling element — **no `role="region"`**: a landmark role there would break `landmark-*-is-top-level` for any story that renders its own regions (e.g. `AppShell` demos). See the inline comments in `demo-block.tsx` (`.demo-block-canvas`) and `src/components/data-display/table.tsx`. Commits `030e82a`, `8675570`.                                                 |
| **List semantics**                         | `listitem`                                                                      | `docs/data-display/list-row.tsx` rendered two `<ListRow as="li">` siblings directly inside `CardContent` (a plain `<div>`) — axe requires an `<li>`'s parent to actually be a list container (`ul`/`ol`/`role="list"`). `ListRow`'s own jsdoc already documents `as="li"` for "when the rows are a semantic list" — the demo just hadn't supplied the wrapping list it implied.                       | Wrap the `<li>` rows in a real `<ul>` in the demo. Commit `30d22f1`.                                                                                                                                                                                                                                                                                                                                |
| **Accessible name — button**               | `button-name`                                                                   | A `<button>` (native or a `SelectTrigger`) with no discernible text (WCAG 4.1.2).                                                                                                                                                                                                                                                                                                                     | Case-by-case: give the control real text, an `aria-label`, or route it through `FormField` (see below). Remaining `button-name` entries all trace to the `SelectTrigger`/`DataSelect` prop-forwarding gap fixed by #177 — see [Remaining baseline debt](#remaining-baseline-debt--the-12-frames).                                                                                                   |
| **Accessible name — form control / label** | (implicit via `FormField` wiring, WCAG 1.3.1/4.1.2)                             | A control inside `FormField` was named only via `aria-labelledby`, which some AT/axe paths don't resolve as reliably as a direct name.                                                                                                                                                                                                                                                                | `FormField` (`src/components/data-entry/form-field.tsx`) now **also** injects a redundant `aria-label` mirroring the visible label text (when it's plain text), alongside its existing `aria-labelledby` wiring — belt-and-suspenders, only when the child hasn't already set its own `aria-label`. Commit `8675570`.                                                                               |
| **Accessible name — dialog**               | `aria-dialog-name` / `aria-hidden-focus`                                        | A `role="dialog"` (Popover in `modal` mode) needs a discernible name; a modal Popover **shown open at rest** in a demo (`Popover modal defaultOpen`) also puts Radix's `aria-hide` on everything outside the portal, which can hide the page's own `<main>`/`<h1>` from the accessibility tree scan.                                                                                                  | Label the titled/modal Popover demos with `aria-label` on `PopoverContent`. The `aria-hidden-focus`/`landmark-one-main`/`page-has-heading-one` combination on an **open-at-rest modal demo** is the deferred exception — see below. Commit `8675570`.                                                                                                                                               |
| **Color contrast**                         | `color-contrast`                                                                | `Calendar`'s selected-day ghost `<button>` kept dark text on the blue fill through hover/focus (insufficient contrast on the selected date).                                                                                                                                                                                                                                                          | Force `text-primary-foreground` on the day `<button>` through hover/focus states. Commit `8675570`. Some `color-contrast` entries remain on `text-muted-foreground` small text — tracked, not yet fixed (see below and [color-extensibility.md](./roadmap/color-extensibility.md)).                                                                                                                 |
| **Stray heading from empty state**         | `heading-order`                                                                 | `DataTable`'s built-in empty state rendered its "no rows" message as an `<h3>` (`EmptyState`'s default `titleAs`), injecting a heading into the outline for a state message, not a section.                                                                                                                                                                                                           | `DataTable`'s empty state now renders `titleAs="p"` (plain text) — `EmptyState`/`CardTitle` both expose `titleLevel`/`titleAs` (`level`/`as` for `CardTitle`) precisely so callers can pick outline position without changing visual size. Commit `8675570`.                                                                                                                                        |

## Remaining baseline debt — the 12 frames

As of `frame-axe.baseline.json` (`generatedAt: 2026-07-13`), 12 frames still carry an allowlisted
component violation. Grouped by root cause (per the tracking note in commit `8675570`):

| Frame(s)                                                                                | Rule(s)                                                          | Why it's still open                                                                                                                                                                                                                                                                                                                                                                                                                               | Path to zero                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-entry-select`, `data-entry-select-matrix`, `feedback-sheet`, `navigation-toolbar` | `button-name` (+ `feedback-sheet` also `color-contrast`)         | All four demos use `Select`/`SelectTrigger`. `#177` (merged, commit `1ef05be`) shipped the `DataSelect` prop/aria-forwarding + `SelectTrigger showIndicator` fix this was tracked against, but the axe baseline was **not re-verified/re-snapshotted** against `main` after that PR merged.                                                                                                                                                       | Run `pnpm check:frame-axe --update-baseline` on current `main`; if `#177` closed the underlying gap, these 4 entries drop out automatically. If any remain, re-triage against the current `SelectTrigger`/`FormField` DOM.                                                                                                                              |
| `navigation-tabs`                                                                       | `color-contrast`                                                 | `#176` (merged, commit `78c1c3b`) fixed `Tabs`' scrollable-overflow + disabled-fallback selection; the `color-contrast` entry here was tracked against that same PR but likewise **not re-verified** since.                                                                                                                                                                                                                                       | `pnpm check:frame-axe --update-baseline` after confirming the fix; re-triage if it persists.                                                                                                                                                                                                                                                            |
| `data-entry-transfer`, `feedback-sheet`                                                 | `color-contrast`                                                 | Both demos use `text-muted-foreground` on small text (`transfer.tsx:83,101,121`, `sheet.tsx:226`). This is the same **default-theme contrast tradeoff** already tracked in [`docs/roadmap/color-extensibility.md`](./roadmap/color-extensibility.md) — resolving it is a brand-colour decision (darken the token or add a dedicated `--text-muted` variant), deliberately deferred pre-release rather than shipped as an unflagged palette shift. | Land the token decision in `color-extensibility.md`, then re-run `--update-baseline`.                                                                                                                                                                                                                                                                   |
| `data-entry-calendar`                                                                   | `landmark-unique`                                                | `Calendar` wraps `react-day-picker` (`^10.0.1`), which renders its **own internal `<nav>`** for month navigation inside every `DayPicker` instance. The docs demo renders 4 `Calendar` instances on one page (each with a distinguishing container `aria-label`, but the _nested_ `nav` isn't currently overridable through this wrapper's `classNames` config) — 4 identical unnamed `nav` landmarks on one page.                                | Needs either upstream `react-day-picker` support for a per-instance nav label, or wrapping its nav slot with a custom, labelled replacement in `src/components/data-entry/calendar.tsx`.                                                                                                                                                                |
| `layout-split-pane`                                                                     | `landmark-unique`                                                | `SplitPane` (`src/components/layout/split-pane.tsx`) renders a bare `<aside className="ui-split-pane-aside">` with **no `aria-label` prop at all**. `docs/layout/split-pane.tsx` renders 4 `SplitPane` instances on one page → 4 identical unnamed `complementary` landmarks.                                                                                                                                                                     | Add an `aria-label`/`asideAriaLabel` override prop to `SplitPane`, same pattern as `Pagination`/`Breadcrumb` (commit `741ccf5`), then give each docs instance a distinguishing label.                                                                                                                                                                   |
| `data-display-popover`                                                                  | `aria-hidden-focus`, `landmark-one-main`, `page-has-heading-one` | `docs/data-display/popover.tsx` (line ~198) renders `<Popover modal defaultOpen>` — a modal Popover **shown open at rest** so the demo illustrates the modal behavior without a click. Radix's modal mode `aria-hide`s everything outside the portal while open, which hides the frame's own `<main>`/`<h1>` from axe's accessibility-tree scan (and leaves focusable content behind the hidden boundary).                                        | Either stop shipping this specific demo `defaultOpen` (illustrate modal-ness a different way, e.g. a screenshot/GIF or a "click to open" note) or accept it as a **known, deliberate** demo-only artifact of showing a Radix modal-trap mid-interaction and add a per-rule documented exception (not a blanket mute) once the maintainers decide which. |
| `layout-resizable-panel`                                                                | `scrollable-region-focusable`                                    | `docs/layout/resizable-panel.tsx:72` — a demo panel with an inline `style={{ overflowY: "auto" }}`, added directly in the doc content, not through a primitive that already carries the `tabIndex={0}` fix.                                                                                                                                                                                                                                       | Add `tabIndex={0}` to that panel's `<div>` in the docs demo (same fix pattern as `.demo-block-canvas`/`Table`, just not yet applied to this hand-rolled demo wrapper).                                                                                                                                                                                  |
| `navigation-breadcrumb`                                                                 | `scrollable-region-focusable`                                    | `docs/navigation/breadcrumb.tsx:89,95` — two `<pre className="overflow-x-auto">` code-snippet blocks rendered directly in the demo body (not the footer "View code" panel, which is disabled in frame mode).                                                                                                                                                                                                                                      | Add `tabIndex={0}` to the `<pre>` elements in the docs demo.                                                                                                                                                                                                                                                                                            |
| `navigation-pagination`                                                                 | `scrollable-region-focusable`                                    | This one is a **real component gap**, not docs-only: `.ui-pagination-list` (`src/styles/layout.css`, the `#153`/`#165` no-wrap pagination CSS) sets `overflow-x: auto` so the page-number strip scrolls instead of wrapping to a second line — but `PaginationContent`'s `<ul>` (`src/components/navigation/pagination.tsx`) never received a `tabIndex={0}` to match.                                                                            | Add `tabIndex={0}` to `PaginationContent`'s `<ul>` in `pagination.tsx` (mirrors the `Table`/`ScrollArea` fix), then `--update-baseline`.                                                                                                                                                                                                                |

Overall rule histogram across the 12 frames: `button-name` ×4, `color-contrast` ×3,
`scrollable-region-focusable` ×3, `landmark-unique` ×2, `aria-hidden-focus` ×1,
`landmark-one-main` ×1, `page-has-heading-one` ×1 (the last three all on the same
`data-display-popover` frame).

**Fastest path to a fully green baseline:** re-run `pnpm check:frame-axe --update-baseline` on
current `main` first (it's plausible `#176`/`#177` already closed 5 of the 12 entries and nobody's
re-snapshotted since) — then tackle the remaining `SplitPane`/`Calendar` landmark props, the two
docs-only `tabIndex` additions, the one real `pagination.tsx` `tabIndex` fix, the muted-foreground
token decision, and finally decide the modal-Popover-at-rest exception.

## Infra frame modes (issue #163)

Any `/frame/<id>` accepts query params (implemented in `preview/src/frame-main.tsx`) so a route can
be exercised across contract axes without editing per-component example content:

| Param     | Values                                  | Effect                                                    |
| --------- | --------------------------------------- | --------------------------------------------------------- |
| `dir`     | `ltr` \| `rtl`                          | flips logical CSS for the whole subtree (global RTL mode) |
| `density` | `compact` \| `default` \| `comfortable` | drives `AppProvider` density                              |
| `theme`   | `light` \| `dark`                       | drives `AppProvider` theme                                |
| `locale`  | `ja` \| `vi` \| `en` \| `ar` …          | drives `AppProvider` locale (BCP-47)                      |

Example: `/frame/data-entry-select?dir=rtl&density=compact&theme=dark`.

`check:frame-axe` itself always runs the default chrome (`ltr`/`default`/`light`/`ja`) — these
params are for manual/exploratory testing (e.g. checking a component under RTL + dark in a real
browser), not currently swept by the automated gate.

## Coverage tracker

`check:frame-coverage` reads the public inventory (`mcp/src/data/components.ts`), the frames that
exist (`docs/` tsx), and the declared ledger (`preview/frame-coverage.ledger.json`), then emits
`docs/FRAME-COVERAGE-REPORT.md` + `audit-evidence/frame-coverage/coverage.json`. Every contract axis
is `covered` / `N/A:<reason>` / **`UNTESTED`** — a missing axis is never a silent pass. Those axes
are rolled up from the 14 contract dimensions the ledger tracks per export.

`check:frame-coverage-ledger` is the enforcing gate: it regenerates the ledger from the real public
surface, recomputes every dimension from the evidence, and fails on regression (coverage falling, a
new export with no frame, a weakened viewport matrix, a growing geometry/axe baseline). Dimension
totals climb toward full coverage (the #163 exit criterion). See
[FRAME-COVERAGE-LEDGER.md](./FRAME-COVERAGE-LEDGER.md) and
[FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md).

## Adding a new component/frame without regressing the gate

Before opening a PR that adds or meaningfully changes a `/frame/**` example:

1. **Give every top-level `Card` a `CardTitle level={2}`** when the frame sits directly under a
   `PageContainer` (`<h1>`) — nested Card-in-Card titles keep the `h3` default. Skipping this
   reintroduces `heading-order`.
2. **Don't hand-roll a scroll container.** If a demo needs `overflow: auto`/`overflow-x: auto`,
   add `tabIndex={0}` to the scrolling element and do **not** add `role="region"` (that turns it
   into a landmark and can trip `landmark-*-is-top-level` for stories with their own regions).
   Prefer reusing `Table`/`DataTable`/`ScrollArea`, which already carry this.
3. **Stacking more than one instance of a landmark-owning component** (`Pagination`, `Breadcrumb`,
   `SplitPane`'s `aside`, custom `<nav>`/`<aside>`/`<section aria-label>`) **on one page** — give
   each instance a distinguishing `aria-label` (use the `aria-label`/`breadcrumbAriaLabel` override
   props already on `Pagination`/`Breadcrumb`/`PageContainer` where they exist), or the frame trips
   `landmark-unique`.
4. **`<li>` needs a real list parent.** `ListRow as="li"` (or any bare `<li>`) must be inside a
   `<ul>`/`<ol>`/`role="list"` container, never a plain `<div>`.
5. **Every interactive control needs a discernible name.** Route form controls through `FormField`
   (it injects both `aria-labelledby` and a redundant `aria-label`); give icon-only buttons/triggers
   an explicit `aria-label`.
6. **A `role="dialog"` (Popover `modal`, custom dialogs) needs a name**, and avoid shipping a demo
   with a **modal** dialog `defaultOpen`/open-at-rest unless you've checked what it hides from the
   rest of the page (see the `data-display-popover` entry above) — prefer "click to open."
7. **Run the gate before pushing:** `pnpm exec playwright install chromium` (once) then
   `AXE_FRAMES_LIMIT=<n> pnpm check:frame-axe` scoped to your new/changed frame(s), or the full
   `pnpm check:frame-axe` if you have time. A brand-new frame with **zero** violations needs no
   baseline entry at all — it's only added if you're knowingly landing a pre-existing violation
   that a follow-up will fix (and even then, prefer fixing it before merge).
8. If you do land a frame with a tracked violation, add it to `scripts/frame-axe.baseline.json` via
   `--update-baseline` (never hand-edit the JSON) and note _why_ + the follow-up issue in the PR
   description — the baseline file's own `note` field explains it may only shrink from here.
9. Register the case you authored in `preview/frame-coverage.ledger.json` so
   `check:frame-coverage-ledger` stops reporting that dimension `UNTESTED`. You **cannot** hand-write
   a verdict — add an entry to the ledger's `cases` array (frame path + case heading + resolvable
   evidence paths + reviewer + HTTPS review link + ISO timestamp) and run
   `pnpm gen:frame-coverage-ledger`; the gate recomputes every cell from that evidence and rejects
   any verdict it cannot reproduce. See [FRAME-COVERAGE-LEDGER.md](./FRAME-COVERAGE-LEDGER.md) and
   [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md).
