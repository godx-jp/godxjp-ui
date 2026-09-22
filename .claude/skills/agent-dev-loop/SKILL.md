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
| **2 · Implement** | build many issues at once, write the tests | a cheaper model is fine | the tests you wrote **+ the three-term set below** | full suite · `verify:ci:static` · `ship:surface` · any browser sweep · `check:contrast` |
| **3 · Review** | read the diff and the requirement flow, audit the tests | judgement-heavy (see below) | the **same three-term set as phase 2** — never "the tests the change reaches", which is precisely what no selector can compute | same bans as phase 2 |
| **4 · Verify the batch** | one pass for the whole batch | any | everything, once | running it **unasked** |

> **The `model` column is ADVISORY, not a control.** Phase 3 carries more judgement than phase 2,
> which is why a stronger model is worth spending there — but a strong model is **not** what catches
> the defects. The `dxs-product` session *was* the strong model and still let a falsely-green
> `toHaveCount(1)` through; CI caught it, not the model. What catches things is the **procedure**:
> read the whole red run, and revert-the-hunk-and-confirm-red. Treat this column as prescriptive and
> a reader will believe that choosing opus means phase 3 was done. In a repo whose hardest reading is
> a migration or a money path, the column means nothing at all.

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

### What you may run

```bash
pnpm vitest run <the file you just wrote> --maxWorkers=2
```

…plus the **path→gate rows** the diff hits (table below), plus **every source-scanning gate,
unconditionally**. That third term is not optional and it is the one people drop.

> **SOURCE-SCANNING GATES ARE INVISIBLE TO EVERY IMPORT-GRAPH SELECTOR — and they fail GREEN.**
>
> The `dxs-product` session proved this with a measurement, and it is the same defect class we hit
> from the other side. On a file that *does* render `<Badge>`:
>
> ```
> $ vitest related --run .../inbox/page.tsx
> No test files found, exiting with code 0
> ```
>
> The gate that catches a dead `<Badge color=>` prop — the one that lost badge colour on production
> — scans SOURCE with `readFileSync` and imports nothing. So the selector cannot see it and **exits
> 0**. It does not fail silently; it emits a green signal, which is worse.
>
> Ours is the same shape: `src/styles/__tests__` reads its CSS with `readFileSync`, so `vitest
> related` here is both useless (250s / 251 files) and blind to exactly the tests that matter.
>
> **A selector that answers "no tests found → exit 0" is a trap.** When scope cannot be derived,
> fail closed and say so.

The minimum honest signal, then, is:

```
related(diff)  ∪  glob-mapping(diff)  ∪  ALL source-scanning gates, unconditionally
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

### The trigger — and what a full run IS and IS NOT

**A full suite run is RELEASE EVIDENCE, bound to the SHA being tagged. It is not a periodic ritual
and it is not debt collection.** The `dxs-product` session put it best: *"một lượt full suite ở
commit thứ 100 không cấp bằng chứng cho commit thứ 101."* A run at commit 100 proves nothing about
commit 101.

This repo already enforces the SHA-bound half **mechanically**, so it is not up for debate:
`release-core.mjs` REQUIRED_CI_CHECK_RUNS + `VerifyCommitProvenance` refuse to publish unless every
CI check has CONCLUDED green **on the exact tagged commit**. That, not a counter, is the evidence.

So the counter is a **backlog ceiling** — a batch-size guard in DORA's sense, there to stop
unmerged work piling up into a batch nobody can review.

### What is counted: commits NOT YET MERGED. Not commits since some marker.

```bash
git fetch origin --quiet
git rev-list --count --all --not origin/main
```

Everything reachable from any ref that is **not yet in `origin/main`**. Measured on this repo while
writing this: **50** — under the threshold, so ask-mode.

**Over 100 ⇒ the batch run is due automatically. At or under 100 ⇒ you ASK and wait.**

> #### ⚠ The counter's ACTION is contested — the threshold is not
>
> The `dxs-product` session's objection, which I could not answer and am recording rather than
> burying:
>
> ```
> problem : 100 commits NOT REVIEWED
> action  : run the full suite
> ```
>
> **Running tests reviews nothing.** A hundred unreviewed commits, after a green full suite, are
> still a hundred unreviewed commits — they merely *look* checked. Calling the threshold a "backlog
> ceiling" defends the **trigger** and says nothing about the **action**.
>
> Its proposal: keep the threshold, change the action to **"stop taking new issues into this batch
> and go review"** — which gates **phase 1** rather than firing phase 4, and stops the counter
> competing with the SHA-bound evidence.
>
> **The owner specified the current action, so it stands until he rules.** What is adopted now,
> because it is true either way:
>
> 1. **At >100, ALSO stop intake.** Whatever else happens, do not pull more issues into a batch
>    nobody has reviewed. This is additive and contradicts nothing.
> 2. **A run fired by this counter is NOT release evidence**, and must never be reported as such.

#### Why "we just ran the full suite" is never evidence — verified in BOTH repos

The peer's release `v0.11.59` had **two** backend CI runs on the tagged SHA: one with `pest =
success`, and a newer **cancelled** one. The gate refused:

```
::error::Product CI has not passed: CI · [backend] tests: completed/cancelled
```

It takes the **latest run per workflow**, not "was there ever a green one". I checked whether ours
differs — it does not. `scripts/release-core.mjs:316`:

```js
// Keep the newest attempt per check-run name, so a re-run that turned a job green is what counts.
```

So a newer cancelled run refuses here too. **Evidence is the concluded status of the required
check, on the exact SHA, in the latest attempt** — never the memory of having run something. A
counter that fires a full suite at an arbitrary SHA teaches the opposite, and the lesson arrives
when someone is trying to ship.

To see where the backlog sits, which is usually more useful than the total:

```bash
for b in $(git branch -r --no-merged origin/main | grep -v HEAD); do
  echo "$(git rev-list --count origin/main..$b) $b"
done | sort -rn
```

> #### Why not a `verified/*` watermark tag — the first draft of this section, and why it was wrong
>
> It counted from a `verified/*` tag, falling back to `git rev-list --max-parents=0 HEAD` when none
> existed. There was no such tag, so the fallback resolved to the **root commit**, the count came
> back **1888**, and the document therefore authorised running the full suite **without asking**,
> from the first read — the exact behaviour it exists to forbid. It was also circular: the tag was
> only created after a successful batch run, so escaping auto-mode required doing the auto thing
> first.
>
> The `dxs-product` session caught it by running the command. It is the same family as §universal
> #2 — **missing data made the system pick the loudest option instead of stopping to ask** — a rule
> stated two sections earlier in this very file and then broken.
>
> Counting unmerged commits removes the failure rather than patching it: there is no marker to
> create, nothing to keep in sync, and no fallback branch to get wrong. Merging is what reduces the
> number, which is also the behaviour you want rewarded.

**If `origin/main` cannot be resolved, ASK. Never fall back to anything.**

```bash
git rev-parse --verify origin/main >/dev/null 2>&1 || {
  echo "cannot resolve origin/main — ASK. Do not run."; exit 1; }
```

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


---

## Universal vs per-repo — reconciled with the `dxs-product` session

Confirmed in BOTH repos, so it belongs in any agent's rules:

1. **Source-scanning gates are invisible to import-graph selectors.** Select them by path glob, and
   run them unconditionally.
2. **A selector that reports "nothing to run → exit 0" is a false green.** Fail closed when scope
   cannot be derived.
3. **Expand and TIME an alias before running it.** Never trust a name. (`ship:surface` was 70s and
   nobody here had expanded it; their `docs-lane` was 56 commands in one step.)
4. **`git diff --name-only` is not the diff** — it misses staged and untracked files. Add
   `git status --porcelain`.
5. **The full suite is release evidence bound to a SHA**, not a ritual on a counter.
6. **A ban enforced by regex must not block the GOOD narrow forms.** Their first hook matched
   `\bpest\b` and blocked `ls .../skills/pest-testing/` — a directory name, not a command; a guard
   that blocks reading files gets switched off the same day. Two design rules from it: **match at
   command position**, and prefer letting a few odd forms through over one false block. And the
   reverse failure to avoid when writing ours: `vitest run --changed` and `vitest related <file>`
   are *valid narrow forms with no path*. A rule demanding a path blocks the two best narrow forms,
   and the blocked agent switches to `pnpm test` — which is wider — because that one is not caught.
   Finally, **name the escape hatch inside the block message**: someone blocked without a visible
   door goes around it, and you lose the trace too.
7. **Measure the cost of a SKIPPED job, not just a running one — and put the scope decision BEFORE
   the expensive step.** Their `[web] web/pos` job spent **225s to decide to skip**: 218s of
   `actions/checkout`, 2s of decision. Wherever scope is decided *after* the expensive step, every
   skipped job still pays in full. That is universal; the cure (a scope job before the matrix, a
   local mirror, `fetch-depth`) is per-repo — and `fetch-depth: 1` in particular breaks
   `git describe`, `...` diffs and tag provenance, so it is not general advice.
8. **Enforce the ban with a MECHANISM, not prose.** Their rule existed in writing for weeks and was
   violated twice in a single session; a hook that refuses an unscoped test command is what actually
   held.
9. **A fail-fast chain of N gates is not N gates.** One red at position 3 makes 4…N not exist for
   that run, and an index that checks *wiring* cannot see it. (Theirs: 249 declared, 31 observed.
   Ours: no `continue-on-error`, but `verify:ci:static` is a 46-command `&&` chain — gh#853.)

   **The fix is neither a log-scanner nor "stop writing chains" — it is to change the SHAPE so the
   CI platform counts for you.** One gate per `step` (or per `matrix` entry): the run UI then shows
   N results, so declared-vs-observed becomes *visible* with no parser, one red gate stops killing
   the rest, and there is no index to drift. The `dxs-product` session's argument for why a
   log-scanner cannot work is the decisive one: a scanner must know the gate **names** to look for,
   so it needs an index — and the index is the very thing that drifted. A detector that depends on
   the index cannot close the loop.

   The only gate worth writing is **structural, not behavioural**: *"no `run:` step may contain more
   than one gate command"* — greppable, ~0.1s, and it stops the chain growing back. Chains are not
   written on purpose; ours reached 46 commands and theirs 56 without anyone deciding to.

**Per-repo — measure, never copy:**

- **`lint --cache`.** Safe only if no rule is type-aware or cross-file. Verified here:
  `tseslint.configs.recommended`, no `project`/`projectService`, no import-resolution rules → safe,
  12.9s → 1.8s. Their `backend/eslint.config.mjs` sets `projectService: true` for
  `consistent-type-imports`, which is cross-file: changing `export const X` to `export type X` in B
  does not change A's content hash, so a cached A returns a stale result. They use it locally and
  **not** in CI.
- **Whether `vitest related` works at all.** Here: no (250s / 251 files). There: yes (5.3s / 2
  files), because their tests mostly import what they check.
- **What the time budget is measuring.** DORA's 10 minutes is a budget for the *wait*. Theirs waits
  8–11 minutes while spending 81–107 runner-minutes. Say which one you are budgeting.
- **The definition of "unit".** Here a directory group is 231 files; theirs is one Pest file at
  1.47s. Measure, then take the smallest grain that still means something.
- **How to make scope cheap.** Their fix was about `fetch-depth`; ours cannot be, because
  `git describe`, `...` diffs and tag-based provenance all need history. The implementation is
  per-repo — but see the universal rule it generalises to, below.

### One line phase 3 owes them

**Read the whole red CI run, do not just fix the red thing.** They changed a public function's
return type; it turned one test red (visible) and another **falsely green** — a `toHaveCount(1)`
quietly shifted from counting override rows to counting state transitions. Fixing only the red one
leaves a test that will answer "yes" to a question nobody asked.


---

## The second axis: IRREVERSIBILITY (classes F and G)

A–E classify by **surface** — how much of the system a change can touch. That is the wrong axis for
two kinds of change, and the `dxs-product` session supplied both from a production POS. They are
not more of A–E; they are a different question: **what happens if this is wrong, and would anyone
find out?**

### F · migration / seeder — *a deploy WRITES this into a live database*

**Definition:** a change a deploy will write into the database of a shop that is trading, with
nobody watching, at whatever hour someone pushes a tag. Their deploy path carries **19** such
writes.

**The incident:** a seeder switched off four time-slot menus at one shop at `06:08:01`, then again
at `07:35:06`. The shop served ~50 minutes on the wrong menu, fixed it by hand, and the next deploy
overwrote it again. The near miss is worse: another seeder upserts `tables` with `status='free',
current_order_id=null`. That deploy happened to land at 15:08, between shifts. **Mid-service it
would have returned every occupied table to empty and severed it from the order the customer was
sitting at.**

**The rules, which are the part worth carrying to any repo:**

- A seeder may re-apply **system catalogue** — things the operator cannot edit and without which
  the product will not run.
- A seeder must **never** re-apply **operator-owned** state. The moment a human can change a value
  in the UI, a deploy that re-applies it is **silently overruling their decision**.
- Three questions before anything joins the deploy path:
  1. Which table does it write? If that table has a screen the operator edits, **it does not belong
     here**.
  2. Is it a **one-off correction** or an invariant that must be re-applied forever? One-off ⇒ run
     it by hand, watched.
  3. **Is it safe at 14:30 on a busy Saturday?** If the answer depends on when you deploy, it is
     not safe.

Their guard locks the **call tree**, not the behaviour — a seeder can be perfectly correct and
still be wrong *here*. And it asserts **both directions**: every production seeder reaches deploy,
**and** everything reaching deploy is on the allowlist. The second direction was missing at first
and missing **silently**: a new seeder touching operator-owned state could join the workflow with
324 architecture tests still green.

### G · money path — *a number that will later be BELIEVED without being re-checked*

**Definition:** a write that produces a figure someone will trust without re-deriving it.

Core rule: **a device never states its own price.** Offline workstations sign each order; the cloud
verifies, then **re-prices from an immutable snapshot**. Exactly one verifier may seal a trusted
snapshot, and that allowlist is **fail-closed** — a new writer outside the aggregate boundary turns
the gate red.

The design consequence worth stealing: **a fabricated snapshot is worse than a missing one, because
it will be believed.** They keep `price_source` nullable *on purpose* — two write paths take price
from the device payload and the cloud cannot resolve it, so stamping an enum there would be an
invention. That NULL is permanent semantics, not a migration debt.

**Why G is not D.** A layout defect is seen and reported. A money defect reports *healthy*: a
¥3,160 completed payment failed to attach to its order, the order read `total = paid = 3160`,
closed cleanly, and **neither the overpayment warning nor the ledger drift scanner fired** — the
order matched no predicate either owned. The customer was most likely charged twice and no surface
knew.

**So the rule for class G: every money write needs a surface that ACTIVELY WAKES A PERSON.** Not a
log line, not a dashboard somebody could open. In their architecture that cost a dedicated event
and listener, because calling the notifier from the lower layer would have violated a layer
boundary.

> **Neither class exists in this repo, and that is the point of recording them.** A design system
> has no irreversible write path. If your repo has one, A–E will not find it, because A–E asks how
> much you touched and these ask whether you can take it back.
