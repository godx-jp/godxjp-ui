---
name: agent-dev-loop
description: MANDATORY for any multi-issue development run (a batch of issues/requests worked in one session, with or without sub-agents). Owns the four-phase loop — classify → implement → review the diff → batched verification — and the hard bans on running the full suite or heavy gates outside phase 4. Read BEFORE picking up a batch of work, and before deciding to run any check.
---

# The agent development loop — four phases, and what each one may run

> 🛠️ **AUDIENCE: any agent doing development work in this repo**, alone or as an orchestrator of
> sub-agents. It governs WHEN verification runs. `godxjp-ui-component` governs WHAT correct code
> is. Read this one first when you are handed more than one issue.

## Why this exists

The owner asked for **one padding fix** — a CSS one-liner. The agent ran nine chained gates, a
199-frame browser sweep and two builds: **~6 minutes for a two-file diff**. Repeated across a batch
of issues, that is most of a working session spent re-proving things the diff could not have
broken.

> *"việc code là mày cứ code mà thôi!! ko phải lúc đéo nào cũng run test full thế này! code xong chỉ
> review diff thôi chứ?! rồi khi hoàn thiện nhiều issue xong rồi mới được phép hỏi user run test cho
> toàn bộ issue 1 lần duy nhất chứ đéo phải mỗi lần đều run fulltest! tốn token mà đéo cần thiết tốn
> thời gian!"*

He is right, and it is the industry position, not a shortcut. **Test Impact Analysis** and Meta's
**Predictive Test Selection** ([arXiv 1810.05286](https://arxiv.org/pdf/1810.05286), now in Gradle
Develocity) both exist because running everything on every change is unaffordable. Google's test
sizes say it plainly: *"Engineers don't wait for slow tests."* DORA gives CI a **10-minute budget**
and prescribes splitting what exceeds it into a separate build.

---

## The four phases

| phase | what you do | model | **may run** | **BANNED** |
| --- | --- | --- | --- | --- |
| **1 · Classify** | read every issue, group them, build the tracking list | any | nothing | everything |
| **2 · Implement** | build many issues at once, write the tests | **sonnet is fine** | only the tests you just wrote | full suite · `verify:ci:static` · `ship:surface` · any browser sweep · `check:contrast` |
| **3 · Review** | read the diff and the requirement flow | **opus / fable** | only tests the change reaches | same bans as phase 2 |
| **4 · Verify the batch** | one pass for the whole batch | any | everything, once | running it **unasked** |

**The ban in phases 2 and 3 is absolute.** Not "prefer not to". A check you run there is a check
you will run again in phase 4, and the only thing it bought is the wall clock.

---

## Phase 1 — classify, and build the tracking list

Take the whole batch (20 issues is a normal size; more is fine). Before writing any code:

1. **Read every issue to the end.** A batch is where duplicates and contradictions hide — two
   issues fixing the same defect from opposite ends is a merge conflict you can see today and not
   discover on day three.
2. **Classify each by BLAST RADIUS**, because that is what decides its verification, not its size:

| class | what it touches | what it will need in phase 4 |
| --- | --- | --- |
| **A · leaf** | one component's own `.tsx`/`.css`, one docs page | that component's tests |
| **B · shared surface** | a token, `src/styles/*.css`, `src/lib/**`, a shared class | the tier tests + everything reading that token |
| **C · public contract** | a prop, an export, `package.json` `exports`, the MCP catalog | the catalog gates + `check:packed-public-contract` |
| **D · layout** | anything that moves a box | `check:frame-overflow` |
| **E · infrastructure** | a workflow, a `scripts/check-*.mjs`, a generator | `check:gate-coverage` + `src/test/__tests__` |

3. **Write the tracking list** and keep it current. One row per issue: `#id · class · files it will
   touch · the measurement that proves it fixed · status`. The "measurement" column is not
   decoration — per gh#620 an issue closes on a **number**, and deciding that number before you
   code is what stops a fix from being declared by eye.

---

## Phase 2 — implement many at once

**Cheaper models are correct here.** Implementation against a clear issue is not where the
judgement is; review is. Use sonnet for the writing and spend the strong model on phase 3.

### What you may run: the tests you just wrote. Nothing else.

```bash
pnpm vitest run <the file you just wrote> --maxWorkers=2
```

### And you must write every relevant edge case

A test that only proves the happy path is why a defect ships with a green tick. For what you
touched, write:

- the **reproducer that fails before your fix and passes after** — run it against the pre-fix code
  and paste both outcomes; a test that passes on the broken code is not a test
- **both sides of every boundary** you introduced (empty / one / many, first / last, min / max)
- the **negative case**: the arrangement that must NOT match. A selector fix without a "and this
  shape still doesn't match" case is half a fix
- **the locale and direction** the change can reach (CJK width, RTL) when it is layout or text
- what the change is **deliberately not** doing, when a reader would assume otherwise

### The bans, concretely

Never in phase 2: `pnpm test` · a bare `pnpm vitest run` · `pnpm verify:ci:static` ·
`pnpm ship:surface` · `pnpm check:frame-overflow` (full) · `check:contrast` · `check:frame-axe` ·
`pnpm build` "to be safe".

> **`ship:surface` is an alias for `regen && verify:ci:static && check:frame-contracts` ≈ 70s.**
> Expand an alias before you run it. Nobody here had, for months.

### Sub-agents

Give each its own worktree (`isolation: "worktree"`) — they otherwise share this checkout and a
release `git add -A` has swallowed an agent's WIP onto main. Put the phase-2 ban list in every
brief, verbatim; an agent that was not told will run the suite.

---

## Phase 3 — review the diff, not the repo

This phase replaces running things. It only works if it is done properly, so here is what it means.

**Use a strong model.** This is the judgement step.

### Step 1 — the file list must be fully explained

```bash
git diff --name-only <batch-base>...HEAD
git status --porcelain     # staged and untracked files that the line above MISSES
```

Every file traces to an issue in the tracking list. An unexplained file is a finding: a stray
regen, a swallowed WIP, a formatter that reflowed a file nobody touched.

### Step 2 — read `git diff -U5` in full

Per hunk, ask:
- does every changed line trace to the request? (an "improvement" to adjacent code is scope creep)
- imports your change orphaned — removed? imports it needs — added?
- a user-facing string or `aria-label` not through `t()`; a number not through `Intl`
- physical direction CSS (`ml-`/`pl-`/`left-`) instead of logical
- a literal height/width instead of a `--control-height` tier token
- a new prop → registered in `src/props/registry.ts`, in the MCP catalog, on a docs page
- generated files changed by anything other than `pnpm regen`
- a `:root` custom property whose value is a bare `var(--role)` — that is the freeze rule, and it
  has shipped **six times**

### Step 3 — audit the TESTS, not just the code

This is the step that is usually skipped, and it is the reason a batch can be green and wrong.

- **Is the test non-vacuous?** Does it actually reach the element and the state it names? One file
  here records six assertions that all passed against an empty string.
- **Would it fail on the old code?** If the agent did not prove that, the burden is on you: revert
  the source hunk, run the test, confirm red, restore. This is the single highest-value action in
  phase 3 and it costs seconds.
- **Is it pinned to the right thing?** A test asserting an exact CSS string breaks when prettier
  wraps the line — a formatter deciding whether a test passes is not a test. Assert the
  relationship, not the spelling.
- **Does the baseline only shrink?** A gate whose baseline can be raised to make a failure go away
  is not a gate.

### Step 4 — name what the diff CANNOT prove, and probe exactly that

jsdom cannot see: paint, contrast, hit-target size, overflow, cascade resolution, focus ring
geometry. For each such class present in the batch, run **one targeted probe**, not a sweep:

| class | the one probe |
| --- | --- |
| horizontal overflow | `pnpm check:frame-overflow --only <slug>` (~18s) |
| a frozen scoped token | `pnpm check:frame-token-scope --freeze-only` (3.4s) |
| focus / keyboard / accessible name | a `user-event` test |
| contrast · hit target · vertical clip | **jsdom cannot** — say so in the issue and leave it to phase 4 |

Leaving one explicitly to phase 4 is a valid outcome. Claiming it was verified is not.

### Step 5 — write the review down

In each issue: the diff stat, what you ran with its time, which "cannot prove" class you probed and
how, and which you deferred. A review nobody can read is a review nobody can check.

---

## Phase 4 — the batch run

### The trigger

**Automatic only when unreviewed commits exceed 100.** Otherwise you ASK, and you do not run it
until he says yes.

```bash
git rev-list --count $(git describe --tags --match 'verified/*' --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD
```

Move the watermark after a successful batch run, so the counter means something:

```bash
git tag -f verified/$(date +%Y%m%d-%H%M) && git push -f origin --tags
```

> **The counter is a proxy for risk, not a measure of it** — 100 docs commits are not 10 token
> commits. It is deliberately crude because a negotiable threshold is not a threshold. If the batch
> is class B/C/E heavy, ask earlier; never use the count to justify waiting longer.

### The ask

One message, with the cost, so the answer is informed:

> *Xong N issue: #… Đã chạy per-issue: [rows + times]. Chạy batch run một lần cho cả N cái không?
> (`ship:surface` ~70s [+ `check:frame-overflow` 52s vì có layout] [+ `pnpm test` ~375s])*

- **Yes** → run once for the whole batch. `pnpm ship:surface` already contains `regen` +
  `verify:ci:static` + `check:frame-contracts`; do not run those again. Add the full frame sweep
  only if the batch moved layout, and `pnpm test` only if he says *"full"*. Record every result.
- **No** → open the PR. `pr-lane` gates the merge, `ci.yml` on `main` is the verdict, a red `main`
  is fixed forward with priority. **Never report a skipped batch run as passed.**
- **axe and VoiceOver are not in the bundle.** He must name them. A yes to the batch is not a yes
  to axe.

---

## The per-issue gate map (phase 2/3 only)

Compute the diff, then run only the rows it hits. Typical two-file fix: **under 10 seconds.**

| changed path | run |
| --- | --- |
| any `.ts/.tsx` under `src/` | `pnpm typecheck` 1.3s · `pnpm run audit` 0.5s · `pnpm exec eslint <files>` 1.0s |
| `src/components/<group>/<name>.tsx` | + `pnpm vitest run src/components/<group>/__tests__/<name>` — **the component, not the group** |
| `src/styles/*.css` | `pnpm run audit` · `pnpm vitest run src/styles/__tests__/<name>` |
| `src/tokens/**` | `check:token-tiers` · `pnpm vitest run src/tokens/__tests__` · `pnpm regen` **twice** (gh#847) |
| a public prop / export | `pnpm regen` · `check:prop-vocabulary` · `check:mcp-sync` · `check:mcp-orphans` · `check:component-api-manifest` · `check:registry` — **not `ship:surface`** |
| `package.json` exports, a barrel, tsup entries | + `pnpm build && pnpm check:packed-public-contract` (22.2s) |
| `mcp/**` | `pnpm typecheck:mcp` 0.3s · `cd mcp && pnpm vitest run` 2.8s |
| `docs/**` | `pnpm typecheck:docs` 0.7s — **not `typecheck`**, which covers `src/` and says nothing about `docs/` |
| `.github/workflows/**`, `scripts/check-*.mjs` | `check:gate-coverage` · `pnpm vitest run src/test/__tests__` |
| anything that moves layout | `pnpm check:frame-overflow --only <slug>` ~18s |

### Measured costs — argue with numbers, never with feelings

```
check:token-tiers 0.2s   typecheck        1.3s   eslint <changed files>  1.0s
typecheck:mcp     0.3s   build            1.5s   lint (warm, --cache)    1.8s
audit             0.5s   preview:build    1.9s   one component's tests  2-23s
typecheck:docs    0.7s   regen            4.0s   packed-public-contract 22.2s
                         frame-contracts  5.5s   verify:ci:static         60s
                         frame-overflow    52s   ship:surface            ~70s
                         check:contrast    91s   full vitest suite      ~375s
```

Note what these kill: **"typecheck the whole repo" is 1.3s and was never the problem.** The
expensive things are aliases and browser sweeps. Before you call any gate slow, time it:

```bash
st=$(date +%s); pnpm <gate> >/dev/null 2>&1; echo $(( $(date +%s) - st ))s
```

Two traps worth naming: `src/components/data-entry/__tests__` is **231 files** (3–4 min) — the unit
is the component prefix (19 files, 22.6s). And `vitest related <file>` is **useless here**: 250s
across 251 files, because the style tests `readFileSync` their CSS so the import graph cannot see
them.

---

## Self-check before you hand the batch over

- [ ] Tracking list exists, every issue classified A–E, every row has its proving measurement
- [ ] Phase 2 ran **only** the tests it wrote; no suite, no sweep, no `ship:surface`
- [ ] Every fix has a reproducer proven to fail on the old code
- [ ] Every file in `git status --porcelain` traces to an issue
- [ ] Tests audited for non-vacuity, not just for green
- [ ] Each "jsdom cannot see this" class either probed once or explicitly deferred **in writing**
- [ ] Unreviewed-commit count checked; if under 100, the owner was **asked** and answered
- [ ] Nothing skipped is reported as passed
