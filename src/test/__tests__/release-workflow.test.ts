import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
const {
  RELEASE_STEPS,
  assertOnlyCoordinatedManifestChanges,
  assertTargetAvailability,
  buildReleasePlan,
  releaseCommandForStep,
  runRelease,
} =
  // @ts-expect-error Release core intentionally stays dependency-free JavaScript for direct Node use.
  await import("../../../scripts/release-core.mjs");

const workspaces: string[] = [];

function releaseFixture(): string {
  const rootDir = mkdtempSync(join(tmpdir(), "godxjp-release-test-"));
  workspaces.push(rootDir);
  mkdirSync(join(rootDir, "mcp"));
  writeFileSync(join(rootDir, "README.md"), "UI fixture\n");
  writeFileSync(join(rootDir, "mcp/README.md"), "MCP fixture\n");
  writeFileSync(
    join(rootDir, "package.json"),
    `${JSON.stringify(
      {
        name: "@godxjp/ui-release-test",
        version: "18.4.0",
        godxUiMcp: "18.4.0",
        files: ["README.md"],
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(rootDir, "mcp/package.json"),
    `${JSON.stringify(
      {
        name: "@godxjp/ui-mcp-release-test",
        version: "18.4.0",
        godxUiCompatibility: "18.4.x",
        files: ["README.md"],
      },
      null,
      2,
    )}\n`,
  );
  return rootDir;
}

function packageJson(rootDir: string, packageDirectory = "."): Record<string, unknown> {
  return JSON.parse(readFileSync(join(rootDir, packageDirectory, "package.json"), "utf8"));
}

function fakeArtifacts(onCleanup = () => {}): Record<string, unknown> {
  return {
    ui: {},
    mcp: {},
    uiTarball: "/tmp/verified-godxjp-ui-18.4.1.tgz",
    mcpTarball: "/tmp/verified-godxjp-ui-mcp-18.4.1.tgz",
    cleanup: onCleanup,
  };
}

afterEach(() => {
  for (const workspace of workspaces.splice(0)) rmSync(workspace, { force: true, recursive: true });
});

describe("coordinated release workflow", () => {
  it("runs every target gate before staged publish and promotes latest only afterward", () => {
    const plan = buildReleasePlan({ currentVersion: "18.4.0", uiBump: "patch", mcpBump: "sync" });
    const firstPublish = plan.steps.indexOf(RELEASE_STEPS.PublishUi);
    expect(plan.targetVersion).toBe("18.4.1");
    expect(plan.steps.slice(0, firstPublish)).toEqual([
      RELEASE_STEPS.ApplyTargetMetadata,
      RELEASE_STEPS.VerifyRoot,
      RELEASE_STEPS.InstallMcp,
      RELEASE_STEPS.BuildMcp,
      RELEASE_STEPS.TestMcp,
      RELEASE_STEPS.VerifyLockstep,
      RELEASE_STEPS.PackTargetManifests,
      RELEASE_STEPS.VerifyNpmAuth,
      RELEASE_STEPS.VerifyTargetAvailability,
      RELEASE_STEPS.VerifyPublishTree,
    ]);
    expect(plan.steps.indexOf(RELEASE_STEPS.VerifyPublishedVersions)).toBeGreaterThan(
      plan.steps.indexOf(RELEASE_STEPS.PublishMcp),
    );
    expect(plan.steps.indexOf(RELEASE_STEPS.PromoteUiLatest)).toBeGreaterThan(
      plan.steps.indexOf(RELEASE_STEPS.VerifyPublishedVersions),
    );
    expect(() =>
      buildReleasePlan({ currentVersion: "18.4.0", uiBump: "skip", mcpBump: "sync" }),
    ).toThrow("recovery-only");
  });

  it("dry-runs offline and packs coordinated target-version manifests", () => {
    const rootDir = releaseFixture();
    const externalSteps: string[] = [];
    const result = runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      dryRun: true,
      runStep: (step: string) => externalSteps.push(step),
    });
    expect(externalSteps).toEqual([]);
    expect(result.packedManifests.ui).toMatchObject({ version: "18.4.1", godxUiMcp: "18.4.1" });
    expect(result.packedManifests.mcp).toMatchObject({
      version: "18.4.1",
      godxUiCompatibility: "18.4.x",
    });
  }, 20_000);

  it("restores exact manifests when any pre-publish gate fails", () => {
    const rootDir = releaseFixture();
    const originalUi = readFileSync(join(rootDir, "package.json"), "utf8");
    const originalMcp = readFileSync(join(rootDir, "mcp/package.json"), "utf8");
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          if (step === RELEASE_STEPS.TestMcp) throw new Error("MCP test failed");
        },
      }),
    ).toThrow("MCP test failed");
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toBe(originalUi);
    expect(readFileSync(join(rootDir, "mcp/package.json"), "utf8")).toBe(originalMcp);
  });

  it("blocks generated drift immediately before publish and cleans verified tarballs", () => {
    const rootDir = releaseFixture();
    const originalUi = readFileSync(join(rootDir, "package.json"), "utf8");
    let cleaned = false;
    const executed: string[] = [];
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          executed.push(step);
          if (step === RELEASE_STEPS.VerifyPublishTree) {
            assertOnlyCoordinatedManifestChanges(
              " M package.json\0 M mcp/package.json\0?? generated-drift.json\0",
            );
          }
        },
        packTargetManifests: () =>
          fakeArtifacts(() => {
            cleaned = true;
          }),
      }),
    ).toThrow("generated-drift.json");
    expect(executed.at(-1)).toBe(RELEASE_STEPS.VerifyPublishTree);
    expect(executed).not.toContain(RELEASE_STEPS.PublishUi);
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toBe(originalUi);
    expect(cleaned).toBe(true);
  });

  it("publishes the exact verified tarballs under the staging tag in UI then MCP order", () => {
    const rootDir = releaseFixture();
    const commands: Array<[string, string[]]> = [];
    const artifacts = fakeArtifacts();
    runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      runStep: (step: string, plan: Record<string, unknown>, packed: Record<string, unknown>) => {
        if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
          commands.push(releaseCommandForStep(step, plan, packed));
        }
      },
      packTargetManifests: () => artifacts,
    });
    expect(commands).toEqual([
      [
        "npm",
        ["publish", artifacts.uiTarball, "--access", "public", "--tag", "godx-staging-18.4.1"],
      ],
      [
        "npm",
        ["publish", artifacts.mcpTarball, "--access", "public", "--tag", "godx-staging-18.4.1"],
      ],
    ]);
  });

  it("records UI-only staged recovery state when MCP publish fails without promoting latest", () => {
    const rootDir = releaseFixture();
    const executed: string[] = [];
    const states: Array<Record<string, unknown>> = [];
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          executed.push(step);
          if (step === RELEASE_STEPS.PublishMcp) throw new Error("MCP publish failed");
        },
        packTargetManifests: () => fakeArtifacts(),
        writeRecoveryState: (state: Record<string, unknown>) => states.push(structuredClone(state)),
      }),
    ).toThrow("MCP publish failed");
    const state = states.at(-1) as {
      ui: Record<string, unknown>;
      mcp: Record<string, unknown>;
    };
    expect(state.ui).toMatchObject({ published: true, promoted: false });
    expect(state.mcp).toMatchObject({ publishAttempted: true, published: false, promoted: false });
    expect(executed).not.toContain(RELEASE_STEPS.PromoteUiLatest);
    expect(executed).not.toContain(RELEASE_STEPS.CommitTargetMetadata);
    expect(packageJson(rootDir)).toMatchObject({ version: "18.4.1", godxUiMcp: "18.4.1" });
  });

  it("resumes the missing MCP publish and promotions without republishing UI", () => {
    const rootDir = releaseFixture();
    let recoveryState: Record<string, unknown> | null = null;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          if (step === RELEASE_STEPS.PublishMcp) throw new Error("MCP publish failed");
        },
        packTargetManifests: () => fakeArtifacts(),
        writeRecoveryState: (state: Record<string, unknown>) => {
          recoveryState = structuredClone(state);
        },
      }),
    ).toThrow("MCP publish failed");

    const executed: string[] = [];
    let cleared = false;
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      recoveryState,
      runStep: (step: string) => executed.push(step),
      packTargetManifests: () => fakeArtifacts(),
      writeRecoveryState: (state: Record<string, unknown>) => {
        recoveryState = structuredClone(state);
      },
      clearRecoveryState: () => {
        cleared = true;
      },
    });
    expect(executed).not.toContain(RELEASE_STEPS.PublishUi);
    expect(executed.filter((step) => step === RELEASE_STEPS.PublishMcp)).toHaveLength(1);
    expect(executed).toContain(RELEASE_STEPS.PromoteUiLatest);
    expect(executed).toContain(RELEASE_STEPS.PromoteMcpLatest);
    expect(executed).toContain(RELEASE_STEPS.CommitTargetMetadata);
    expect(cleared).toBe(true);
  });

  it("rejects an already-existing MCP target when recovery says it still needs publish", () => {
    expect(() =>
      assertTargetAvailability({
        recovery: true,
        progress: {
          ui: { published: true },
          mcp: { published: false },
        },
        uiExists: true,
        mcpExists: true,
      }),
    ).toThrow("Recovery MCP registry state mismatch");
  });
});
