#!/usr/bin/env node
/**
 * init-guinea-pig — install the GUINEA-PIG skill into a consumer app.
 *
 * Deliberately NOT part of `init-agent-kit`. The agent kit is for every consumer; this skill
 * carries an obligation only a guinea-pig repo accepts — that a gap found here is fixed UPSTREAM,
 * in @godxjp/ui, rather than worked around locally. Installing it in an ordinary consumer would
 * tell its agent to go edit a library it has no mandate over.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { shouldSkip } from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();
const skip = shouldSkip(root);

if (skip === "self") {
  console.error("init-guinea-pig is for CONSUMER apps, not the @godxjp/ui repo itself.");
  process.exit(1);
}
if (skip === "no-package") {
  console.error(`No package.json at ${root} — run this from a consumer app's root.`);
  process.exit(1);
}

const source = join(dirname(fileURLToPath(import.meta.url)), "guinea-pig-skill.md");
const target = join(root, ".claude", "skills", "godx-ui-guinea-pig", "SKILL.md");

if (existsSync(target)) {
  console.log(`  guinea-pig skill already present — left untouched:\n    ${target}`);
  console.log(
    "\n  It is safe to append repo-specific sections to that file; this command never overwrites.\n" +
      "  To take a newer upstream version, delete the file and re-run.\n",
  );
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`
  guinea-pig skill installed:
    • ${target}

  This repo now carries the guinea-pig obligation: a gap found here is fixed in @godxjp/ui,
  not worked around locally. Append a repo-specific section to the file for anything only
  this app knows — a deliberate audit exception, its package manager, its open findings.

  Restart your agent to load the skill.
`);
