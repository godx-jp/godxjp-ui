# Adopting `agent-dev-loop` in a new repository

`SKILL.md` is portable and stays byte-identical wherever you copy it. This file is the protocol for
producing that repo's `this-repo.md`. **Budget an hour. Do it once, before the first batch.**

A loop that does not know its own costs will guess, and guessing is the thing the skill exists to
stop. Every number below must be **measured on the machine that will run it**, not estimated and
not copied from another repo.

---

## Step 1 — time every check you have

```bash
t() { s=$(date +%s); "$@" >/dev/null 2>&1; echo "$(( $(date +%s) - s ))s  $*"; }
```

Run it over **every** check the repo declares — **whatever cheap static checks exist** (a type
checker, a linter, a formatter, architecture tests — not every language has all four), each named
gate, the build, the packaging step, each test grouping. Sort by cost.

Do not assume the rows of another repo's map. A repo with no type checker should not have a
type-checker row it fills in with something that is not one.

Expect the result to contradict your intuition. In the originating repo the check that *looked*
wasteful — type-checking the entire program — was **1.3 seconds**, and the real cost was a browser
sweep nobody thought about and an alias nobody had expanded.

**Never call a check slow before timing it.** That rule has already been broken once by the author
of this file.

## Step 2 — expand every alias

List the scripts whose body is other scripts. For each, write down what it **actually** runs and
what the chain costs.

One repo's `ship:surface` was three aggregate commands ≈ 70 seconds, and the docs, a skill and a
saved memory all prescribed it *per change*. Nobody had opened it.

## Step 3 — find the gates that scan SOURCE rather than import

```bash
grep -rln 'readFileSync\|file_get_contents\|glob(' <test and gate directories>
```

Every hit is invisible to an import-graph selector and **must** be selected by path glob and run
unconditionally. This is the third term of phase 2's set, and it is the term people drop.

## Step 4 — decide whether an import-graph selector is usable at all

```bash
t <runner> related <a file you know is covered>
```

Read **both** numbers: how long, and how many files. A selector that returns *"no test files
found, exit 0"* on a file you know is covered is worse than none — it emits a green signal. Record
the verdict as **usable / unusable** with the measurement beside it.

## Step 5 — decide whether a lint cache is safe HERE

Safe only if **no rule is type-aware or cross-file**. Check the config for a project-service or
type-aware preset, and for import-resolution rules.

If one exists, a content-hash cache is **unsound**: changing a symbol's kind in B does not change
A's content hash, so a cached A returns a stale result. Local use may still be fine; CI is not.

## Step 6 — build the path→gate map

For each path glob the repo contains, name the gates that **can have an opinion about it** — and
nothing else. The test is falsifiable: *can this gate fail because of a change to this path?* If
not, it does not belong in that row.

Beware the near-misses: a type checker scoped to one program says nothing about another program in
the same repo; a catalogue-vs-exports comparison cannot move on a stylesheet edit.

## Step 7 — find the fail-fast chains and the silent-success traps

```bash
grep -rn 'continue-on-error' <ci config>
grep -rnE '(&&|;).*(&&|;)' <ci config>            # multi-command steps
```

- `continue-on-error` on a gate job makes a red job report a green run. One repo had this on a
  chain with a failure at position 33 of 56: **23 gates had not executed for weeks and nobody
  knew.**
- A multi-command step is not N gates. Fix the **shape**: one gate per step or matrix entry, so the
  platform counts for you. Then write the one structural gate: *no step may contain more than one
  gate command.*

## Step 8 — measure a SKIPPED job

Find a CI job that decides it has nothing to do, and time it end to end. If the scope decision
happens *after* the expensive step, every skipped job pays in full. One repo's skip cost 225
seconds, of which 218 was checkout and 2 was the decision.

## Step 9 — write down who may start a full run

**A person asks, or it does not happen.** Record the exact wording your project uses for the ask,
and what is deliberately excluded from the bundle (accessibility sweeps, manual capture — anything
the owner must name separately).

Do not invent a threshold that starts one automatically. The originating repo tried; the counter
fell back to the root commit and authorised an unasked run on its first read, and the corrected
version still needed a paragraph to explain itself. A rule needing a paragraph gets applied
wrongly, and this one fails **open** when it is.

## Step 10 — write the mechanism, not just the document

A rule that exists only in prose will be violated. Add a pre-execution hook that refuses an
unscoped test command. Design notes, both paid for in real failures:

- **Match at command position.** A pattern matching the tool's name anywhere blocks reading a
  directory that contains it, and a guard that blocks reading files gets disabled the same day.
- **Do not demand a path.** Legitimate narrow forms carry none (`--changed`, `related <file>`).
  Demanding one blocks the best options and pushes people to the *wider* command you did not catch.
- **Name the escape hatch in the block message**, and make it obviously human-only. Someone blocked
  without a visible door goes around it, and you lose the trace as well.

---

## The template

Copy into `this-repo.md` and fill in. Leave nothing as a guess; write `UNMEASURED` instead, so the
gap is visible.

```markdown
# <repo> — the numbers behind agent-dev-loop
Measured on: <machine>, <date>. Re-measure after any toolchain change.

## Costs                      | ## Aliases expanded
<command>            <time>   | <alias> = <what it really runs> (<total>)

## Source-scanning gates (unconditional, always run)
## Import-graph selector: usable / unusable — <measurement>
## Lint cache: safe / unsafe — <the rule that decides it>
## Path → gate map
## Blast-radius classes present: A B C D E [F G]
## Batch-run trigger: the owner asks — record the wording, and what is excluded from the bundle
## Fail-fast chains / silent-success traps: <findings>
## Enforcement mechanism: <hook path, what it refuses, the escape hatch>
```
