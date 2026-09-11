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
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
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
    `${prose.length} prose string(s) quote no blocked class as advice.`,
);
