#!/usr/bin/env node
/**
 * Guard: every token in the SHIPPED artifact actually RESOLVES.
 *
 * `check-token-tiers` proves the tokens in `src/` are spelled right. It does not — cannot — prove
 * that what lands in `dist/` still exists at runtime. Two real #319 bugs slipped past every
 * textual gate:
 *
 *   1. STRUCTURALLY DEAD DECLARATIONS. 122 control tokens were appended after the closing brace of
 *      `:root` but inside the trailing `@media (pointer: coarse)` block. A bare declaration inside
 *      a conditional group rule is invalid CSS, so browsers drop it: the token is perfectly spelled
 *      and completely nonexistent. Three guards stayed green — the tier check read the file line by
 *      line, the geometry ratchet only reads `.tsx`, and jsdom never resolves the cascade.
 *
 *   2. DANGLING REFERENCES. Two rules read `var(--space-9)` from a `foundation.css` whose ramp
 *      jumps `--space-8` → `--space-10`. `var()` with no fallback and no declaration computes to
 *      the guaranteed-invalid value: the property is dropped, silently.
 *
 * Both shapes are structural, so this reads the braces rather than the lines, and it reads `dist/`
 * rather than `src/` — the artifact consumers actually import.
 *
 * There is deliberately NO baseline and NO ratchet. The tree is at zero today; anything this finds
 * is a token that does not exist in the browser, which is never something to carry forward.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

/**
 * Custom-property families supplied at runtime by a third party, never declared in our CSS.
 * Radix positions its own portalled surfaces (`--radix-popover-trigger-width`, the
 * `*-content-available-height` measurements) by writing them onto the content element; Tailwind's
 * utilities own the `--tw-*` shadow/ring plumbing. A `var()` on either resolves in the browser and
 * must not be reported.
 */
const RUNTIME_SUPPLIED = [/^--radix-/, /^--tw-/];

/**
 * At-rules whose body is a declaration list rather than a list of rules. A custom property sitting
 * directly inside one of these is legal. Everything else that starts with `@` — `@media`,
 * `@supports`, `@container`, `@layer`, `@scope` — is a grouping rule whose body may hold only
 * rules, so a bare declaration there is the bug this guard exists for.
 */
const DECLARATION_AT_RULES = ["@theme", "@property", "@font-face", "@page", "@counter-style"];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".css")) out.push(full);
  }
  return out;
}

/**
 * Blank out comments and quoted strings, preserving every byte's offset (and so every line number),
 * so that a `--token:` mentioned in prose or in a `content: "…"` string is never mistaken for a
 * declaration or a reference.
 */
function blankNonCode(css) {
  const out = css.split("");
  let i = 0;
  while (i < css.length) {
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? css.length : end + 2;
      for (let j = i; j < stop; j += 1) if (out[j] !== "\n") out[j] = " ";
      i = stop;
    } else if (css[i] === '"' || css[i] === "'") {
      const quote = css[i];
      let j = i + 1;
      while (j < css.length && css[j] !== quote) j += css[j] === "\\" ? 2 : 1;
      const stop = Math.min(j + 1, css.length);
      for (let k = i; k < stop; k += 1) if (out[k] !== "\n") out[k] = " ";
      i = stop;
    } else {
      i += 1;
    }
  }
  return out.join("");
}

function lineCounter(css) {
  const starts = [0];
  for (let i = 0; i < css.length; i += 1) if (css[i] === "\n") starts.push(i + 1);
  return (index) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (starts[mid] <= index) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };
}

/**
 * Walk the brace structure and yield every custom-property declaration with the block that encloses
 * it. Handles the last declaration in a block even when it has no trailing semicolon.
 */
function customPropertyDeclarations(code, lineAt) {
  const found = [];
  const stack = [];
  let bufferStart = 0;
  let depth = 0; // parentheses — a `;` inside `url(data:…;…)` does not end a declaration

  const flush = (end) => {
    // The buffer is exactly one declaration (or one prelude): every `{`, `}` and `;` resets it, and
    // comments were blanked out upstream. Take the WHOLE buffer, not its last line — a token whose
    // value wraps onto the next line (`--shadow-md:\n  0 1px 2px …;`) is the common formatting here
    // and slicing to the last line would read the value as if it were the name.
    const raw = code.slice(bufferStart, end);
    const decl = raw.trim();
    if (!decl.startsWith("--")) return;
    const colon = decl.indexOf(":");
    if (colon === -1) return;
    const name = decl.slice(0, colon).trim();
    if (!/^--[\w-]+$/.test(name)) return;
    found.push({
      name,
      line: lineAt(bufferStart + raw.indexOf("--")),
      context: stack[stack.length - 1] ?? null,
    });
  };

  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth > 0) continue;
    else if (ch === "{") {
      stack.push(code.slice(bufferStart, i).trim().replace(/\s+/g, " "));
      bufferStart = i + 1;
    } else if (ch === "}") {
      flush(i);
      stack.pop();
      bufferStart = i + 1;
    } else if (ch === ";") {
      flush(i);
      bufferStart = i + 1;
    }
  }
  return found;
}

/** True when a declaration in this block reaches the browser. */
function isLiveContext(context) {
  if (context === null) return false; // top level — not a rule at all
  if (!context.startsWith("@")) return true; // a selector
  const name = context.split(/[\s({]/)[0];
  return DECLARATION_AT_RULES.includes(name);
}

/**
 * Every `var()` in the source, with the referenced name and whether a fallback was supplied.
 * Scans by paren depth so a nested `var(--a, var(--b))` reports both, and so a comma inside a
 * fallback's own function call is not mistaken for the fallback separator.
 */
function varReferences(code, lineAt) {
  const refs = [];
  for (let i = code.indexOf("var("); i !== -1; i = code.indexOf("var(", i + 1)) {
    if (i > 0 && /[\w-]/.test(code[i - 1])) continue;
    let depth = 1;
    let hasFallback = false;
    let j = i + 4;
    let name = "";
    let readingName = true;
    for (; j < code.length && depth > 0; j += 1) {
      const ch = code[j];
      if (ch === "(") depth += 1;
      else if (ch === ")") depth -= 1;
      else if (ch === "," && depth === 1) {
        hasFallback = true;
        readingName = false;
      } else if (readingName) name += ch;
    }
    const trimmed = name.trim();
    if (trimmed.startsWith("--")) {
      refs.push({ name: trimmed, hasFallback, line: lineAt(i) });
    }
  }
  return refs;
}

if (!existsSync(dist)) {
  console.error("✗ dist token resolution guard failed");
  console.error("  dist/ does not exist — run `pnpm build` first (this guard reads the artifact,");
  console.error("  not src/; a stale or missing dist is exactly what it is here to notice).");
  process.exit(1);
}

const failures = [];
for (const dir of ["tokens", "styles"]) {
  if (!existsSync(join(dist, dir))) {
    failures.push(`dist/${dir}/ is missing from the build output — run \`pnpm build\`.`);
  }
}
if (failures.length) {
  console.error("✗ dist token resolution guard failed");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

const tokenFiles = walk(join(dist, "tokens"));
const styleFiles = walk(join(dist, "styles"));

// ── 1. Every custom property in the shipped CSS must live in a real rule body. ───────────────────
// The declarations that survive this check are the ones that actually exist at runtime, so they —
// and only they — are what a `var()` may resolve to below.
const declared = new Set();
for (const file of [...tokenFiles, ...styleFiles]) {
  const rel = relative(root, file);
  const code = blankNonCode(readFileSync(file, "utf8"));
  const lineAt = lineCounter(code);
  for (const decl of customPropertyDeclarations(code, lineAt)) {
    if (isLiveContext(decl.context)) {
      declared.add(decl.name);
      continue;
    }
    const where = decl.context === null ? "the top level of the file" : `\`${decl.context}\``;
    failures.push(
      `${rel}:${decl.line}: ${decl.name} is declared directly inside ${where}, not inside a rule ` +
        `body — this is invalid CSS and browsers DROP it. Wrap it in a selector (\`:root { … }\`).`,
    );
  }
}

// ── 2. Every var() in the shipped CSS must resolve, or carry a fallback. ─────────────────────────
// Token files are scanned alongside the stylesheets on purpose: in the `--space-9` incident the
// dangling references were themselves TOKENS (`--space-stack-*` reaching for a rung the foundation
// ramp skips, `--space-8` → `--space-10`), so a styles-only scan would have missed the original.
for (const file of [...styleFiles, ...tokenFiles]) {
  const rel = relative(root, file);
  const code = blankNonCode(readFileSync(file, "utf8"));
  const lineAt = lineCounter(code);
  for (const ref of varReferences(code, lineAt)) {
    if (ref.hasFallback) continue;
    if (RUNTIME_SUPPLIED.some((pattern) => pattern.test(ref.name))) continue;
    if (declared.has(ref.name)) continue;
    failures.push(
      `${rel}:${ref.line}: var(${ref.name}) resolves to nothing — no declaration of ${ref.name} ` +
        `exists in dist/tokens/** or dist/styles/**, and there is no fallback. The property is ` +
        `dropped at runtime. Declare the token, fix the name, or give it a fallback.`,
    );
  }
}

if (failures.length) {
  console.error("✗ dist token resolution guard failed");
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    `\n  ${failures.length} dead token${failures.length === 1 ? "" : "s"}. ` +
      "There is no baseline for this guard: a token that does not resolve does not exist.",
  );
  process.exit(1);
}

console.log(
  `✓ dist token resolution guard passed ` +
    `(${declared.size} live declarations across ${tokenFiles.length + styleFiles.length} shipped CSS files)`,
);
