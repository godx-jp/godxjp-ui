#!/usr/bin/env node
/**
 * check:catalog-snippets — the MCP catalog must not prescribe what `ui-audit` forbids.
 *
 * An agent copies a catalog snippet verbatim. When the snippet carries a utility the audit blocks
 * in a consumer, that agent ships audit errors while following the design system's own guidance —
 * and it has no way to tell, because the catalog is the thing it was told to trust.
 *
 * This is not hypothetical. The Avatar entry's capability-card recipe read
 * `<CardHeader className="flex flex-row items-center gap-3">` for a long time: two errors
 * (`no-utility-layout`, `no-utility-spacing`) in every consumer that copied it. Nothing caught it —
 * `check:doc-prop-existence` reads PROPS, `check:mcp-pattern-imports` reads IMPORTS, and neither
 * looks at classes.
 *
 * ## Two kinds of string, and only one of them is a program
 *
 * The first version of this script fed EVERY string literal that mentioned `className=` to
 * `ui-audit` at once, on one flattened line each. That reported 74 findings across 57 entries and
 * was left unwired, correctly, because most of those findings were not defects — and the shape of
 * the mistake is worth naming, because it is the same one this repo keeps paying for: it measured
 * the wrong thing and the number looked real.
 *
 *  - A CODE field (`example` on a component, `code` on a pattern) is a program. An agent pastes it.
 *    `ui-audit` is exactly the right instrument, and every finding in one is a defect.
 *  - Everything else — `tagline`, `description`, `usage`, `useCases`, `related`, `notes`, `body`,
 *    `fix` — is PROSE written for a reader, and prose in this catalog quotes code for one purpose:
 *    to contrast the wrong shape against the right one. Auditing it audits the WARNINGS. Of the 74
 *    original findings, 40 were in code fields and were real; the rest were sentences like
 *    "DON'T hand-roll `<div className="flex items-center justify-between border-b py-3">`", where
 *    the flagged class is the thing the sentence exists to forbid.
 *
 * So code fields get `ui-audit`, one file per snippet so a finding maps back to its own line. Prose
 * gets a different, narrower question, and it is the question that actually matters there:
 *
 *    **does this sentence RECOMMEND a class a consumer is not allowed to write?**
 *
 * Two things have to be true before that is a finding, and both are mechanical rather than a
 * judgement about English:
 *
 *  1. the quoted class value fails `ui-audit` on its own — `h-9 w-full` on a Skeleton and `h-64` on
 *     a ScrollArea are measurements of a SCREEN and a consumer may write them, while
 *     `w-auto p-0` and `flex items-center gap-2` are not; and
 *  2. the sentence does not mark it as the shape NOT to write.
 *
 * That is not a loophole, it is the check the prose needed. It is what catches the Calendar entry's
 * DO bullet — "set PopoverContent className='w-auto p-0'" — a real prescription of two
 * per-call-site constants, in a catalog whose own Popover bullet forbids exactly that. Marking an
 * anti-pattern is the author's job and the catalog already has a vocabulary for it; ANTI_PATTERN
 * below IS that vocabulary. Widening it is a decision about what the catalog means, not a way to
 * make this gate quiet — if a sentence has no way to say "not this", it is prescribing.
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "mcp/src/data");

/** The fields whose whole content is a program an agent pastes. */
const CODE_FIELDS = new Set(["example", "code"]);

/**
 * The catalog's own vocabulary for "this is the shape NOT to write".
 *
 * Every entry here is a phrase the catalog already uses, in English or Vietnamese. A sentence that
 * quotes a class and carries none of them is telling the reader to write it.
 */
const ANTI_PATTERN =
  /don't|don’t|\bnot\b|\bnever\b|instead\s+of|rather\s+than|hand-roll|hand-rolled|replace\s+classname|ui-audit\s+(?:blocks|rejects|forbids)|blocked\s+by\s+ui-audit|always\s+wrong|only\s+move\s+left|⛔|⚠️|sai|[Đđ]ừng|thay\s+cho/i;

/**
 * Generated output is not authored guidance. `component-tokens.generated.ts` is written by
 * `gen-component-tokens.mjs` from the token files' own comments; a finding there is a finding about
 * a CSS comment, and the place to fix it is the token file, which `check:token-tiers` already owns.
 */
const isGenerated = (file) => file.endsWith(".generated.ts");

/** Collect every string literal in the catalog with the field it belongs to and its owner. */
function collect() {
  const code = [];
  const prose = [];
  for (const entry of readdirSync(DATA_DIR)) {
    if (!entry.endsWith(".ts") || isGenerated(entry)) continue;
    const src = readFileSync(join(DATA_DIR, entry), "utf8");
    const sf = ts.createSourceFile(entry, src, ts.ScriptTarget.Latest, true);
    const walk = (node, field, owner) => {
      if (ts.isObjectLiteralExpression(node)) {
        const named = node.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) &&
            p.name.getText(sf) === "name" &&
            ts.isStringLiteral(p.initializer),
        );
        if (named) owner = named.initializer.text;
      }
      if (ts.isPropertyAssignment(node)) field = node.name.getText(sf).replace(/['"]/g, "");
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const text = node.text;
        if (text.includes("className=")) {
          const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
          const where = { file: `mcp/src/data/${entry}`, line, field: field ?? "(root)", owner };
          if (CODE_FIELDS.has(field)) code.push({ ...where, text });
          else prose.push({ ...where, text });
        }
      }
      ts.forEachChild(node, (child) => walk(child, field, owner));
    };
    walk(sf, null, null);
  }
  return { code, prose };
}

const { code, prose } = collect();
const failures = [];

/*
 * CODE FIELDS — one scratch file per snippet, never one shared file.
 *
 * The shared-file version joined every snippet onto ONE LINE each so the reporter could map a line
 * number back, which meant a multi-line recipe was audited as a single 4000-character line and the
 * context printed with each finding was the first 100 characters of an unrelated import block. A
 * file per snippet keeps the snippet's own line numbers, so a finding points at the line inside the
 * recipe that carries it.
 */
const dir = mkdtempSync(join(tmpdir(), "catalog-snippets-"));
try {
  for (const snippet of code) {
    const scratch = join(dir, "snippet.tsx");
    writeFileSync(scratch, `${snippet.text}\n`);
    let output = "";
    try {
      execFileSync(process.execPath, [join(ROOT, "scripts/ui-audit.mjs"), "--consumer", scratch], {
        encoding: "utf8",
      });
      continue;
    } catch (error) {
      output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    }
    const lines = snippet.text.split("\n");
    for (const line of output.split("\n")) {
      // Strip the reporter's ANSI colour runs. The escape is BUILT rather than written as a
      // literal, because a raw ESC inside a regex literal is an eslint `no-control-regex` error.
      const ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
      const match = line.replace(ansi, "").match(/snippet\.tsx:(\d+)\s+\[([a-z-]+)]/);
      if (!match) continue;
      const inSnippet = Number(match[1]);
      failures.push(
        `  ${snippet.file}:${snippet.line} · ${snippet.owner ?? "?"}.${snippet.field} ` +
          `[${match[2]}]\n      ${(lines[inSnippet - 1] ?? "").trim().slice(0, 120)}`,
      );
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

/*
 * PROSE FIELDS — a quoted class must be marked as something not to write.
 *
 * Split on sentence ends and blank lines so a bullet that says "DO X, DON'T hand-roll Y" is judged
 * as the two claims it makes rather than as one blob.
 */
const proseDir = mkdtempSync(join(tmpdir(), "catalog-prose-"));
try {
  for (const snippet of prose) {
    for (const chunk of snippet.text.split(/(?<=[.!?。」])\s+|\n{2,}/)) {
      if (!chunk.includes("className=")) continue;
      if (ANTI_PATTERN.test(chunk)) continue;
      for (const match of chunk.matchAll(/className=['"{`]*["']([^"']+)["']/g)) {
        const scratch = join(proseDir, "quoted.tsx");
        writeFileSync(scratch, `<div className="${match[1]}" />\n`);
        try {
          execFileSync(
            process.execPath,
            [join(ROOT, "scripts/ui-audit.mjs"), "--consumer", scratch],
            { encoding: "utf8" },
          );
          continue; // a class a consumer may legitimately write
        } catch {
          failures.push(
            `  ${snippet.file}:${snippet.line} · ${snippet.owner ?? "?"}.${snippet.field} ` +
              `[prose-prescribes-a-blocked-class]\n      className="${match[1]}"\n      ` +
              `${chunk.replace(/\n/g, " ").trim().slice(0, 130)}`,
          );
        }
      }
    }
  }
} finally {
  rmSync(proseDir, { recursive: true, force: true });
}

/*
 * PHASE 3 — COMPILE CHECK: does an `example` on a `components.ts` entry compile against the REAL
 * @godxjp/ui prop types, the way `get_component`'s reader would paste it?
 *
 * gh#889: Cascader/TreeSelect wrote `content:` where the real field is `children:`, and Transfer
 * wrote `value:` where the real field is `key:`. Phases 1-2 above never had a chance at these —
 * `collect()` only keeps a string that contains the literal substring `className=`, and none of
 * these three examples mention a class at all, so they were never handed to anything. Even the
 * ones that DO contain `className=` only ever went through `ui-audit`, which lints utility-class
 * usage; it has no notion of a prop TYPE and would not have flagged a renamed field either way.
 * There has never been a check in this repo that a catalog example actually compiles.
 *
 * This phase extracts every `example` field in components.ts (not `code` in patterns.ts — that is
 * a separate catalog surface with its own, often framework-specific, dependencies, and is out of
 * scope here), turns each into a standalone `.tsx` module, and runs one batched `tsc --noEmit`
 * over all of them with `@godxjp/ui` resolved to this checkout's OWN built `dist/` — the same
 * self-reference `typecheck:docs` already relies on. That means `pnpm build` must have run first;
 * a missing `dist/` fails loudly below rather than silently skipping the check.
 *
 * ## Two adjustments were required to make a plain `tsc` pass mean anything here
 *
 * 1. Most examples build their sample data as a top-level `const REGIONS = [...]` and pass it by
 *    reference (`options={REGIONS}`). TypeScript's excess-property check — the thing that would
 *    catch a stray `content:` key — only fires on an object/array LITERAL checked in place, not on
 *    a variable of inferred type. Reverting this fix and compiling the ORIGINAL text confirms it:
 *    Transfer's bug (`value:` where `key:` is REQUIRED) still failed as "Property 'key' is missing"
 *    because a required field is missing either way, and the one INLINE literal in the Cascader
 *    example (`fieldNames={{ ...content: "nodes" }}`) still failed too — but the two `REGIONS` /
 *    `accountTree` mismatches, the actual headline defect, produced NO diagnostic at all. So this
 *    phase textually inlines every top-level `const NAME = <array or object literal>` into the
 *    single JSX attribute that references it by that identifier (`prop={NAME}` → `prop={<literal>}`),
 *    which puts the literal back where TypeScript's excess-property check can see it. This is a
 *    mechanical, position-based text splice — it does not attempt to infer the prop's expected type.
 *
 * 2. An example is deliberately illustrative: it calls placeholder handlers (`run(key)`,
 *    `regenerate()`) and references free variables (`answer`, `vote`) that the catalog never
 *    declares, because a reader is expected to supply their own. A literal `tsc` pass would fail
 *    EVERY example on these, which would bury the three real defects in noise the gate cannot
 *    distinguish from a shape bug. So compilation runs twice: pass 1 collects every
 *    "Cannot find name 'X'" a snippet produces; for each X that names a real catalog component
 *    (looked up in this same file's own name→group table), pass 2 gets a REAL
 *    `import { X } from "@godxjp/ui/<group>"` prepended, so its actual prop types stay in the
 *    check; every other X gets `declare const X: any;` so it stops erroring without ever
 *    influencing a real component's type-checking. An import resolved this way that points at the
 *    wrong subpath, or a component whose prop shape is actually wrong, still fails pass 2 — only
 *    the identifier lookup itself is patched.
 *
 * This does not make every conceivable example provable. A snippet whose own free identifier
 * collides with a catalog component name in an unrelated sense, or one that needs a TYPE (not a
 * value) declared, is not specifically handled — none of the 162 current examples do this, and if
 * one starts to, it will show up here as a new, investigable failure rather than a silent skip.
 */
const EXAMPLES_FILE = "components.ts";
const componentSpecifier = new Map(); // component name -> import specifier

{
  const src = readFileSync(join(DATA_DIR, EXAMPLES_FILE), "utf8");
  const sf = ts.createSourceFile(EXAMPLES_FILE, src, ts.ScriptTarget.Latest, true);
  const visitEntry = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      let name;
      let group;
      let importPath;
      for (const p of node.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = p.name.getText(sf);
        if (key === "name" && ts.isStringLiteral(p.initializer)) name = p.initializer.text;
        if (key === "group" && ts.isStringLiteral(p.initializer)) group = p.initializer.text;
        if (key === "importPath" && ts.isStringLiteral(p.initializer))
          importPath = p.initializer.text;
      }
      if (name && group) componentSpecifier.set(name, importPath ?? `@godxjp/ui/${group}`);
    }
    ts.forEachChild(node, visitEntry);
  };
  visitEntry(sf);
}

/** Extract an `example` field's source text, however it was authored. */
function extractExampleText(initializer) {
  if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
    return initializer.text;
  }
  // `[ "line one", "line two" ].join("\n")` — the multi-line-array authoring style.
  if (
    ts.isCallExpression(initializer) &&
    ts.isPropertyAccessExpression(initializer.expression) &&
    initializer.expression.name.text === "join" &&
    ts.isArrayLiteralExpression(initializer.expression.expression)
  ) {
    const sep =
      initializer.arguments[0] && ts.isStringLiteral(initializer.arguments[0])
        ? initializer.arguments[0].text
        : "\n";
    const parts = initializer.expression.expression.elements.map((el) =>
      ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el) ? el.text : null,
    );
    if (parts.every((p) => p !== null)) return parts.join(sep);
  }
  return null;
}

/** Strip the vestigial `{\`...\`}` double-wrap a handful of examples carry. */
function unwrapTemplateShell(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{`") && trimmed.endsWith("`}")) return trimmed.slice(2, -2);
  return text;
}

/**
 * A catalog example often shows several bare top-level JSX statements — `<Card>...</Card>` with
 * no `const`/`function`/`return` wrapping it, sometimes several in a row as independent recipes,
 * sometimes one root whose own children just have blank lines between them for readability. None
 * of that has a terminating `;` (nothing does when JSX is the whole statement), and TSX's parser
 * treats two adjacent unterminated top-level JSX statements as ONE malformed expression ("JSX
 * expressions must have one parent element", TS2657) rather than two — reproduced with a two-line
 * minimal case. This is a parser fact, not a defect in the examples: a reader who copies ONE such
 * block into their own file never hits it.
 *
 * `findBareJsxRuns` finds every maximal run of such bare top-level JSX in the snippet (blanking out
 * strings/comments first, then a small tag-depth walk — real nesting, not indentation, is what
 * tells a still-open multi-line element like `<Flex>` (whose children may have blank lines between
 * them) apart from several independent single-line siblings that should be treated separately).
 *
 * Known gap: a `<Tag>` that is itself the initializer of a top-level `const`/`let` (JSX assigned
 * directly rather than returned from a function or held in `useState`) is excluded from being a
 * run's START (its `=` prefix fails the boundary check below), but its OWN nested children are not
 * separately re-walked to confirm they are excluded too. No current example in this file assigns
 * multi-element JSX to a bare top-level `const` this way — every example that does that either
 * returns it from a function or wraps a single self-closing element — so this has not produced a
 * false run in practice; if one is ever authored, it will surface here as a new failure to look at
 * rather than silently mis-splitting.
 */

/**
 * Blank out every string/template/comment character (keeping newlines, so line numbers survive) —
 * a hand-rolled scan rather than `ts.createScanner`, because driving the scanner's own template
 * mode through `reScanTemplateToken` after a `${...}` substitution proved unreliable (it desynced
 * on the PrefetchLink example's `` `/invoices/${invoice.id}` ``, swallowing everything up to the
 * NEXT unrelated backtick in the file as if it were one template). A `${...}` substitution's own
 * content is left UNMASKED — it is real code — with its own nested strings/templates handled the
 * same way, recursively.
 */
function maskStringsAndComments(text) {
  const n = text.length;
  const out = text.split("");
  const blank = (a, b) => {
    for (let k = a; k < b; k++) if (out[k] !== "\n") out[k] = " ";
  };

  function scanQuoted(start) {
    const quote = text[start];
    let i = start + 1;
    while (i < n) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i] === quote) {
        i++;
        break;
      }
      i++;
    }
    blank(start, i);
    return i;
  }

  function scanTemplate(start) {
    let i = start + 1;
    let segStart = start; // template-text run pending a blank, up to the next '${' or the close
    while (i < n) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i] === "`") {
        blank(segStart, i + 1);
        return i + 1;
      }
      if (text[i] === "$" && text[i + 1] === "{") {
        blank(segStart, i + 2);
        i += 2;
        let depth = 1;
        while (i < n && depth > 0) {
          if (text[i] === "`") {
            i = scanTemplate(i);
            continue;
          }
          if (text[i] === '"' || text[i] === "'") {
            i = scanQuoted(i);
            continue;
          }
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth === 0) break; // leave the '}' itself for the segStart blank below to cover
          i++;
        }
        segStart = i; // resume blanking template syntax from this '}' onward
        i++;
        continue;
      }
      i++;
    }
    blank(segStart, n);
    return n;
  }

  let i = 0;
  while (i < n) {
    if (text[i] === "/" && text[i + 1] === "/") {
      let j = i;
      while (j < n && text[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }
    if (text[i] === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const j = close === -1 ? n : close + 2;
      blank(i, j);
      i = j;
      continue;
    }
    if (text[i] === '"' || text[i] === "'") {
      i = scanQuoted(i);
      continue;
    }
    if (text[i] === "`") {
      i = scanTemplate(i);
      continue;
    }
    i++;
  }
  return out.join("");
}

/** The index of the '>' that closes the tag starting at `start` ('<'), respecting `{}` nesting. */
function findTagEnd(masked, start) {
  let j = start + 1;
  let braceDepth = 0;
  while (j < masked.length) {
    const c = masked[j];
    if (c === "{") braceDepth++;
    else if (c === "}") braceDepth--;
    else if (braceDepth === 0 && c === ">") return j;
    j++;
  }
  return masked.length - 1;
}

function lastNonSpaceChar(masked, beforeIndex) {
  let k = beforeIndex - 1;
  while (k >= 0 && /\s/.test(masked[k])) k--;
  return k >= 0 ? masked[k] : null;
}

const JSX_TAG_START = /[A-Za-z/>]/;

/**
 * Each group is a maximal chain of adjacent bare top-level JSX elements — `{ start, end, elementEnds }`
 * where `elementEnds` is the end offset of every individual element in the chain (a chain of one is
 * the common case: a single recipe with nothing next to it).
 */
function findBareJsxRuns(text) {
  const masked = maskStringsAndComments(text);
  const n = masked.length;
  const runs = [];
  let i = 0;
  let jsDepth = 0; // (), {}, [] depth OUTSIDE any run — a '<' here is someone's expression, not a statement
  let runStart = -1;
  let elementEnds = [];
  let tagDepth = 0; // JSX nesting depth INSIDE the run currently being accumulated

  while (i < n) {
    if (runStart === -1) {
      const c = masked[i];
      if (jsDepth === 0 && c === "<" && JSX_TAG_START.test(masked[i + 1] ?? "")) {
        const prev = lastNonSpaceChar(masked, i);
        if (prev === null || prev === ";" || prev === "}" || prev === ">") {
          runStart = i;
          elementEnds = [];
          tagDepth = 0;
          continue;
        }
      }
      if (c === "(" || c === "{" || c === "[") jsDepth++;
      else if (c === ")" || c === "}" || c === "]") jsDepth = Math.max(0, jsDepth - 1);
      i++;
      continue;
    }
    if (masked[i] === "<" && JSX_TAG_START.test(masked[i + 1] ?? "")) {
      const tagEnd = findTagEnd(masked, i);
      const tagText = masked.slice(i, tagEnd + 1);
      if (tagText.startsWith("</")) tagDepth--;
      else if (!tagText.endsWith("/>")) tagDepth++;
      i = tagEnd + 1;
      if (tagDepth <= 0) {
        tagDepth = 0;
        elementEnds.push(i);
        let k = i;
        while (k < n && /\s/.test(masked[k])) k++;
        if (masked[k] === "<" && JSX_TAG_START.test(masked[k + 1] ?? "")) continue; // a sibling follows — same run
        runs.push({ start: runStart, end: i, elementEnds });
        runStart = -1;
      }
      continue;
    }
    i++;
  }
  return runs;
}

/**
 * A JSX FRAGMENT's children are parsed as JSX TEXT, not JS — a plain `//` line there is not a
 * comment at all, just literal text, and this catalog's comments routinely mention a real tag
 * inline ("never reach for a raw `<ul>`", "the `<a>` IS the lockup"). Wrapped in `<>...</>`, the
 * parser reads that `<a>` as an actual unclosed element and the whole fragment cascades into
 * "no corresponding closing tag" — reproduced by isolating one such comment on its own. An ARRAY
 * keeps every element in a normal JS EXPRESSION position, where `//` is a real comment again, so
 * this phase inserts a `,` after each element in the chain and wraps the group as `void [ ... ];`.
 */
function isolateBareJsxParagraphs(text) {
  const runs = findBareJsxRuns(text);
  let out = text;
  for (const r of [...runs].sort((a, b) => b.start - a.start)) {
    let body = out.slice(r.start, r.end);
    for (const end of [...r.elementEnds].sort((a, b) => b - a)) {
      const at = end - r.start;
      body = `${body.slice(0, at)},${body.slice(at)}`;
    }
    out = `${out.slice(0, r.start)}void [\n${body}\n];${out.slice(r.end)}`;
  }
  return out;
}

const examples = [];
let unsupported = 0;
{
  const src = readFileSync(join(DATA_DIR, EXAMPLES_FILE), "utf8");
  const sf = ts.createSourceFile(EXAMPLES_FILE, src, ts.ScriptTarget.Latest, true);
  const walk = (node, owner) => {
    if (ts.isObjectLiteralExpression(node)) {
      const named = node.properties.find(
        (p) =>
          ts.isPropertyAssignment(p) &&
          p.name.getText(sf) === "name" &&
          ts.isStringLiteral(p.initializer),
      );
      if (named) owner = named.initializer.text;
    }
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(sf).replace(/['"]/g, "") === "example"
    ) {
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      const raw = extractExampleText(node.initializer);
      if (raw === null) unsupported++;
      else examples.push({ owner, line, text: isolateBareJsxParagraphs(unwrapTemplateShell(raw)) });
    }
    ts.forEachChild(node, (child) => walk(child, owner));
  };
  walk(sf, null);
}

/**
 * Inline every top-level `const NAME = <array|object literal>` into the single JSX attribute that
 * references it as a bare identifier (`prop={NAME}`), so TypeScript's excess-property check runs
 * on the literal the way it would if the example had written it inline.
 */
function inlineLiteralConsts(text) {
  let sf;
  try {
    sf = ts.createSourceFile("snippet.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  } catch {
    return text;
  }
  const literals = new Map(); // name -> source text of its literal initializer
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (
        ts.isIdentifier(decl.name) &&
        decl.initializer &&
        (ts.isArrayLiteralExpression(decl.initializer) || ts.isObjectLiteralExpression(decl.initializer))
      ) {
        literals.set(decl.name.text, decl.initializer.getText(sf));
      }
    }
  }
  if (literals.size === 0) return text;

  const replacements = []; // { start, end, text }
  const visit = (node) => {
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isIdentifier(node.expression) &&
      literals.has(node.expression.text)
    ) {
      replacements.push({
        start: node.expression.getStart(sf),
        end: node.expression.getEnd(),
        text: literals.get(node.expression.text),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (replacements.length === 0) return text;

  replacements.sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of replacements) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}

/**
 * Several examples show independent recipes back to back, each re-importing the same name from the
 * same module — deliberately self-contained, so a reader who copies ONE recipe never has to look
 * above it for an import (AppSettingPicker's example does this three times over). Concatenated into
 * one file for a real compile, a repeated `import { X } from "y"` is a duplicate declaration
 * (TS2300), which is a fact about compiling several recipes at once, not about the recipes
 * themselves — a reader who copies one block still gets exactly the import they need. This drops a
 * later `import { X }` once `X` from that same specifier has already been bound, and removes an
 * import statement entirely once every name in it has been dropped this way.
 */
function dedupeRepeatedImports(text) {
  let sf;
  try {
    sf = ts.createSourceFile("snippet.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  } catch {
    return text;
  }
  const seen = new Set(); // "specifier localName"
  const removals = []; // { start, end } — either one specifier or the whole declaration
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause?.namedBindings) continue;
    const bindings = stmt.importClause.namedBindings;
    if (!ts.isNamedImports(bindings)) continue; // skip `import * as X` — never seen duplicated here
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    const spec = stmt.moduleSpecifier.text;
    const dupes = [];
    for (const el of bindings.elements) {
      const key = `${spec} ${el.name.text}`;
      if (seen.has(key)) dupes.push(el);
      else seen.add(key);
    }
    if (dupes.length === 0) continue;
    if (dupes.length === bindings.elements.length) {
      removals.push({ start: stmt.getFullStart(), end: stmt.getEnd() });
    } else {
      for (const el of dupes) {
        const withComma = sf.text[el.getEnd()] === "," ? el.getEnd() + 1 : el.getEnd();
        removals.push({ start: el.getFullStart(), end: withComma });
      }
    }
  }
  if (removals.length === 0) return text;
  removals.sort((a, b) => b.start - a.start);
  let out = text;
  for (const r of removals) out = out.slice(0, r.start) + out.slice(r.end);
  return out;
}

const DIST_DIR = join(ROOT, "dist");
try {
  readFileSync(join(DIST_DIR, "components/data-entry/index.d.ts"));
} catch {
  console.error(
    "✗ check:catalog-snippets — dist/ is not built. The compile-check phase resolves " +
      "`@godxjp/ui/*` to this checkout's own dist (self-reference, same as typecheck:docs) — " +
      "run `pnpm build` first.",
  );
  process.exit(1);
}

const compileDir = join(ROOT, ".catalog-example-check");
rmSync(compileDir, { recursive: true, force: true });
mkdirSync(compileDir, { recursive: true });
try {
  writeFileSync(
    join(compileDir, "tsconfig.json"),
    JSON.stringify(
      {
        extends: "../tsconfig.json",
        include: ["*.tsx", "*.d.ts"],
        // A `declare const X: any;` placeholder (illustrative business data the example never
        // declares — `projects`, `entries`, an onClick handler) has no contextual type, so calling
        // `.map()` on it leaves the callback's OWN parameter with nothing to infer from. That is a
        // real `noImplicitAny` violation, but it is ABOUT THE PLACEHOLDER, never about whether a
        // real @godxjp/ui prop was shaped correctly — the thing this phase exists to check, and
        // which fires through entirely different diagnostics (TS2353/TS2322/TS2559/…) unaffected by
        // this flag. Turning off just this one strict sub-flag here stops that noise without
        // touching `pnpm typecheck`'s real strictness over `src/`.
        //
        // `paths: { "@/*": ["./src/*"] }` is inherited from the root config for THIS package's own
        // internal alias — but a catalog example that writes `@/api/invoices` means the READER'S
        // app alias, an illustrative import with nothing behind it here. Left mapped, TypeScript
        // tries to resolve it inside our own `src/` and fails before the external-module fallback
        // below ever gets a chance; clearing `paths` lets it fall through as a plain unresolved
        // specifier instead, same as `@inertiajs/react`.
        compilerOptions: { noImplicitAny: false, paths: {} },
      },
      null,
      2,
    ),
  );
  const slug = (s, i) => `${i}-${s.replace(/[^a-zA-Z0-9]/g, "") || "snippet"}.tsx`;
  const byFile = new Map(); // filename -> example
  examples.forEach((ex, i) => {
    const file = slug(ex.owner ?? "unknown", i);
    byFile.set(file, ex);
    let body = dedupeRepeatedImports(inlineLiteralConsts(ex.text));
    // Illustrative state names that are ALSO ambient globals in the "dom" lib this config needs for
    // real event types elsewhere: `open={open}` resolves to `window.open` (a function, not a
    // dialog's boolean) and a bare `value={name}` resolves to the global `name` (typed `void` here,
    // not a string) — both silently type-check against the WRONG thing instead of erroring, so the
    // usual "cannot find name" auto-import never fires. `declare const` shadows each one whenever
    // the snippet uses the bare word at all, the same tolerance every other placeholder gets.
    for (const globalName of ["open", "name"]) {
      if (new RegExp(`\\b${globalName}\\b`).test(body)) {
        body = `declare const ${globalName}: any;\n${body}`;
      }
    }
    writeFileSync(join(compileDir, file), body);
  });

  const tscBin = join(ROOT, "node_modules/typescript-7/bin/tsc");
  const parseDiagnostic = (line) => line.match(/^([^(]+\.tsx)\((\d+),\d+\): (error TS\d+: .+)$/);
  const runTsc = (includeFiles) => {
    writeFileSync(
      join(compileDir, "tsconfig.json"),
      JSON.stringify(
        {
          extends: "../tsconfig.json",
          include: [...includeFiles, "*.d.ts"],
          compilerOptions: { noImplicitAny: false, paths: {} },
        },
        null,
        2,
      ),
    );
    try {
      // Node's default `maxBuffer` (1 MB) truncates `error.stdout` — invisibly, catching only the
      // alphabetically-first diagnostics — the moment enough examples fail at once to exceed it
      // (reproduced by reverting every fix in this file at once: 100+ diagnostics silently became
      // 4). 64 MB is far past anything one run of 170-odd examples can produce.
      execFileSync(process.execPath, [tscBin, "--noEmit", "-p", join(compileDir, "tsconfig.json")], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      return "";
    } catch (error) {
      return `${error.stdout ?? ""}${error.stderr ?? ""}`;
    }
  };

  /*
   * A file with a FATAL parse error (an unbalanced JSX tag, an unclosed fragment — TS1xxx/TS17xxx)
   * can take the rest of a batched `tsc` run down with it: reverting every fix in this file to
   * reproduce the original three bugs, ONE separate pre-existing unclosed-tag defect in this same
   * batch (ListRow's, before its own fix) silently cut hundreds of real diagnostics across the
   * other 170 files down to four — proven by re-running with that one file excluded, which restored
   * every one of them. `tsc` gives no warning; the run just looks clean. So a full compile of this
   * scratch directory is never trusted in one shot: whenever the result contains a parse-fatal code,
   * the files that produced it are excluded and the rest are re-checked — repeated until a round
   * produces no new fatal file, so no single shattered example can hide a defect in another. This
   * protects BOTH passes: the first (which decides what each snippet needs patched) is exactly as
   * vulnerable as the second (the real result), and only reports diagnostics for a file once they
   * come from a run where THAT file itself was not the thing being excluded.
   */
  const PARSE_FATAL = /^error TS(1\d{3}|17\d{3}):/;
  function runTscComplete(fileList) {
    const byFileOut = new Map(); // filename -> message[]
    let remaining = [...fileList];
    for (let round = 0; round < 5 && remaining.length; round++) {
      const output = runTsc(remaining);
      const roundByFile = new Map();
      for (const line of output.split("\n")) {
        const match = parseDiagnostic(line);
        if (!match) continue;
        const [, filePath, , message] = match;
        const file = filePath.split(/[\\/]/).pop();
        if (!roundByFile.has(file)) roundByFile.set(file, []);
        roundByFile.get(file).push(message.trim());
      }
      const fatalNow = remaining.filter((f) => (roundByFile.get(f) ?? []).some((m) => PARSE_FATAL.test(m)));
      if (fatalNow.length === 0) {
        for (const f of remaining) byFileOut.set(f, roundByFile.get(f) ?? []);
        remaining = [];
      } else {
        for (const f of fatalNow) byFileOut.set(f, roundByFile.get(f) ?? []);
        remaining = remaining.filter((f) => !fatalNow.includes(f));
      }
    }
    for (const f of remaining) if (!byFileOut.has(f)) byFileOut.set(f, []); // safety net, should not hit
    return byFileOut;
  }

  // Pass 1: discover free identifiers each snippet needs patched (real import or `declare const`),
  // and any non-`@godxjp/ui` module it imports for illustration only (a consumer's own
  // `@/api/invoices`, or a peer library like `@inertiajs/react` this package never depends on).
  // A `@godxjp/ui/*` specifier that fails to resolve is NOT patched here — that is exactly the
  // "points at the wrong subpath" defect gh#864/878/879 are about, and pass 2 must still fail on it.
  const pass1ByFile = runTscComplete([...byFile.keys()]);
  const pass1 = [...pass1ByFile.entries()]
    .flatMap(([file, messages]) => messages.map((m) => `${file}(0,0): ${m}`))
    .join("\n");
  const missingByFile = new Map(); // filename -> Set<name>
  const externalModulesByFile = new Map(); // filename -> Set<specifier>
  for (const line of pass1.split("\n")) {
    const nameMatch =
      line.match(/^([^(]+\.tsx)\(\d+,\d+\): error TS2304: Cannot find name '([^']+)'/) ??
      line.match(/^([^(]+\.tsx)\(\d+,\d+\): error TS2552: Cannot find name '([^']+)'/) ??
      // "'React' refers to a UMD global, but the current file is a module" — an example that calls
      // `React.useState(...)` etc. without its own `import * as React from "react"`, relying on the
      // ambient UMD global a plain <script> consumer would have and a module never does.
      line.match(/^([^(]+\.tsx)\(\d+,\d+\): error TS2686: '([^']+)' refers to a UMD global/);
    if (nameMatch) {
      const [, filePath, name] = nameMatch;
      const file = filePath.split(/[\\/]/).pop();
      if (!missingByFile.has(file)) missingByFile.set(file, new Set());
      missingByFile.get(file).add(name);
      continue;
    }
    const moduleMatch = line.match(
      /^([^(]+\.tsx)\(\d+,\d+\): error TS2307: Cannot find module '([^']+)'/,
    );
    if (moduleMatch) {
      const [, filePath, specifier] = moduleMatch;
      if (specifier.startsWith("@godxjp/ui")) continue; // a real defect — must still fail pass 2
      const file = filePath.split(/[\\/]/).pop();
      if (!externalModulesByFile.has(file)) externalModulesByFile.set(file, new Set());
      externalModulesByFile.get(file).add(specifier);
    }
  }
  // A `declare module "spec";` INSIDE one of the snippet files fails as TS2664 "invalid module
  // name in augmentation" — a file with real imports is a MODULE, and `declare module` there always
  // augments an EXISTING module rather than creating one. A single shared `.d.ts` alongside them has
  // no imports of its own (a global script, not a module), so the exact same bare declaration there
  // mints a genuinely new, fully permissive ambient module instead — verified against both a default
  // and a named import from the same stub.
  const allExternalSpecifiers = new Set([...externalModulesByFile.values()].flatMap((s) => [...s]));
  if (allExternalSpecifiers.size) {
    writeFileSync(
      join(compileDir, "ambient.d.ts"),
      [...allExternalSpecifiers].map((spec) => `declare module "${spec}";`).join("\n") + "\n",
    );
  }

  const patchedFiles = new Set([...missingByFile.keys(), ...externalModulesByFile.keys()]);
  for (const file of patchedFiles) {
    const names = missingByFile.get(file) ?? new Set();
    const importsByModule = new Map(); // specifier -> Set<name>
    const declares = [];
    const extraImports = [];
    for (const name of names) {
      if (name === "React") {
        // esModuleInterop lets `import React from "react"` synthesize the default the UMD global
        // stands in for — the named-import form below is for real @godxjp/ui named exports only.
        extraImports.push('import React from "react";');
        continue;
      }
      const specifier = componentSpecifier.get(name);
      if (specifier) {
        if (!importsByModule.has(specifier)) importsByModule.set(specifier, new Set());
        importsByModule.get(specifier).add(name);
      } else {
        declares.push(`declare const ${name}: any;\ntype ${name} = any;`);
      }
    }
    const header =
      extraImports.join("\n") +
      (extraImports.length ? "\n" : "") +
      [...importsByModule.entries()]
        .map(([spec, names2]) => `import { ${[...names2].join(", ")} } from "${spec}";`)
        .join("\n") +
      (declares.length ? `\n${declares.join("\n")}\n` : "\n");
    const original = readFileSync(join(compileDir, file), "utf8");
    writeFileSync(join(compileDir, file), `${header}\n${original}`);
  }

  // Pass 2: the real result — every remaining diagnostic is either a genuine shape defect or an
  // unresolved `@godxjp/ui` import (also a real defect: the example points at the wrong subpath).
  const compileFailuresByFile = runTscComplete([...byFile.keys()]);
  for (const [file, messages] of compileFailuresByFile) {
    const ex = byFile.get(file);
    if (!ex) continue; // a diagnostic about the shared tsconfig/global scope, not one snippet
    for (const message of messages) {
      failures.push(
        `  mcp/src/data/${EXAMPLES_FILE}:${ex.line} · ${ex.owner ?? "?"}.example [does-not-compile]\n` +
          `      ${message}`,
      );
    }
  }
} finally {
  if (!process.env.KEEP_SCRATCH) rmSync(compileDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`✗ check:catalog-snippets — ${failures.length} finding(s).\n`);
  for (const failure of failures) console.error(failure);
  console.error(
    "\nA code field must pass ui-audit the way a consumer's page does: layout via <Flex>/" +
      "<ResponsiveGrid>,\nspacing via props, surfaces via Card/Badge/ListRow, colour via tones.\n" +
      "A prose field may RECOMMEND a class a consumer is allowed to write, and may QUOTE a blocked" +
      " one\nonly to warn about it — say so in words, the way the rest of the catalog does.",
  );
  process.exit(1);
}

console.log(
  `✓ check:catalog-snippets — ${code.length} code snippet(s) pass ui-audit as a consumer; ` +
    `${prose.length} prose string(s) quote no blocked class as advice; ` +
    `${examples.length} example(s) in ${EXAMPLES_FILE} compile against the real prop types` +
    `${unsupported ? ` (${unsupported} skipped — unsupported authoring shape)` : ""}.`,
);
