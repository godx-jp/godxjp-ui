# Per-frame accessibility — `check:frame-axe` (LOCAL ONLY)

One ruler, run in the repository that owns the CSS — **on a developer machine, never in CI/CD.**

> **Owner's standing rule (2026-09-17): axe must not run in any GitHub Actions workflow.** It is a
> local measurement only. gh#643 had wired it into `ci-browser.yml` (four shards on every merge) and
> `ci-browser-full.yml` (nightly); both jobs are removed. `check:gate-coverage` lists
> `check:frame-axe` as EXEMPT with this reason, so its absence from the workflows is a declaration,
> not a dead gate. **Do not re-wire it into a workflow.** The file keeps its historical name so
> existing links still resolve.

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
| states    | as rendered, **plus** one overlay OPEN on the routes that declare `data-axe-open` |

320 is not decoration: it is WCAG 2.2 SC 1.4.10's reflow width, it is the width the consumer's
nightly runs, and it is the width gh#639 failed at while 390 passed.

Showcases are included on purpose. They are the only frames here shaped like a real screen — a whole
page, a landmark tree, a focus order — which is precisely the class the component frames cannot
reach and the consumer has been carrying alone.

## The overlay scope — opening the thing before measuring it

A menu, dialog, listbox or popover that is closed at rest **paints nothing**. Every axe rule whose
condition only exists while one is open was therefore outside this gate's field of view, not passing
it. The gate shipped in 24.1.0 without this half; it is back (gh#643 item 4), rebuilt from the
version #492 deleted.

A demo opts in **declaratively**, from the demo itself:

```tsx
// the trigger, when it forwards DOM props
<DialogTrigger asChild>
  <Button data-axe-open size="sm">仕訳新規作成</Button>
</DialogTrigger>

// the region that owns it, when the component renders its own trigger
<CardContent data-axe-open>
  <FormField id="status" label="状態"><Select … /></FormField>
</CardContent>

// right-click, for the gesture nothing else reaches
<Button data-axe-open="contextmenu" variant="outline">…</Button>
```

What the gate then does, per route/viewport, **after** the default-state scan (opening an overlay is
destructive to the state that scan measures):

1. Take the **first** `[data-axe-open]` on the page. No declaration ⇒ the route skips this entirely
   and costs nothing.
2. Press **Escape** up to three times while any overlay is mounted. Several demos deliberately
   render one open at rest (`popover`'s anchored panel, `dropdown-menu`'s `defaultOpen` card), and a
   modal one makes the rest of the page unreachable. Dismissing first also makes the measurement a
   real **closed → open** transition rather than whatever the demo happened to leave mounted.
3. Resolve the click target: the declaring element itself when it matches
   `button, [role=button], [role=combobox], [role=menuitem], a[href], summary`, otherwise the first
   such control inside it. (`Select` and `DatePicker` own their trigger DOM and forward no `data-*`
   to it — hence the declare-on-the-region form. `DatePicker`'s combobox `<input>` is what opens the
   calendar, and it is what gets pressed.)
4. Click (or right-click), then wait until **one more** overlay is mounted
   (`[data-radix-popper-content-wrapper], [role=dialog], [role=alertdialog], [role=menu],
[role=listbox]`) — never a bare timer.
5. Scan again, and key the rows `@<viewport>+open`:

```
/isolate/data-entry-select-matrix @1440+open aria-required-children
```

**A declaration whose overlay never opens is a gate FAILURE**, recorded as `overlay-did-not-open`
and red on the spot. A broken declaration otherwise reads exactly like a clean frame, which is the
one thing this scope exists to prevent.

**Routes declaring an open step today — 7 declared, 7 open:** `data-entry-select`,
`data-entry-select-matrix`, `data-entry-date-picker`, `data-display-popover`,
`navigation-dropdown-menu`, `feedback-dialog`, `feedback-sheet`. (The old `navigation-context-menu`
frame is gone — `ContextMenu` was folded into `DropdownMenu trigger={["contextMenu"]}` in v23 — so
the right-click gesture is declared on that card of `navigation-dropdown-menu` instead.)

### What it found, and the proof it has teeth

**`aria-required-children`, CRITICAL, on `/isolate/data-entry-select-matrix` at all three
viewports.** `SelectSeparator` rendered react-aria's `<Separator>`, i.e. `role="separator"`, as a
direct child of the viewport's `role="listbox"`. ARIA 1.2 lets a `listbox` own `option` and `group`
and nothing else. Fixed in `src/components/data-entry/select.tsx` — the divider is decoration over a
structure the two `SelectGroup`s already announce, so it now renders `aria-hidden` with no role.
`menu` **does** own `separator`, so `DropdownMenuSeparator` is correct as it stands. Regression test:
`src/components/data-entry/__tests__/select-groups.test.tsx`.

The control run is the part worth keeping. On the **same defective build**:

| declarations | result                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| removed      | ✓ green, `0 route(s) opened a declared overlay`                             |
| present      | ✗ red, 3 × `aria-required-children` on `@1440+open / @375+open / @320+open` |

A `data-axe-open` on a `Button` that opens nothing turns the gate red with three
`overlay-did-not-open` rows, one per viewport.

**The original 2026-09 proof no longer reproduces, and the reason matters more than the proof.** That
commit disabled `src/components/general/inert-background.ts` and watched `aria-hidden-focus` go red
on `select`, `dropdown-menu` and `context-menu`. Disabling it today changes nothing measurable:
these overlays are **react-aria-components**, not Radix: react-aria inerts the background itself —
`#root` plus three focus sentinels carry `inert` the moment a listbox opens, with no `aria-hidden`
anywhere on them. Stripping every `inert` attribute immediately before the scan still leaves the
page clean and `aria-hidden-focus` in axe's `passes` bucket, because that rule needs an
`aria-hidden` ancestor to fire at all. No `src/` component imports `useInertHiddenBackground` any
more; the only importer is the Radix parity fixture
`src/components/data-entry/__tests__/radix-select.fixture.tsx`. So `inert-background.ts` is dead
for `Select` and `DropdownMenu`, and the overlay scope's value is no longer the rule it was built
for.

Be careful with the stronger version of that claim, because the first draft of this paragraph made
it and it is false: `data-aria-hidden` is **not** absent from the built preview. The `aria-hidden`
npm package ships inside the `command` chunk (`cmdk`'s dependency tree), so the marker exists in
the bundle even though no first-party overlay sets it. What is measured above is the narrow claim —
`Select` and `DropdownMenu` background-inert via `inert`, not `aria-hidden` — not a repo-wide
absence. It is still the rule class: `aria-required-children` is the same
shape, and nothing else here could see it.

### What is still outside this scope, stated rather than hidden

- Only the **first** declaration per route is exercised. A route with several distinct overlays is
  measured on one of them.
- Only **one step deep**: submenus, an overlay opened from inside another, and the state after a
  selection are not reached.
- **Keyboard opening is not exercised** — the gate clicks. A trigger that opens on click but not on
  `Enter`/`Space` passes.
- The overlay's **focus trap and focus order** are not asserted; axe cannot see a JS focus trap.

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

The gate deleted in #492 did three things this one does not. One is now back; two are still gaps:

1. ~~**No overlay scope.**~~ Restored — see [the overlay
   scope](#the-overlay-scope--opening-the-thing-before-measuring-it) above.
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

|                                       |                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| full sweep                            | **2m14s** locally, with the overlay scope — 215 routes × 3 viewports                |
| sequential                            | ~55 min — the three viewport passes run concurrently, which is the whole difference |
| showcase only (`--scope=showcase`)    | ~30s                                                                                |
| one route (`pnpm check:frame-axe /isolate/…`) | seconds — the loop to use while fixing                                      |

The overlay pass is bounded by declaration: only the 7 declaring routes pay it (21 extra scans plus
their open steps), and no `/showcase/**` route declares one, so `--scope=showcase` is unchanged by it.

## Where it runs: your machine

**Never in CI/CD** — see the rule at the top. The procedure:

```bash
pnpm build && pnpm preview:build        # the STATIC preview — not `pnpm dev` / `pnpm preview`
pnpm check:frame-axe                    # full sweep; must end with 0 baselined entries, 0 nodes
pnpm check:frame-axe /isolate/<frame>   # one route, while fixing
```

Run it before a PR that touches markup, ARIA, focus behaviour or colour, and commit what it writes —
`audit-evidence/frame-axe/results.json` and, only when a full sweep genuinely changed it,
`frame-axe-baseline.json`.

**The static preview, not the dev server.** Against the vite dev server the sweep produces 1–3
spurious `route-did-not-render` / `axe-did-not-run` rows on different routes each run — 30s
`page.goto` timeouts while three viewport contexts hammer an on-demand-transforming server. Each is
clean alone. The static build does not do this.

**`--shard=i/n` and `--scope=` are for splitting a LOCAL run**, e.g. across two terminals. Two guards
hold for both: `--update` refuses under either (a partial run would rewrite the ledger from a fraction
of the frames and delete the rest), and the "no longer fires" report is suppressed on a partial run
(every other partition's rows would read as fixed). Regenerate the baseline from a full sweep only.

### What leaving CI costs, stated rather than discovered

A regression is now caught when someone runs this, not on merge. Nothing in the pipeline will turn
red on a new `aria-*` defect, a nameless button or a sub-24px target. That is the trade the rule
makes, and the only thing that closes it is the local run above actually happening before a PR.

## Related

- [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md) — which frames must exist at all.
- [DEVELOPMENT.md](./DEVELOPMENT.md) §5 — the `/isolate/<id>` · `/frame/<id>` addressing.
