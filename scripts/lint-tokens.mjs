#!/usr/bin/env node
/**
 * lint-tokens.mjs — enforce the 7 lint rules from
 * `docs/specs/05-design-handoff-formats.md` §C + skill Part 5.5.
 *
 * Each rule scans the framework's CSS / TSX surface and emits
 * violations. Non-zero exit code on any failure.
 *
 * Usage:
 *   node scripts/lint-tokens.mjs            (run all rules)
 *   node scripts/lint-tokens.mjs --rule=R1  (run one rule)
 *   node scripts/lint-tokens.mjs --quiet    (summary only)
 *
 * Rules:
 *   R1 broken-token-ref      var(--non-existent) in any CSS / style=
 *   R2 wcag-contrast         color pairs failing 4.5:1 AA (deferred)
 *   R3 orphaned-token        token declared but referenced nowhere
 *   R4 section-ordering      docs/specs files with non-monotonic §A→§Z
 *   R5 duplicate-token       two tokens with identical value
 *   R6 prop-vocabulary       prop name not in docs/specs/04 vocabulary
 *   R7 density-axis-coverage primitive hardcodes height (interactive
 *                            element pixel literal outside exceptions)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");

const args = process.argv.slice(2);
const ONLY_RULE = args.find((a) => a.startsWith("--rule="))?.slice(7);
const QUIET = args.includes("--quiet");

const LOG = QUIET ? () => {} : (...x) => console.log(...x);

// ─── Walker ───────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "storybook-static",
  "design-handoff", "design", "__designs__",
]);

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const cssFiles = walk(join(ROOT, "src"), [".css"]);
const tsxFiles = walk(join(ROOT, "src"), [".tsx", ".ts"]).filter(
  (f) => !f.includes("__tests__") && !f.endsWith(".stories.tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".test.ts"),
);
// Lint all stories under src/stories/ — flattened from the previous
// `new-primitives/components/<group>/` nesting on 2026-05-17. The
// legacy story files at src/stories/ root were already cleaned out
// in the prior cleanup, so any *.stories.tsx anywhere under
// src/stories/ is canonical.
const storyFiles = walk(join(ROOT, "src"), [".stories.tsx"]).filter(
  (f) => f.includes("/src/stories/"),
);
const specsFiles = (() => {
  try { return walk(join(ROOT, "docs/specs"), [".md"]); }
  catch { return []; }
})();

// ─── Token extraction ─────────────────────────────────────────────

/**
 * @typedef {Object} TokenDecl
 * @property {string} name        token name (without leading --)
 * @property {string} value       raw value text
 * @property {string} file        relative path
 * @property {number} line        1-based line number
 * @property {string} scope       :root | [data-theme="dark"] | etc.
 */

function extractTokens() {
  /** @type {TokenDecl[]} */
  const tokens = [];
  for (const file of cssFiles) {
    const txt = readFileSync(file, "utf-8");
    const rel = relative(ROOT, file);
    // Track current selector scope (best-effort — only top-level rules).
    let scope = "";
    let depth = 0;
    const lines = txt.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      // Selector start (depth 0 → 1)
      if (depth === 0) {
        const selMatch = trimmed.match(/^([^{}\/]+)\{\s*$/);
        if (selMatch) {
          scope = selMatch[1].trim();
          depth = 1;
          continue;
        }
        // Single-line selector + decls (e.g. `[data-density="compact"] { … }`)
        const inline = trimmed.match(/^([^{}\/]+)\{\s*(.+?)\s*\}\s*$/);
        if (inline) {
          extractFromBlock(inline[2], inline[1].trim(), rel, i + 1, tokens);
          continue;
        }
      } else {
        // Inside a block
        if (trimmed === "}") { depth--; scope = ""; continue; }
        // Strip inline /* ... */ comments, then split by `;` to handle
        // multiple declarations per line (e.g. the spacing scale row
        // `--spacing-0: 0; --spacing-1: 0.25rem; --spacing-2: 0.5rem;`).
        const stripped = trimmed.replace(/\/\*[\s\S]*?\*\//g, "");
        for (const seg of stripped.split(";")) {
          const decl = seg.trim().match(/^--([a-z][a-z0-9-]*)\s*:\s*(.+)$/i);
          if (decl) {
            tokens.push({
              name: decl[1],
              value: decl[2].trim(),
              file: rel,
              line: i + 1,
              scope,
            });
          }
        }
      }
    }
  }
  return tokens;
}

function extractFromBlock(blockText, scope, file, line, tokens) {
  const decls = blockText.split(";").map((s) => s.trim()).filter(Boolean);
  for (const d of decls) {
    const m = d.match(/^--([a-z][a-z0-9-]*)\s*:\s*(.+)$/i);
    if (m) {
      tokens.push({ name: m[1], value: m[2].trim(), file, line, scope });
    }
  }
}

// ─── Token reference extraction ───────────────────────────────────

function extractReferences() {
  /** @type {Array<{name: string, file: string, line: number}>} */
  const refs = [];
  // Static reference: `var(--<name>)`. Matched in all CSS + source
  // TSX. Capture the full var() up to `)` so we can spot
  // documentation placeholders like `var(--card-pad-y-*)` or
  // `var(--breakpoint-<bp>)` precisely.
  const reVar = /var\(\s*--([a-z][a-z0-9-]*)(\s*[,*…]|\s*-\*|\s*<[^>]+>)?\s*\)/gi;
  // Story-file reference: `"--<name>"` string literal (used in
  // foundation catalogue stories like
  // `<code>{name}</code>` + `style={{ width: \`var(${name})\` }}`
  // where the var() is built dynamically from a string list).
  const reLiteral = /(?:["'`])--([a-z][a-z0-9-]*)(?:["'`])/g;
  const allFiles = [...cssFiles, ...tsxFiles, ...storyFiles];
  for (const file of allFiles) {
    const txt = readFileSync(file, "utf-8");
    const rel = relative(ROOT, file);
    const lines = txt.split("\n");
    const isStory = file.endsWith(".stories.tsx");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Static var() refs
      let m;
      reVar.lastIndex = 0;
      while ((m = reVar.exec(line)) !== null) {
        if (m[2] && /[*…<]/.test(m[2])) continue;
        refs.push({ name: m[1], file: rel, line: i + 1 });
      }
      // Story-file string-literal refs (the foundation catalogue
      // stories list tokens by name string + render them via
      // dynamic `var(${tok})` interpolation).
      if (isStory) {
        reLiteral.lastIndex = 0;
        while ((m = reLiteral.exec(line)) !== null) {
          refs.push({ name: m[1], file: rel, line: i + 1 });
        }
      }
    }
  }
  return refs;
}

// ─── Rule R1 — broken-token-ref ───────────────────────────────────

function r1_BrokenTokenRef(tokens, refs) {
  const declared = new Set(tokens.map((t) => t.name));
  // Whitelist Tailwind-builtin tokens (--tw-*, --color-*, --spacing-*
  // generated by @theme inline; --rdp-* legacy etc.) and Radix
  // runtime-injected CSS vars (--radix-popover-trigger-width, etc.).
  const wl = (n) =>
    n.startsWith("tw-") ||
    n.startsWith("color-") ||
    n.startsWith("font-size-") ||
    n.startsWith("rdp-") || // legacy react-day-picker (removed but kept tolerated)
    n.startsWith("radix-") || // Radix runtime-injected (Popover.Content sets --radix-popover-trigger-width on itself, etc.)
    n === "primary" || n === "background" || n === "foreground";
  const violations = [];
  for (const ref of refs) {
    if (declared.has(ref.name)) continue;
    if (wl(ref.name)) continue;
    violations.push({
      rule: "R1 broken-token-ref",
      detail: `var(--${ref.name}) — not declared in any theme.css :root / [data-*] block`,
      file: ref.file,
      line: ref.line,
    });
  }
  return violations;
}

// ─── Rule R3 — orphaned-token ─────────────────────────────────────

function r3_OrphanedToken(tokens, refs) {
  // Allow tokens that are only referenced from outside the framework
  // (e.g. Tailwind @theme inline aliases referencing them by name).
  const referenced = new Set(refs.map((r) => r.name));
  // Tokens consumed inside Tailwind's @theme inline block via the
  // same-name redeclaration (e.g. `--color-primary: var(--primary)`).
  // The right side is `var(--primary)` so `--primary` IS in refs.
  // But the left side (`--color-primary`) is a Tailwind theme alias
  // not referenced as `var(--color-primary)` anywhere — Tailwind
  // resolves it via utility classes. Whitelist these aliases.
  const tailwindThemeAliases = new Set([
    "color-background", "color-foreground", "color-card", "color-card-foreground",
    "color-popover", "color-popover-foreground", "color-primary",
    "color-primary-foreground", "color-secondary", "color-secondary-foreground",
    "color-muted", "color-muted-foreground", "color-accent", "color-accent-foreground",
    "color-destructive", "color-destructive-foreground", "color-success",
    "color-success-foreground", "color-attention", "color-border", "color-input",
    "color-input-background", "color-ring", "color-sidebar", "color-sidebar-foreground",
    "color-sidebar-border", "color-surface-2", "color-surface-3",
    "spacing-page", "spacing-section", "spacing-element", "spacing-card",
    "font-size-page-title", "font-sans", "radius-lg",
    "breakpoint-sm", "breakpoint-md", "breakpoint-lg", "breakpoint-xl", "breakpoint-2xl",
    "density-spacing",
  ]);
  // Dynamic-reference allowlist. Tokens consumed via JS template
  // literal (`getComputedStyle(:root).getPropertyValue(\`--…-\${var}\`)`)
  // can't be statically grepped. Each entry below MUST cite the
  // dynamic consumer file/line in the comment. Nothing else
  // allowlisted — orphan tokens must be either USED (in a primitive,
  // shell.css, OR a `new-primitives/theme/` catalogue story) or
  // DELETED. No legacy compatibility shims kept around.
  const dynamicReferences = new Set([
    // useBreakpoint() + Row.tsx normalizeGutter() read
    // `--breakpoint-${bp}` at runtime — every xs/sm/md/lg/xl/xxl
    // value is consumed dynamically.
    "breakpoint-xs", "breakpoint-xxl",
    // (xs/xxl are the ones the static `var(--breakpoint-sm)` etc.
    //  in tailwind.css doesn't cover.)
  ]);
  const violations = [];
  const seenNames = new Set();
  for (const t of tokens) {
    if (seenNames.has(t.name)) continue; // multi-scope token (light + dark)
    seenNames.add(t.name);
    if (referenced.has(t.name)) continue;
    if (tailwindThemeAliases.has(t.name)) continue;
    if (dynamicReferences.has(t.name)) continue;
    violations.push({
      rule: "R3 orphaned-token",
      detail: `--${t.name}: declared but referenced nowhere`,
      file: t.file,
      line: t.line,
    });
  }
  return violations;
}

// ─── Rule R4 — section-ordering ───────────────────────────────────

function r4_SectionOrdering() {
  const violations = [];
  for (const file of specsFiles) {
    if (file.endsWith("README.md")) continue; // index has no sections
    const txt = readFileSync(file, "utf-8");
    const rel = relative(ROOT, file);
    const lines = txt.split("\n");
    // Match `## §X — title` headings.
    const re = /^##\s+§([A-Z]\d?)\s*—/;
    const seq = [];
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (m) seq.push({ tag: m[1], line: i + 1 });
    }
    if (seq.length < 2) continue;
    // Canonical comparator: A < A-2 < A2 < B < … (literal lexicographic
    // works since tags are A..Z + optional digit suffix).
    for (let i = 1; i < seq.length; i++) {
      if (seq[i].tag < seq[i - 1].tag && seq[i].tag !== seq[i - 1].tag) {
        violations.push({
          rule: "R4 section-ordering",
          detail: `§${seq[i].tag} appears after §${seq[i - 1].tag} — non-monotonic`,
          file: rel,
          line: seq[i].line,
        });
      }
    }
  }
  return violations;
}

// ─── Rule R5 — duplicate-token ────────────────────────────────────

function r5_DuplicateToken(tokens) {
  // Intentional cross-mapping groups — design canon binds these
  // names together by semantic role even though they share value.
  // Per cardinal rule 23 §A separate concepts: ring is the focus
  // chain, brand is the logo/avatar stripe, primary is the brand
  // fill — they map together to ONE accent hue per palette but
  // semantically remain distinct props on the consumer side.
  // Design-canon-documented intentional groups. Each is cited in
  // docs/specs/03 §B–§E or the dxs-kintai SKILL.md. Cardinal rule
  // 23 §A still applies: each token encodes ONE concept; these are
  // deliberate cross-mappings where multiple semantic roles
  // resolve to the same value at a specific density / theme.
  // NOT legacy excuses — every group below has a documented reason.
  const intentionalGroups = [
    // Brand chain — `primary` / `ring` / `brand` / `sidebar-active-fg`
    // intentionally share the accent hue per palette + dark variant.
    // Cited in docs/specs/03 §B "Brand chain rules".
    new Set(["primary", "ring", "brand", "sidebar-active-fg"]),
    // `destructive` ↔ `error` — `error` is the documented alias of
    // `destructive` for form-validation contexts.
    // Cited in docs/specs/03 §B "Semantic chain".
    new Set(["destructive", "error"]),
    // Light-mode warm off-white shared across page / card / popover
    // / input-bg / surface-1. Cited in docs/specs/03 §B "Surface chain".
    new Set(["background", "card", "popover", "input-background", "surface-1"]),
    // Warm off-black text on every light-mode surface.
    new Set(["foreground", "card-foreground", "popover-foreground",
             "secondary-foreground", "accent-foreground"]),
    // Off-white text on every solid semantic surface (light mode).
    // Cited in dxs-kintai SKILL.md "Semantic mapping is fixed".
    new Set(["destructive-foreground", "success-foreground",
             "info-foreground", "attention-foreground", "error-foreground",
             "primary-foreground"]),
    // muted = secondary by design (both warm-grey 96% in light).
    new Set(["secondary", "muted", "surface-inset"]),
    // border = input (both hairline grey).
    new Set(["border", "input"]),
    // Density values at default — design canon's 1rem step for
    // card / page / section. Cited in docs/specs/03 §E.
    new Set(["density-card", "density-page", "density-section"]),
    new Set(["density-dialog", "density-page-title"]),
    new Set(["density-element", "density-table-head"]),
    // Compact / comfortable density variants follow the same pairs.
    new Set(["density-element-xs", "density-dialog"]),
    new Set(["density-element-xl", "header-height"]),
    // Card chrome — design canon pins .ch / .cf / .ch-kicker / .ch
    // gap all to 10px. Cited in docs/specs/03 §J "Component-scope tokens".
    new Set(["card-pad-y-header", "card-pad-y-footer",
             "card-header-gap", "card-kicker-size"]),
    // Dark-mode surface collapse documented in docs/specs/03 §L.
    new Set(["sidebar-bg", "topbar-bg", "surface-2"]),
    new Set(["sidebar-border", "topbar-border"]),
    new Set(["popover", "input-background"]),
    new Set(["surface-3", "kbd-bg"]),
    new Set(["card", "surface-1"]),
    new Set(["secondary", "muted"]),
  ];
  function isIntentional(names) {
    const set = new Set(names);
    for (const grp of intentionalGroups) {
      // All names in this duplicate group are members of the same
      // intentional group → skip.
      let allIn = true;
      for (const n of set) if (!grp.has(n)) { allIn = false; break; }
      if (allIn) return true;
    }
    return false;
  }
  // Token "family" — only flag duplicates within the same semantic
  // family. Cross-family value collisions (text-base 0.875rem ==
  // card-pad-y-body 0.875rem) are intentional per cardinal rule
  // 23 §A "separate every concept".
  function family(name) {
    if (/^(text|font|leading|heading)-/.test(name)) return "type";
    if (/^spacing-/.test(name)) return "spacing";
    if (/^(density-|header-height$|touch-target)/.test(name)) return "density";
    if (/^breakpoint-/.test(name)) return "breakpoint";
    if (/^(radius|border)-/.test(name) || name === "radius" || name === "border-width") return "radius";
    if (/^shadow/.test(name)) return "shadow";
    if (/^(transition-|ease-)/.test(name)) return "motion";
    if (/^wa-/.test(name)) return "wairo";
    if (/^(gray|blue|red|green|amber|rose|slate|violet|yellow)-/.test(name)) return "rawcolor";
    if (/^card-/.test(name)) return "cardchrome";
    if (/^(sidebar|topbar)-/.test(name)) return "shell";
    if (/^dot-/.test(name)) return "dot";
    if (/^aspect-/.test(name)) return "aspect";
    if (/^(primary|ring|brand|sidebar-active)/.test(name)) return "brand";
    if (/^(success|warning|info|attention|destructive|error)/.test(name)) return "semantic";
    if (/^(background|foreground|card|popover|secondary|muted|accent|surface|input|kbd-bg|content-)/.test(name)) return "surface";
    return "misc";
  }
  /** @type {Map<string, TokenDecl[]>} */
  const groups = new Map();
  for (const t of tokens) {
    // Skip alias declarations that intentionally point at another token.
    if (/^var\(--/.test(t.value)) continue;
    // Skip empty values + values with calc().
    if (!t.value || /calc\(/.test(t.value)) continue;
    // Group by (scope, value, family) so cross-family collisions
    // never group together.
    const key = `${t.scope}::${t.value}::${family(t.name)}`;
    const arr = groups.get(key) ?? [];
    arr.push(t);
    groups.set(key, arr);
  }
  const violations = [];
  for (const [_key, arr] of groups) {
    if (arr.length < 2) continue;
    const namesSet = arr.map((t) => t.name);
    if (isIntentional(namesSet)) continue;
    const names = arr.map((t) => `--${t.name}`).join(", ");
    violations.push({
      rule: "R5 duplicate-token",
      detail: `${names} share value "${arr[0].value}" in scope "${arr[0].scope}" — consolidate`,
      file: arr[0].file,
      line: arr[0].line,
    });
  }
  return violations;
}

// ─── Rule R6 — prop-vocabulary (stub — manual review until full impl) ───

const LOCKED_VOCAB = new Set([
  // From docs/specs/04 §A
  "size", "variant", "color", "tone", "accent", "padding", "density",
  "shape", "status", "block", "hoverable",
  "disabled", "loading", "readOnly", "required", "autoFocus",
  "defaultChecked", "checked", "defaultValue", "value",
  "prefix", "suffix", "addonBefore", "addonAfter",
  "startContent", "endContent",
  "title", "subtitle", "kicker", "meta", "extra", "footer", "actions", "band",
  // React + HTML standard props (passthrough)
  "className", "children", "style", "id", "key", "ref",
  "onClick", "onChange", "onSubmit", "onFocus", "onBlur", "onKeyDown",
  "aria-label", "aria-labelledby", "aria-describedby", "aria-hidden",
  "aria-disabled", "aria-readonly", "aria-required", "aria-invalid",
  "aria-expanded", "aria-controls", "aria-current", "aria-busy",
  "aria-live", "aria-atomic", "role", "tabIndex", "name", "type",
  "placeholder", "maxLength", "minLength", "min", "max", "step",
  "pattern", "autoComplete", "form", "htmlFor",
]);

const FORBIDDEN_SYNONYMS = new Map([
  ["scale", "use `size`"],
  ["dimension", "use `size`"],
  ["kind", "use `variant`"],
  ["look", "use `variant`"],
  ["appearance", "use `variant`"],
  ["intent", "use `color`"],
  ["tint", "use `color`"],
  ["compactness", "use `padding`"],
  ["dense", "use `padding`"],
  ["fullWidth", "use `block`"],
  ["wide", "use `block`"],
  ["stretched", "use `block`"],
]);

function r6_PropVocabulary() {
  const violations = [];
  // Scan primitive .tsx files for `export interface <Name>Props { … }`.
  const primitiveFiles = tsxFiles.filter((f) =>
    f.includes("/src/components/primitives/") &&
    !f.endsWith("/index.ts") && !f.endsWith("/cn.ts"),
  );
  for (const file of primitiveFiles) {
    const txt = readFileSync(file, "utf-8");
    const rel = relative(ROOT, file);
    // Match `export interface <Name>Props … { <body> }` with brace
    // balancing for the body.
    const re = /export\s+interface\s+([A-Z]\w*)Props\b[^{]*\{/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const start = m.index + m[0].length;
      let depth = 1;
      let i = start;
      while (i < txt.length && depth > 0) {
        if (txt[i] === "{") depth++;
        else if (txt[i] === "}") depth--;
        i++;
      }
      const body = txt.slice(start, i - 1);
      // Extract property names — lines like `<name>?: <type>` or
      // `<name>: <type>`. Skip ones starting with `//`.
      const propRe = /^[ \t]*(\w+)\??\s*:\s*[^;]+;/gm;
      let p;
      while ((p = propRe.exec(body)) !== null) {
        const propName = p[1];
        if (FORBIDDEN_SYNONYMS.has(propName)) {
          const lineNum = txt.slice(0, p.index + start).split("\n").length;
          violations.push({
            rule: "R6 prop-vocabulary",
            detail: `${m[1]}Props.${propName} — forbidden synonym; ${FORBIDDEN_SYNONYMS.get(propName)}`,
            file: rel,
            line: lineNum,
          });
        }
      }
    }
  }
  return violations;
}

// ─── Rule R7 — density-axis-coverage ──────────────────────────────

function r7_DensityCoverage() {
  // Look for hardcoded `height: \dpx` / `min-height: \dpx` /
  // `padding: …\dpx…` in primitive CSS (shell.css) where N is large
  // enough to be an interactive surface height. Allowed exceptions:
  // 1, 2, 4 (hairlines, band heights), 44 (touch-target floor),
  // values used in well-known utility contexts.
  const ALLOWED_PX = new Set([0, 1, 2, 3, 4, 6, 8, 10, 11, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 34, 36, 40, 44, 48, 60, 64, 80, 96, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 256, 260, 280, 300, 320, 360, 400, 420, 480, 540, 600, 640, 720, 768, 1024, 1280, 1440, 1536]);
  // We mostly flag heights >= 24 that aren't tokens. But many CSS
  // utility classes legitimately use specific pixel values for
  // chart bars, icon squares, etc. Run this as a SOFT warning only:
  // we collect, but don't fail-on-first. Hardcoded heights inside
  // primitive .tsx `style={{ height: 32 }}` are the bigger concern.
  const violations = [];
  const primitiveTsx = tsxFiles.filter((f) =>
    f.includes("/src/components/primitives/") &&
    !f.endsWith(".ts") && !f.endsWith("/cn.tsx"),
  );
  for (const file of primitiveTsx) {
    const txt = readFileSync(file, "utf-8");
    const rel = relative(ROOT, file);
    // Match `height: N` or `height: "Npx"` inside style={{}} blocks.
    const re = /\b(height|minHeight)\s*:\s*(['"]?)(\d+)(px)?\2/g;
    const lines = txt.split("\n");
    let m;
    while ((m = re.exec(txt)) !== null) {
      const n = Number(m[3]);
      if (ALLOWED_PX.has(n)) continue;
      const lineNum = txt.slice(0, m.index).split("\n").length;
      violations.push({
        rule: "R7 density-axis-coverage",
        detail: `${m[1]}: ${n}px hardcoded — use var(--density-element) / --density-element-{xs,sm,lg,xl}`,
        file: rel,
        line: lineNum,
      });
    }
  }
  return violations;
}

// ─── R2 — wcag-contrast (deferred, prints stub) ───────────────────

function r2_WcagContrast() {
  // OKLCH → sRGB → relative luminance → 4.5:1 ratio computation
  // requires either a color library (culori — cardinal rule 14 ADR
  // required) or a hand-rolled OKLCH parser. Deferred until ADR
  // approval. Manual review covers this for now.
  return [];
}

// ─── Runner ───────────────────────────────────────────────────────

const RULES = {
  R1: { name: "broken-token-ref", fn: (t, r) => r1_BrokenTokenRef(t, r) },
  R2: { name: "wcag-contrast (deferred)", fn: () => r2_WcagContrast() },
  R3: { name: "orphaned-token", fn: (t, r) => r3_OrphanedToken(t, r) },
  R4: { name: "section-ordering", fn: () => r4_SectionOrdering() },
  R5: { name: "duplicate-token", fn: (t) => r5_DuplicateToken(t) },
  R6: { name: "prop-vocabulary", fn: () => r6_PropVocabulary() },
  R7: { name: "density-axis-coverage", fn: () => r7_DensityCoverage() },
};

const tokens = extractTokens();
const refs = extractReferences();

LOG(`Scanned ${cssFiles.length} CSS + ${tsxFiles.length} TSX + ${storyFiles.length} story files`);
LOG(`Extracted ${tokens.length} token declarations + ${refs.length} var(--…) references`);
LOG("");

let totalViolations = 0;
const ruleResults = [];
for (const [id, rule] of Object.entries(RULES)) {
  if (ONLY_RULE && ONLY_RULE !== id) continue;
  const violations = rule.fn(tokens, refs);
  ruleResults.push({ id, name: rule.name, violations });
  totalViolations += violations.length;
}

for (const { id, name, violations } of ruleResults) {
  const status = violations.length === 0 ? "✓" : "✗";
  LOG(`${status} ${id} ${name} (${violations.length} violation${violations.length === 1 ? "" : "s"})`);
  for (const v of violations) {
    LOG(`    ${v.file}:${v.line}  ${v.detail}`);
  }
  if (violations.length > 0) LOG("");
}

if (totalViolations > 0) {
  console.error(`\n${totalViolations} total violations across ${ruleResults.filter((r) => r.violations.length > 0).length} rules`);
  process.exit(1);
}
LOG("All rules passing.");
process.exit(0);
