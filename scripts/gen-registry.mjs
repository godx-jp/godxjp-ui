#!/usr/bin/env node
/**
 * Emit a shadcn-compatible registry for @godxjp/ui.
 *
 * WHAT THIS PUBLISHES, AND WHAT IT DELIBERATELY DOES NOT
 *
 * A shadcn registry is a COPY-PASTE channel: `shadcn add @godxjp/x` writes files into the
 * consumer's tree and they own them from then on. `@godxjp/ui` is an npm package — consumers
 * import from `dist/`. Publishing the 165 components as copy-paste source would fork every
 * consumer's copy from the package: they would stop receiving token fixes, a11y fixes and the
 * guard discipline this library is built on, while carrying 73k lines they did not write. So the
 * components stay a package, and are NOT in this registry.
 *
 * What a registry IS right for here is the part the package cannot hand you: the design language.
 * `docs/showcase/acme-portal.tsx` is the proof — an entire brand (gold/navy, Source Sans 3, 14px
 * radius, tinted shadows) reproduced by configuring TOKENS ALONE, with no component edits and no
 * new components. Tokens are values, not logic: a copied theme cannot drift into a broken
 * component, and re-running `shadcn add` re-applies it cleanly.
 *
 * The repo's own cardinal rule #46 draws the same line from the other side: anything that fails
 * the Framework-Component Test is a COMPOSITION, to be copied rather than imported. Those are
 * exactly what belongs in a registry, and exactly what `src/components/` refuses to hold.
 *
 * ITEMS
 *   theme    registry:theme  the full token system (foundation, semantic, per-component)
 *   styles   registry:style  the stylesheets those tokens drive
 *
 * SERVING
 * Output lands in `preview/dist/registry/`, which the existing Pages workflow already publishes,
 * so items resolve at `<pages-origin>/registry/{name}.json` with no new infrastructure. A consumer
 * adds one line to their own components.json:
 *
 *   "registries": { "@godxjp": "https://godx-jp.github.io/godxjp-ui/registry/{name}.json" }
 *
 * then `npx shadcn add @godxjp/theme`.
 *
 * Usage: node scripts/gen-registry.mjs [--out <dir>] [--check]
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const outIdx = args.indexOf("--out");
const outArg = outIdx === -1 ? "preview/dist/registry" : args[outIdx + 1];
const OUT = isAbsolute(outArg) ? outArg : join(ROOT, outArg);

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const HOMEPAGE = "https://godx-jp.github.io/godxjp-ui";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** CSS files in source order — `base.css` first, since it `@import`s the rest. */
function cssTree(dir) {
  const files = walk(join(ROOT, dir))
    .filter((f) => f.endsWith(".css") && !f.includes("__tests__"))
    .sort();
  const base = files.filter((f) => /\/(base|index)\.css$/.test(f));
  return [...base, ...files.filter((f) => !base.includes(f))];
}

/**
 * A CSS-tree registry item.
 *
 * The files ship verbatim rather than being flattened into `cssVars`: the token system is layered
 * on purpose (foundation → semantic → per-component) and the density axis resolves through
 * `calc(… * var(--scaling))`. Flattening it to a value map would compute those away and hand the
 * consumer a frozen snapshot that no longer responds to `--scaling` or a scoped `[data-tenant]`
 * override — which is the entire point of the system.
 */
function cssItem(name, type, dirs, title, description) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type,
    title,
    description,
    files: dirs.flatMap((dir) =>
      cssTree(dir).map((f) => ({
        path: relative(ROOT, f),
        type: "registry:file",
        target: `${relative(ROOT, f).replace(/^src\//, "styles/")}`,
        content: readFileSync(f, "utf8"),
      })),
    ),
  };
}

const items = [
  {
    ...cssItem(
      "theme",
      "registry:theme",
      ["src/tokens"],
      "godxjp-ui design tokens",
      "The full token system — foundation scales, semantic roles, and per-component knobs. " +
        "Apply it to your own shadcn components to adopt the godxjp design language without " +
        "taking the component library. Cardinal rules #44/#45: chrome defaults to its quietest " +
        "state, and every service-tunable constant is a knob.",
    ),
    // Consumers who want the density axis wire this once; it is what --scaling multiplies.
    docs:
      "Import the token entry alongside your Tailwind styles, before your own overrides:\n" +
      '  @import "./styles/tokens/base.css";\n' +
      "Then re-theme by overriding roles at :root or under a scoped [data-tenant] — see " +
      `${HOMEPAGE}/isolate/showcase-acme-portal for an entire brand built from tokens alone.`,
  },
  {
    ...cssItem(
      "styles",
      "registry:style",
      ["src/styles"],
      "godxjp-ui stylesheets",
      "The stylesheets the tokens drive — control, layout, table, dialog, navigation and the " +
        "rest. Needed only if you are adopting godxjp component markup; the `theme` item alone " +
        "is enough to re-theme your existing shadcn components.",
    ),
    registryDependencies: ["@godxjp/theme"],
  },
];

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "godxjp",
  homepage: HOMEPAGE,
  items: items.map(({ files, ...meta }) => ({
    ...meta,
    files: files.map(({ content: _content, ...f }) => f),
  })),
};

function emit() {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
  for (const item of items) {
    writeFileSync(join(OUT, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
  }
}

if (CHECK) {
  if (!existsSync(join(OUT, "registry.json"))) {
    console.error(
      `✗ registry not built at ${relative(ROOT, OUT)} — run node scripts/gen-registry.mjs`,
    );
    process.exit(1);
  }
  const onDisk = readFileSync(join(OUT, "registry.json"), "utf8");
  if (onDisk !== `${JSON.stringify(registry, null, 2)}\n`) {
    console.error("✗ registry is stale — run node scripts/gen-registry.mjs");
    process.exit(1);
  }
  console.log(`✓ registry current — ${items.length} item(s)`);
  process.exit(0);
}

emit();
const total = items.reduce((n, i) => n + i.files.length, 0);
console.log(
  `✓ registry written to ${relative(ROOT, OUT)} — ${items.length} item(s), ${total} file(s)\n` +
    `  v${pkg.version} · resolves at ${HOMEPAGE}/registry/{name}.json`,
);
