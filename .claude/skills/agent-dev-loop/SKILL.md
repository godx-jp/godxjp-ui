---
name: agent-dev-loop
description: MANDATORY for any multi-issue development run — a batch of issues or requests worked in one session, alone or with sub-agents. Owns the four-phase loop (classify → implement → review the diff → batched verification) and the hard bans on running the full suite or heavy gates outside phase 4. PORTABLE across repositories and languages; the per-repo numbers live in references/this-repo.md. Read BEFORE picking up a batch of work and before deciding to run any check.
---

# The agent development loop

> **This file is PORTABLE. Copy it to any repository, in any language.** It contains no command,
> no gate name and no measurement belonging to one project. Everything project-specific lives in
> **`references/this-repo.md`**, which each repository fills in for itself using the protocol in
> **`references/adopting.md`**. The incidents that justify the rules are in
> **`references/case-studies.md`** — read them once; they are evidence, not instructions.
>
> If you are reading this in a repo where `references/this-repo.md` is still the blank template,
> **fill it in before phase 2.** A loop that does not know its own costs will guess, and guessing
> is what this skill exists to stop.

## Why it exists

An owner asked for **one CSS one-liner**. The agent ran nine chained gates, a 199-frame browser
sweep and two builds: **six minutes for a two-file diff**. Across a batch of issues that is most of
a working session spent re-proving things the diff could not have broken.

This is not a local preference. **Test Impact Analysis** and **Predictive Test Selection** (Meta,
[arXiv 1810.05286](https://arxiv.org/pdf/1810.05286)) exist because running everything on every
change is unaffordable. Google's test-size taxonomy says it plainly: *engineers don't wait for slow
tests.* DORA gives CI a **ten-minute budget** and prescribes splitting what exceeds it into a
separate build.

---

## The four phases

| phase | what you do | may run | **banned** |
| --- | --- | --- | --- |
| **1 · Classify** | read every request, group by blast radius, build the tracking list | nothing | everything |
| **2 · Implement** | build many items at once, write the tests and their edge cases | the tests you wrote **+ the three-term set** | the full suite · any aggregate verification alias · any browser/visual sweep · anything whole-repo and slow |
| **3 · Review** | read the diff and the requirement flow; audit the tests | the **same three-term set** | same as phase 2 |
| **4 · Verify the batch** | one pass, for the whole batch | everything, once | running it **unasked** |

**The ban in phases 2 and 3 is absolute, not a preference.** A check you run there is a check you
will run again in phase 4; the only thing it bought was wall clock.

> **On choosing a model per phase:** phase 3 carries more judgement than phase 2, so it is worth
> spending a stronger model there. Treat that as advice, never as a control. In this debate the
> strong model **was** the one that let a falsely-green assertion through — CI caught it, not the
> model. What catches defects is the **procedure** below. Read as a rule, "use a strong model"
> lets someone believe that choosing one means phase 3 was done.

---

## Phase 1 — classify, and build the tracking list

Read **every** request to the end before writing code. A batch is where duplicates and
contradictions hide; two items fixing one defect from opposite ends is a conflict you can see today
or discover on day three.

### Classify by BLAST RADIUS, not by size

Size predicts nothing. Radius decides what verification the change will need.

| class | the question it answers | typical members |
| --- | --- | --- |
| **A · leaf** | touches one unit and nothing else | one component/module and its own tests |
| **B · shared surface** | many things read it | a token, a shared stylesheet, a utility, a base class |
| **C · public contract** | consumers depend on the shape | an exported symbol, a prop, a package entry point, a schema |
| **D · presentation** | only a rendered surface can prove it | anything that moves a box, a colour, a focus ring |
| **E · infrastructure** | it decides how everything else is checked | CI config, a gate script, a generator, build config |

### And a SECOND axis, which A–E cannot see

A–E ask *how much did you touch*. These ask **what happens if it is wrong, and would anyone find
out**. Add them if your repo has them; a library usually does not, a product usually does.

| class | definition | the rule it forces |
| --- | --- | --- |
| **F · irreversible write** | a deploy writes this into live data, unattended, whenever someone ships | may re-apply **system-owned** invariants; **never** re-applies **operator-owned** state. Screening question: *is it safe at the busiest hour of the week?* If the answer depends on when you deploy, it is not safe. |
| **G · believed number** | produces a figure that will later be trusted without being re-derived | the producer never states its own authority; a **fabricated** value is worse than a missing one, because it will be believed. Every such write needs a surface that **actively wakes a person** — not a log line, not a dashboard someone could open. |

The distinction that makes G its own class: a presentation defect is **seen and reported**; a
believed-number defect reports **healthy**. See `references/case-studies.md`.

### The tracking list

One row per item: `id · class · files it will touch · the measurement that proves it fixed · status`.

The measurement column is not decoration. An item closes on a **number**, and deciding that number
*before* coding is what stops a fix being declared by eye.

---

## Phase 2 — implement many at once

### What you may run

The tests you just wrote — **plus** the path→gate rows your diff hits, **plus** every
source-scanning gate, unconditionally:

```
related(diff)  ∪  glob-mapping(diff)  ∪  ALL source-scanning gates
```

> #### The third term is not optional, and it is the one people drop
>
> **Source-scanning gates are invisible to every import-graph selector, and they fail GREEN.**
>
> A gate that reads source text (rather than importing the module) has no edge in the import graph.
> Ask a selector like `<runner> related <file>` for the tests covering that file and it answers
> *"No test files found"* — and **exits 0**. It does not fail silently; it emits a success signal,
> which is worse. Verified independently in two unrelated repositories, one JS/TS and one PHP.
>
> **A selector that answers "nothing to run → exit 0" is a trap.** When scope cannot be derived,
> **fail closed** and say so.

### Write every relevant edge case

A test proving only the happy path is why defects ship with a green tick. For what you touched:

- **the reproducer that fails before your fix and passes after** — run it against the pre-fix code
  and keep both outcomes. A test that passes on the broken code is not a test.
- **both sides of every boundary** you introduced (empty / one / many; first / last; min / max)
- **the negative case** — the arrangement that must NOT match. A selector fix without "and this
  shape still doesn't match" is half a fix.
- **locale and direction**, where the change can reach text or layout
- what the change deliberately does **not** do, when a reader would assume otherwise

### Sub-agents

Give each one an isolated working copy — they otherwise share your checkout, and a release-time
`add -A` has swallowed an agent's work-in-progress. Put the phase-2 ban list in **every** brief,
verbatim: an agent that was not told will run the suite.

---

## Phase 3 — review the diff instead of running things

This phase is what makes the bans safe. It only works if it is done properly, so here is what it
means concretely.

### 1. The file list must be fully explained

Take the diff **and** the working-tree status — the diff alone omits staged and untracked files.
Every file must trace to an item on the tracking list. An unexplained file is a **finding**: a
stray regeneration, a swallowed WIP, a formatter that reflowed something nobody touched.

### 2. Read the whole diff with context

Per hunk: does every changed line trace to the request? (improving adjacent code is scope creep) ·
imports your change orphaned removed, ones it needs added? · a user-facing string bypassing the
translation layer, a number bypassing locale formatting? · a hard-coded value where a design token
or constant exists? · a new public symbol registered everywhere the repo requires? · generated
files changed by anything other than the generator?

### 3. Audit the TESTS, not only the code

This is the step that is usually skipped, and it is why a batch can be green and wrong.

- **Is it non-vacuous?** Does it reach the element and state it names? Assertions have passed
  against empty strings in this codebase's history.
- **Would it fail on the old code?** If that was not proven, prove it: **revert the source hunk,
  run the test, confirm red, restore.** Seconds, and the single highest-value action in the phase.
- **Is it pinned to the right thing?** A test asserting an exact formatted string breaks when a
  formatter rewraps the line. A formatter deciding whether a test passes is not a test — assert the
  relationship, not the spelling.
- **Can its baseline only shrink?** A baseline that can be raised to silence a failure is not a
  gate.

### 4. Read the WHOLE red run, do not just fix the red thing

A change can turn one test red (visible) and another **falsely green** at the same time — an
assertion that quietly starts counting something else and still reports the same number. Fixing
only the red one leaves a test that will answer "yes" to a question nobody asked.

### 5. Name what the diff CANNOT prove, and probe exactly that

Unit-level tooling cannot see paint, contrast, hit-target size, overflow, cascade resolution or
focus geometry. For each such class present in the batch, run **one targeted probe**, not a sweep.

**Deferring one to phase 4 in writing is a valid outcome. Claiming it was verified is not.**

### 6. Write the review down

Per item: the diff stat, what you ran and how long it took, which "cannot prove" class you probed
and how, and which you deferred. A review nobody can read is a review nobody can check.

---

## Phase 4 — the batch run

### What a full run IS and IS NOT

**A full suite run is RELEASE EVIDENCE, bound to the exact commit being shipped.** It is not a
ritual and it is not debt collection. *A run at one commit proves nothing about the next one.*

And *"we just ran the full suite"* is **never** the evidence. Release gates take the **latest
attempt of the required check on the exact commit** — a newer cancelled run beats an older green
one. Verified independently in both repositories that debated this file.

### The trigger — there is only one

**The owner asks for it, or it does not happen.** There is no counter, no threshold and no
automatic case.

This used to be a threshold on un-integrated work, and removing it is the conclusion of getting it
wrong twice: first it fell back to the root commit and **authorised an unasked full-suite run from
the first read** — the one behaviour it forbids — and then, once fixed, it still needed a paragraph
explaining what it counted and what it did not. A rule that needs a paragraph is a rule that will
be applied wrongly, and this one fails **open** when applied wrongly.

The argument that killed it is also the simplest one:

```
problem : work that has not been REVIEWED
action  : run the full suite
```

Running tests reviews nothing. Unreviewed work, after a green suite, is still unreviewed — it
merely **looks** checked. There was never an amount of un-integrated work that made a full suite
the right answer; what a growing backlog calls for is **reviewing it**, or not taking more on.

So: **phase 3 is the answer to a large batch, and phase 4 is the answer to a question the owner
asked.** If the batch feels too big to review, stop taking work into it — do not reach for the
suite instead.

### The ask

One message, carrying the cost, so the answer is informed: the items completed, what you ran per
item with times, and the price of the batch run. Then:

- **Yes** → run once, for the whole batch. **Expand your aggregate aliases first** so you do not
  run their contents twice. Record every result.
- **Not asked** → it does not run. Silence is not a yes.
- **No** → open the PR. CI is the verdict; a red integration branch is fixed forward with priority.
  **Never report a skipped batch run as passed.**
- **Anything the owner must request by name** (accessibility sweeps, manual capture) is **not** in
  the bundle. A yes to the batch is not a yes to those.

A phase-2/3 failure is never waived by the batch run being optional.

---

## Nine rules that survived being attacked

Confirmed in two unrelated repositories (a TS design system and a PHP product). These are the
portable core; everything else is measurement.

1. **Source-scanning gates are invisible to import-graph selectors.** Select them by path glob and
   run them unconditionally.
2. **"Nothing to run → exit 0" is a false green.** Fail closed whenever scope cannot be derived.
3. **Expand and TIME an alias before running it.** Never trust a name. Aggregate aliases hide
   minutes behind one word, and nobody had expanded ours for months.
4. **The diff is not the diff command alone** — include staged and untracked files.
5. **The full suite is release evidence bound to a commit** — not a ritual, not a counter, and not
   the memory of having run it. Nothing but a person asking should start one.
6. **A ban enforced by pattern must not block the GOOD narrow forms.** Match at *command position*,
   not anywhere in the string — a guard that blocks reading a file whose name contains the tool is
   switched off the same day. Watch the reverse failure too: narrow forms like `--changed` or
   `related <file>` carry no path, so a rule demanding a path blocks the best options and pushes
   people to the *wider* command that is not caught. And **name the escape hatch inside the block
   message**: someone blocked without a visible door goes around it, and you lose the trace.
7. **Put the scope decision BEFORE the expensive step, and measure the cost of a SKIPPED job.**
   One repo's job spent 225 seconds deciding to skip: 218 of checkout, 2 of decision. Wherever
   scope is decided after the expensive step, every skipped job pays in full.
8. **Enforce the ban with a MECHANISM, not prose.** A written rule survived weeks and was violated
   twice in one session; a pre-execution hook that refuses an unscoped test command is what held.
9. **A fail-fast chain of N gates is not N gates.** One red at position 3 makes 4…N not exist for
   that run, and an index that checks *wiring* cannot see it. **The fix is neither a log-scanner
   nor willpower — change the SHAPE so the CI platform counts for you**: one gate per step or
   matrix entry, and declared-vs-observed becomes visible with no parser and no index. A
   log-scanner must know the gate *names*, so it needs an index — and the index is the thing that
   drifts, so it cannot close the loop. Write exactly one **structural** gate: *no step may contain
   more than one gate command.* Nobody writes a 46- or 56-command chain on purpose.

## What must NOT be generalised

Measure these per repository; copying them is how a handbook becomes wrong.

- **Whether a lint cache is safe.** Only if no rule is type-aware or cross-file. One repo: safe,
  12.9s → 1.8s. The other: unsafe in CI, because a cross-file rule means changing a symbol's kind
  in B does not change A's content hash, so a cached A returns a stale result.
- **Whether an import-graph selector works at all.** One repo: 5.3s over 2 files. The other: 250s
  over 251 files, because its tests read their fixtures as text.
- **What a time budget is measuring.** Ten minutes of *waiting* is not ten minutes of *runner
  time*: one repo waits 8–11 minutes while spending 81–107 runner-minutes. Say which you mean.
- **The definition of "unit".** One repo's directory group is 231 files; another's single test file
  is 1.5 seconds. Measure, then take the smallest grain that still means something.
- **Where the money actually goes.** It may not be tests at all.

---

## Self-check before handing the batch over

- [ ] `references/this-repo.md` is filled in with **measured** numbers, not estimates
- [ ] Tracking list exists; every item classified; every row carries its proving measurement
- [ ] Phase 2 ran only its own tests **plus the three-term set** — no suite, no sweep, no alias
- [ ] Every fix has a reproducer **proven to fail on the old code**
- [ ] Every file in the working tree traces to an item
- [ ] Tests audited for non-vacuity, not just for green
- [ ] Each "cannot prove" class either probed once or **deferred in writing**
- [ ] The batch run happened only because the owner **asked** for it
- [ ] Nothing skipped is reported as passed
