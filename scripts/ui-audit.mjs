#!/usr/bin/env node
/**
 * godxjp-ui audit — the design system's own linter for consumer UI code.
 *
 * Enforces the UI-standardization rules that ship with @godxjp/ui
 * (see the app's .claude/skills/frontend-design/rules/ui-standardization.md):
 * use the design system, never hand-roll. Inspired by `@google/design.md lint`
 * — structured, agent-readable findings.
 *
 * Runs from the CONSUMER's repo root and scans its hand-written UI
 * (components / pages / layouts) — never the framework or generated code.
 *
 * Usage (from the consuming app):
 *   node packages/godx-ui/scripts/ui-audit.mjs                 # human report; exit 1 on error
 *   node packages/godx-ui/scripts/ui-audit.mjs --format json
 *   node packages/godx-ui/scripts/ui-audit.mjs --quiet         # errors only
 *   node packages/godx-ui/scripts/ui-audit.mjs src/ui lib/     # custom scan dirs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CWD = process.cwd();
const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const quiet = args.includes("--quiet");
const dirArgs = args.filter((a) => !a.startsWith("--") && a !== "json");
const SCAN_DIRS = dirArgs.length
  ? dirArgs
  : ["resources/js/components", "resources/js/pages", "resources/js/layouts"];

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone";

/** @type {{id:string, severity:'error'|'warn', test:RegExp, message:string}[]} */
const RULES = [
  {
    id: "no-space-xy",
    severity: "error",
    test: /\bspace-[xy]-\d/,
    message: "Use <Stack>/<Inline> with gap, not space-x/y-* (rules §5).",
  },
  {
    id: "no-raw-palette-color",
    severity: "error",
    test: new RegExp(
      `\\b(bg|text|border|ring|fill|stroke|from|to|via|divide|outline)-(${PALETTE})-\\d`,
    ),
    message:
      "Use semantic tokens (bg-primary, text-muted-foreground…), not raw palette colors (rules §4).",
  },
  {
    id: "no-arbitrary-hex",
    severity: "error",
    test: /(bg|text|border|ring|fill|stroke|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/,
    message: "No hardcoded hex colors in className; use design-system tokens (rules §4).",
  },
  {
    id: "no-raw-select",
    severity: "error",
    test: /<select[\s>]/,
    message: "Use <Select> from @godxjp/ui, not a raw <select> (rules §3).",
  },
  {
    id: "no-raw-table",
    severity: "error",
    test: /<table[\s>]/,
    message: "Use the <Table> family from @godxjp/ui, not a raw <table> (rules §3).",
  },
  {
    id: "no-raw-textarea",
    severity: "warn",
    test: /<textarea[\s>]/,
    message: "Use <Textarea> from @godxjp/ui, not a raw <textarea> (rules §3).",
  },
  {
    id: "no-raw-input",
    severity: "error",
    test: /<input[\s>]/,
    message: "Use <Input> from @godxjp/ui, not a raw <input> (rules §3).",
  },
  {
    id: "no-raw-button",
    severity: "error",
    test: /<button[\s>]/,
    message: "Use <Button> from @godxjp/ui, not a raw <button> (rules §3).",
  },
  {
    id: "card-manual-padding",
    severity: "error",
    test: /<Card\b[^>]*\bp-[1-9]/,
    message:
      "Don't hand-roll padding on <Card> (className='p-4'…) — wrap the body in <CardContent>. (p-0 for a full-bleed table is fine.)",
  },
  {
    id: "no-dark-color-override",
    severity: "warn",
    test: /\bdark:(bg|text|border|ring|fill|stroke)-/,
    message: "Don't add dark: color overrides — semantic tokens already adapt (rules §4).",
  },
  {
    id: "manual-field-error",
    severity: "warn",
    test: /<p[^>]*className="[^"]*text-(xs|sm)[^"]*text-destructive/,
    message:
      "Field errors should use <FormField error=…>, not a hand-rolled <p> (rules §1). OK only for checkbox/radio groups.",
  },
  {
    id: "manual-field-helper",
    severity: "warn",
    test: /<p[^>]*className="text-xs text-muted-foreground"/,
    message:
      "Field helper text should use <FormField helper=…>, not a hand-rolled <p> (rules §1). OK only for checkbox/radio groups.",
  },
  {
    id: "raw-white-black",
    severity: "warn",
    test: /\b(bg|text|border)-(white|black)\b/,
    message:
      "Prefer semantic tokens (text-primary-foreground, bg-background…) over raw white/black (rules §4).",
  },
];

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, acc);
    } else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      acc.push(full);
    }
  }
  return acc;
}

// Structural: a <Card> (without p-0) whose first child is body content rather than a Card
// sub-component sits FLUSH (no padding). Per-line regexes can't see across lines, so this is a
// whole-file pass. The body must be wrapped in <CardContent> (titles in <CardHeader>).
const CARD_FLUSH =
  /<Card(?![^>]*\bp-0\b)(?:\s[^>]*)?>\s*<(?!CardContent|CardHeader|CardCover|CardFooter|\/Card)/g;

const findings = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(CWD, dir))) {
    const rel = relative(CWD, file);
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        if (rule.test.test(line)) {
          findings.push({
            file: rel,
            line: i + 1,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
    });
    for (const match of content.matchAll(CARD_FLUSH)) {
      findings.push({
        file: rel,
        line: content.slice(0, match.index).split("\n").length,
        rule: "card-needs-content",
        severity: "error",
        message:
          "<Card> body content must be wrapped in <CardContent> (it has NO padding otherwise) — use <CardContent flush> only for a full-bleed table.",
        snippet: match[0].replace(/\s+/g, " ").slice(0, 120),
      });
    }
  }
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");

if (asJson) {
  process.stdout.write(
    JSON.stringify(
      { summary: { errors: errors.length, warnings: warnings.length }, findings },
      null,
      2,
    ) + "\n",
  );
} else {
  const C = {
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };
  const shown = quiet ? errors : findings;
  for (const f of shown) {
    const tag = f.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`;
    console.log(`${tag} ${C.bold}${f.file}:${f.line}${C.reset}  ${C.dim}[${f.rule}]${C.reset}`);
    console.log(`      ${f.message}`);
    console.log(`      ${C.dim}${f.snippet}${C.reset}`);
  }
  console.log(
    `\ngodxjp-ui audit: ${C.red}${errors.length} error(s)${C.reset}, ${C.yellow}${warnings.length} warning(s)${C.reset} across ${SCAN_DIRS.join(", ")}.`,
  );
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✓ No UI-standardization violations found.");
  }
}

process.exit(errors.length > 0 ? 1 : 0);
