import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * THE GATE AND `--changed` ANSWERED DIFFERENTLY ABOUT THE SAME TREE (gh#949).
 *
 * The scan roots were spelled inline at the SCAN_DIRS expression, so only the default path knew
 * them; `--changed` audited whatever git named. On one commit, one working tree:
 *
 *     pnpm run audit                       -> 0 error
 *     node scripts/ui-audit.mjs --changed  -> 3 error
 *
 * All three were in `mcp/src/data/components.ts` and all three were the catalog's own PROSE — the
 * `Text` entry quotes `<span className="text-[13px] …">` as the anti-example the component exists
 * to replace. Reproduced here before the fix: appending one newline to that file and running
 * `--changed` gave `3 error(s) across mcp/src/data/components.ts`; after it, zero.
 *
 * What these tests pin is the PROPERTY, not the exclusion: one declared territory that both
 * automatic paths read. So there is a case per direction, including the two that a blanket
 * "ignore mcp/" would have broken — an explicit path argument, and consumer mode.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");

let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

const git = (cwd: string, ...a: string[]) => execFileSync("git", a, { cwd, encoding: "utf8" });

/** `text-[13px]` is `no-arbitrary-typography`, severity error, and it fires in SELF mode. */
const VIOLATION = 'export const A = () => <span className="text-[13px]">a</span>;\n';

/**
 * SELF mode is decided by `package.json::name === "@godxjp/ui"`, so the fixture's identity is what
 * selects the territory. `consumer` builds the same tree under a different name to prove the
 * narrowing does NOT follow it there.
 */
function fixture(kind: "self" | "consumer", files: Record<string, string>): string {
  root = mkdtempSync(join(tmpdir(), `ui-audit-territory-${kind}-`));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: kind === "self" ? "@godxjp/ui" : "some-consumer-app" }, null, 2),
  );
  git(root, "init", "-q", "-b", "main", ".");
  git(root, "config", "user.email", "t@example.test");
  git(root, "config", "user.name", "fixture");
  git(root, "add", "-A");
  git(root, "commit", "-qm", "base");
  // Written AFTER the commit so `--changed` sees them as this branch's work (untracked counts).
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

const ESC = String.fromCharCode(27);
const strip = (s: string) => (s ?? "").split(new RegExp(`${ESC}\\[[0-9;]*m`)).join("");

/**
 * `--base=HEAD` because the fixture has no remote, and `--changed` without a resolvable base
 * fails CLOSED by design (gh#542/#948) — that refusal is correct and is pinned by
 * `ui-audit-changed-base-948.test.ts`. With HEAD as the base the changed set is the untracked
 * files these fixtures write, which is exactly the set under test.
 */
function audit(cwd: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });
  return { status: r.status, out: strip(r.stdout) + strip(r.stderr) };
}

describe("ui-audit: one territory, read by both paths (gh#949)", () => {
  it("--changed does not audit a file the default gate never looks at", () => {
    const dir = fixture("self", { "mcp/src/data/catalog.ts": VIOLATION });
    const { status, out } = audit(dir, "--changed", "--base=HEAD");

    expect(out).not.toContain("no-arbitrary-typography");
    expect(out).not.toContain("mcp/src/data/catalog.ts");
    expect(status).toBe(0);
  });

  it("…and SAYS it declined, rather than reporting a clean branch", () => {
    const dir = fixture("self", { "mcp/src/data/catalog.ts": VIOLATION });
    const { out } = audit(dir, "--changed", "--base=HEAD");

    // "Nothing changed" and "what changed is outside the territory" are different facts. Reading
    // the first when the second is true is how someone concludes their file was audited.
    expect(out).toContain("[src, docs]");
    expect(out).toContain("1 file");
  });

  it("still audits the same violation when it is INSIDE the territory", () => {
    const dir = fixture("self", { "src/components/thing.tsx": VIOLATION });
    const { status, out } = audit(dir, "--changed", "--base=HEAD");

    // The negative case for the filter: a territory that silences everything is not a territory.
    expect(out).toContain("no-arbitrary-typography");
    expect(out).toContain("src/components/thing.tsx");
    expect(status).not.toBe(0);
  });

  it("an explicit path argument outranks the territory — explicit is explicit", () => {
    const dir = fixture("self", { "mcp/src/data/catalog.ts": VIOLATION });
    const { out } = audit(dir, "mcp/src/data/catalog.ts");

    expect(out).toContain("no-arbitrary-typography");
    expect(out).toContain("1 error(s)");
  });

  it("CONSUMER mode is NOT narrowed — its roots are a guess, not a map", () => {
    // An app that keeps components outside `resources/js/**` would get "nothing scanned" from a
    // filter that is only right about this repo. There, seeing the real changed files is better.
    const dir = fixture("consumer", { "app/frontend/thing.tsx": VIOLATION });
    const { out } = audit(dir, "--changed", "--base=HEAD");

    expect(out).toContain("app/frontend/thing.tsx");
    expect(out).not.toContain("ngoài lãnh thổ");
  });
});
