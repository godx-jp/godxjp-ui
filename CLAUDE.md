# @godxjp/ui — agent instructions

## Platform ↔ godx-ui development and acceptance (confirmed 2026-09-07)

- `@godxjp/ui` is the shared UI framework. Platform is its first consumer and the real application used to develop, debug, and validate the framework. Keep business workflows, data, and permissions in Platform; fix reusable presentation and interaction behavior in godx-ui.
- Configure consumer presentation through documented public component APIs and design tokens only. Do not hide framework gaps behind page-specific CSS, private imports, or copied components. Create a linked issue in `godx-jp/godxjp-ui`, fix the authoritative package, and verify the result through Platform.
- Use the latest compatible package baseline and a local package reference during development; publishing and reinstalling a registry release is not required for each iteration. From Platform, run `node scripts/use-local-ui.mjs ../godxjp-ui`. This links built `dist/` while preserving the consumer's React resolution. Never import library `src/` directly.
- Rebuild godx-ui with `pnpm build` in its checkout after source changes (or use its watcher), then run `pnpm build` in Platform. Verify that Platform consumes the rebuilt local output. Keep committed dependency/patch configuration reproducible for other checkouts; do not commit machine-specific absolute links.
- Acceptance is based on passing the required local checks, relevant framework tests, and real Platform browser/E2E verification, including responsive screenshots for UI changes. A build alone is not workflow acceptance. Record exact commands, results, commits, and evidence in the owning issues; preserve existing redesign reviewer and regression-test requirements.
- Once local acceptance passes and the fix is integrated, close the resolved issues. Do not keep an otherwise completed issue open solely because GitHub Actions is queued or running. Do not wait for CI, a registry publication, or a release build to continue development or to close a locally verified issue.
- **How an issue is closed, not just when (gh#620).** The rule above says WHEN to close; this says HOW, and it was learned the expensive way — gh#503/#506/#507 were each closed and reopened four times, until the reporter opened an issue about the closing itself: _"when `closed` stops meaning `fixed`, we lose the ability to read the issue tracker at all, so we have to re-measure everything every release."_
  - **Closing as FIXED requires a number.** Paste the new measurement, or the release that carries the fix, in the closing comment — one line, e.g. `fixed in 23.4.9: unchecked dot 4/4 → 0/6`. A reporter who measured the defect must be able to see it move without re-running their suite.
  - **If the reporter's number will NOT change, it is a REFUSAL, not a fix.** Label it `wontfix`, close it `not planned`, and say so in one sentence with the reason. A clear refusal is more useful than a quiet close, and dressing a refusal up as a fix is what cost the four reopenings.
  - **A fix merged to `main` is not a fix the reporter has.** If the artefact they run comes from the registry — the package, `scripts/ui-audit.mjs` — say plainly that it is unreleased, or release it. If what changed is CI-only and never reaches them, say that instead of implying a release.
  - **A process complaint about your own closing behaviour is closed like anything else — on DELIVERY, not on a promise.** The first draft of this rule said "leave the close to the reporter", and applying it showed that to be wrong: an issue that is fully resolved and released but left open forever misreports the tracker exactly as badly as a close that wasn't a fix, which is the thing gh#620 was about. The standard lifecycle is _resolve → deliver → communicate → close → reopen on recurrence_ (ISO/IEC 20000-1 service management; the same shape as ITIL incident closure and GitHub's own `closed as completed`, where reopening costs nothing and stays the reporter's right). So: do not close it while it is unaddressed, and never on an intention — close it once the change is **shipped in a release the reporter can install**, with the release number and the evidence in the closing comment, and say plainly that reopening is welcome if the behaviour returns.
- The user has authorized push and merge for this Platform/godx-ui work. Do not ask again for that same authorization. Let normal GitHub Actions run asynchronously and check them occasionally at meaningful checkpoints while working; do not continuously poll or block on them. Respect branch protection; if it prevents merging, report the pending merge and continue independent work rather than bypassing it.
- Never force-push shared branches or suppress their CI with `[skip ci]`. Local acceptance does not mean CI is green. If a later check reveals a failure caused by this work, fix it forward with priority and reopen/link an issue as needed. Package publication and deployment are separate actions, not prerequisites for this local development loop.
- This decision supersedes older instructions requiring renewed push/merge approval or waiting for CI for this authorized work. A newer explicit user restriction takes precedence.

## ⛔ axe is LOCAL ONLY — never in CI/CD (owner's standing rule, 2026-09-17)

- **`pnpm check:frame-axe` must not run in any GitHub Actions workflow** — not on merge, not nightly, not behind a label, not sharded. It is a measurement you run on your own machine, against the STATIC preview (`pnpm build && pnpm preview:build`, then `pnpm check:frame-axe`).
- Do not add an axe job, an `@axe-core/playwright` step, or a workflow that invokes `check:frame-axe`, even to fix a regression or to "restore coverage". `check:gate-coverage` lists the gate as EXEMPT for exactly this reason; its absence from `.github/workflows/` is a declaration, not a dead gate.
- The cost is accepted, not overlooked: a new a11y defect is caught when someone runs the gate locally, not at merge. So run it before any PR that touches markup, ARIA, focus behaviour or colour, and commit `audit-evidence/frame-axe/`. Procedure and rationale: `docs/FRAME-A11Y-CI.md`.

## Two skill families — pick the right one first

Skills are split by audience (see **`.claude/skills/README.md`** for the full map):

- **CORE** (this repo's `src/`/`docs/`/`mcp/`) → the `godxjp-ui-*` skills in `.claude/skills/`. Start with **`godxjp-ui-component`** (below), then its follow-map: interaction-feel → behavioral-test → example-page → best-ux → **`godxjp-ui-mcp-catalog-sync`** (keep the MCP catalog + tests in sync on any public-API change). - **CONSUMER** (an app importing `@godxjp/ui`) → served by the `godxjp-ui` MCP, never these files: `list_consumer_skills` / `route_consumer_task` / `get_consumer_skill` (`design-to-page`, `compose-a-screen`, taste family) + `draft_bug_report` for filing library bugs.

## MANDATORY: read the component skill before touching UI

Before creating OR changing **any** component, recipe, doc, or example, you MUST activate and follow the **`godxjp-ui-component`** skill (`.claude/skills/godxjp-ui-component/SKILL.md`). It is a hard contract — do not skip a gate. In short:

1. **MCP-first** — consult the `godxjp-ui` MCP (`get_component`, `search_components`, `get_rule`, `list_anti_ai_tells`, `get_vocab`, `get_tokens`) before writing; never guess a prop. Check that the thing doesn't already exist (no duplication — `Select` covers searchable/async select). 2. **Real primitives only** — no invented/hand-rolled/faked components, no raw HTML controls, compose primitives fully (`CardContent` for padding; `Card` + `CardContent flush` + `DataTable`). 3. **International standards on every component** — i18n via `t()` + `Intl`/CLDR (ISO 3166/4217/8601, IANA, BCP-47, `Intl.DisplayNames`/`PluralRules`); WAI-ARIA APG + WCAG 2.2 AA (measured by `pnpm check:frame-axe` on the component's own `/isolate/**` frame — `vitest-axe` was removed in #492 and no longer exists here; see docs/FRAME-A11Y-CI.md); RTL logical CSS; controlled-vocabulary API (`value`/`defaultValue`/ `onValueChange`, `size` ∈ xs|sm|md|lg, forward `ref`, register the prop type). 4. **Semantic tokens only** (`pnpm run audit` = 0/0); add an MCP catalog entry + a real-screen docs page. 5. **Verify what you touched — NEVER the full suite.** A component's tests live beside it in `src/components/<group>/__tests__/`, so run exactly those: `pnpm vitest run src/components/<group>/__tests__ --maxWorkers=2`. **`pnpm test` (and a bare `pnpm vitest run`) is FORBIDDEN outside CI** — it is 506 files / 3700+ tests, and with several agents on one machine it puts 70 workers on the box and takes load past 90. The full suite is CI's job on the PR (`tal --help`: "FULL SUITE KHÔNG THUỘC VỀ VÒNG LẶP"). **Gates are matched to the DIFF, never run as a fixed chain** — this line used to list nine `&&`-joined commands as "run freely", so a one-line CSS change got the same nine as a new component. Run only the gates that can have an opinion about the files you changed; the table is in the skill's §5 and `docs/DEVELOPMENT.md` §5.1. (`typecheck` covers `src/` and says nothing about `docs/`; `check:mcp-sync`/`check:mcp-orphans` compare the catalog to the export list and cannot move on a CSS edit.) This is Test Impact Analysis, the industry norm — running everything on every change is what TIA and Meta's Predictive Test Selection exist to stop. **`pnpm verify:ci:static`, `pnpm ship:surface`, the full `check:frame-overflow`, `check:contrast` and `pnpm test` are THE BATCH RUN** — never per issue, never "to be safe", never on your own initiative. See "The batch run" below.

## MANDATORY for a BATCH of work: read `agent-dev-loop` first

Handed more than one issue? Activate **`agent-dev-loop`** (`.claude/skills/agent-dev-loop/SKILL.md`)
before writing anything. It owns the four-phase loop and the bans.

**It is PORTABLE** — no command, gate name or measurement of this repo is in it, so it copies to
any repository in any language. This repo's numbers live in `references/this-repo.md`; a new repo
generates its own with the ten-step protocol in `references/adopting.md`; the incidents that
justify the rules are in `references/case-studies.md`.

| phase                                                                                   | model          | may run                       | banned                                                               |
| --------------------------------------------------------------------------------------- | -------------- | ----------------------------- | -------------------------------------------------------------------- |
| **1 · classify** — read every issue, group by blast radius A–E, build the tracking list | any            | nothing                       | everything                                                           |
| **2 · implement** many at once, write the tests + every edge case                       | sonnet is fine | only the tests you just wrote | full suite · `verify:ci:static` · `ship:surface` · any browser sweep |
| **3 · review** the diff and the requirement flow, audit the TESTS not just the code     | opus / fable   | only tests the change reaches | same                                                                 |
| **4 · batch run** — once, for the whole batch                                           | any            | everything                    | running it **unasked**                                               |

**A merged agent worktree must be REMOVED, in the same step as the merge.** `isolation: "worktree"`
is a tool PARAMETER, never a request in the brief — and the copy is rented, not given. Kill the
worktree's preview server first (gh#875 puts it on `6100 + sha256(top) % 900`, so it is not on 6008
and it outlives the worktree), prove the tree is clean AND its HEAD is already an ancestor of
`main`, then `git worktree remove --force` + `git worktree prune`. Leave `locked` ones alone.
Measured 2026-09-24 when nobody did this: **64 worktrees, 30 GB, 46 `node_modules` trees and 4
orphaned servers, the oldest up over a day** — 0 of the 61 agent copies held work that was not
already on `main`. Commands and the full measurement: `agent-dev-loop/references/this-repo.md`.

**Phase 4 runs only when the owner asks for it.** No counter, no threshold, no automatic case —
silence is not a yes. A batch that feels too big to review means stop taking work into it, not
reach for the suite.

## The batch run — the ONLY time "run everything" is allowed, and the owner triggers it

The owner, after asking for one padding fix and watching six minutes of gates:

> _"việc code là mày cứ code mà thôi!! ko phải lúc đéo nào cũng run test full thế này! code xong chỉ
> review diff thôi chứ?! rồi khi hoàn thiện nhiều issue xong rồi mới được phép hỏi user run test cho
> toàn bộ issue 1 lần duy nhất chứ đéo phải mỗi lần đều run fulltest! tốn token mà đéo cần thiết tốn
> thời gian!"_

**Per issue: code, run the T1 rows the diff maps to, review the diff, move on.** That is it.

**After SEVERAL issues are finished** — a batch, aim for a few issues over a few days (DORA
small-batch guidance; a batch you cannot check is itself a defect) — post ONE message: the issues,
the rows you ran per issue with their times, and the question:

> _Chạy batch run một lần cho cả N issue này không? (`ship:surface` ~70s [+ `check:frame-overflow`
> 52s vì có layout] [+ `pnpm test` ~375s])_

- **Yes** → run it ONCE for the whole batch. `pnpm ship:surface` already contains `regen` +
  `verify:ci:static` + `check:frame-contracts` — do not also run those separately. Add the full
  frame sweep only if the batch moved layout, and `pnpm test` only if he says _"full"_. Record the
  results in the issues, open the PR.
- **No** → open the PR anyway. `pr-lane` is the merge gate and `ci.yml` on `main` is the verdict; a
  red `main` is fixed forward with priority. **Never report a skipped batch run as passed.**
- **axe / VoiceOver are NOT in the bundle.** A yes to the batch run is not a yes to axe — he must
  name it. (Codex forced this distinction: _"'owner said yes' is not the same as 'owner
  specifically requested axe'; your own instruction says 'never an agent'."_)

A T1 failure is never waived by the batch run being optional.

### `ship:surface` is a BATCH command, not a per-change one

It expands to `pnpm regen && pnpm verify:ci:static && pnpm check:frame-contracts` ≈ **70s**. Any
doc or memory that says to run it "at the first public export" is wrong and is the single biggest
hidden cost in this repo's loop. For a public prop, run: `pnpm regen` (4s) · `check:prop-vocabulary`
· `check:mcp-sync` · `check:mcp-orphans` · `check:component-api-manifest` · `check:registry`.

### The test unit is the COMPONENT, not the group

`src/components/data-entry/__tests__` is **231 files** (3–4 minutes). The unit is the component
prefix: `pnpm vitest run src/components/data-entry/__tests__/select --maxWorkers=2` — 19 files,
22.6s. `vitest related <file>` is useless here: measured **250s across 251 files**, because the
style tests `readFileSync` their CSS and the import graph cannot see it.

## Scope the checks to the DIFF — and never argue about a cost you have not timed

Measured on this repo (`docs/DEVELOPMENT.md` §5.0 carries the full table and the method):

    check:token-tiers  0.2s   build             1.5s   eslint <changed files>   1.0s
    typecheck:mcp      0.3s   preview:build     1.9s   lint (warm, --cache)     1.8s
    audit              0.5s   lint (cold)      16.1s   one component's tests  2-23s
    typecheck:docs     0.7s   regen             4.0s   packed-public-contract  22.2s
    typecheck          1.3s   frame-contracts   5.5s   check:contrast            91s
                              frame-overflow     52s   verify:ci:static          60s
                                                       ship:surface            ~70s
                                                       full vitest suite       ~375s

**The intuition is backwards.** "Typecheck the whole system" costs **1.3 seconds** — there is
nothing to save by scoping it. The one command that cost real time was the browser sweep, at
**~96% of the wall clock** of a local pass: 398 navigations down a single page, in series. Pooled
one page per core it is **52s, 6.5x faster**, with byte-identical output. Running it for a two-file change is not
thoroughness; it is why a small fix takes six minutes, and a gate that expensive gets skipped,
which is how the baseline it guards goes stale.

So: **match the checks to what you touched** (`docs/DEVELOPMENT.md` §5.1 has the table by file
type). A CSS-only diff does not need `typecheck`. A `docs/` diff does not need `typecheck` either
— it needs `typecheck:docs`. Only a PR or a release earns "run everything".

For layout work use the diff-scoped sweep: `pnpm check:frame-overflow --only <slug>` — 9 frames in
**17.5s** against the full **52s**. It refuses `--update-baseline` and labels its own output
`PARTIAL, not a release gate`, so a filtered green can never be passed off as the real one. Run the
full sweep once, before the PR.

**Time it before you claim it is slow:** `st=$(date +%s); pnpm <gate> >/dev/null 2>&1; echo $(( $(date +%s) - st ))s`.

See `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md` for the full rules and the i18n/a11y/vocab audit.

## Design-knob discipline (cardinal rules #44/#45)

If yes, it MUST be a documented component token — theme sets it once globally, props override per instance. ALL pass → it may be a framework component. ANY fails → it is a **composition pattern**: build it from existing primitives - token overrides (global / scoped `[data-tenant]` / per-region role scoping) in the app or a `docs/` showcase — never in `src/components/`.

### Add-a-token checklist (ALL steps, in order)

1. Declare it in the right tier file — `src/tokens/{foundation.css | semantic/* | components/*}` (new `components/<name>.css` files need an `@import` in `src/tokens/base.css`; names must pass `check-token-tiers` — `--{component}-{part}-{property}`). 2. See `docs/TOKENS.md` · "Role-mirror knobs MUST be `initial`". 3.

## Local-link development (file:-linked consumer apps)

Consumer apps may link this repo directly (`"@godxjp/ui": "file:.../godxjp-ui"`) to develop the framework against real screens. Consumers import **`dist/`**, never `src/` — so:

- **Keep `pnpm dev` running.** It is now the WHOLE of `pnpm build`, incrementally: tsup watch, the three post-steps on every rebuild (copy-styles · fix-esm-extensions · add-use-client, 256ms together), a parallel incremental `tsc --watch` for the `.d.ts`, and the CSS-tree re-copy. A `src/` edit without a dist rebuild ships a stale package; a missing export white-screens the consumer (`does not provide an export named …`).
  - **It used to run two of those five, and the three it skipped were the ones a consumer notices.** `tsup.config.ts` sets `dts: false`, so `tsc` is the only thing that emits declarations — without it a linked consumer type-checks against the last full build, meaning a NEW export does not exist to its compiler and a CHANGED signature is silently the old one, and both read as the consumer's bug. `fix-esm-extensions` adds the `.js` a `bundle: false` build omits ("unbreaks Node", its own words). `add-use-client` prevents `TypeError: createContext is not a function` in an RSC graph. A watcher that produces a `dist/` wrong in three ways is a watcher nobody trusts, which is how a consumer ends up paying a full `pnpm build` on every library edit — measured, ~2s instead of ~0.3s, on every keystroke-to-check cycle.
  - After a one-off edit without the watcher, run `pnpm build`; `node scripts/copy-styles.mjs` (79ms) covers a CSS-only change.
