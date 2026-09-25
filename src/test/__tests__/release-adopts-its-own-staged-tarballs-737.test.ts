import { describe, expect, it } from "vitest";

const { adoptAlreadyStagedTargets, assertFreshTargets, STAGE_TAG } =
  // @ts-expect-error Release core intentionally stays dependency-free JavaScript for direct Node use.
  (await import("../../../scripts/release-core.mjs")) as {
    STAGE_TAG: string;
    assertFreshTargets: (ui: unknown, mcp: unknown) => void;
    adoptAlreadyStagedTargets: (input: {
      uiRegistry: unknown;
      mcpRegistry: unknown;
      artifacts: { ui: { integrity: string }; mcp: { integrity: string } };
      targetVersion: string;
      stageTag: string;
    }) => boolean;
  };

/**
 * A RELEASE THAT PUBLISHED EVERYTHING AND HAD NO WAY TO FINISH (gh#737).
 *
 * `verify-published-versions` waits up to 300s for npm's read-after-write to catch up. Measured
 * twice here: 348s (v30.5.2) and 334s (v30.6.0). Both had already published both tarballs, so they
 * aborted with `godx-staging` on the new version and `latest` a release behind.
 *
 * The rerun was meant to be the way out and was not: recovery state lives in the RUNNER's workspace,
 * and this repo has several runners. v30.5.3's rerun landed on the same one and resumed; v30.6.0's
 * landed elsewhere, took the fresh path, and hit `Target version already exists`. Resumability was
 * decided by job scheduling, and `latest` sat on 30.4.2 for 7h40 across three published versions.
 *
 * These tests pin BOTH directions, because widening this is how a release guard stops guarding: the
 * run's OWN bytes are adopted, and anything else still refuses.
 */

const VERSION = "31.2.0";
const UI_INTEGRITY = `sha512-${"u".repeat(86)}==`;
const MCP_INTEGRITY = `sha512-${"m".repeat(86)}==`;

const artifacts = {
  ui: { integrity: UI_INTEGRITY },
  mcp: { integrity: MCP_INTEGRITY },
};

/** What `registryState` returns: existence, the tarball's integrity, and the dist-tags. */
const onRegistry = (integrity: string, stageTagVersion: string = VERSION) => ({
  exists: true,
  integrity,
  tags: { [STAGE_TAG]: stageTagVersion },
});
const absent = { exists: false, integrity: null, tags: {} };

const adopt = (uiRegistry: unknown, mcpRegistry: unknown) =>
  adoptAlreadyStagedTargets({
    uiRegistry,
    mcpRegistry,
    artifacts,
    targetVersion: VERSION,
    stageTag: STAGE_TAG,
  });

describe("a release adopts its own already-staged tarballs (gh#737)", () => {
  it("adopts when BOTH packages are on the registry as this run's own bytes", () => {
    // The measured state of v30.6.0 at the moment its rerun refused.
    expect(adopt(onRegistry(UI_INTEGRITY), onRegistry(MCP_INTEGRITY))).toBe(true);
  });

  it("does NOT adopt a fresh release — the normal path is untouched", () => {
    // The negative case that matters most: this must not become "publishing is optional".
    expect(adopt(absent, absent)).toBe(false);
  });

  it("refuses bytes that are not ours, however plausible the version looks", () => {
    const foreign = `sha512-${"x".repeat(86)}==`;
    expect(() => adopt(onRegistry(foreign), onRegistry(MCP_INTEGRITY))).toThrow(
      /integrity or staging tag does not match/,
    );
  });

  it("refuses when the staging tag has not moved to this version", () => {
    // Integrity right, staging tag still on the previous release: the registry is mid-propagation,
    // and treating that as "published" would promote on a half-visible packument.
    expect(() => adopt(onRegistry(UI_INTEGRITY, "31.1.0"), onRegistry(MCP_INTEGRITY))).toThrow(
      /integrity or staging tag does not match/,
    );
  });

  it("does not adopt a PARTIAL publish — one side present is not a finished release", () => {
    // Returning false hands it to `assertFreshTargets`, which refuses. Which half ran is not
    // something these bytes can answer, so it stays a human's call.
    expect(adopt(onRegistry(UI_INTEGRITY), absent)).toBe(false);
    expect(adopt(absent, onRegistry(MCP_INTEGRITY))).toBe(false);
  });

  it("the refusal names WHICH package is already there", () => {
    // It used to say only "Target version already exists", so whoever read it had to go and look.
    expect(() => assertFreshTargets(onRegistry(UI_INTEGRITY), absent)).toThrow(/@godxjp\/ui;/);
    expect(() => assertFreshTargets(onRegistry(UI_INTEGRITY), absent)).toThrow(
      /Only one of the two/,
    );
    expect(() => assertFreshTargets(onRegistry(UI_INTEGRITY), onRegistry(MCP_INTEGRITY))).toThrow(
      /@godxjp\/ui and @godxjp\/ui-mcp/,
    );
  });

  it("stays silent on a genuinely fresh target", () => {
    expect(() => assertFreshTargets(absent, absent)).not.toThrow();
  });
});
