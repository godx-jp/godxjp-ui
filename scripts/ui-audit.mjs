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
    id: "status-tone-not-variant",
    severity: "error",
    // Only the tone-driven status components (Badge/Tag/StatCard) are wrong here — they expose a
    // `tone` prop and reserve `variant` for STRUCTURE (default|secondary|outline). Button, Alert,
    // DropdownMenuItem, ContextMenuItem, AlertDialog etc. legitimately use `variant` for emphasis,
    // so they must NOT be flagged.
    test: /<(?:Badge|Tag|StatCard)\b[^>]*\bvariant=["'](?:success|warning|destructive|info|neutral)["']/,
    message:
      "Badge/Tag/StatCard status uses tone, not variant (variant is structural: default|secondary|outline). Use tone='success|warning|destructive|info|neutral'.",
  },
  {
    id: "no-domain-tracking-token",
    severity: "error",
    test: /--(?:color-)?tracking-|--(?:tracking|color-tracking)-(?:internal|seller|yamato)/,
    message:
      "Package tracking/domain tokens are forbidden. Use semantic tokens or app-local theme overrides.",
  },
  {
    id: "value-callback-on-value-change",
    severity: "error",
    test: /<(?:Checkbox\.Group|Upload|Cascader|TreeSelect|Transfer|SearchSelect|DatePicker|DateRangePicker|TimePicker|ColorPicker|LocalePicker|TimezonePicker|DateFormatPicker|TimeFormatPicker)\b[^>]*\bonChange=/,
    message:
      "Abstract value components use onValueChange, not onChange. Reserve onChange for DOM events.",
  },
  {
    id: "no-arbitrary-hex",
    severity: "error",
    test: /(bg|text|border|ring|fill|stroke|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/,
    message: "No hardcoded hex colors in className; use design-system tokens (rules §4).",
  },
  // Arbitrary RAW-NUMERIC Tailwind values — the #1 source of "every agent does it
  // differently". Match `<util>-[<digit/.>...]` only; `var(--token)` / `calc()` escape
  // (they start with a letter), so token-driven values stay legal (rules §4–§5).
  {
    id: "no-arbitrary-spacing",
    severity: "error",
    test: /\b(p|px|py|pt|pb|pl|pr|pe|ps|m|mx|my|mt|mb|ml|mr|me|ms|gap|gap-x|gap-y|inset|inset-x|inset-y|top|right|bottom|left)-\[-?\.?\d/,
    message:
      "No arbitrary spacing (p-[13px], gap-[7px]…). Use the token scale / <Stack gap> / <Inline gap> / <PageContainer> (rules §5).",
  },
  {
    id: "no-arbitrary-size",
    severity: "error",
    // `min-w-[…]` / `min-h-[…]` are allowed: a MINIMUM dimension is the legit responsive
    // pattern (horizontal-scroll tables `<Table className="min-w-[720px]">`, collapse
    // guards), not a hardcoded design size. The (?<!min-) lookbehind exempts the `min-`
    // prefix; bare `w`/`h` still catch `max-w-[…]`, `w-[37px]`, `h-[260px]`, etc.
    test: /\b(?<!min-)(?:w|h|size|basis)-\[-?\.?\d/,
    message:
      "No arbitrary width/height (w-[37px], max-w-[65ch], h-[260px]…). Use token sizes or a sizing prop. min-w-[…]/min-h-[…] are allowed (responsive scroll containers / collapse guards).",
  },
  {
    id: "no-arbitrary-typography",
    severity: "error",
    test: /\b(text|leading|tracking|font)-\[-?\.?\d/,
    message:
      "No arbitrary type (text-[20px], leading-[1.7], font-[600]…). Use the type-scale tokens (text-xs…text-3xl) (rules §4).",
  },
  {
    id: "no-arbitrary-radius",
    severity: "error",
    test: /\brounded(?:-[a-z]+)?-\[-?\.?\d/,
    message: "No arbitrary radius (rounded-[6px]…). Use rounded-sm/md/lg radius tokens (rules §4).",
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

/**
 * Blank out `//` line comments and block comments (incl. JSDoc) — replacing them with spaces and
 * preserving newlines so line numbers stay accurate — while KEEPING string/template literals (the
 * className values we actually want to scan). Prevents false positives like a doc-comment that
 * literally says "Never a raw <input>".
 */
function stripComments(src) {
  let out = "";
  let state = "code"; // code | line | block | string
  let quote = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (state === "code") {
      if (c === "/" && n === "/") {
        state = "line";
        out += "  ";
        i++;
      } else if (c === "/" && n === "*") {
        state = "block";
        out += "  ";
        i++;
      } else if (c === '"' || c === "'" || c === "`") {
        state = "string";
        quote = c;
        out += c;
      } else {
        out += c;
      }
    } else if (state === "line") {
      if (c === "\n") {
        state = "code";
        out += c;
      } else out += " ";
    } else if (state === "block") {
      if (c === "*" && n === "/") {
        state = "code";
        out += "  ";
        i++;
      } else out += c === "\n" ? "\n" : " ";
    } else {
      // string
      out += c;
      if (c === "\\") {
        out += src[i + 1] ?? "";
        i++;
      } else if (c === quote) state = "code";
    }
  }
  return out;
}

/** A finding is suppressed by `ui-audit-disable-line <rule>` on the same line, or
 *  `ui-audit-disable-next-line <rule>` on the line above (explicit rule id required). */
function isSuppressed(ruleId, sameLine, prevLine) {
  const onSame = new RegExp(`ui-audit-disable-line\\b[^\\n]*\\b${ruleId}\\b`).test(sameLine ?? "");
  const onPrev = new RegExp(`ui-audit-disable-next-line\\b[^\\n]*\\b${ruleId}\\b`).test(
    prevLine ?? "",
  );
  return onSame || onPrev;
}

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
    const origLines = content.split("\n");
    const scanContent = stripComments(content); // comments blanked; strings + line numbers kept
    const scanLines = scanContent.split("\n");
    scanLines.forEach((line, i) => {
      for (const rule of RULES) {
        if (rule.test.test(line) && !isSuppressed(rule.id, origLines[i], origLines[i - 1])) {
          findings.push({
            file: rel,
            line: i + 1,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
            snippet: (origLines[i] ?? line).trim().slice(0, 120),
          });
        }
      }
    });
    for (const match of scanContent.matchAll(CARD_FLUSH)) {
      const lineNo = scanContent.slice(0, match.index).split("\n").length;
      if (isSuppressed("card-needs-content", origLines[lineNo - 1], origLines[lineNo - 2]))
        continue;
      findings.push({
        file: rel,
        line: lineNo,
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
