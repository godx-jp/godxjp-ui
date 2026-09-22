import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — a plain .mjs rule module, the same shape as component-token-rules.
import { parseThemeTokens } from "../../../scripts/theme-token-rules.mjs";

type Token = { name: string; value: string; description: string };
const parse = parseThemeTokens as (text: string) => Token[];

const root = join(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/**
 * THE DEFECT (gh#862): `agent/tokens.json` held 1685 tokens and every one was a COMPONENT knob.
 * `--primary`, `--background`, `--radius` and `--ring` were in no file under `agent/` at all, while
 * docs/CUSTOMER-THEMING.md named `--primary` 24 times. The catalog exists for an assistant that can
 * only read files; the answer it supported to "which token carries the brand colour" was "this
 * system has none", which sends that reader to the bespoke CSS the guide exists to prevent.
 */
describe("parseThemeTokens reads the DEFAULT scope, not every scope", () => {
  it("skips a re-declaration under a theme attribute", () => {
    const tokens = parse(`/* Foundation tokens: colour. */
:root {
  --background: 60 33% 99%;
}
:root[data-theme="dark"] {
  --background: 240 6% 10%;
}`);
    expect(tokens).toEqual([
      { name: "--background", value: "60 33% 99%", description: "Foundation tokens: colour." },
    ]);
  });

  it("skips a `:root` nested inside an at-rule", () => {
    // derived.css carries an `@supports not (color: hsl(from …))` fallback that redeclares seven
    // names. Read linearly, `--primary-hover` appears twice with different values and nothing in
    // the catalog says which one applies.
    const tokens = parse(`/* Derived colour. */
:root {
  --primary-hover: initial;
}
@supports not (color: hsl(from red h s l)) {
  :root {
    --primary-hover: 268 100% 42%;
  }
}`);
    expect(tokens).toEqual([
      { name: "--primary-hover", value: "initial", description: "Derived colour." },
    ]);
  });

  it("keeps braces inside prose from moving the block boundary", () => {
    // foundation.css and derived.css both write `{` and `}` inside their comments.
    const tokens = parse(`/* Foundation. Written as \`:root { --x: 1 }\` elsewhere. */
:root {
  /* The seed. */
  --primary: 268.7 100% 50%;
}`);
    expect(tokens.map((t) => t.name)).toEqual(["--primary"]);
    expect(tokens[0].description).toBe("The seed.");
  });

  it("uses the file header's FIRST SENTENCE as the fallback, not the whole essay", () => {
    // Taking the opening comment whole repeated derived.css's 4 KB header as the description of
    // every token in it that carries no comment of its own — 60 KB of the same paragraphs,
    // published to every consumer, saying no more than the first line does.
    const tokens = parse(`/* DERIVED COLOUR — the states that hang off the seeds.
 *
 * WHY THIS SHAPE. A long second paragraph that is not a summary of anything. */
:root {
  --text-link: initial;
}`);
    expect(tokens[0].description).toBe("DERIVED COLOUR — the states that hang off the seeds.");
  });
});

describe("the published catalog carries all three tiers", () => {
  const catalog = JSON.parse(read("agent/tokens.json")) as (Token & { tier: string })[];

  it("tags every entry with a tier, and none of the three is empty", () => {
    expect(catalog.every((t) => typeof t.tier === "string")).toBe(true);
    for (const tier of ["foundation", "semantic", "component"]) {
      expect(catalog.filter((t) => t.tier === tier).length).toBeGreaterThan(0);
    }
  });

  it("answers the question the audience actually arrives with", () => {
    // The six names gh#862 measured at zero occurrences across the whole `agent/` tree.
    for (const name of [
      "--primary",
      "--background",
      "--foreground",
      "--muted",
      "--border",
      "--radius",
    ]) {
      const entry = catalog.find((t) => t.name === name);
      expect(entry, `${name} is absent from agent/tokens.json`).toBeDefined();
      expect(entry!.tier).toBe("foundation");
      expect(entry!.description.length).toBeGreaterThan(0);
    }
  });

  it("contains every token docs/CUSTOMER-THEMING.md tells a consumer to set", () => {
    // The same rule scripts/gen-agent-catalog.mjs gates on: a token written as a DECLARATION in the
    // guide is one the guide instructs a reader to put in their own theme.css. The doc and the
    // catalog are written from different sources and nothing compared them until gh#862.
    const promised = [
      ...new Set([...read("docs/CUSTOMER-THEMING.md").matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map(
        (m) => m[1],
      )),
    ].sort();
    const names = new Set(catalog.map((t) => t.name));
    expect(promised.length).toBeGreaterThan(20);
    expect(promised.filter((name) => !names.has(name))).toEqual([]);
  });
});
