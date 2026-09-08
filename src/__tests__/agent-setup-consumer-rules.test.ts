import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// prettier-ignore
// @ts-expect-error — plain ESM script without a declaration file
import { ensureConsumerRules, stampedDigest, stampedVersion } from "../../scripts/_agent-setup.mjs";

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
});
