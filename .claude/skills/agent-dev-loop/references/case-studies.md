# Case studies — the incidents behind the rules

Evidence, not instructions. Each rule in `SKILL.md` exists because one of these happened. Two
unrelated repositories: a TypeScript design system and a PHP point-of-sale product.

---

## 1. The selector that failed GREEN

The PHP repo has a gate catching a dead `<Badge color=>` prop — the defect that lost badge colour
in production. It scans source with `readFileSync` and imports nothing. On a file that **does**
render `<Badge>`:

```
$ vitest related --run .../inbox/page.tsx
No test files found, exiting with code 0
```

Not a silent miss — a **success signal**. The TS repo has the same blindness with the opposite
symptom: its style tests read CSS as text, so `related` returns 250s across 251 files and still
misses them.

→ rules 1 and 2.

## 2. The alias nobody had expanded

`ship:surface` was prescribed *per public export* by the docs, a skill **and** a saved memory. It
is `regen && verify:ci:static && check:frame-contracts` ≈ **70 seconds**. Months, one word, nobody
opened it.

→ rule 3.

## 3. Twenty-three gates that had not run since September

The PHP repo's docs lane ran **56 commands in one `run:` step**. `bash -e` stopped at #33, so 23
gates never executed — including *"deploy must back up the database before migrating"*. The job
also carried `continue-on-error: true`, so **RUN read success while JOB was failure**: 6 of the
last 12 runs job-red, 12 of 12 run-green. Four releases went through it. Two gates its author had
written and proven by removing the protection had **never run once on CI**.

Its index declared 249 gates; the log counted 31.

→ rule 9, and why the fix is a shape change rather than a log-scanner: a scanner needs the names,
so it needs the index, and the index is the thing that drifted.

## 4. The counter that authorised what it forbade

The first version of phase 4 counted from a `verified/*` marker tag, falling back to the root
commit when none existed. None existed:

```
$ git rev-list --count $(… || git rev-list --max-parents=0 HEAD)..HEAD
1888
```

Over the threshold ⇒ *"Automatic"* ⇒ run the full suite **without asking**, from the first read.
Circular too: the marker was only created after a successful run.

Caught by the other session reading the draft and running the command. The rule it violated —
*missing data must fail closed* — was stated **two sections earlier in the same file**.

→ the fail-closed note in phase 4, and rule 2 generalised.

## 5. The strong model was not what caught the defect

A public function's return type changed. One test went red (visible) and another went **falsely
green**: a `toHaveCount(1)` quietly shifted from counting override rows to counting state
transitions and still reported 1. CI caught it; the strong model reviewing the change did not.

→ the model column is advisory, and phase 3 step 4.

## 6. Two hundred and twenty-five seconds to decide to do nothing

A CI job took 225s end to end to conclude it should skip: **218s of `actions/checkout`** (a 666 MB
`.git` with no `fetch-depth`) and 2s of decision.

The cure is per-repo — `fetch-depth: 1` breaks `git describe`, `...` diffs and tag provenance. The
lesson is not.

→ rule 7.

## 7. The regex that blocked reading a file

A hook meant to refuse unscoped test runs matched `\bpest\b` and blocked
`ls .../skills/pest-testing/` — a directory name. A guard that blocks reading files gets switched
off the same day.

Its mirror image, avoided before shipping: demanding a path in the narrow form blocks
`vitest run --changed` and `related <file>`, which carry none — so the blocked agent reaches for
the **wider** command that was not caught.

→ rule 6.

## 8. Class F — a deploy that rewrote a trading shop

A seeder switched off four time-slot menus at one shop at `06:08:01`, then again at `07:35:06`. The
shop served ~50 minutes on the wrong menu, fixed it by hand, and the next deploy overwrote it
again.

The near miss is worse. Another seeder upserts `tables` with `status='free',
current_order_id=null`. That deploy landed at 15:08, between shifts, so nobody saw it. **Mid-service
it would have returned every occupied table to empty and severed it from the order the customer was
sitting at.**

The rule: a seeder may re-apply **system-owned** catalogue; it must never re-apply **operator-owned**
state, because from the moment a human can change a value, a deploy re-applying it silently
overrules them. Screening question: **is it safe at 14:30 on a busy Saturday?** If the answer
depends on when you deploy, it is not safe.

Its guard locks the **call tree**, not the behaviour — a seeder can be correct and still be wrong
*here* — and asserts **both directions**. The second direction was missing at first, and missing
silently: a new seeder touching operator-owned state could join the deploy workflow with 324
architecture tests still green.

→ class F.

## 9. Class G — every surface reported healthy

A ¥3,160 completed payment failed to attach to its order. The order read `total = paid = 3160`,
closed cleanly, and **neither the overpayment warning nor the ledger drift scanner fired** — the
order matched no predicate either of them owned. The customer was most likely charged twice, and no
surface knew.

A layout defect is seen and reported. A money defect reports healthy.

→ class G, and its rule that every such write needs a surface that **actively wakes a person**.

## 10. A green run that was not evidence

Release `v0.11.59` had two backend CI runs on the tagged commit: one with `pest = success`, and a
newer **cancelled** one. The gate refused:

```
::error::Product CI has not passed: CI · [backend] tests: completed/cancelled
```

It takes the latest attempt per workflow, not *"was there ever a green one"*. The TS repo's
provenance does the same by design (`release-core.mjs:316`).

→ phase 4's definition of evidence.


---

## 11. The list that told a repo it was exempt

Phase 3 step 5 once read: *"Unit-level tooling cannot see paint, contrast, hit-target size,
overflow, cascade resolution or focus geometry."* Every item is an interface concern, presented as
universal.

A PHP point-of-sale repo read it and reported the failure in **both** directions.

**Missing** — its largest unprovable classes were not on the list: business time (shops at UTC+7
and UTC+9 on one UTC backend, so *"today"* is not global and a test in one timezone proves the
wrong thing), the bytes reaching a thermal printer (encoding, and the regex library version that
decides which characters fold — two minor versions produce different bytes), cryptographic
signatures, and database constraints under real concurrency.

**Backwards** — those classes *are* testable, but only when the test pins its conditions. An agent
reading a list with nothing on it that applies concludes the step is **skippable**, when it in fact
owes more: freeze the clock, assert across at least three timezones, compare a golden fixture, pin
the library version to production's.

The fix was not a longer list. **A list invites you to check whether you are on it; a question does
not.** Step 5 is now two questions — what can your test layer not observe, and what can it observe
only if pinned — with both families as examples underneath.

→ phase 3 step 5, and a caution for anything written as an enumeration in a portable document.


---

## 12. The lane that fails with no verdict

A browser-journeys job carries `timeout-minutes: 60`. The step inside it carries
`timeout-minutes: 90`. **The job dies first, so the larger number is dead configuration** — and the
step's own comment ("402 specs with two retries per failure fit well inside 90") has never once
applied. A justification can outlive the thing it justified and still be read as true.

Then the failure mode compounds. A job that hits its cap reports **`cancelled`** and prints **no
test summary at all**. Measured across six nights the lane ran 22, 26, 23, 21, 35, then >60
minutes: it is being pushed over its cap **by its own failures**, because each failing spec burns
its full timeout and then retries.

So it fails in a way that **destroys the evidence needed to fix it**, and the word `cancelled`
reads as though a human pressed cancel.

Concrete cost: a fix for one of those specs landed on 09-21. The next night was the first chance to
confirm it — and that run timed out. Two days later the fix is still unverified.

Same family as case 1 and case 3, third shape: *fails green* · *fails green from the outside* ·
**fails with no verdict**. In all three the CI platform's own reporting is the thing lying.

→ rules 2 and 7.

## 13. Speeding up my gate by tipping over someone else's

Pooling the frame sweep one page per core took it from 339s to 52s. Every workflow in that repo is
`runs-on: [self-hosted, swarm-pool]`, and `availableParallelism()` on a self-hosted runner reports
**the whole machine** — 14 cores — not the slice allotted to the job.

A consumer repo on the same pool reported the hazard after reading the change: it has 84
two-process concurrency tests that spawn real processes against SQLite, and under a loaded runner
the losing process exhausts its retry budget and dies with `database is locked`. `busy_timeout`
cannot rescue it, because a lock **upgrade** returns `SQLITE_BUSY` immediately without calling the
busy handler.

The optimisation was real; its blast radius was another repository's test suite. Capped to 2 when
`CI` is set, fast pool kept for the developer machine.

→ rule 8.
