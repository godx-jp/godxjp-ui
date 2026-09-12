import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

// prettier-ignore
// @ts-expect-error — plain ESM script without a declaration file
import { ensureConsumerRules, guineaPigStamp, KIT_VERSION, refreshGuineaPigSkill, stampedDigest, stampedVersion } from "../../scripts/_agent-setup.mjs";

/*
 * `ensureConsumerRules` writes the package-owned rule file into a consumer repo. What it decides is
 * whether an agent working in that repo reads THIS release's guidance or the previous one's, and it
 * decides it silently either way — so the decision is worth pinning.
 *
 * It used to skip whenever the stamped VERSION matched the installed package. Measured on the three
 * consumers of this package: editing `consumer-rule.md` without bumping the version left two of
 * them holding the old text under a stamp that read as current, with nothing anywhere reporting a
 * difference. The rules are edited far more often than the version moves — most of all while they
 * are being written — so the guard now compares a digest of the content.
 */

const roots: string[] = [];

function consumerRepo(uiDir = "resources/js") {
  const root = mkdtempSync(join(tmpdir(), "godxui-consumer-"));
  roots.push(root);
  mkdirSync(join(root, uiDir), { recursive: true });
  return root;
}

const rulePath = (root: string) => join(root, ".ai", "rules", "godxjp-ui.md");

function managedRuleBody(uiDir: string) {
  const body = readFileSync(join(import.meta.dirname, "../../scripts/consumer-rule.md"), "utf8");
  const front = `---\npaths:\n    - '${uiDir}/**'\n---\n\n`;
  return `${front}${body}`;
}

function writeDigestMatchedStaleVersionStamp(root: string, uiDir: string, stamped = "23.3.0") {
  const managed = managedRuleBody(uiDir);
  const digest = createHash("sha256").update(managed).digest("hex").slice(0, 12);
  mkdirSync(join(root, ".ai", "rules"), { recursive: true });
  writeFileSync(
    rulePath(root),
    `<!-- godxjp-ui:version ${stamped} -->\n<!-- godxjp-ui:digest ${digest} -->\n${managed}`,
  );
}

const auditScript = join(import.meta.dirname, "../../scripts/ui-audit.mjs");

function auditOwnedRulesStale(root: string) {
  mkdirSync(join(root, "node_modules", "@godxjp", "ui"), { recursive: true });
  writeFileSync(
    join(root, "node_modules", "@godxjp", "ui", "package.json"),
    JSON.stringify({ name: "@godxjp/ui", version: KIT_VERSION }),
  );
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "consumer" }));
  const result = spawnSync(process.execPath, [auditScript, "--format", "json"], {
    cwd: root,
    encoding: "utf8",
  });
  return result.stdout;
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop()!, { recursive: true, force: true });
});

describe("ensureConsumerRules", () => {
  it("installs the rule file and stamps both the version and the content", () => {
    const root = consumerRepo();
    expect(ensureConsumerRules(root)).toBe("resources/js");

    const written = readFileSync(rulePath(root), "utf8");
    expect(stampedVersion(written)).toBeTruthy();
    expect(stampedDigest(written)).toMatch(/^[0-9a-f]{12}$/);
    // The detected glob reaches the front matter — a rule wired to a directory the repo does not
    // have never fires, and looks installed while it does nothing.
    expect(written).toContain("- 'resources/js/**'");
  });

  it("is a no-op on the second run, so installing twice does not churn the file", () => {
    const root = consumerRepo();
    ensureConsumerRules(root);
    const first = readFileSync(rulePath(root), "utf8");

    expect(ensureConsumerRules(root)).toBe(false);
    expect(readFileSync(rulePath(root), "utf8")).toBe(first);
  });

  it("REWRITES when the rule text changed but the package version did not", () => {
    // The regression this guard exists for. A stale body under a current version stamp is the
    // worst of the three states: an agent reads it, believes it, and is wrong.
    const root = consumerRepo();
    ensureConsumerRules(root);
    const current = readFileSync(rulePath(root), "utf8");

    const stale = current.replace(
      /<!-- godxjp-ui:digest [0-9a-f]{12} -->/,
      `<!-- godxjp-ui:digest ${createHash("sha256").update("something else").digest("hex").slice(0, 12)} -->`,
    );
    writeFileSync(rulePath(root), stale);

    expect(ensureConsumerRules(root)).toBe("resources/js");
    expect(readFileSync(rulePath(root), "utf8")).toBe(current);
  });

  it("rewrites a file left by an older release that carries no digest at all", () => {
    const root = consumerRepo();
    mkdirSync(join(root, ".ai", "rules"), { recursive: true });
    writeFileSync(
      rulePath(root),
      "<!-- godxjp-ui:version 19.6.0 -->\n---\npaths:\n    - 'resources/js/**'\n---\n\nold text\n",
    );

    expect(ensureConsumerRules(root)).toBe("resources/js");
    expect(readFileSync(rulePath(root), "utf8")).not.toContain("old text");
  });

  it("declines a repo with no UI directory rather than installing a rule that can never fire", () => {
    const root = mkdtempSync(join(tmpdir(), "godxui-empty-"));
    roots.push(root);
    expect(ensureConsumerRules(root)).toBe(false);
  });

  it("carries the three-column scope contract, the one thing consumers get wrong unprompted", () => {
    // Not prose-checking the file: this is the standard the platform layout depends on, and a
    // refactor that drops it leaves every consumer free to put app nav in the platform rail.
    const root = consumerRepo();
    ensureConsumerRules(root);
    const written = readFileSync(rulePath(root), "utf8");

    expect(written).toContain("navRail");
    expect(written).toMatch(/platform/i);
    expect(written).toContain("--app-shell-nav-rail-width");
  });

  describe("owned-rule version stamp vs digest (godx-jp/id#513)", () => {
    it("resyncs the version stamp when digest matches but the release marker is behind", () => {
      const root = consumerRepo();
      writeDigestMatchedStaleVersionStamp(root, "resources/js");
      expect(stampedVersion(readFileSync(rulePath(root), "utf8"))).toBe("23.3.0");

      expect(ensureConsumerRules(root)).toBe("resources/js");
      expect(stampedVersion(readFileSync(rulePath(root), "utf8"))).toBe(KIT_VERSION);
      expect(auditOwnedRulesStale(root)).not.toContain('"owned-rules-stale"');
    });

    it("is idempotent after a version-stamp-only resync", () => {
      const root = consumerRepo();
      writeDigestMatchedStaleVersionStamp(root, "resources/js");
      ensureConsumerRules(root);
      const once = readFileSync(rulePath(root), "utf8");
      const mtime = statSync(rulePath(root)).mtimeMs;

      expect(ensureConsumerRules(root)).toBe(false);
      expect(readFileSync(rulePath(root), "utf8")).toBe(once);
      expect(statSync(rulePath(root)).mtimeMs).toBe(mtime);
    });
  });
});

describe("refreshGuineaPigSkill", () => {
  const skillDir = (root: string) => join(root, ".claude", "skills", "godx-ui-guinea-pig");
  const skillPath = (root: string) => join(skillDir(root), "SKILL.md");
  const optinPath = (root: string) => join(skillDir(root), ".guinea-pig-optin");

  function optedIn(stamp = guineaPigStamp(), tail = "") {
    const root = consumerRepo();
    mkdirSync(skillDir(root), { recursive: true });
    writeFileSync(skillPath(root), `stale base\n${tail}`);
    writeFileSync(optinPath(root), `${stamp}\n`);
    return root;
  }

  it("is a no-op when the base text and opt-in stamp already match this release", () => {
    const root = optedIn();
    expect(refreshGuineaPigSkill(root)).toBe(false);
    expect(readFileSync(skillPath(root), "utf8")).toContain("stale base");
  });

  it("resyncs only the opt-in version half when the base digest already matches", () => {
    const stamp = guineaPigStamp();
    const digest = stamp.split(":").pop()!;
    const root = optedIn(`23.3.0:${digest}`, "\n---\n\n# 8. This repo\n\nits own note\n");
    expect(refreshGuineaPigSkill(root)).toBe(true);
    expect(readFileSync(optinPath(root), "utf8").trim()).toBe(guineaPigStamp());
    const written = readFileSync(skillPath(root), "utf8");
    expect(written).toContain("# 8. This repo");
    expect(written).toContain("its own note");
    expect(written).toContain("stale base");
  });

  it("refreshes when the base text changed under an unchanged version", () => {
    const root = optedIn("20.0.0:000000000000");
    expect(refreshGuineaPigSkill(root)).toBe(true);
    expect(readFileSync(skillPath(root), "utf8")).not.toContain("stale base");
    expect(readFileSync(optinPath(root), "utf8").trim()).toBe(guineaPigStamp());
  });

  it("preserves everything the repo appended below the `# 8.` marker", () => {
    // The base is the package's; section 8 down is the repo's — a deliberate audit exception, its
    // package manager, its open findings. A refresh that ate them would make repos stop opting in.
    const root = optedIn("20.0.0:000000000000", "\n---\n\n# 8. This repo\n\nits own note\n");
    refreshGuineaPigSkill(root);
    const written = readFileSync(skillPath(root), "utf8");
    expect(written).toContain("# 8. This repo");
    expect(written).toContain("its own note");
    expect(written).not.toContain("stale base");
  });

  it("declines a repo that never opted in — the skill carries an obligation, not a default", () => {
    // Installing it in an ordinary consumer would tell its agent to go edit a library it has no
    // mandate over.
    const root = consumerRepo();
    mkdirSync(skillDir(root), { recursive: true });
    writeFileSync(skillPath(root), "base");
    expect(refreshGuineaPigSkill(root)).toBe(false);
  });
});
