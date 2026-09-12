#!/usr/bin/env node
/**
 * gh#557 — react-aria `HiddenSelect` mirrors every option in a hidden <select> even when the
 * control has no `name`/`form` (nothing to submit). Grids pay ~(N+1) extra React elements per row.
 * Idempotent; safe to run on every install (library repo and consumers).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "gh#557 — unnamed selects";
const INSERT = `    // gh#557 — unnamed selects are not submitted; skip the hidden <select> that mirrors every option (autofill-only for ≤300 items).
    if (!name && !form) return null;
`;

const FILES = ["HiddenSelect.mjs", "HiddenSelect.js", "HiddenSelect.cjs"];

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(MARKER)) return false;
  const needle =
    /function \$\w+\$export\$cbd84cdb2e668835\(props\) \{\n    let \{ state: state, triggerRef: triggerRef, label: label, name: name, form: form, isDisabled: isDisabled \} = props;\n/;
  if (!needle.test(content)) {
    console.warn(`@godxjp/ui: skip react-aria patch — unexpected HiddenSelect shape in ${filePath}`);
    return false;
  }
  content = content.replace(
    needle,
    (match) => `${match}${INSERT}`,
  );
  fs.writeFileSync(filePath, content);
  return true;
}

function findHiddenSelectPaths(root) {
  const pnpmDir = path.join(root, "node_modules", ".pnpm");
  if (!fs.existsSync(pnpmDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(pnpmDir)) {
    if (!entry.startsWith("react-aria@")) continue;
    const mjs = path.join(
      pnpmDir,
      entry,
      "node_modules",
      "react-aria",
      "dist",
      "private",
      "select",
      "HiddenSelect.mjs",
    );
    if (fs.existsSync(mjs)) out.push(mjs);
  }
  return out;
}

export function applyReactAriaHiddenSelectPatch(root) {
  const hits = findHiddenSelectPaths(root);
  if (hits.length === 0) return 0;
  let patched = 0;
  for (const mjsPath of hits) {
    const selectDir = path.dirname(mjsPath);
    for (const name of FILES) {
      const filePath = path.join(selectDir, name);
      if (!fs.existsSync(filePath)) continue;
      if (patchFile(filePath)) patched += 1;
    }
  }
  return patched;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const root = process.env.INIT_CWD || process.cwd();
  const n = applyReactAriaHiddenSelectPatch(root);
  if (n > 0) console.log(`@godxjp/ui: patched react-aria HiddenSelect (${n} file(s)) for gh#557`);
}
