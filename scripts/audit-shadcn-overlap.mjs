#!/usr/bin/env node
/**
 * Audit the 47 components that overlap shadcn/ui.
 * Measures hard-coded geometry/chrome literals (rule #44/#45 violations) per component.
 * Role utilities (bg-primary, text-muted-foreground) are token-backed and NOT counted.
 *
 * Usage: node scripts/audit-shadcn-overlap.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
const walk = (d, o = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p, o);
    else o.push(p);
  }
  return o;
};
const files = walk("src/components").filter((f) => /\.tsx$/.test(f) && !f.includes("__tests__"));
// shadcn/ui catalog (registry index, 2026-08)
const SHADCN = new Set([
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "data-table",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "form",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
  "typography",
]);
// GEOMETRY/CHROME literal scale values -> must become tokens (#44/#45)
const GEO =
  /(?:^|[\s:])((?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|gap|gap-x|gap-y|w|h|min-w|max-w|min-h|max-h|size|z|inset|top|bottom|start|end)-(?:\d+(?:\.\d+)?|px|xs|sm|md|lg|xl|\d?xl|full|fit|auto))(?=$|[\s"'`])/g;
const CHROME =
  /(?:^|[\s:])((?:rounded|shadow|border|text|leading|tracking|opacity)-(?:none|sm|md|lg|xl|\d?xl|full|px|\d+))(?=$|[\s"'`])/g;
// token-backed = arbitrary var() or a semantic role colour
const TOKENVAR = /\[var\(--[a-z0-9-]+\)\]/g;
const agg = new Map();
for (const f of files) {
  const n = basename(f, extname(f));
  if (n === "index") continue;
  const s = readFileSync(f, "utf8");
  const lits = [...s.matchAll(/"([^"\n]{2,400})"|'([^'\n]{2,400})'/g)].map(
    (m) => m[1] || m[2] || "",
  );
  const cur = agg.get(n) || { geo: 0, chrome: 0, semantic: 0, tokenvar: 0, set: new Set() };
  for (const l of lits) {
    if (!/[a-z]-|\bui-/.test(l)) continue;
    if (/^(https?:|\.\/|\.\.\/|@)/.test(l)) continue;
    const g = [...l.matchAll(GEO)].map((m) => m[1]);
    const c = [...l.matchAll(CHROME)].map((m) => m[1]);
    cur.geo += g.length;
    cur.chrome += c.length;
    [...g, ...c].forEach((x) => cur.set.add(x));
    cur.semantic += [...l.matchAll(/\bui-[a-z0-9-]+/g)].length;
    cur.tokenvar += [...l.matchAll(TOKENVAR)].length;
  }
  agg.set(n, cur);
}
const rows = [...agg]
  .filter(([n]) => SHADCN.has(n))
  .map(([n, v]) => ({
    n,
    hard: v.geo + v.chrome,
    geo: v.geo,
    chrome: v.chrome,
    semantic: v.semantic,
    tokenvar: v.tokenvar,
    uniq: v.set.size,
    samples: [...v.set].slice(0, 6),
  }))
  .sort((a, b) => b.hard - a.hard);
const P = (s, w) => String(s).padEnd(w);
console.log(
  P("COMPONENT", 16) +
    P("HARD", 6) +
    P("geo", 5) +
    P("chrome", 7) +
    P("ui-*", 6) +
    P("var()", 6) +
    "worst offenders",
);
console.log("-".repeat(88));
for (const r of rows)
  console.log(
    P(r.n, 16) +
      P(r.hard, 6) +
      P(r.geo, 5) +
      P(r.chrome, 7) +
      P(r.semantic, 6) +
      P(r.tokenvar, 6) +
      r.samples.join(" "),
  );
const t = rows.reduce((a, r) => a + r.hard, 0);
console.log("\nTOTAL hard-coded geometry/chrome literals:", t);
console.log(
  "components with >=1 violation:",
  rows.filter((r) => r.hard > 0).length,
  "/",
  rows.length,
);
console.log(
  "clean (0 violations):",
  rows
    .filter((r) => r.hard === 0)
    .map((r) => r.n)
    .join(" "),
);
