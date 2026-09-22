#!/usr/bin/env node
/**
 * WHO SETS THIS TOKEN, WHO READS IT, AND WHO WOULD WIN — the resolution trace.
 *
 * WHY THIS EXISTS. The owner's complaint, verbatim: *"tao thấy rất nhiều chỗ mày cứ đè cấu hình
 * lung tung làm ảnh hưởng component này sang component khác"* — configuration overriding
 * configuration until a change to one component moves another. Prose cannot settle that argument.
 * A trace can: for one token, print every DECLARATION and every READ in the package, in cascade
 * order, and name the rule that would win.
 *
 * WHAT THE ORDER IS. See docs/TOKEN-RESOLUTION.md. In short, a custom property is resolved by the
 * ordinary cascade, so the winner at an element is the declaration from the nearest ancestor that
 * matched, and among equals the one with the highest specificity, and among those the last:
 *
 *     1  inline `style` on the element            (a per-instance prop)
 *     2  the nearest scope that declares it       ([data-tenant], .dark, a region wrapper)
 *     3  `:root` in the consumer's own theme.css  (unlayered, so it beats every package layer)
 *     4  `:root` in this package's token tier     (the default)
 *
 * THE ONE RULE THAT BREAKS IT, and the reason this script reports `FREEZE` loudly: `var()`
 * substitutes where it is DECLARED, not where it is read. So a package default written as
 *
 *     :root { --card-border-color: var(--border); }      ← FROZEN
 *
 * resolves against the ROOT's `--border` once, and a `[data-tenant]` below root that changes
 * `--border` can never reach it — step 2 of the chain is silently dead for that token. The shape
 * that keeps the chain alive is a knob of `initial` plus the formula at the CALL SITE:
 *
 *     :root       { --card-border-color: initial; }
 *     .ui-card    { border-color: var(--card-border-color, hsl(var(--border))); }
 *
 * This repo has paid for that distinction seven times (gh#687, gh#843, gh#848, gh#866, …), which
 * is why it is a reported finding here and not a footnote.
 *
 * USAGE
 *   node scripts/explain-token.mjs --card-border-color     one token, full trace
 *   node scripts/explain-token.mjs --card                  every token matching a prefix
 *   node scripts/explain-token.mjs --audit                 every FREEZE and every orphan
 *   node scripts/explain-token.mjs --json <name>           machine-readable, for a gate
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** Source of truth for what a CONSUMER can set: the published catalog, not the stylesheets. */
function publishedTokens() {
  try {
    const raw = JSON.parse(readFileSync(join(ROOT, "agent/tokens.json"), "utf8"));
    const list = Array.isArray(raw) ? raw : Object.values(raw).find(Array.isArray);
    return new Map(list.map((t) => [t.name, t.tier ?? "component"]));
  } catch {
    return new Map();
  }
}

function cssFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".css")) out.push(full);
    }
  };
  for (const dir of ["src/tokens", "src/styles"]) {
    try {
      walk(join(ROOT, dir));
    } catch {
      /* a tree that is not there is not an error here */
    }
  }
  return out.sort();
}

/**
 * Every `--x: value` declaration, with the selector it sits under and the layer that governs it.
 *
 * Comments are BLANKED rather than removed so byte offsets stay true — a `{`, `}` or `;` inside
 * prose otherwise desynchronises the brace walk and silently moves every selector after it. That
 * failure has a name in this repo: it is what `check-mcp-prop-sync` hit with `=>` (gh#857).
 */
function parse(file) {
  const text = readFileSync(file, "utf8");
  const blank = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const rel = relative(ROOT, file);
  const lineAt = (i) => text.slice(0, i).split("\n").length;

  const decls = [];
  const reads = [];
  const stack = [];
  let selStart = 0;

  for (let i = 0; i < blank.length; i += 1) {
    const ch = blank[i];
    if (ch === "{") {
      stack.push(blank.slice(selStart, i).trim().replace(/\s+/g, " "));
      selStart = i + 1;
    } else if (ch === "}") {
      stack.pop();
      selStart = i + 1;
    } else if (ch === ";") {
      selStart = i + 1;
    }
  }

  // Declarations: `--name: value;` — captured with their enclosing selector chain.
  const declRe = /(--[a-z0-9-]+)\s*:\s*([^;}]+)[;}]/gi;
  for (const m of blank.matchAll(declRe)) {
    const line = lineAt(m.index);
    const value = text.slice(m.index + m[1].length, m.index + m[0].length).replace(/^\s*:\s*/, "");
    decls.push({
      file: rel,
      line,
      name: m[1],
      value: value
        .replace(/[;}]\s*$/, "")
        .trim()
        .replace(/\s+/g, " "),
      context: contextAt(blank, m.index),
    });
  }

  // Reads: `var(--name` anywhere, including inside another declaration's value.
  for (const m of blank.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    reads.push({
      file: rel,
      line: lineAt(m.index),
      name: m[1],
      context: contextAt(blank, m.index),
      hasFallback: text
        .slice(m.index, m.index + 400)
        .replace(/\s+/g, " ")
        .includes(`${m[1]},`),
    });
  }
  return { decls, reads };
}

/** The selector chain enclosing a byte offset, outermost first. */
function contextAt(blank, at) {
  const chain = [];
  let depth = 0;
  let selStart = 0;
  for (let i = 0; i < at; i += 1) {
    const ch = blank[i];
    if (ch === "{") {
      chain.push({ depth, sel: blank.slice(selStart, i).trim().replace(/\s+/g, " ") });
      depth += 1;
      selStart = i + 1;
    } else if (ch === "}") {
      depth -= 1;
      while (chain.length && chain[chain.length - 1].depth >= depth) chain.pop();
      selStart = i + 1;
    } else if (ch === ";" && depth >= 0) {
      selStart = i + 1;
    }
  }
  return chain.map((c) => c.sel).filter(Boolean);
}

/**
 * IS THIS DECLARATION ON THE ROOT ELEMENT? — the one thing here that is mechanically decidable,
 * and the only thing the freeze test needs.
 *
 * An earlier version of this file ranked every selector into four "cascade" buckets by regex and
 * printed them "strongest last". Codex took it apart and was right: `@theme inline` and
 * `[dir="rtl"] .ui-actions[data-fade-in-inline]` both scored TOP precedence because their text
 * contains the substring `inline`; `:root[data-brand="crm"]` scored "descendant scope" although it
 * matches only the root; `[data-slot="card"][data-density="tight"]` — a declaration on the
 * component itself — scored "ambient scope". And "strongest last" sorted by ALPHABETICAL FILE
 * ORDER, not import order, so the ordering was decoration.
 *
 * A tool meant to settle override disputes that manufactures precedence from substrings is worse
 * than no tool: it sends the reader to the wrong fix with confidence. So the ranking is gone. This
 * prints WHERE a token is declared and read, and computes only the one property it can prove.
 */
function isRootOnly(context) {
  if (!context.length) return false;
  return context.every((sel) =>
    sel
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .every((s) =>
        // `:root`, `:root[data-theme="dark"]`, `html` — matches the root element and nothing
        // below it. A descendant combinator, or any selector that can match an element deeper in
        // the tree, is NOT root-only.
        /^(:root|html)(\[[^\]]*\]|:[a-z-]+(\([^)]*\))?)*$/.test(s),
      ),
  );
}

/**
 * Every token some declaration BELOW the root can move.
 *
 * Deliberately wider than "a theme scope": `.ui-page-container` inside `@media (max-width: 720px)`
 * restates `--space-section-active` (src/styles/layout.css:992), and `--card-space-inset` binds it
 * at `:root` (src/tokens/components/card.css:6) — so below 720px a Card keeps the root's inset. The
 * previous version missed that because it only accepted selectors that LOOKED like theme scopes.
 * Anything not root-only counts now.
 */
function scopedTokenNames(decls) {
  return new Set(decls.filter((d) => !isRootOnly(d.context)).map((d) => d.name));
}

function collect() {
  const decls = [];
  const reads = [];
  for (const f of cssFiles()) {
    const r = parse(f);
    decls.push(...r.decls);
    reads.push(...r.reads);
  }
  return { decls, reads };
}

/**
 * A `:root` binding that a scope below root cannot reach.
 *
 * The naive test — "a `:root` declaration whose value contains `var()`" — reports 1028 sites here,
 * and a finding list that long is one nobody reads. Most are harmless: `--actions-gap:
 * var(--space-1)` freezes against a `--space-1` that no scope ever redeclares, so freezing it
 * changes nothing that could ever have differed.
 *
 * The binding only COSTS something when the token it reads is itself restated somewhere below
 * root — a `.dark` block, a `[data-tenant]`, a density or scale scope. Then the scope moves the
 * source and the binding keeps the root's answer, which is the defect this repo has paid for
 * seven times. So the signal is the INTERSECTION, and `scopedNames` is derived from the
 * stylesheets on every run rather than hand-listed: a hand-kept list is what went blind in gh#854.
 */
function isFrozen(d, scopedNames) {
  if (!isRootOnly(d.context)) return false;
  if (d.value.trim() === "initial") return false;
  const reads = [...d.value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]);
  return reads.some((r) => scopedNames.has(r));
}

function trace(name, { decls, reads }, published, scopedNames) {
  const mine = decls.filter((d) => d.name === name);
  const myReads = reads.filter((r) => r.name === name);
  const tier = published.get(name);

  console.log(`\n${name}`);
  console.log(
    `  published: ${tier ? `yes (${tier} tier)` : "NO — not in agent/tokens.json, so a consumer cannot discover it"}`,
  );

  if (!mine.length) {
    console.log("  declared:  nowhere — every read falls to its inline fallback, or to nothing");
  } else {
    console.log(
      `  declared:  ${mine.length} site(s) — DECLARATION SITES, not a cascade ranking; which one`,
    );
    console.log(
      "             wins at a given element depends on the DOM, and is not computed here.",
    );
    for (const d of mine.sort(
      (a, b) => Number(isRootOnly(b.context)) - Number(isRootOnly(a.context)),
    )) {
      const frozen = isFrozen(d, scopedNames)
        ? "  ← FREEZE: binds at :root against a token a scope below DOES restate"
        : "";
      console.log(
        `    ${isRootOnly(d.context) ? "root-only " : "below root"}  ${d.file}:${d.line}`,
      );
      console.log(`         ${d.context.join(" ") || ":root"} { ${name}: ${d.value} }${frozen}`);
    }
  }

  console.log(`  read by:   ${myReads.length} site(s)`);
  for (const r of myReads.slice(0, 12)) {
    console.log(
      `    ${r.file}:${r.line}  ${r.context.join(" ") || "(top level)"}${r.hasFallback ? "  [has a call-site fallback]" : "  [NO fallback — undeclared means unset]"}`,
    );
  }
  if (myReads.length > 12) console.log(`    … and ${myReads.length - 12} more`);
  return { name, tier, decls: mine, reads: myReads };
}

function audit({ decls, reads }, published) {
  const scopedNames = scopedTokenNames(decls);
  const frozen = decls.filter((d) => isFrozen(d, scopedNames));
  const declaredNames = new Set(decls.map((d) => d.name));
  const orphanReads = reads.filter((r) => !declaredNames.has(r.name) && !r.hasFallback);
  const unpublished = [...declaredNames].filter((n) => !published.has(n));

  console.log(
    `\nFROZEN — a :root binding whose SOURCE a scope below root restates (${frozen.length})`,
  );
  console.log(
    `  ${scopedNames.size} token(s) are restated in some scope. A :root binding that reads one of`,
  );
  console.log("  them keeps the root's answer, so step 2 of the chain is dead for that token.");
  for (const d of frozen.slice(0, 40)) {
    console.log(`  ${d.file}:${d.line}  ${d.name}: ${d.value}`);
  }
  if (frozen.length > 40) console.log(`  … and ${frozen.length - 40} more`);

  console.log(
    `\nORPHAN READS — var(--x) with no declaration and no fallback (${orphanReads.length})`,
  );
  for (const r of orphanReads.slice(0, 20)) console.log(`  ${r.file}:${r.line}  ${r.name}`);
  if (orphanReads.length > 20) console.log(`  … and ${orphanReads.length - 20} more`);

  console.log(
    `\nUNPUBLISHED — declared in CSS but absent from agent/tokens.json (${unpublished.length})`,
  );
  console.log("  A consumer cannot discover these, so they are not part of the theme API.");
  for (const n of unpublished.slice(0, 20)) console.log(`  ${n}`);
  if (unpublished.length > 20) console.log(`  … and ${unpublished.length - 20} more`);

  console.log("\nWHAT THIS CANNOT SEE — do not read a clean run as proof of no freeze:");
  console.log(
    "  1. CONSUMER CSS. Only src/tokens and src/styles are scanned, so a token this package never",
  );
  console.log(
    "     restates below root looks safe. `--shadow-md` binds `--shadow-color` at :root; a",
  );
  console.log(
    "     consumer's `[data-tenant] { --shadow-color: … }` cannot recolour it, and nothing here says so.",
  );
  console.log("  2. `@supports` FALLBACKS. src/tokens/derived.css gives engines without relative");
  console.log(
    "     colour LITERAL hover/active values, so a tenant seed stops propagating — a lost derivation,",
  );
  console.log("     not a var() freeze, and invisible to a test that requires a var() reference.");
  console.log(
    "  3. CONDITIONS ARE NOT EVALUATED. A declaration inside @media/@container is counted as if it",
  );
  console.log(
    "     always applies. That widens the scoped set deliberately, but it is not the cascade.",
  );
  console.log(
    "  4. NO WINNER IS COMPUTED. Which declaration applies at an element depends on the DOM.",
  );

  console.log(
    `\nsummary: ${declaredNames.size} declared · ${published.size} published · ${frozen.length} frozen · ${orphanReads.length} orphan read(s)`,
  );
  return {
    frozen: frozen.length,
    orphanReads: orphanReads.length,
    unpublished: unpublished.length,
  };
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const query = args.filter((a) => a !== "--json" && a !== "--audit")[0];
const model = collect();
const published = publishedTokens();

if (args.includes("--audit") || !query) {
  if (!query && !args.includes("--audit")) {
    console.log("usage: node scripts/explain-token.mjs <--token-name|prefix|--audit> [--json]\n");
  }
  audit(model, published);
} else {
  const names = [...new Set(model.decls.map((d) => d.name))]
    .concat([...published.keys()])
    .filter((n, i, a) => a.indexOf(n) === i)
    .filter((n) => n === query || n.startsWith(query));
  if (!names.length) {
    console.log(`no token matches ${query}`);
    process.exit(1);
  }
  const scopedNames = scopedTokenNames(model.decls);
  const out = names
    .sort()
    .slice(0, 40)
    .map((n) => trace(n, model, published, scopedNames));
  if (asJson) console.log(JSON.stringify(out, null, 2));
  if (names.length > 40) console.log(`\n… ${names.length - 40} more match ${query}`);
}
