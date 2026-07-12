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

## Chrome vs component: two independently-tracked scopes

`check:frame-axe` runs axe **twice** per frame/viewport:

- **Preview chrome** = the zoom / dimension **toolbar** (`.demo-block-toolbar`). We own this.
  It **must be 0** — a chrome violation fails the build. The dominant violation in the original
  audit (199/200 _serious_ runs) was the `100%` zoom preset at **3.93:1** contrast; it is fixed
  (`#0b57d0` on `#e8f0fe` ≈ 5.5:1) so chrome is AA-clean.
- **Component / demo** = _everything except the toolbar_ — the rendered example **and its Radix
  portals** (Dialog / Popover / Sheet / Toast mount on `document.body`, outside the frame box, so
  scoping by "exclude the toolbar" keeps portaled demo violations attributed to the component,
  never to chrome). Owned by the per-component agents. Tracked against a machine-readable baseline.

This separation means component fixes are tracked independently and never mask a chrome regression.

## The component allowlist — and how it shrinks to zero

`scripts/frame-axe.baseline.json` is the allowlist of **pre-existing** component violations, keyed
`frame → [axe-rule-id]` — the **set of violation types** still firing on each frame (union across
desktop + mobile). We key on rule _presence_, not exact node counts, because axe counts jitter
run-to-run as a Radix portal (Dialog/Popover/Sheet) opens or closes — an exact-count gate would be
flaky. `--update-baseline` unions **two passes** (`AXE_RUNS`) so an intermittently-mounted overlay is
captured. The gate:

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

When every component frame is clean, `frame-axe.baseline.json` becomes `{ "component": {} }` and the
gate is fully green with **zero** allowlisted violations — the exit criterion for #157. There is **no
blanket suppression**: a documented axe false positive would be an explicit per-rule entry, not a mute.

`scripts/frame-geometry.baseline.json` works identically for responsive overflow.

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

## Coverage tracker

`check:frame-coverage` reads the public inventory (`mcp/src/data/components.ts`), the frames that
exist (`docs/` tsx), and the declared ledger (`preview/frame-coverage.ledger.json`), then emits
`docs/FRAME-COVERAGE-REPORT.md` + `audit-evidence/frame-coverage/coverage.json`. Every contract axis
is `covered` / `N/A:<reason>` / **`UNTESTED`** — a missing axis is never a silent pass. Component
agents declare covered axes in the ledger as they author cases; dimension totals climb toward full
coverage (the #163 exit criterion). See [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md).
