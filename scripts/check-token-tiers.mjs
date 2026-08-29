#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const srcRoot = join(root, "src");
const cssFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".css")) cssFiles.push(full);
  }
}

walk(join(srcRoot, "tokens"));
walk(join(srcRoot, "styles"));

const failures = [];
const domainToken = /--(?:color-)?tracking-|--(?:internal|seller|yamato)\b/i;
const publicRawRamp = /--(?:color-)?(?:gray|blue)-\d+\b/;
const hexThemeColor = /^\s*--color-[\w-]+:\s*#/m;
const componentToken = /^src\/tokens\/components\/([a-z0-9-]+)\.css$/;
const componentNameShape =
  /^--[a-z0-9]+(?:-[a-z0-9]+)*-(?:space|color|background|foreground|border|radius|height|width|padding|gap|size|font|line|letter|shadow|glow|tint|gradient|alpha|align|inset|offset|translate|max|overflow|display)(?:-[a-z0-9]+)*:/;
/**
 * Custom-property declarations that are not inside a rule body.
 *
 * Walks the brace structure rather than matching lines, because the failure this catches is
 * structural: the text of the declaration is perfectly well-formed, it is merely in a place CSS
 * does not allow it (directly inside `@media { … }` instead of inside a `:root { … }` within it).
 */
function bareDeclarations(css) {
  const out = [];
  const stack = [];
  let buffer = "";
  let line = 1;
  for (const ch of css) {
    if (ch === "\n") line += 1;
    if (ch === "{") {
      stack.push(buffer.trim().split("\n").pop().trim());
      buffer = "";
    } else if (ch === "}") {
      stack.pop();
      buffer = "";
    } else if (ch === ";") {
      // The WHOLE buffer, not its last line. This repo wraps long token values onto the next
      // line (`--shadow-md:\n  0 4px 6px …;`), so slicing to the last line reads the VALUE and
      // the declaration stops looking like a custom property — which would have let exactly the
      // bug this guard exists for slip through whenever the token happened to be multi-line.
      const decl = buffer.trim();
      // Inside a rule the innermost frame is a selector; inside a bare @media it is the at-rule.
      const innermost = stack[stack.length - 1] ?? "(top level)";
      if (decl.startsWith("--") && innermost.startsWith("@")) {
        out.push({ token: decl.split(":")[0].trim(), line, context: innermost });
      }
      buffer = "";
    } else {
      buffer += ch;
    }
  }
  return out;
}

const componentPrefixes = {
  badge: ["badge"],
  card: ["card", "stat-card"],
  control: [
    "control",
    "month-picker",
    "tree-select",
    "time-picker",
    "search-select",
    "time-input",
    "checkbox",
    "choice",
    "switch",
    "slider",
    "color-picker",
    "command",
    "search-input",
    "toggle",
    "button",
    "tag-input",
    "calendar",
    "input",
    "textarea",
    "select",
    "rating",
    "otp",
    "number-input",
    "transfer",
    "cascader",
  ],
  // `banner` is the page-level Alert treatment (gh#255) — same component file, own measure knobs.
  // `query` = the InfiniteQueryState/DataState lifecycle footers — query feedback surfaces with no
  // stylesheet of their own, so their knobs live in the feedback tier (gh#319).
  // `toast` = the Sonner Toaster (src/components/feedback/sonner.tsx) — a feedback surface whose
  // body sonner renders itself, so its knobs have nowhere else to live (gh#319).
  feedback: [
    "dialog",
    "alert",
    "banner",
    "empty-state",
    "skeleton",
    "sheet",
    "tooltip",
    "popover",
    "query",
    "toast",
  ],
  navigation: [
    "pagination",
    "menu",
    "filter",
    "filter-bar",
    "breadcrumb",
    "menubar",
    "tabs",
    "steps",
    "dropdown",
    "context-menu",
    "navigation-menu",
    "popover",
    "hover-card",
    "app-setting-picker",
  ],
  table: ["table"],
  "data-display": [
    "progress",
    "permission-matrix",
    "tree",
    "timeline",
    "avatar",
    "accordion",
    "carousel",
    "list-row",
    "descriptions",
    "qr-code",
    "scroll-area",
  ],
  // `branch-scope-picker` = the all-branches/subset scope control (gh#257); its rules live in
  // styles/data-entry-layout.css, so its knobs belong to the data-entry tier (gh#319).
  "data-entry": ["password-strength", "branch-scope-picker"],
  shell: [
    "sidebar",
    "topbar",
    "kbd",
    "app-shell",
    "org-switcher",
    "auth-identity",
    "auth-account-summary",
    "auth-requester",
    "auth-footer",
    "auth-stack",
    "auth-shell",
    "centered-shell",
    "page",
    "page-header",
    // `service-role-panel` = the role-collection ⇄ role-detail surface (gh#257). It is styled
    // from styles/layout.css alongside MasterDetail/PageContainer, whose knobs already live in
    // this tier (gh#319).
    "service-role-panel",
  ],
};

for (const file of cssFiles) {
  const rel = file.slice(root.length + 1);
  const css = readFileSync(file, "utf8");
  if (domainToken.test(css)) failures.push(`${rel}: forbidden tracking/domain token`);
  if (publicRawRamp.test(css)) failures.push(`${rel}: public raw gray/blue ramp token`);

  if (rel === "src/styles/index.css") {
    const themeBlock = css.match(/@theme(?:\s+inline)?\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    if (hexThemeColor.test(themeBlock)) {
      failures.push(`${rel}: @theme color exports must reference tokens, not literal hex`);
    }
  }

  const componentMatch = rel.match(componentToken);
  if (componentMatch) {
    const component = componentMatch[1];
    const prefixes = componentPrefixes[component] ?? [component];
    // A custom property only exists if it is declared inside a RULE. A bare declaration sitting
    // directly in a conditional group (@media/@supports) is invalid CSS and browsers drop it
    // silently — the token resolves to nothing at runtime while every textual check still passes.
    // That is not hypothetical: 122 control tokens spent most of #319 dead this way, because an
    // append landed after the closing brace of `:root` but inside the trailing `@media
    // (pointer: coarse)` block. Nothing caught it — this guard scanned line by line, the geometry
    // ratchet only reads .tsx, and jsdom does not resolve the cascade. So walk the braces.
    for (const stray of bareDeclarations(css)) {
      failures.push(
        `${rel}: component token ${stray.token} is declared outside any rule ` +
          `(line ${stray.line}, inside ${stray.context}) — browsers DROP it. Move it into :root.`,
      );
    }

    for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) {
      const token = match[1];
      if (!prefixes.some((prefix) => token.startsWith(`--${prefix}-`))) {
        failures.push(
          `${rel}: component token ${token} must start with an allowed component prefix`,
        );
      } else if (!componentNameShape.test(`${token}:`)) {
        failures.push(`${rel}: component token ${token} must use --{component}-{part}-{property}`);
      }
    }
  }
}

const base = readFileSync(join(srcRoot, "tokens/base.css"), "utf8");
for (const required of ["./foundation.css", "./semantic/layout.css", "./components/control.css"]) {
  if (!base.includes(`@import "${required}"`)) {
    failures.push(`src/tokens/base.css: missing tier import ${required}`);
  }
}

if (failures.length) {
  console.error("✗ token tier guard failed");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("✓ token tier guard passed");
