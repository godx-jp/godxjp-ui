# `@godxjp/ui` — the numbers behind `agent-dev-loop`

Measured on an M-series Mac, warm, 2026-09-22. **Re-measure after any toolchain change** — and
never quote a figure from here in another repository; see `adopting.md`.

## Costs

```
check:token-tiers 0.2s   typecheck        1.3s   eslint <changed files>  1.0s
typecheck:mcp     0.3s   build            1.5s   lint (warm, --cache)    1.8s
audit             0.5s   preview:build    1.9s   lint (cold)            16.1s
typecheck:docs    0.7s   regen            4.0s   one component's tests  2-23s
                         frame-contracts  5.5s   packed-public-contract 22.2s
                         frame-overflow    52s   verify:ci:static         60s
                         check:contrast    91s   ship:surface            ~70s
                                                 full vitest suite      ~375s
```

**`typecheck` over the whole program is 1.3s and was never the problem.** The costs are aliases and
browser sweeps.

`check:frame-overflow` was **339s** until it was pooled (it ran 398 navigations down one page, in
series); `--only <slug>` narrows it to ~18s for a diff-scoped run and refuses `--update-baseline`.

## Aliases expanded

| alias | what it really runs | cost |
| --- | --- | --- |
| `ship:surface` | `regen && verify:ci:static && check:frame-contracts` | **~70s** |
| `verify:ci:static` | a **46-command `&&` chain** | 60s |
| `check:frame-contracts` | 7 gates | 5.5s |

`ship:surface` was prescribed **per public export** by the docs, a skill and a saved memory. It is
batch-only. Expand aliases before running them.

## Source-scanning gates — unconditional

`src/styles/__tests__` (42 files) read their CSS with `readFileSync`, and most `check:*` gates read
source text. **They are invisible to `vitest related`.**

## Import-graph selector: **UNUSABLE**

`vitest related <file>` — **250s across 251 files.** The style tests read CSS as text, so the graph
cannot find them and drags in everything else. Do not use it here. Select by path glob.

## Lint cache: **SAFE**

`eslint.config.js` uses `tseslint.configs.recommended` — *not* `recommendedTypeChecked` — with no
`project`/`projectService` and no import-resolution rules, so nothing is type-aware or cross-file.
`--cache --cache-strategy content` is sound, including in CI. **12.9s → 1.8s warm.**

## Path → gate map

| changed path | run |
| --- | --- |
| any `.ts/.tsx` in `src/` | `typecheck` · `audit` · `eslint <files>` |
| `src/components/<group>/<name>.tsx` | + `vitest run src/components/<group>/__tests__/<name>` |
| `src/styles/*.css` | `audit` · `vitest run src/styles/__tests__/<name>` |
| `src/tokens/**` | `check:token-tiers` · `vitest run src/tokens/__tests__` · `regen` **twice** (gh#847) |
| a public prop / export | `regen` · `check:prop-vocabulary` · `check:mcp-sync` · `check:mcp-orphans` · `check:component-api-manifest` · `check:registry` — **not `ship:surface`** |
| `package.json` exports, a barrel, tsup entries | + `build && check:packed-public-contract` |
| `mcp/**` | `typecheck:mcp` · `cd mcp && vitest run` |
| `docs/**` | `typecheck:docs` — **not `typecheck`**, which covers `src/` only — · `audit` · `check:example-imports` |
| `.github/workflows/**`, `scripts/check-*.mjs` | `check:gate-coverage` · `vitest run src/test/__tests__` |
| anything that moves layout | `check:frame-overflow --only <slug>` |

**The test unit is the COMPONENT, not the group.** `src/components/data-entry/__tests__` is **231
files** (3–4 min); the `select` prefix is 19 files (22.6s).

## Blast-radius classes present

**A–E.** No F (no deploy writes to live data) and no G (no believed-number path) — this is a
library. Their absence is why they are documented in `SKILL.md` rather than here.

## Batch-run trigger

**The owner asks, or it does not run.** No counter, no threshold — see `SKILL.md`. A batch too
large to review is a signal to stop taking work into it, not to run the suite.

## Fail-fast chains and silent-success traps

- ✅ **No `continue-on-error`** anywhere in `.github/workflows/` — a red job is a red run here.
- ❌ **`verify:ci:static` is a 46-command `&&` chain** run as one step. Red at position 3 ⇒ 43
  gates do not exist for that run. **gh#853.**
- `check:gate-coverage` reports 71 gates, 68 reached by 8 workflows — a real index, better than
  most repos have — but it asks whether a gate is **wired**, not whether it **executed**, so it is
  blind to the chain.

## Release evidence

`release-core.mjs` REQUIRED_CI_CHECK_RUNS + `assertCiProvenance` keep **the newest attempt per
check-run name** (`release-core.mjs:316`) and refuse on any other red check on the SHA. So a newer
cancelled run refuses a publish even when an older green one exists. **"We just ran the suite" is
not evidence here.**

## Enforcement mechanism

**NOT BUILT YET** — currently prose only, which rule 8 says is insufficient. Planned: a `PreToolUse`
hook refusing `pnpm test`, a bare `vitest run`, `ship:surface`, `verify:ci:static`, a full
`check:frame-overflow` and `check:contrast`. Must match at command position, must **not** demand a
path (`vitest run --changed` is a legitimate narrow form), and must name its human-only escape
hatch in the block message.
