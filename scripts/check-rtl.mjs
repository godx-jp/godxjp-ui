#!/usr/bin/env node
/**
 * check:rtl — guards the rtl-vocab cardinal rule: component CSS and JSX use
 * LOGICAL inline-axis properties (margin/padding/border-inline-*, inset-inline-*,
 * text-align: start/end) and logical Tailwind utilities (ms/me/ps/pe, start-/end-,
 * border-s/e, rounded-s/e, text-start/end) — never physical left/right.
 *
 * Escape hatch: append `rtl-ignore` in a comment on the same line for a genuinely
 * physical use (a rotated glyph edge, a 50%-centering idiom, etc.).
 *
 * Scope: src/styles/**.css (the layout/chrome CSS) and src/components/**.tsx
 * (excluding __tests__). Stories/examples/preview are not shipped chrome.
 */
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const IGNORE = /rtl-ignore/;

// ── CSS: physical inline-axis declarations ──────────────────────────────────
const CSS_RULES = [
  { re: /(?:^|[\s;{])(margin|padding)-(left|right)\s*:/, msg: "$1-$2 → $1-inline-{start|end}" },
  {
    re: /(?:^|[\s;{])border-(left|right)(-width|-color|-style)?\s*:/,
    msg: "border-$1 → border-inline-{start|end}",
  },
  { re: /(?:^|[\s;{])(left|right)\s*:/, msg: "$1 → inset-inline-{start|end}" },
  { re: /text-align\s*:\s*(left|right)\b/, msg: "text-align:$1 → start|end" },
  { re: /\bfloat\s*:\s*(left|right)\b/, msg: "float:$1 → inline-start|end" },
  { re: /\bclear\s*:\s*(left|right)\b/, msg: "clear:$1 → inline-start|end" },
];

// ── JSX: physical Tailwind utilities (as standalone class tokens) ───────────
const TW_RULES = [
  { re: /(?:^|[\s"'`{])-?ml-/, msg: "ml-* → ms-*" },
  { re: /(?:^|[\s"'`{])-?mr-/, msg: "mr-* → me-*" },
  { re: /(?:^|[\s"'`{])-?pl-/, msg: "pl-* → ps-*" },
  { re: /(?:^|[\s"'`{])-?pr-/, msg: "pr-* → pe-*" },
  { re: /(?:^|[\s"'`{])-?(left|right)-/, msg: "left-/right-* → start-/end-*" },
  { re: /(?:^|[\s"'`{])-?border-(l|r)(-|\b)/, msg: "border-l/r → border-s/e" },
  {
    re: /(?:^|[\s"'`{])-?rounded-(l|r|tl|tr|bl|br)(-|\b)/,
    msg: "rounded-l/r/tl.. → rounded-s/e/ss..",
  },
  { re: /(?:^|[\s"'`{])text-(left|right)\b/, msg: "text-left/right → text-start/end" },
  { re: /\bm[lr]-auto\b/, msg: "ml-auto/mr-auto → ms-auto/me-auto" },
];

const failures = [];

function scan(files, rules, kind) {
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // The escape hatch covers the line itself OR the line just above it, so a
      // prettier-wrapped value (key + `rtl-ignore` on one line, the long class
      // string on the next) is still honoured.
      if (IGNORE.test(line) || (i > 0 && IGNORE.test(lines[i - 1]))) return;
      // CSS: skip already-logical lines; JSX: skip pure comment lines for the
      // mr-auto advice etc. is still flagged so docs stay logical too.
      for (const { re, msg } of rules) {
        const m = re.exec(line);
        if (m) {
          const rendered = msg.replace(/\$(\d)/g, (_, n) => m[Number(n)] ?? "");
          failures.push(`${file}:${i + 1}  [${kind}] ${rendered.trim()}  —  ${line.trim()}`);
          break;
        }
      }
    });
  }
}

const cssFiles = globSync("src/styles/**/*.css");
const tsxFiles = globSync("src/components/**/*.tsx").filter((f) => !f.includes("__tests__"));

scan(cssFiles, CSS_RULES, "css");
scan(tsxFiles, TW_RULES, "jsx");

if (failures.length) {
  console.error(`✗ check:rtl — ${failures.length} physical inline-axis use(s) found:\n`);
  for (const f of failures) console.error("  " + f);
  console.error(
    "\nUse logical properties/utilities, or add `rtl-ignore` on the line for a genuine physical case.",
  );
  process.exit(1);
}
console.log(
  `✓ check:rtl — ${cssFiles.length} CSS + ${tsxFiles.length} JSX files use logical inline-axis only.`,
);
