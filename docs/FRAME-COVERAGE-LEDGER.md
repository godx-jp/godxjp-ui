# Frame-coverage ledger (issue #163)

`preview/frame-coverage.ledger.json` is the machine-readable preview **contract**: it links every
public export and compound subcomponent to a frame, and declares — per contract dimension — whether
an executed case proves it, whether nothing proves it, or whether it cannot exist here.

> **UNTESTED IS NOT A PASS.** The absence of a demonstrated state must never be read as support.
> A frame rendering successfully proves the hand-picked example, nothing more.

- Schema: [`frame-coverage.ledger.schema.json`](../frame-coverage.ledger.schema.json)
- Standard: [`FRAME-COVERAGE-STANDARD.md`](./FRAME-COVERAGE-STANDARD.md)
- Generator: `pnpm gen:frame-coverage-ledger` → `scripts/gen-frame-coverage-ledger.mjs`
- Gate: `pnpm check:frame-coverage-ledger` → `scripts/check-frame-coverage-ledger.mjs`
- Shared registry: `scripts/frame-coverage-contract.mjs`
- Consumed by the MCP: `get_frame_coverage`, and appended to every `get_component` response

The architecture deliberately mirrors the issue #171 screen-reader evidence gate
([SCREEN-READER-EVIDENCE.md](./SCREEN-READER-EVIDENCE.md)): JSON-Schema + locked policy registry +
promotion gate + a baseline that can be extended but never weakened.

## The three verdicts

| Verdict          | Meaning                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| `covered`        | An **executed** case proves this dimension. Never inferred, never hand-written. |
| `untested`       | No executed case. **This is not a pass** — report it to users as UNTESTED.      |
| `not-applicable` | The dimension cannot exist for this export, **with a written reason**.          |

Cells are stored compactly and the reason is single-sourced in `policy.dimensions`:

```
untested
not-applicable:api-manifest      # the generated TypeScript surface has no such prop
not-applicable:reviewed          # a human waiver in policy.notApplicable, with a written reason
covered:prop-evidence:variant    # every literal branch of `variant` has resolvable evidence
covered:declared-case:<caseId>   # a reviewed entry in `cases`
```

## The 14 contract dimensions

Issue #163 item 2, each mapped onto one of the nine FRAME-COVERAGE-STANDARD axes.

| Dimension        | Axis          | Applicable when                                   | Promoted by   |
| ---------------- | ------------- | ------------------------------------------------- | ------------- |
| `variants`       | visual        | the API exposes `variant`                         | prop evidence |
| `tones`          | visual        | the API exposes `tone`                            | prop evidence |
| `sizes`          | visual        | the API exposes `size`                            | prop evidence |
| `shapes`         | visual        | the API exposes `shape`                           | prop evidence |
| `density`        | visual        | the API exposes `density`                         | prop evidence |
| `ownership`      | ownership     | a controlled/uncontrolled pair or `setApi` exists | declared case |
| `states`         | state         | a disabled/readOnly/loading/error/… prop exists   | declared case |
| `async`          | async         | always                                            | declared case |
| `responsive`     | responsive    | always                                            | declared case |
| `rtl`            | international | always                                            | declared case |
| `contentStress`  | contentStress | always                                            | declared case |
| `keyboard`       | accessibility | always                                            | declared case |
| `accessibleName` | accessibility | always                                            | declared case |
| `reducedMotion`  | preferences   | always                                            | declared case |

**Applicability is derived from the real TypeScript surface** (`component-api-manifest.json`), not
declared by hand — so `not-applicable:api-manifest` carries a machine-verified reason and is
re-derived on every CI run. A component that GAINS a `variant` prop automatically flips that
dimension from N/A to UNTESTED; it cannot rot into a false N/A.

`async` is deliberately universal and never auto-N/A: per
[FRAME-COVERAGE.md](./FRAME-COVERAGE.md) a blanket primitive-default not-applicable hides
async-capable controls and is forbidden.

## The two promotion routes

**Prop evidence (automatic).** Only for the five strictly prop-shaped dimensions, where "every
branch has a rendered case" _is_ the contract. `component-case-evidence.json` must enumerate every
literal branch of the union and reference at least one evidence file that resolves on disk — it is
already fail-closed via `pnpm audit:component-cases`. This proves the visual branch matrix **only**;
it never proves responsive, RTL, keyboard, async or assistive-technology behaviour.

**Declared case (reviewed).** Everything behavioural. Add an entry to the ledger's `cases` array:

```jsonc
{
  "id": "button-responsive-matrix",
  "export": "Button",
  "dimensions": ["responsive"],
  "frame": "docs/general/button/index.tsx",
  "case": "Responsive — label truncation across the width matrix",
  "evidence": ["src/components/general/__tests__/button.responsive.test.tsx"],
  "viewports": [320, 375, 390, 768, 1024, 1280, 1440, 1920],
  "verifiedBy": "your-name",
  "verifiedIn": "https://github.com/godx-jp/godxjp-ui/pull/…",
  "verifiedAt": "2026-07-30T00:00:00Z",
}
```

Then run `pnpm gen:frame-coverage-ledger`. Every field must resolve: the frame file must exist,
every evidence path must exist inside the repository, `verifiedIn` must be HTTPS and `verifiedAt`
must be an ISO-8601 UTC timestamp. A `responsive` case must list **every** required width, and for
an export flagged `embeddable` it must also list every container width.

You cannot hand-write a verdict. The gate recomputes every cell from the evidence and fails on any
mismatch:

```
Button.responsive: ledger says "covered:declared-case:invented" but the evidence
recomputes to "untested" — a verdict cannot be hand-written
```

## Viewport baseline

Required matrix (issue #163 §5), locked in `scripts/frame-coverage-contract.mjs` — the gate refuses
a ledger that drops any of them:

```
320  375  390  768  1024  1280  1440  1920
```

Container widths for embeddable exports: `240 320 480 640 960`.

The executed geometry sweep (`pnpm check:frame-geometry`, `scripts/frame-geometry.mjs`) is recorded
in `policy.sweeps.geometry` from its shrink-only baseline: **36 frame×width failures across 12
frames**, concentrated at 320 (12), 375 (11), 390 (10) and 768 (3) — matching the ~30 the issue
reported. That sweep was **not re-executed** when this ledger was authored (it needs Chromium plus a
built preview), so it is recorded with its `recordedAt` date and treated as evidence of _known
overflow_, never as evidence of responsive coverage. `responsive` stays UNTESTED everywhere.

## The ratchet

The pre-existing `untested` backlog is enormous — that _is_ the honest state of #163 — so it is
**recorded as a baseline** rather than failing the build on day one. What fails is regression:

| Rule                                            | Direction                                         |
| ----------------------------------------------- | ------------------------------------------------- |
| per-export `covered`                            | may only **rise**                                 |
| per-export reasoned `not-applicable`            | may only **fall**                                 |
| total `covered`                                 | may only **rise**                                 |
| `baseline.knownMissingFrames`                   | may only **shrink**                               |
| geometry overflow / clipped-control failures    | may only **shrink**                               |
| frames carrying axe violations                  | may only **shrink**                               |
| `policy.viewports.required` / `containerWidths` | may not be trimmed                                |
| `policy.dimensions[].promotion`                 | may not be weakened                               |
| `policy.knownGaps`                              | may be resolved, never deleted or waived          |
| `policy.runtimeGates`                           | may not be deleted or unwired from `package.json` |

Per-export `untested` is **informational**, not gated: it legitimately rises when the _contract_
tightens (a new public prop makes a previously-N/A dimension applicable), and gating on it would
punish exactly the behaviour we want.

`pnpm gen:frame-coverage-ledger --reset-baseline` re-mints the floor from current reality — the
same deliberate escape hatch as `frame-geometry.mjs --update-baseline`. Use it when introducing the
ledger, or after a reviewed public-API change legitimately turns a dimension into a reasoned N/A.
Never use it to silence a coverage regression; that is what the gate exists to catch.

## Known gaps

The issue's "Initial known gaps to encode" are locked in code
(`KNOWN_GAPS` in `scripts/frame-coverage-contract.mjs`) and mirrored into `policy.knownGaps`:
Button, Card, Card subcomponents, EmptyState, Progress, Carousel, DataTable, Charts and the
Timeline/TreeList/PasswordStrength locale stress. They cannot be deleted, and they cannot be
waived through `policy.notApplicable` — they must be **covered** or stay **UNTESTED**.

## Current state — read this before quoting coverage

Snapshot at the time this ledger was introduced (run `pnpm check:frame-coverage-ledger` for the
live figures — they move as the public surface moves):

- **273** public exports / compound subcomponents, **272** of which reach a frame
  (`layout/legal-document-shell` is mid-flight and recorded in `baseline.knownMissingFrames`)
- **3822** dimension cells: **6 covered · 2141 UNTESTED · 1675 reasoned not-applicable**
- the 6 covered cells are branch matrices promoted from `component-case-evidence.json`:
  `Button.variants/sizes/shapes`, `Form.density`, `QrCode.sizes`, `Tabs.variants` — nothing else
  in the entire library is proven by an executed case
- **0** exports are fully classified across all 14 dimensions
- **0** declared cases; **9/9** known gaps still open
- `responsive`, `rtl`, `keyboard`, `accessibleName`, `reducedMotion`, `async` and `contentStress`
  are **UNTESTED for every single export** — 0/273 each

Coverage is therefore **0.2%**. The contract, the gate, the ratchet and the MCP exposure are done;
authoring the ~3800 frame cases is the epic that remains.
