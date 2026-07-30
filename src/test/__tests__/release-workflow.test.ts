import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
const {
  RELEASE_STEPS,
  assertOnlyCoordinatedManifestChanges,
  assertRegistryArtifact,
  buildReleasePlan,
  integrityFor,
  reconcilePackagePublication,
  releaseCommandForStep,
  runRelease,
  validateRecoveryState,
  writeJsonAtomic,
} =
  // @ts-expect-error Release core intentionally stays dependency-free JavaScript for direct Node use.
  await import("../../../scripts/release-core.mjs");

const workspaces: string[] = [];
const SOURCE_HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
type RecoveryState = Record<string, unknown> & {
  sourceHead: string;
  targetVersion: string;
  ui: Record<string, unknown>;
  mcp: Record<string, unknown>;
};

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "godxjp-release-test-"));
  workspaces.push(root);
  mkdirSync(join(root, "mcp"));
  writeFileSync(join(root, "README.md"), "UI\n");
  writeFileSync(join(root, "mcp/README.md"), "MCP\n");
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "@godxjp/ui-test",
        version: "18.4.0",
        godxUiMcp: "18.4.0",
        files: ["README.md"],
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(root, "mcp/package.json"),
    `${JSON.stringify(
      {
        name: "@godxjp/ui-mcp-test",
        version: "18.4.0",
        godxUiCompatibility: "18.4.x",
        files: ["README.md"],
      },
      null,
      2,
    )}\n`,
  );
  return root;
}

function artifacts(cleanup = () => {}): Record<string, unknown> {
  return {
    ui: {},
    mcp: {},
    uiTarball: "/tmp/verified-ui.tgz",
    mcpTarball: "/tmp/verified-mcp.tgz",
    uiIntegrity: "sha512-ui",
    mcpIntegrity: "sha512-mcp",
    cleanup,
  };
}

function recordLatest(step: string, progress: Record<string, Record<string, unknown>>): void {
  if (step === RELEASE_STEPS.RecordPreviousLatestTags) {
    progress.ui.previousLatest = "18.4.0";
    progress.mcp.previousLatest = "18.4.0";
  }
}

afterEach(() => {
  for (const root of workspaces.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("recoverable coordinated release", () => {
  it("orders every preflight before staged publish and latest promotion after exact verification", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    expect(plan.steps.slice(0, plan.steps.indexOf(RELEASE_STEPS.PublishUi))).toEqual([
      RELEASE_STEPS.ApplyTargetMetadata,
      RELEASE_STEPS.VerifyRoot,
      RELEASE_STEPS.InstallMcp,
      RELEASE_STEPS.BuildMcp,
      RELEASE_STEPS.TestMcp,
      RELEASE_STEPS.VerifyLockstep,
      RELEASE_STEPS.PackTargetManifests,
      RELEASE_STEPS.VerifyNpmAuth,
      RELEASE_STEPS.VerifyTargetAvailability,
      RELEASE_STEPS.RecordPreviousLatestTags,
      RELEASE_STEPS.VerifyPublishTree,
    ]);
    expect(plan.steps.indexOf(RELEASE_STEPS.PromoteUiLatest)).toBeGreaterThan(
      plan.steps.indexOf(RELEASE_STEPS.VerifyPublishedVersions),
    );
  });

  it("packs coordinated metadata locally without executing release gates", () => {
    const rootDir = fixture();
    const external: string[] = [];
    const result = runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      dryRun: true,
      runStep: (step: string) => external.push(step),
    });
    expect(external).toEqual([]);
    expect(result.packedManifests.ui).toMatchObject({ version: "18.4.1", godxUiMcp: "18.4.1" });
    expect(result.packedManifests.mcp).toMatchObject({
      version: "18.4.1",
      godxUiCompatibility: "18.4.x",
    });
  }, 20_000);

  it("restores byte-exact manifests on prepublish failure", () => {
    const rootDir = fixture();
    const ui = readFileSync(join(rootDir, "package.json"), "utf8");
    const mcp = readFileSync(join(rootDir, "mcp/package.json"), "utf8");
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          if (step === RELEASE_STEPS.TestMcp) throw new Error("gate failed");
        },
      }),
    ).toThrow("gate failed");
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toBe(ui);
    expect(readFileSync(join(rootDir, "mcp/package.json"), "utf8")).toBe(mcp);
  });

  it("blocks generated prepublish drift and cleans unconsumed artifacts", () => {
    const rootDir = fixture();
    let cleaned = false;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          if (step === RELEASE_STEPS.VerifyPublishTree) {
            assertOnlyCoordinatedManifestChanges(
              " M package.json\0 M mcp/package.json\0?? drift.json\0",
            );
          }
        },
        packTargetManifests: () =>
          artifacts(() => {
            cleaned = true;
          }),
      }),
    ).toThrow("drift.json");
    expect(cleaned).toBe(true);
  });

  it("publishes exact verified paths under the staging tag in UI then MCP order", () => {
    const rootDir = fixture();
    const packed = artifacts();
    const commands: Array<[string, string[]]> = [];
    runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      runStep: (
        step: string,
        plan: Record<string, unknown>,
        value: Record<string, unknown>,
        progress: Record<string, Record<string, unknown>>,
      ) => {
        recordLatest(step, progress);
        if (step === RELEASE_STEPS.PublishUi || step === RELEASE_STEPS.PublishMcp) {
          commands.push(releaseCommandForStep(step, plan, value));
        }
      },
      packTargetManifests: () => packed,
    });
    expect(commands).toEqual([
      ["npm", ["publish", packed.uiTarball, "--access", "public", "--tag", "godx-staging-18.4.1"]],
      ["npm", ["publish", packed.mcpTarball, "--access", "public", "--tag", "godx-staging-18.4.1"]],
    ]);
  });

  it("reconciles ambiguous publish only when integrity and staging tag are exact", () => {
    const progress = {
      publishAttempted: true,
      published: false,
      promoted: false,
      stageTagRemoved: false,
    };
    reconcilePackagePublication({
      progress,
      registry: {
        exists: true,
        integrity: "sha512-exact",
        tags: { "godx-staging-18.4.1": "18.4.1" },
      },
      artifact: { integrity: "sha512-exact" },
      targetVersion: "18.4.1",
      stageTag: "godx-staging-18.4.1",
      packageName: "@godxjp/ui",
    });
    expect(progress.published).toBe(true);
    expect(() =>
      reconcilePackagePublication({
        progress: { ...progress, published: false },
        registry: {
          exists: true,
          integrity: "sha512-other",
          tags: { "godx-staging-18.4.1": "18.4.1" },
        },
        artifact: { integrity: "sha512-exact" },
        targetVersion: "18.4.1",
        stageTag: "godx-staging-18.4.1",
        packageName: "@godxjp/ui",
      }),
    ).toThrow("cannot be reconciled");
  });

  it("requires exact registry integrity and staging tag before promotion", () => {
    expect(() =>
      assertRegistryArtifact(
        { exists: true, integrity: "sha512-exact", tags: { "godx-staging-18.4.1": "18.4.0" } },
        { integrity: "sha512-exact" },
        "18.4.1",
        "godx-staging-18.4.1",
        "@godxjp/ui",
      ),
    ).toThrow("integrity or staging tag");
    expect(() =>
      assertRegistryArtifact(
        { exists: true, integrity: "sha512-exact", tags: {} },
        { integrity: "sha512-exact" },
        "18.4.1",
        "godx-staging-18.4.1",
        "@godxjp/ui",
        false,
      ),
    ).not.toThrow();
  });

  it("binds recovery to source HEAD, exact manifests and retained SHA512 artifacts", () => {
    const rootDir = fixture();
    const recoveryDirectory = join(rootDir, ".recovery");
    const artifactDirectory = join(recoveryDirectory, "artifacts");
    mkdirSync(artifactDirectory, { recursive: true });
    const uiTarball = join(artifactDirectory, "ui.tgz");
    const mcpTarball = join(artifactDirectory, "mcp.tgz");
    writeFileSync(uiTarball, "ui bytes");
    writeFileSync(mcpTarball, "mcp bytes");
    let state: RecoveryState | null = null;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        recoveryDirectory,
        runStep: (
          step: string,
          _plan: unknown,
          _packed: unknown,
          progress: Record<string, Record<string, unknown>>,
        ) => {
          recordLatest(step, progress);
          if (step === RELEASE_STEPS.PublishMcp) throw new Error("MCP failed");
        },
        packTargetManifests: () => ({
          ui: {},
          mcp: {},
          uiTarball,
          mcpTarball,
          uiIntegrity: integrityFor(uiTarball),
          mcpIntegrity: integrityFor(mcpTarball),
        }),
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("MCP failed");
    expect(
      validateRecoveryState(state, { sourceHead: SOURCE_HEAD, rootDir, recoveryDirectory }),
    ).toMatchObject({
      sourceHead: SOURCE_HEAD,
      targetVersion: "18.4.1",
    });
    expect(() =>
      validateRecoveryState(state, { sourceHead: OTHER_HEAD, rootDir, recoveryDirectory }),
    ).toThrow("source HEAD");
    const wrongBoolean = structuredClone(state) as unknown as RecoveryState;
    wrongBoolean.ui.published = "true";
    expect(() =>
      validateRecoveryState(wrongBoolean, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toThrow("progress invariants");
    const invalidPreviousLatest = structuredClone(state) as unknown as RecoveryState;
    invalidPreviousLatest.ui.previousLatest = "latest";
    expect(() =>
      validateRecoveryState(invalidPreviousLatest, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toThrow("progress invariants");
    const extraKey = structuredClone(state) as unknown as RecoveryState & { unexpected?: boolean };
    extraKey.unexpected = true;
    expect(() =>
      validateRecoveryState(extraKey, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toThrow("state shape");
    const impossiblePromotion = structuredClone(state) as unknown as RecoveryState;
    impossiblePromotion.mcp.published = true;
    impossiblePromotion.mcp.promoted = true;
    expect(() =>
      validateRecoveryState(impossiblePromotion, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toThrow("transaction invariants");
    writeFileSync(uiTarball, "tampered");
    expect(() =>
      validateRecoveryState(state, { sourceHead: SOURCE_HEAD, rootDir, recoveryDirectory }),
    ).toThrow("SHA512");
  });

  it("reconciles ambiguous staging-tag removal and resumes after one tag removal", () => {
    const removalProgress = {
      publishAttempted: true,
      published: true,
      promoted: true,
      compensated: false,
      stageTagRemovalAttempted: true,
      stageTagRemoved: false,
      previousLatest: "18.4.0",
    };
    reconcilePackagePublication({
      progress: removalProgress,
      registry: { exists: true, integrity: "sha512-exact", tags: {} },
      artifact: { integrity: "sha512-exact" },
      targetVersion: "18.4.1",
      stageTag: "godx-staging-18.4.1",
      packageName: "@godxjp/ui",
    });
    expect(removalProgress.stageTagRemoved).toBe(true);

    const rootDir = fixture();
    let state: RecoveryState | null = null;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: (
          step: string,
          _plan: unknown,
          _packed: unknown,
          progress: Record<string, Record<string, unknown>>,
        ) => {
          recordLatest(step, progress);
          if (step === RELEASE_STEPS.RemoveMcpStagingTag) throw new Error("remove timed out");
        },
        packTargetManifests: () => artifacts(),
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("remove timed out");
    expect((state as RecoveryState | null)?.ui).toMatchObject({
      stageTagRemovalAttempted: true,
      stageTagRemoved: true,
    });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({
      stageTagRemovalAttempted: true,
      stageTagRemoved: false,
    });
    reconcilePackagePublication({
      progress: (state as unknown as RecoveryState).mcp,
      registry: { exists: true, integrity: "sha512-mcp", tags: {} },
      artifact: { integrity: "sha512-mcp" },
      targetVersion: "18.4.1",
      stageTag: "godx-staging-18.4.1",
      packageName: "@godxjp/ui-mcp",
    });
    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: state,
      runStep: (step: string) => executed.push(step),
      writeRecoveryState: (value: RecoveryState) => {
        state = structuredClone(value);
      },
    });
    expect(executed).not.toContain(RELEASE_STEPS.RemoveUiStagingTag);
    expect(executed).not.toContain(RELEASE_STEPS.RemoveMcpStagingTag);
    expect(executed).toContain(RELEASE_STEPS.CommitTargetMetadata);
  });

  it("resumes commit failure after both staging tags were removed", () => {
    const rootDir = fixture();
    let state: RecoveryState | null = null;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: (
          step: string,
          _plan: unknown,
          _packed: unknown,
          progress: Record<string, Record<string, unknown>>,
        ) => {
          recordLatest(step, progress);
          if (step === RELEASE_STEPS.CommitTargetMetadata) throw new Error("commit failed");
        },
        packTargetManifests: () => artifacts(),
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("commit failed");
    expect((state as RecoveryState | null)?.ui).toMatchObject({ stageTagRemoved: true });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({ stageTagRemoved: true });
    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: state,
      runStep: (step: string) => executed.push(step),
    });
    expect(executed).not.toContain(RELEASE_STEPS.RemoveUiStagingTag);
    expect(executed).not.toContain(RELEASE_STEPS.RemoveMcpStagingTag);
    expect(executed).toEqual(
      expect.arrayContaining([
        RELEASE_STEPS.VerifyPublishedVersions,
        RELEASE_STEPS.CommitTargetMetadata,
      ]),
    );
  });

  it("writes recovery state atomically", () => {
    const rootDir = fixture();
    const path = join(rootDir, ".recovery", "state.json");
    writeJsonAtomic(path, { schemaVersion: 2, targetVersion: "18.4.1" });
    expect(JSON.parse(readFileSync(path, "utf8"))).toMatchObject({
      schemaVersion: 2,
      targetVersion: "18.4.1",
    });
  });

  it("compensates UI latest on MCP promotion failure and recovery retries promotions only", () => {
    const rootDir = fixture();
    let state: RecoveryState | null = null;
    let compensated = false;
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: (
          step: string,
          _plan: unknown,
          _packed: unknown,
          progress: Record<string, Record<string, unknown>>,
        ) => {
          recordLatest(step, progress);
          if (step === RELEASE_STEPS.PromoteMcpLatest) throw new Error("promotion failed");
        },
        packTargetManifests: () => artifacts(),
        compensateLatest: () => {
          compensated = true;
          return {
            observed: { ui: "18.4.1", mcp: "18.4.1" },
            restored: { ui: "18.4.0", mcp: "18.4.0" },
          };
        },
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("promotion failed");
    expect(compensated).toBe(true);
    expect((state as RecoveryState | null)?.ui).toMatchObject({
      published: true,
      promoted: false,
      compensated: true,
      previousLatest: "18.4.0",
    });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({
      published: true,
      promoted: false,
      compensated: true,
      previousLatest: "18.4.0",
    });
    expect((state as RecoveryState | null)?.latestCompensation).toEqual({
      observed: { ui: "18.4.1", mcp: "18.4.1" },
      restored: { ui: "18.4.0", mcp: "18.4.0" },
    });

    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: state,
      runStep: (step: string) => executed.push(step),
      writeRecoveryState: (value: RecoveryState) => {
        state = structuredClone(value);
      },
    });
    expect(executed).not.toContain(RELEASE_STEPS.PublishUi);
    expect(executed).not.toContain(RELEASE_STEPS.PublishMcp);
    expect(executed).toContain(RELEASE_STEPS.PromoteUiLatest);
    expect(executed).toContain(RELEASE_STEPS.PromoteMcpLatest);
  });

  it("labels metadata-plan CLI output as explicitly non-validating", () => {
    const output = execFileSync(
      "node",
      ["scripts/release.mjs", "--ui", "patch", "--mcp", "sync", "--metadata-plan"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    expect(output).toContain("NOT validated");
    expect(output).toContain('"releaseValidated": false');
  }, 20_000);
});
