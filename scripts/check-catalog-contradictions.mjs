#!/usr/bin/env node
/**
 * check:catalog-contradictions — if A says "use me INSTEAD OF B", then B must point at A.
 *
 * The MCP catalog is how an agent discovers this package, and an agent looks up the component it
 * already knows the name of. So a rule that lives only on the REPLACEMENT is invisible: it is read
 * by someone who has already found it, and missed by everyone who has not.
 *
 * That is not hypothetical. `TopbarItem` said "use it INSTEAD OF a Button in a Topbar slot", while
 * `Topbar`'s own guidance said "DO build the sidebar toggle as a Button", its example used Buttons
 * in two slots, and its `related` list — the section literally titled "don't confuse / don't
 * reinvent" — named neither TopbarItem nor AccountChip. A consumer read Topbar carefully, followed
 * it exactly, and built all three bar cells out of Buttons. The catalog taught the mistake.
 *
 * The check is mechanical: every "INSTEAD OF B" / "not as B" claim creates an obligation on B's
 * entry to mention A. Nothing here judges the advice, only that both ends agree it exists.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(resolve(process.cwd(), "mcp/src/data/components.ts"), "utf8");

const starts = [...src.matchAll(/\n {4}name: "([A-Z][A-Za-z]+)",/g)].map((m) => ({
  name: m[1],
  at: m.index,
}));
const entries = starts.map((e, i) => ({
  name: e.name,
  body: src.slice(e.at, i + 1 < starts.length ? starts[i + 1].at : src.length),
}));
const byName = new Map(entries.map((e) => [e.name, e]));

const failures = [];
for (const entry of entries) {
  const claims = new Set(
    [...entry.body.matchAll(/(?:INSTEAD OF|instead of|not as) (?:a |an )?`?<?([A-Z][A-Za-z]+)>?`?/g)]
      .map((m) => m[1])
      .filter((n) => n !== entry.name && byName.has(n)),
  );
  for (const target of claims) {
    // The obligation is on the DISPLACED component: whoever looks up B must learn that A exists.
    if (!byName.get(target).body.includes(entry.name)) {
      failures.push(
        `${entry.name} says it replaces ${target}, but ${target}'s entry never mentions ${entry.name}. ` +
          `Add it to ${target}'s "related" list (and fix any guidance or example there that still ` +
          `recommends the shape ${entry.name} exists to replace).`,
      );
    }
  }
}

if (failures.length) {
  console.error("✗ check:catalog-contradictions — a replacement claim only one side knows about:\n");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("✓ check:catalog-contradictions — every replacement claim is named on both sides.");
