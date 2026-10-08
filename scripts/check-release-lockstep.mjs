#!/usr/bin/env node
/**
 * Release-lockstep guard — @godxjp/ui and @godxjp/ui-mcp MUST ship as one release train. The two
 * packages describe the SAME thing from two sides: `@godxjp/ui` is the runtime component library;
 * `@godxjp/ui-mcp` is the catalog that tells agents how to use it (props, tokens, rules,
 * patterns).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ui = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const mcp = JSON.parse(readFileSync(join(ROOT, "mcp/package.json"), "utf8"));

const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * Does `version` satisfy a compatibility range? We keep this dependency-free and only support the
 * two forms we actually author: an exact `x.y.z` or a minor-pinned `x.y.x` wildcard (the form the
 * MCP declares, e.g.
 */
function satisfies(version, range) {
  if (!version || !range) return false;
  if (range === version) return true;
  const m = /^(\d+)\.(\d+)\.x$/.exec(range);
  if (m) {
    const v = /^(\d+)\.(\d+)\.\d+$/.exec(version);
    return !!v && v[1] === m[1] && v[2] === m[2];
  }
  return false;
}

const errors = [];

if (!SEMVER.test(ui.version)) {
  errors.push(`@godxjp/ui version "${ui.version}" is not a plain x.y.z semver.`);
}
if (!SEMVER.test(mcp.version)) {
  errors.push(`@godxjp/ui-mcp version "${mcp.version}" is not a plain x.y.z semver.`);
}
if (ui.version !== mcp.version) {
  errors.push(
    `Version line split: @godxjp/ui is ${ui.version} but @godxjp/ui-mcp is ${mcp.version}. ` +
      `They must publish from the same release train (see scripts/release.mjs --mcp sync).`,
  );
}
if (!ui.godxUiMcp) {
  errors.push(
    '@godxjp/ui package.json is missing the "godxUiMcp" field (catalog version it ships with).',
  );
} else if (ui.godxUiMcp !== mcp.version) {
  errors.push(
    `@godxjp/ui declares godxUiMcp=${ui.godxUiMcp} but the catalog is @godxjp/ui-mcp@${mcp.version}.`,
  );
}
if (!mcp.godxUiCompatibility) {
  errors.push('@godxjp/ui-mcp package.json is missing the "godxUiCompatibility" field.');
} else if (!satisfies(ui.version, mcp.godxUiCompatibility)) {
  errors.push(
    `@godxjp/ui-mcp godxUiCompatibility="${mcp.godxUiCompatibility}" is not satisfied by ` +
      `@godxjp/ui@${ui.version}.`,
  );
}

/* THE PACKAGES BESIDE THE KIT (gh#1108 / gh#1109): @godxjp/markdown and @godxjp/editor are
 * versioned WITH the kit — one release, one number — and published after it by
 * scripts/publish-satellites.mjs. A satellite left on the previous version would publish nothing
 * (that version already exists) while its peer range still pointed at the old kit. */
const SATELLITES = [
  "packages/markdown/package.json",
  "packages/editor/package.json",
  "packages/block-editor/package.json",
  "packages/chat/package.json",
];
const satellites = SATELLITES.map((file) => ({
  file,
  manifest: JSON.parse(readFileSync(join(ROOT, file), "utf8")),
}));
const tildeAccepts = (range, version) => {
  const m = /^~(\d+)\.(\d+)\.(\d+)$/.exec(range ?? "");
  const v = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return !!m && !!v && m[1] === v[1] && m[2] === v[2] && Number(v[3]) >= Number(m[3]);
};
for (const { file, manifest } of satellites) {
  if (manifest.version !== ui.version) {
    errors.push(
      `${manifest.name} (${file}) is ${manifest.version}, but @godxjp/ui is ${ui.version}.`,
    );
  }
  for (const peer of ["@godxjp/ui", "@godxjp/markdown"]) {
    const range = manifest.peerDependencies?.[peer];
    if (range !== undefined && !tildeAccepts(range, ui.version)) {
      errors.push(
        `${manifest.name} declares peer ${peer}@${range}, which does not accept ${ui.version}.`,
      );
    }
  }
}

/* REACT IS ALWAYS THE APP'S (gh#1156). A @godxjp package that listed react or react-dom as a
 * dependency would install its own copy beside the app's — two React instances, and every hook in
 * the kit throws "invalid hook call". They are peers, everywhere, and nothing here bundles them. */
for (const { file, manifest } of [{ file: "package.json", manifest: ui }, ...satellites]) {
  for (const name of ["react", "react-dom"]) {
    for (const field of [
      "dependencies",
      "optionalDependencies",
      "bundleDependencies",
      "bundledDependencies",
    ]) {
      const listed = Array.isArray(manifest[field])
        ? manifest[field].includes(name)
        : manifest[field]?.[name];
      if (listed)
        errors.push(
          `${manifest.name} (${file}) lists ${name} in ${field}; it must be a peerDependency only.`,
        );
    }
  }
}

const report = {
  ui: ui.version,
  mcp: mcp.version,
  godxUiMcp: ui.godxUiMcp ?? null,
  godxUiCompatibility: mcp.godxUiCompatibility ?? null,
  satellites: Object.fromEntries(
    satellites.map(({ manifest }) => [manifest.name, manifest.version]),
  ),
  inLockstep: errors.length === 0,
  errors,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else if (errors.length === 0) {
  console.log(
    `✓ Release lockstep OK — @godxjp/ui@${ui.version} ↔ @godxjp/ui-mcp@${mcp.version} ` +
      `(compat ${mcp.godxUiCompatibility}).`,
  );
} else {
  console.error("✗ Release lockstep FAILED — @godxjp/ui and @godxjp/ui-mcp have drifted:");
  for (const e of errors) console.error(`  • ${e}`);
  console.error(
    "\nFix: release both together with `pnpm release --ui <bump> --mcp sync`, or reconcile the " +
      "version / godxUiMcp / godxUiCompatibility fields so they agree. packages/markdown, " +
      "packages/editor and packages/block-editor carry the same version, their peer ranges are " +
      "`~<that version>`, and react / react-dom are peers only.",
  );
}

process.exit(errors.length > 0 ? 1 : 0);
