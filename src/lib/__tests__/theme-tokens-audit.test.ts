import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const componentsRoot = join(dirname(fileURLToPath(import.meta.url)), "../../components");
const srcRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** Raw Tailwind palette in components breaks theme axes — use semantic tokens instead. */
const FORBIDDEN_PALETTE = [
  /\bbg-green-/,
  /\bbg-blue-/,
  /\bbg-amber-/,
  /\bbg-red-\d/,
  /\btext-green-/,
  /\btext-blue-/,
  /\btext-amber-/,
  /\bborder-green-/,
  /\bborder-blue-/,
  /\bborder-amber-/,
];

/** Fixed control heights bypass --control-height density axis. */
const FORBIDDEN_CONTROL_HEIGHT = [
  /\bh-8\b/,
  /\bh-9\b/,
  /\bh-10\b/,
  /\bh-11\b/,
  /\bh-12\b/,
  /\bsize-7\b/,
  /\bsize-8\b/,
  /\bsize-9\b/,
];

/** Legacy date formatting — must use formatDate. */
const FORBIDDEN_DATE_FORMAT = [
  /from ["']date-fns["']/,
  /\.toLocaleString\s*\(/,
  /\.toLocaleDateString\s*\(/,
];

const SKIP_CONTROL_HEIGHT_DIRS = new Set(["feedback/skeleton.tsx"]);

const INTERACTIVE_MUST_USE_CONTROL_STYLES = [
  "data-entry/select.tsx",
  "data-entry/textarea.tsx",
  "data-entry/command.tsx",
  "data-display/table.tsx",
  "data-display/data-table.tsx",
];

const RTL_LOGICAL_PRIMITIVES = [
  "data-entry/select.tsx",
  "navigation/dropdown-menu.tsx",
  "feedback/sheet.tsx",
];

const FORBIDDEN_RTL_PHYSICAL_SNIPPETS = [
  "absolute left-",
  "absolute right-",
  " pl-",
  " pr-",
  " ml-auto",
  " mr-auto",
  "data-[inset=true]:pl-",
];

function listTsxFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      files.push(...listTsxFiles(full));
    } else if (entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

function findAllViolations(patterns: RegExp[], content: string): string[] {
  const hits: string[] = [];
  for (const pattern of patterns) {
    const matches = content.match(new RegExp(pattern.source, "g"));
    if (matches) hits.push(...matches);
  }
  return [...new Set(hits)];
}

describe("theme token audit (components)", () => {
  const files = listTsxFiles(componentsRoot);

  it("does not use raw palette colors in any component file", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = relative(componentsRoot, file);
      const content = readFileSync(file, "utf8");
      const hits = findAllViolations(FORBIDDEN_PALETTE, content);
      if (hits.length > 0) offenders.push(`${rel}: ${hits.join(", ")}`);
    }
    expect(offenders, "Use semantic tokens (primary, success, warning, info, accent)").toEqual([]);
  });

  it("does not hardcode control heights in interactive components", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = relative(componentsRoot, file);
      if (SKIP_CONTROL_HEIGHT_DIRS.has(rel)) continue;
      const content = readFileSync(file, "utf8");
      const hits = findAllViolations(FORBIDDEN_CONTROL_HEIGHT, content);
      if (hits.length > 0) offenders.push(`${rel}: ${hits.join(", ")}`);
    }
    expect(offenders, "Use var(--control-height) via control-styles.ts").toEqual([]);
  });

  it("interactive primitives import control-styles", () => {
    const missing: string[] = [];
    for (const rel of INTERACTIVE_MUST_USE_CONTROL_STYLES) {
      const content = readFileSync(join(componentsRoot, rel), "utf8");
      if (!content.includes("control-styles")) missing.push(rel);
    }
    expect(missing, "Must import shared control-styles").toEqual([]);
  });

  it("components do not call toLocaleString for display dates", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = relative(componentsRoot, file);
      const content = readFileSync(file, "utf8");
      const hits = findAllViolations(FORBIDDEN_DATE_FORMAT, content);
      if (hits.length > 0) offenders.push(`${rel}: ${hits.join(", ")}`);
    }
    expect(offenders, "Use formatDate from @/lib/datetime").toEqual([]);
  });

  it("shadcn primitive chrome uses logical direction utilities", () => {
    const offenders: string[] = [];
    for (const rel of RTL_LOGICAL_PRIMITIVES) {
      const content = readFileSync(join(componentsRoot, rel), "utf8");
      const hits = FORBIDDEN_RTL_PHYSICAL_SNIPPETS.filter((snippet) => content.includes(snippet));
      if (hits.length > 0) offenders.push(`${rel}: ${hits.join(", ")}`);
    }
    expect(offenders, "Use start/end, ps/pe, ms/me for RTL-safe primitive chrome").toEqual([]);
  });

  it("dialog close offset uses logical CSS", () => {
    const content = readFileSync(join(srcRoot, "styles/dialog-layout.css"), "utf8");
    expect(content).toContain("inset-inline-end: var(--space-dialog-close-offset)");
    expect(content).not.toContain("right: var(--space-dialog-close-offset)");
  });
});

describe("theme token audit (lib/datetime)", () => {
  it("format-date module exists and exports formatDate", () => {
    const index = readFileSync(join(srcRoot, "lib/datetime/index.ts"), "utf8");
    expect(index).toContain("formatDate");
  });
});

describe("theme token audit (badge/status)", () => {
  it("status-badge uses tone classes from control-styles", () => {
    const content = readFileSync(join(componentsRoot, "data-display/status-badge.tsx"), "utf8");
    expect(content).toContain("toneSuccessClass");
    expect(content).toContain("toneWarningClass");
    expect(content).toContain("toneInfoClass");
    expect(content).not.toMatch(/green-500/);
  });

  it("badge success variant uses toneSuccessClass", () => {
    const content = readFileSync(join(componentsRoot, "data-display/badge.tsx"), "utf8");
    expect(content).toContain("toneSuccessClass");
    expect(content).not.toMatch(/bg-green-/);
  });
});
