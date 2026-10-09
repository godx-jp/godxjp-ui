import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

/**
 * gh#1228 — 32.0.0 built `@godxjp/chat` as ONE bundled `index.js`. Each component's
 * `X.displayName = "X"` assignment is a top-level side effect a bundler must keep, so an app that
 * imported three components shipped all eight, and the Dock grew past its size budget. Built one
 * module per source file (with `sideEffects: false`), a component nobody imports is dropped with
 * its module.
 *
 * This builds the package with its REAL tsup config, then bundles a single import from that output.
 * It runs in a child process because esbuild refuses to start under jsdom.
 */
const PKG = path.resolve(process.cwd(), "packages/chat");
const out = mkdtempSync(path.join(tmpdir(), "godx-chat-1228-"));
afterAll(() => rmSync(out, { recursive: true, force: true }));

const COMPONENTS = [
  "Attachments",
  "ChatBubble",
  "ChatBubbleList",
  "ChatComposer",
  "ChatSuggestion",
  "Conversations",
  "ThoughtChain",
  "ThoughtChainItem",
  "Welcome",
];

/** Names whose `displayName` string survives in a bundle that imports only `name`. */
function shippedWith(name: string): string[] {
  const script = `
    import { writeFileSync } from "node:fs";
    import { build as tsup } from "tsup";
    import { build as esbuild } from "esbuild";
    const out = ${JSON.stringify(out)};
    await tsup({ outDir: out + "/dist", dts: false, silent: true });
    // The package.json beside dist/ is what tells esbuild the modules are side-effect free.
    writeFileSync(out + "/package.json", JSON.stringify({ sideEffects: false }));
    writeFileSync(out + "/entry.js", 'import { ${name} } from "./dist/index.js"; export default ${name};');
    const r = await esbuild({
      entryPoints: [out + "/entry.js"], bundle: true, write: false, format: "esm", logLevel: "silent",
      // Every import the package makes is a dependency or a peer: only its own code is bundled.
      external: ["react", "react/*", "react-dom", "@godxjp/ui", "@godxjp/ui/*", "lucide-react"],
    });
    const text = r.outputFiles[0].text;
    console.log(JSON.stringify(${JSON.stringify(COMPONENTS)}.filter((n) => text.includes('"' + n + '"'))));
  `;
  const stdout = execFileSync("node", ["--input-type=module", "-e", script], {
    cwd: PKG,
    encoding: "utf8",
  });
  return JSON.parse(stdout.trim().split("\n").pop()!) as string[];
}

describe("@godxjp/chat tree-shakes per component (gh#1228)", () => {
  it("an app importing only Welcome ships none of the other eight components", () => {
    expect(shippedWith("Welcome")).toEqual(["Welcome"]);
  }, 60_000);

  it("an app importing ChatComposer keeps it and drops Welcome", () => {
    const shipped = shippedWith("ChatComposer");
    expect(shipped).toContain("ChatComposer");
    expect(shipped).not.toContain("Welcome");
  }, 60_000);
});
