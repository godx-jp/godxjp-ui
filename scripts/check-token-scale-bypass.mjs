#!/usr/bin/env node
/**
 * Token scale-bypass guard — "a token that declares a raw number on an axis that already HAS a
 * scale fails" (gh#332, from the gh#324 / gh#325 axis survey).
 *
 * WHY THIS GUARD EXISTS
 *   gh#324 measured every geometry token in `src/tokens/{components,semantic}` and found a
 *   near-perfect correlation: an axis WITH a named scale stays disciplined, an axis WITHOUT one is
 *   almost all raw numbers.
 *
 *       axis        via scale   raw   % raw
 *       width               8    80     91%   ← no scale
 *       size               10    34     77%   ← no scale
 *       icon-size           9    28     76%   ← no scale AT THE TIME; gh#326 has since given it one
 *       height             18    40     69%   ← no scale AT THE TIME; gh#324 split out --band-height-*
 *       padding            82    34     29%   ← --space-*
 *       gap                86    26     23%   ← --space-*
 *       radius             34     3      8%   ← --radius-*
 *       font-size          90     4      4%   ← --font-size-*
 *
 *   Nobody is skipping `var(--font-size-lg)` out of laziness; they write `28rem` because there is
 *   nothing else to write. So the fix for the top of that table is a SCALE, not a guard.
 *   (`--list` prints the live census, on this guard's own axis definitions, whenever you want it.)
 *
 *   icon-size is the cleanest demonstration of both halves. It was 76% raw with no scale; gh#326
 *   named nine steps, every one of the 31 component icon tokens moved onto them, and switching
 *   this guard's `enforced` flag on for that axis cost ZERO baseline entries. Scale first, gate
 *   second — in that order the gate is free.
 *
 *   gh#324 then did the top two rows, and found the interesting half of the answer: the loudest
 *   axis is not one axis. `-width` at 91% raw is THREE concerns wearing one suffix — the thickness
 *   of a painted line, the measure of a container, and the content width of a field — and only the
 *   first is a vocabulary. So `--stroke-*` was named and gated; the other two are recorded in the
 *   rules module as NOT A SCALE, with the census behind the verdict, because putting a dialog's
 *   32rem and an auth card's 23.75rem on a shared grid would be worse than leaving them literal.
 *   `height` split the same way: `--band-height-*` (control, row, menu item, top bar — one
 *   vocabulary, seven values) versus container measures that stay literal. `size` and `offset`
 *   came out as no-scale on the same test. Naming a scale is the fix for an axis; declaring that
 *   an axis is not one is the fix for the rest, and it has to be written down or it gets re-asked.
 *
 *   But a scale alone is not sufficient either, and that is what this guard is for. font-size is
 *   the most disciplined axis in the system and FOUR tokens still went around it —
 *   `--sidebar-nav-item-font-size: 0.8125rem` (13px) sits between two steps, so every sidebar nav
 *   row is off the system's type rhythm. Those four are the entire case: the scale was there, and
 *   they walked past it. Nothing in CI noticed.
 *
 * WHAT COUNTS AS A VIOLATION
 *   A custom-property declaration in `src/tokens/components/**` or `src/tokens/semantic/**` whose
 *   NAME sits on an ENFORCED axis (one that has a scale today: font-size, padding, gap, margin,
 *   radius, icon-size, stroke, band-height, line-height) and whose VALUE bakes a length literal
 *   without deriving from that axis's scale.
 *   `token-scale-bypass-rules.mjs` owns the axis table and flips an axis on when its scale lands.
 *
 * WHAT DOES NOT COUNT — the allow-list, and why each entry is on it
 *   • Any value with no length literal: `var(--space-4)`, `var(--card-space-inset)`, `auto`,
 *     `none`, `inherit`, `max-content`. Aliasing another token is the system working.
 *   • `0` in any unit. `--space-0` IS `0`; there is nothing to name.
 *   • Exactly `1px`. The device hairline — `check-no-hardcoded-css-values.mjs` exempts it for the
 *     same reason (cardinal rule #44: a service retunes whether a rule exists, not whether it is
 *     1px). It is also what makes `calc(var(--radius) - 1px)`, the correct nested-radius inset,
 *     read as scale-derived instead of raw.
 *   • Percentages, unitless numbers, and viewport units. `100%` is proportional to a parent and
 *     `1.5` on `--line-height-*` is a ratio; neither is a step of any scale.
 *   • Comments. Header prose that documents a token (`--font-size-lg: 15.7px`) and trailing `16px`
 *     annotations on scale-derived values are blanked before parsing — two guards in this repo
 *     have already shipped reporting on their own comments, and a phantom violation sends someone
 *     off to "fix" prose.
 *   • Axes with no scale: width, height, size, offset. Enforcing an axis with no steps would
 *     demand people write something that does not exist. Each is DECLARED in the rules module —
 *     since gh#324 with a VERDICT rather than a to-do, because the census says these four are
 *     several concerns each rather than one undernamed axis. The coherent halves that were hiding
 *     inside `width` and `height` have been split out and ARE enforced (`stroke`, `band-height`).
 *     line-height is enforced too, and is the odd member: its scale is a set of unitless RATIOS,
 *     so a LENGTH there is never a step — it is a mis-named height, and now fails as one.
 *   • `src/tokens/foundation.css`. That file DECLARES the scales; its literals are the steps
 *     themselves. Same for `src/styles/**`, which is `check-no-hardcoded-css-values.mjs`'s beat —
 *     that guard explicitly skips custom-property declarations, and this one is its other half.
 *
 * EXCLUDED, WITH THE REASON RECORDED
 *   `src/tokens/components/email.css` — 28 raw geometry/type constants, and they must stay raw.
 *   HTML email cannot read custom properties: Gmail and Outlook strip <style> blocks and demand
 *   literal inline values, so a Blade/Twig/MJML template can never `var()` a token. Verified in
 *   the file's own header and in `scripts/gen-email-tokens.mjs`.
 *   One correction to the issue text, since it matters for how safe the exclusion is: email.css is
 *   the generator's INPUT, not its output — `gen-email-tokens.mjs` reads it and writes
 *   `src/email/tokens.generated.ts`. So the file IS hand-edited and CAN drift on its own; what
 *   cannot drift is the email export away from it, because `pnpm check:email-token-sync` fails
 *   when the generated file is stale. The exclusion rests on the literal-values constraint alone.
 *
 * TWO TIERS — the escape that keeps this honest
 *   A system with only named steps turns every real exception into a hack (`!important`, a global
 *   token override, a fork). gh#325's consumers were explicit about wanting a legitimate route to
 *   an arbitrary value — their 6px status dot will never be on any scale. So there are two:
 *     tier 1  a step:            `--x-padding: var(--space-4);`
 *     tier 2a derive from a step:`--x-padding: calc(var(--space-4) + 2px);`
 *     tier 2b say why, in place: `--x-size: 0.375rem; /` + `* scale-exempt: 6px status dot, below
 *             --space-1 and deliberately off-grid *` + `/`
 *   An exemption needs the `scale-exempt:` marker and a reason of 12+ characters, on the
 *   declaration line or the line above. It is never silent: every exemption honoured is printed on
 *   a passing run, so they stay countable and reviewable.
 *
 * RATCHET, NOT A CLIFF
 *   55 declarations bypassed an enforced scale the day this landed, and 59 after gh#324 turned on
 *   three more axes — the four additions are `--menu-item-height`, `--steps-dot-process-ring-width`,
 *   `--steps-marker-border-width` and `--branch-scope-picker-subset-border-width`, each a one-line
 *   swap in a file that a different owner had open at the time. Failing all of them at once
 *   gets the guard switched off, so the baseline records them BY TOKEN NAME per file. A name not
 *   in the baseline fails, naming the file, line, token and value. A baselined name that is no
 *   longer a violation ALSO fails, telling you to re-baseline — that is what stops the number
 *   creeping back up after someone cleans a file. Names rather than counts, so a new violation is
 *   identified exactly instead of "shell.css went from 25 to 26".
 *
 * Usage:
 *   node scripts/check-token-scale-bypass.mjs            # check against the baseline
 *   node scripts/check-token-scale-bypass.mjs --update   # rewrite the baseline after a cleanup
 *   node scripts/check-token-scale-bypass.mjs --list     # every violation + every axis's census
 *   node scripts/check-token-scale-bypass.mjs --json     # machine-readable report
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { AXES, AXIS_BY_ID, ENFORCED_AXES, scanCss } from "./token-scale-bypass-rules.mjs";

const ROOT = process.cwd();
const SCAN_DIRS = ["src/tokens/components", "src/tokens/semantic"];
/** See "EXCLUDED, WITH THE REASON RECORDED" above. */
const EXCLUDED = new Set(["src/tokens/components/email.css"]);
const BASELINE = join(ROOT, "scripts/token-scale-bypass.baseline.json");

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const AS_JSON = args.has("--json");
const LIST = args.has("--list");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".css")) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))
  .map((f) => relative(ROOT, f))
  .filter((f) => !EXCLUDED.has(f))
  .sort();

/** file → violation records; plus the honoured exemptions and a per-axis census for reporting. */
const found = new Map();
const exemptions = [];
const census = {};
for (const file of files) {
  const {
    violations,
    exemptions: exempt,
    perAxis,
  } = scanCss(readFileSync(join(ROOT, file), "utf8"));
  if (violations.length) found.set(file, violations);
  for (const e of exempt) exemptions.push({ ...e, file });
  for (const [axis, stat] of Object.entries(perAxis)) {
    census[axis] ??= { viaScale: 0, raw: 0 };
    census[axis].viaScale += stat.viaScale;
    census[axis].raw += stat.raw;
  }
}

const total = [...found.values()].reduce((a, v) => a + v.length, 0);
const currentNames = Object.fromEntries(
  [...found].map(([file, v]) => [file, v.map((x) => x.token).sort()]),
);

if (UPDATE) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify(
      {
        _comment:
          "Ratchet baseline for scripts/check-token-scale-bypass.mjs (gh#332). Tokens listed here " +
          "declare a raw number on an axis that already has a scale. The list may only SHRINK — " +
          "removing one and re-running with --update is the whole workflow. Do not add a name by hand.",
        enforcedAxes: ENFORCED_AXES,
        total,
        files: currentNames,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`✓ baseline written — ${total} bypass(es) across ${found.size} file(s)`);
  process.exit(0);
}

if (LIST) {
  console.log("axis census (declarations in src/tokens/{components,semantic}, email.css excluded)");
  for (const axis of AXES) {
    const stat = census[axis.id] ?? { viaScale: 0, raw: 0 };
    const denominator = stat.viaScale + stat.raw;
    const pct = denominator ? `${Math.round((100 * stat.raw) / denominator)}%` : "—";
    console.log(
      `  ${axis.id.padEnd(12)} via scale ${String(stat.viaScale).padStart(4)}   raw ${String(stat.raw).padStart(4)}   ${pct.padStart(4)} raw   ` +
        (axis.enforced ? `ENFORCED → ${axis.scale}` : "not enforced (no scale yet)"),
    );
  }
  console.log("\nbypasses on enforced axes");
  for (const [file, violations] of found) {
    for (const v of violations)
      console.log(`  ${file}:${v.line}  ${v.token}: ${v.value}  [${v.axis}]`);
  }
}

if (!existsSync(BASELINE)) {
  console.error(`✗ missing ${relative(ROOT, BASELINE)} — run with --update to create it.`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const regressions = [];
const improvements = [];

for (const [file, violations] of found) {
  const allowed = baseline.files[file] ?? [];
  const remaining = [...allowed];
  for (const v of violations) {
    const at = remaining.indexOf(v.token);
    if (at === -1) {
      regressions.push(
        `${file}:${v.line}  ${v.token}: ${v.value}   [${v.axis} — use ${AXIS_BY_ID.get(v.axis).scale}]`,
      );
    } else {
      remaining.splice(at, 1);
    }
  }
}
for (const [file, allowed] of Object.entries(baseline.files)) {
  const present = (found.get(file) ?? []).map((v) => v.token);
  const remaining = [...present];
  for (const token of allowed) {
    const at = remaining.indexOf(token);
    if (at === -1) improvements.push(`${file}  ${token} is no longer a bypass`);
    else remaining.splice(at, 1);
  }
}

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        enforcedAxes: ENFORCED_AXES,
        total,
        baselineTotal: baseline.total,
        census,
        violations: [...found].flatMap(([file, v]) => v.map((x) => ({ file, ...x }))),
        exemptions,
        regressions,
        improvements,
      },
      null,
      2,
    ),
  );
  process.exit(regressions.length || improvements.length ? 1 : 0);
}

if (regressions.length) {
  console.error("✗ token declares a raw number on an axis that already has a scale (gh#332)\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  These axes have named steps, so a bare number silently leaves the system's rhythm —\n" +
      "  --sidebar-nav-item-font-size: 0.8125rem is 13px between two type steps, and every\n" +
      "  sidebar row has been off the scale ever since. Pick one of three routes:\n" +
      "    1. a step:              var(--space-4), var(--font-size-sm), var(--radius-md)\n" +
      "    2. derive from a step:  calc(var(--space-4) + 2px)\n" +
      "    3. genuinely off-grid:  keep the literal and write, on the same line,\n" +
      "       a block comment reading  scale-exempt: <why this value is not on the scale>\n" +
      "  (See docs/TOKENS.md · Add-a-token checklist for where a new token is declared.)",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — ${improvements.length} bypass(es) fixed. Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-token-scale-bypass.mjs --update");
  process.exit(1);
}

const exemptionNote = exemptions.length
  ? `, ${exemptions.length} explicit exemption(s)`
  : ", no exemptions";
console.log(
  `✓ no new scale bypasses — ${total} on enforced axes (${ENFORCED_AXES.join(", ")}) across ` +
    `${found.size} file(s), at the ${baseline.total} baseline${exemptionNote}.`,
);
for (const e of exemptions) {
  console.log(`  exempt  ${e.file}:${e.line}  ${e.token}: ${e.value} — ${e.reason}`);
}
