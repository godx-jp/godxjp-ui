import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/**
 * check:agent-api-names resolves every name the consumer guidance presents as package API against
 * the PACKED declarations. Each case is a throwaway mini-package: a `dist/index.d.ts`, an export
 * map, a rules file and a README, then the real script's exit code. A gate is worth its exit code.
 */
const SCRIPT = resolve(process.cwd(), "scripts/check-agent-api-names.mjs");

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

interface Fixture {
  dts?: string | null;
  rules?: Array<{ number: number; title: string; body: string }>;
  readme?: string;
  files?: string[];
  extra?: Record<string, string>;
}

function repo({
  dts = "export declare const Flex: () => null;\nexport declare function useThing(): void;\n",
  rules = [{ number: 1, title: "Layout", body: "Use `Flex` for rows." }],
  readme = "# Pkg\n\nUse `Flex`.\n",
  files = ["agent", "dist", "docs"],
  extra = {},
}: Fixture = {}): string {
  const root = mkdtempSync(join(tmpdir(), "agent-api-names-"));
  roots.push(root);
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  write(
    "package.json",
    JSON.stringify({
      name: "@godxjp/ui",
      files,
      exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } },
    }),
  );
  if (dts !== null) write("dist/index.d.ts", dts);
  write("agent/rules.json", JSON.stringify(rules));
  write("README.md", readme);
  write("docs/GUIDE.md", "# guide\n");
  for (const [path, text] of Object.entries(extra)) write(path, text);
  return root;
}

function run(root: string, args: string[] = []): { code: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [SCRIPT, ...args], {
      cwd: root,
      encoding: "utf8",
    });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status: number; stdout: string; stderr: string };
    return { code: e.status, output: `${e.stdout}${e.stderr}` };
  }
}

describe("check:agent-api-names", () => {
  it("passes when every named API is exported by the packed declarations", () => {
    const { code, output } = run(repo());
    expect(output).toContain("0 unknown");
    expect(code).toBe(0);
  });

  it("is RED on a planted bad name in the rules (the initI18n case)", () => {
    const { code, output } = run(
      repo({ rules: [{ number: 5, title: "i18n", body: "Call `initI18n()` once." }] }),
    );
    expect(code).toBe(1);
    expect(output).toContain("initI18n");
  });

  it("is RED on a planted bad component name in the README", () => {
    const { code, output } = run(repo({ readme: "Use `Flex` and `Combobox`.\n" }));
    expect(code).toBe(1);
    expect(output).toContain("Combobox");
  });

  it("resolves a README import against the subpath it imports from", () => {
    const readme = '```tsx\nimport { Flex, Ghost } from "@godxjp/ui";\n```\n';
    const { code, output } = run(repo({ readme }));
    expect(code).toBe(1);
    expect(output).toContain("Ghost");
    expect(output).not.toContain("`Flex`");
  });

  it("is RED on a subpath that is not in the export map", () => {
    const { code, output } = run(repo({ readme: "Import from `@godxjp/ui/nowhere`.\n" }));
    expect(code).toBe(1);
    expect(output).toContain("@godxjp/ui/nowhere");
  });

  it("does not treat the left column of the migration table as API", () => {
    const readme =
      "## Migrating\n\n| Removed | Replacement |\n| --- | --- |\n| `Stack` | `Flex` |\n";
    expect(run(repo({ readme })).code).toBe(0);
  });

  it("FAILS CLOSED when dist/ has no declarations", () => {
    const { code, output } = run(repo({ dts: null }));
    expect(code).toBe(1);
    expect(output).toMatch(/0 names proves nothing|no declarations/);
  });

  it("FAILS CLOSED when the declarations export nothing", () => {
    const { code } = run(repo({ dts: "export {};\n" }));
    expect(code).toBe(1);
  });

  it("FAILS CLOSED when the extractor finds no names to check", () => {
    const { code, output } = run(
      repo({
        rules: [{ number: 1, title: "none", body: "no code here" }],
        readme: "plain prose\n",
      }),
    );
    expect(code).toBe(1);
    expect(output).toContain("extracted 0 names");
  });

  it("is RED on a dead repo path in agent/", () => {
    const { code, output } = run(
      repo({ extra: { "agent/START-HERE.md": "See `docs/MISSING.md` and `src/gone.ts`.\n" } }),
    );
    expect(code).toBe(1);
    expect(output).toContain("docs/MISSING.md");
  });

  it("is RED when agent/ points at a docs file that package.json files does not ship", () => {
    const { code, output } = run(
      repo({
        files: ["agent", "dist", "docs/OTHER.md"],
        extra: { "agent/START-HERE.md": "Read `docs/GUIDE.md`.\n" },
      }),
    );
    expect(code).toBe(1);
    expect(output).toContain("does not ship");
  });

  it("--propose-files lists the docs the shipped scripts and agent/ read", () => {
    const root = repo({
      files: ["agent", "dist", "scripts/setup.mjs", "docs"],
      extra: {
        "scripts/setup.mjs": 'const p = "docs/GUIDE.md";\n',
        "agent/START-HERE.md": "Read `docs/OTHER.md`.\n",
        "docs/OTHER.md": "x\n",
      },
    });
    const { output } = run(root, ["--propose-files"]);
    expect(output.split("\n")).toEqual(
      expect.arrayContaining(["docs/GUIDE.md", "docs/OTHER.md", "docs/CONSUMER-RULES.md"]),
    );
  });
});

describe("package.json files covers every docs path the consumer guidance reads", () => {
  it("each docs/*.md named by agent/ or a shipped script is inside a files entry", async () => {
    const { docsReadByScripts, isShipped, pathRefsInAgent } = await import(
      resolve(process.cwd(), "scripts/check-agent-api-names.mjs")
    );
    const root = process.cwd();
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const named = new Set<string>([
      ...docsReadByScripts(root, pkg.files),
      ...pathRefsInAgent(root)
        .map((r: { path: string }) => r.path)
        .filter((p: string) => /^docs\/.+\.md$/.test(p)),
      "docs/CONSUMER-RULES.md",
      "docs/CUSTOMER-THEMING.md",
    ]);
    expect(named.size).toBeGreaterThan(3);
    const unshipped = [...named].filter((p) => !isShipped(p, pkg.files));
    expect(unshipped).toEqual([]);
  });

  it("isShipped is red for a path no files entry covers", async () => {
    const { isShipped } = await import(resolve(process.cwd(), "scripts/check-agent-api-names.mjs"));
    expect(isShipped("docs/TOKENS.md", ["docs/OTHER.md", "agent"])).toBe(false);
    expect(isShipped("docs/TOKENS.md", ["docs"])).toBe(true);
    expect(isShipped("docs/TOKENS.md", ["docs/TOKENS.md"])).toBe(true);
  });
});

describe("subpathsMentioned reads file-like subpaths whole (v32)", () => {
  it("keeps the extension of `styles/fonts.css` and drops a sentence-ending period", async () => {
    // @ts-expect-error — plain .mjs script module, no types
    const { subpathsMentioned } = await import("../../../scripts/check-agent-api-names.mjs");
    expect(subpathsMentioned('@import "@godxjp/ui/styles/fonts.css";')).toEqual([
      "./styles/fonts.css",
    ]);
    expect(subpathsMentioned("import from @godxjp/ui/themes/godx.")).toEqual(["./themes/godx"]);
    expect(subpathsMentioned("see `@godxjp/ui/data-entry`")).toEqual(["./data-entry"]);
  });
});
