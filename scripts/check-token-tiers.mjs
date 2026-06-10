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
  /^--[a-z0-9]+(?:-[a-z0-9]+)*-(?:space|color|background|foreground|border|radius|height|width|padding|gap|size|font|line|letter|shadow|alpha|inset|offset|translate|max)(?:-[a-z0-9]+)*:/;
const componentPrefixes = {
  badge: ["badge"],
  card: ["card", "stat-card"],
  control: [
    "control",
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
  ],
  feedback: ["dialog", "alert", "empty-state", "skeleton"],
  navigation: ["pagination", "filter", "filter-bar", "breadcrumb", "menubar"],
  table: ["table"],
  "data-display": ["progress", "tree", "timeline"],
  "data-entry": ["password-strength"],
  shell: ["sidebar", "topbar", "kbd"],
};

for (const file of cssFiles) {
  const rel = file.slice(root.length + 1);
  const css = readFileSync(file, "utf8");
  if (domainToken.test(css)) failures.push(`${rel}: forbidden tracking/domain token`);
  if (publicRawRamp.test(css)) failures.push(`${rel}: public raw gray/blue ramp token`);

  if (rel === "src/styles/index.css") {
    const themeBlock = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    if (hexThemeColor.test(themeBlock)) {
      failures.push(`${rel}: @theme color exports must reference tokens, not literal hex`);
    }
  }

  const componentMatch = rel.match(componentToken);
  if (componentMatch) {
    const component = componentMatch[1];
    const prefixes = componentPrefixes[component] ?? [component];
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
