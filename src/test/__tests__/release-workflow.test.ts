import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
const {
  CI_PROOF_FOR_RELEASE_GATE,
  RELEASE_STEPS,
  REQUIRED_CI_CHECK_RUNS,
  VERIFY_ROOT_SCRIPTS,
  applyTargetMetadata,
  assertCiProvenance,
  assertOnlyCoordinatedManifestChanges,
  assertPreflightOrder,
  assertRegistryArtifact,
  assertReleaseCommandPlan,
  assertReleaseTagMatchesTree,
  assertTargetOutranksLatest,
  buildReleasePlan,
  commitFromLsRemote,
  compareVersions,
  createReleaseRuntime,
  integrityFor,
  planReleaseCommands,
  reconcilePackagePublication,
  releaseCommandForStep,
  runRelease,
  validateRecoveryState,
  verifyRootScriptFor,
  versionFromReleaseTag,
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
type ReleaseCommand = { step: string; binary: string; args: string[]; cwd: string };
type Capture = { status: number; stdout: string; stderr: string };

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
      RELEASE_STEPS.VerifyReleaseTag,
      RELEASE_STEPS.VerifyCommitProvenance,
      RELEASE_STEPS.VerifyRoot,
      RELEASE_STEPS.InstallMcp,
      RELEASE_STEPS.BuildMcp,
      RELEASE_STEPS.TestMcp,
      RELEASE_STEPS.VerifyLockstep,
      RELEASE_STEPS.PackTargetManifests,
      RELEASE_STEPS.VerifyNpmAuth,
      RELEASE_STEPS.VerifyTargetOutranksLatest,
      RELEASE_STEPS.VerifyTargetAvailability,
      RELEASE_STEPS.RecordPreviousLatestTags,
      RELEASE_STEPS.VerifyPublishTree,
    ]);
    expect(plan.steps.indexOf(RELEASE_STEPS.PromoteUiLatest)).toBeGreaterThan(
      plan.steps.indexOf(RELEASE_STEPS.VerifyPublishedVersions),
    );
  });

  it("adopts an exact staged pair without planning an immutable republish", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      adoptStagedVersion: "18.5.0",
    });
    expect(plan.targetVersion).toBe("18.5.0");
    expect(plan.adoptStaged).toBe(true);
    expect(plan.steps).not.toContain(RELEASE_STEPS.PublishUi);
    expect(plan.steps).not.toContain(RELEASE_STEPS.PublishMcp);
    expect(plan.steps.indexOf(RELEASE_STEPS.VerifyPublishedVersions)).toBeLessThan(
      plan.steps.indexOf(RELEASE_STEPS.PromoteUiLatest),
    );
  });

  it("retries bounded post-publish verification while npm registry metadata propagates", () => {
    let uiIntegrityReads = 0;
    let waits = 0;
    const capture = (_binary: string, args: string[]): Capture => {
      if (args[0] === "view" && args[2] === "dist.integrity") {
        const isUi = args[1].startsWith("@godxjp/ui@18.5.0");
        if (isUi) uiIntegrityReads += 1;
        const integrity =
          isUi && uiIntegrityReads === 1 ? "sha512-stale" : isUi ? "sha512-ui" : "sha512-mcp";
        return { status: 0, stdout: JSON.stringify(integrity), stderr: "" };
      }
      if (args[0] === "view" && args[2] === "dist-tags") {
        return {
          status: 0,
          stdout: JSON.stringify({ "godx-staging": "18.5.0" }),
          stderr: "",
        };
      }
      throw new Error(`unexpected capture: ${args.join(" ")}`);
    };
    const runtime = createReleaseRuntime({
      repositoryRoot: fixture(),
      run: () => {},
      capture,
      wait: () => {
        waits += 1;
      },
      registryVerificationAttempts: 3,
      registryVerificationDelayMs: 0,
    });
    runtime.runStep(
      RELEASE_STEPS.VerifyPublishedVersions,
      { targetVersion: "18.5.0", stageTag: "godx-staging" },
      artifacts(),
      {
        artifacts: {
          ui: { integrity: "sha512-ui" },
          mcp: { integrity: "sha512-mcp" },
        },
      },
    );
    expect(uiIntegrityReads).toBe(2);
    expect(waits).toBe(1);
  });

  it("plans the whole side-effecting command sequence with every gate before the first publish", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    const commands: ReleaseCommand[] = planReleaseCommands(plan, artifacts());
    expect(
      commands.map((entry) => `${[entry.binary, ...entry.args].join(" ")} @${entry.cwd}`),
    ).toEqual([
      "pnpm run verify:publish-tree @root",
      "pnpm install --frozen-lockfile @mcp",
      "pnpm build @mcp",
      "pnpm test @mcp",
      "node scripts/check-release-lockstep.mjs @root",
      "npm whoami @root",
      "npm publish /tmp/verified-ui.tgz --access public --tag godx-staging @root",
      "npm publish /tmp/verified-mcp.tgz --access public --tag godx-staging @root",
      "npm dist-tag add @godxjp/ui@18.4.1 latest @root",
      "npm dist-tag add @godxjp/ui-mcp@18.4.1 latest @root",
    ]);
    // No `npm dist-tag rm` anywhere: the constant overwritable godx-staging tag needs no delete
    // permission (issue #266) — the next release simply overwrites it.
    expect(commands.some((entry) => entry.args[0] === "dist-tag" && entry.args[1] === "rm")).toBe(
      false,
    );
    expect(assertReleaseCommandPlan(commands)).toBe(commands);
  });

  it("rejects a package-manager version bump and any publish that outruns a gate", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    const planned: ReleaseCommand[] = planReleaseCommands(plan, artifacts());
    expect(() =>
      assertReleaseCommandPlan([
        { step: "legacy-bump", binary: "npm", args: ["version", "patch"], cwd: "root" },
        ...planned,
      ]),
    ).toThrow('must not bump with "npm version"');
    const publishFirst = [
      ...planned.filter((entry) => entry.step === RELEASE_STEPS.PublishUi),
      ...planned.filter((entry) => entry.step !== RELEASE_STEPS.PublishUi),
    ];
    expect(() => assertReleaseCommandPlan(publishFirst)).toThrow(
      `Release plan runs preflight gate "${RELEASE_STEPS.VerifyRoot}" after publish.`,
    );
  });

  it("refuses to plan a publish without a tarball verified by the preflight pack", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    expect(() => releaseCommandForStep(RELEASE_STEPS.PublishUi, plan, {})).toThrow(
      "no verified tarball",
    );
  });

  it("runs the real executor offline in gate → publish → promote → commit order at the target version", () => {
    const rootDir = fixture();
    const packed = artifacts();
    const registry: Record<string, { integrity: string | null; tags: Record<string, string> }> = {
      "@godxjp/ui": { integrity: null, tags: { latest: "18.4.0" } },
      "@godxjp/ui-mcp": { integrity: null, tags: { latest: "18.4.0" } },
    };
    const log: string[] = [];
    const manifestsAtPublish: Array<{ ui: unknown; mcp: unknown }> = [];

    const run = (binary: string, args: string[], cwd: string): void => {
      log.push(`${[binary, ...args].join(" ")} @${cwd === join(rootDir, "mcp") ? "mcp" : "root"}`);
      if (binary !== "npm") return;
      if (args[0] === "publish") {
        manifestsAtPublish.push({
          ui: JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8")),
          mcp: JSON.parse(readFileSync(join(rootDir, "mcp/package.json"), "utf8")),
        });
        const name = args[1] === packed.uiTarball ? "@godxjp/ui" : "@godxjp/ui-mcp";
        registry[name].integrity = name === "@godxjp/ui" ? "sha512-ui" : "sha512-mcp";
        registry[name].tags[args[args.length - 1]] = "18.4.1";
      }
      if (args[0] === "dist-tag" && args[1] === "add") {
        const [name, version] = args[2].split(/@(?=\d)/);
        registry[name].tags.latest = version;
      }
      if (args[0] === "dist-tag" && args[1] === "rm") delete registry[args[2]].tags[args[3]];
    };

    const capture = (binary: string, args: string[]): Capture => {
      if (binary === "git" && args[0] === "status") return { status: 0, stdout: "", stderr: "" };
      if (binary === "git" && args[0] === "diff") return { status: 1, stdout: "", stderr: "" };
      if (binary === "npm" && args[0] === "view" && args[2] === "dist.integrity") {
        const spec = args[1];
        const integrity = registry[spec.slice(0, spec.lastIndexOf("@"))].integrity;
        return integrity
          ? { status: 0, stdout: JSON.stringify(integrity), stderr: "" }
          : { status: 1, stdout: "", stderr: "npm ERR! code E404" };
      }
      if (binary === "npm" && args[0] === "view" && args[2] === "dist-tags") {
        return { status: 0, stdout: JSON.stringify(registry[args[1]].tags), stderr: "" };
      }
      // The three preflight probes added for the tag trigger / CI provenance / ascent gates.
      if (binary === "git" && args[0] === "ls-remote") return { status: 0, stdout: "", stderr: "" };
      if (binary === "git" && args[0] === "rev-parse") {
        return { status: 0, stdout: `${"c".repeat(40)}\n`, stderr: "" };
      }
      if (binary === "git" && args[0] === "merge-base")
        return { status: 0, stdout: "", stderr: "" };
      if (binary === "gh") {
        const checkRuns = greenCheckRuns();
        return {
          status: 0,
          stdout: JSON.stringify({ total_count: checkRuns.length, check_runs: checkRuns }),
          stderr: "",
        };
      }
      throw new Error(`unexpected capture: ${binary} ${args.join(" ")}`);
    };

    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run,
      capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      runStep: runtime.runStep,
      compensateLatest: runtime.compensateLatest,
      packTargetManifests: () => {
        log.push("pack target manifests @root");
        return packed;
      },
    });

    expect(log).toEqual([
      "pnpm run verify:publish-tree @root",
      "pnpm install --frozen-lockfile @mcp",
      "pnpm build @mcp",
      "pnpm test @mcp",
      "node scripts/check-release-lockstep.mjs @root",
      "pack target manifests @root",
      "npm whoami @root",
      "npm publish /tmp/verified-ui.tgz --access public --tag godx-staging @root",
      "npm publish /tmp/verified-mcp.tgz --access public --tag godx-staging @root",
      "npm dist-tag add @godxjp/ui@18.4.1 latest @root",
      "npm dist-tag add @godxjp/ui-mcp@18.4.1 latest @root",
      "git add package.json mcp/package.json @root",
      "git commit -m chore(release): UI + MCP @18.4.1 @root",
    ]);
    // Post-release steady state (issue #266): godx-staging is NOT removed — it stays on the
    // released version, equal to latest, until the next release overwrites it.
    expect(registry["@godxjp/ui"].tags).toEqual({ latest: "18.4.1", "godx-staging": "18.4.1" });
    expect(registry["@godxjp/ui-mcp"].tags).toEqual({ latest: "18.4.1", "godx-staging": "18.4.1" });
    expect(manifestsAtPublish).toHaveLength(2);
    for (const snapshot of manifestsAtPublish) {
      expect(snapshot.ui).toMatchObject({ version: "18.4.1", godxUiMcp: "18.4.1" });
      expect(snapshot.mcp).toMatchObject({ version: "18.4.1", godxUiCompatibility: "18.4.x" });
    }
  });

  it("aborts the whole release when an MCP gate fails, before any publish command runs", () => {
    const rootDir = fixture();
    const log: string[] = [];
    const world = releaseWorld({ latest: { "@godxjp/ui": "18.4.0", "@godxjp/ui-mcp": "18.4.0" } });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: (binary: string, args: string[]) => {
        log.push([binary, ...args].join(" "));
        if (binary === "pnpm" && args[0] === "build") throw new Error("mcp build failed");
      },
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: runtime.runStep,
        packTargetManifests: () => artifacts(),
      }),
    ).toThrow("mcp build failed");
    expect(log.some((entry) => entry.startsWith("npm publish"))).toBe(false);
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toContain('"version": "18.4.0"');
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
    const commands: ReleaseCommand[] = [];
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
      {
        step: RELEASE_STEPS.PublishUi,
        binary: "npm",
        args: ["publish", packed.uiTarball, "--access", "public", "--tag", "godx-staging"],
        cwd: "root",
      },
      {
        step: RELEASE_STEPS.PublishMcp,
        binary: "npm",
        args: ["publish", packed.mcpTarball, "--access", "public", "--tag", "godx-staging"],
        cwd: "root",
      },
    ]);
  });

  it("reconciles ambiguous publish only when integrity and staging tag are exact", () => {
    const progress = {
      publishAttempted: true,
      published: false,
      promoted: false,
    };
    reconcilePackagePublication({
      progress,
      registry: {
        exists: true,
        integrity: "sha512-exact",
        tags: { "godx-staging": "18.4.1" },
      },
      artifact: { integrity: "sha512-exact" },
      targetVersion: "18.4.1",
      stageTag: "godx-staging",
      packageName: "@godxjp/ui",
    });
    expect(progress.published).toBe(true);
    expect(() =>
      reconcilePackagePublication({
        progress: { ...progress, published: false },
        registry: {
          exists: true,
          integrity: "sha512-other",
          tags: { "godx-staging": "18.4.1" },
        },
        artifact: { integrity: "sha512-exact" },
        targetVersion: "18.4.1",
        stageTag: "godx-staging",
        packageName: "@godxjp/ui",
      }),
    ).toThrow("cannot be reconciled");
  });

  it("requires the constant staging tag to point at the target version, before and after promote", () => {
    // Wrong version under the tag → refuse.
    expect(() =>
      assertRegistryArtifact(
        { exists: true, integrity: "sha512-exact", tags: { "godx-staging": "18.4.0" } },
        { integrity: "sha512-exact" },
        "18.4.1",
        "godx-staging",
        "@godxjp/ui",
      ),
    ).toThrow("integrity or staging tag");
    // Missing tag → refuse: there is no removal step any more, so an absent godx-staging can
    // only mean the publish under the constant tag never happened (issue #266).
    expect(() =>
      assertRegistryArtifact(
        { exists: true, integrity: "sha512-exact", tags: {} },
        { integrity: "sha512-exact" },
        "18.4.1",
        "godx-staging",
        "@godxjp/ui",
      ),
    ).toThrow("integrity or staging tag");
    // The accepted post-promote steady state: godx-staging === latest === targetVersion.
    expect(() =>
      assertRegistryArtifact(
        {
          exists: true,
          integrity: "sha512-exact",
          tags: { "godx-staging": "18.4.1", latest: "18.4.1" },
        },
        { integrity: "sha512-exact" },
        "18.4.1",
        "godx-staging",
        "@godxjp/ui",
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

  it("accepts a pre-#266 legacy recovery state, keeps its versioned staging tag and strips the removal flags", () => {
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

    // Rewrite the captured state into the exact shape the pre-#266 script persisted:
    // schemaVersion 2, per-version staging tag, and the two removal-progress flags.
    const legacy = structuredClone(state) as unknown as RecoveryState & {
      schemaVersion: number;
      stageTag: string;
    };
    legacy.schemaVersion = 2;
    legacy.stageTag = "godx-staging-18.4.1";
    for (const name of ["ui", "mcp"] as const) {
      legacy[name].stageTagRemovalAttempted = false;
      legacy[name].stageTagRemoved = false;
    }
    const normalized = validateRecoveryState(legacy, {
      sourceHead: SOURCE_HEAD,
      rootDir,
      recoveryDirectory,
    }) as RecoveryState & { schemaVersion: number; stageTag: string };
    expect(normalized.schemaVersion).toBe(3);
    expect(normalized.stageTag).toBe("godx-staging-18.4.1");
    expect(normalized.ui).not.toHaveProperty("stageTagRemovalAttempted");
    expect(normalized.ui).not.toHaveProperty("stageTagRemoved");
    expect(normalized.mcp).not.toHaveProperty("stageTagRemovalAttempted");
    expect(normalized.mcp).not.toHaveProperty("stageTagRemoved");

    // The recovery plan republishes under the tag the interrupted release actually used…
    const legacyPlan = buildReleasePlan({
      currentVersion: "18.4.1",
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: normalized,
    });
    expect(legacyPlan.stageTag).toBe("godx-staging-18.4.1");
    // …while a fresh plan always stages under the single constant, overwritable tag.
    expect(
      buildReleasePlan({
        currentVersion: "18.4.0",
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
      }).stageTag,
    ).toBe("godx-staging");
    // Any other tag shape stays rejected.
    const wrongTag = structuredClone(legacy) as unknown as RecoveryState & { stageTag: string };
    wrongTag.stageTag = "godx-staging-18.9.9";
    expect(() =>
      validateRecoveryState(wrongTag, { sourceHead: SOURCE_HEAD, rootDir, recoveryDirectory }),
    ).toThrow("staging tag is invalid");
  });

  it("resumes commit failure after both promotions without ever planning a tag removal", () => {
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
    expect((state as RecoveryState | null)?.ui).toMatchObject({ published: true, promoted: true });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({ published: true, promoted: true });
    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: state,
      runStep: (step: string) => executed.push(step),
    });
    expect(executed).not.toContain("remove-ui-staging-tag");
    expect(executed).not.toContain("remove-mcp-staging-tag");
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
    writeJsonAtomic(path, { schemaVersion: 3, targetVersion: "18.4.1" });
    expect(JSON.parse(readFileSync(path, "utf8"))).toMatchObject({
      schemaVersion: 3,
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

  it("compensates both latest tags on UI promotion ambiguity and clears history on recovery", () => {
    const rootDir = fixture();
    const recoveryDirectory = join(rootDir, ".recovery");
    const artifactDirectory = join(recoveryDirectory, "artifacts");
    mkdirSync(artifactDirectory, { recursive: true });
    const uiTarball = join(artifactDirectory, "ui.tgz");
    const mcpTarball = join(artifactDirectory, "mcp.tgz");
    writeFileSync(uiTarball, "ui immutable bytes");
    writeFileSync(mcpTarball, "mcp immutable bytes");
    let state: RecoveryState | null = null;
    let compensated = false;

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
          if (step === RELEASE_STEPS.PromoteUiLatest) {
            throw new Error("UI latest changed then timed out");
          }
        },
        packTargetManifests: () => ({
          ui: {},
          mcp: {},
          uiTarball,
          mcpTarball,
          uiIntegrity: integrityFor(uiTarball),
          mcpIntegrity: integrityFor(mcpTarball),
        }),
        compensateLatest: (_plan: unknown, progress: Record<string, Record<string, unknown>>) => {
          compensated = true;
          expect(progress.ui.previousLatest).toBe("18.4.0");
          expect(progress.mcp.previousLatest).toBe("18.4.0");
          return {
            observed: { ui: "18.4.1", mcp: "18.4.0" },
            restored: { ui: "18.4.0", mcp: "18.4.0" },
          };
        },
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("UI latest changed then timed out");
    expect(compensated).toBe(true);
    expect((state as RecoveryState | null)?.ui).toMatchObject({
      promoted: false,
      compensated: true,
    });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({
      promoted: false,
      compensated: true,
    });
    expect(
      validateRecoveryState(state, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toBeTruthy();

    expect(() =>
      runRelease({
        rootDir,
        uiBump: "skip",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        recoveryState: state,
        runStep: (step: string) => {
          if (step === RELEASE_STEPS.CommitTargetMetadata) throw new Error("commit retry failed");
        },
        writeRecoveryState: (value: RecoveryState) => {
          state = structuredClone(value);
        },
      }),
    ).toThrow("commit retry failed");
    expect((state as RecoveryState | null)?.ui).toMatchObject({
      promoted: true,
      compensated: false,
    });
    expect((state as RecoveryState | null)?.mcp).toMatchObject({
      promoted: true,
      compensated: false,
    });
    expect((state as RecoveryState | null)?.latestCompensation).toBeNull();
    expect(
      validateRecoveryState(state, {
        sourceHead: SOURCE_HEAD,
        rootDir,
        recoveryDirectory,
      }),
    ).toBeTruthy();

    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      recoveryState: state,
      runStep: (step: string) => executed.push(step),
    });
    expect(executed).not.toContain(RELEASE_STEPS.PromoteUiLatest);
    expect(executed).not.toContain(RELEASE_STEPS.PromoteMcpLatest);
    expect(executed).toContain(RELEASE_STEPS.CommitTargetMetadata);
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
    const plan = JSON.parse(output.slice(output.indexOf("{"))) as {
      targetVersion: string;
      commands: Array<{ step: string; command: string }>;
      packed: {
        ui: { version: string; godxUiMcp: string };
        mcp: { version: string; godxUiCompatibility: string };
      };
    };
    // The dry run packs the POST-bump manifests: both tarballs already carry the coordinated
    // target version and both compatibility fields, with no publish before the gates (issue #230).
    expect(plan.packed.ui).toEqual({
      version: plan.targetVersion,
      godxUiMcp: plan.targetVersion,
    });
    expect(plan.packed.mcp.version).toBe(plan.targetVersion);
    expect(plan.packed.mcp.godxUiCompatibility).toBe(
      `${plan.targetVersion.split(".").slice(0, 2).join(".")}.x`,
    );
    const firstPublish = plan.commands.findIndex((entry) =>
      entry.command.startsWith("npm publish"),
    );
    expect(firstPublish).toBeGreaterThan(0);
    expect(plan.commands.map((entry) => entry.command).slice(0, firstPublish)).toEqual([
      "pnpm run verify:publish-tree",
      "pnpm install --frozen-lockfile",
      "pnpm build",
      "pnpm test",
      "node scripts/check-release-lockstep.mjs",
      "npm whoami",
    ]);
    expect(plan.commands.some((entry) => entry.command.includes("npm version"))).toBe(false);
  }, 20_000);
});

/* ------------------------------------------------------------------------------------------- *
 * The three defects the release path used to have:
 *   1. nothing required the target to be GREATER than what is published — only different;
 *   2. nothing tied the release to a git tag, so there was no immutable marker of what shipped;
 *   3. CD re-ran the whole verify:release suite on a commit CI had already proved green.
 * ------------------------------------------------------------------------------------------- */

type CheckRun = { name: string; status: string; conclusion: string | null; started_at?: string };

function greenCheckRuns(overrides: Record<string, Partial<CheckRun>> = {}): CheckRun[] {
  return (REQUIRED_CI_CHECK_RUNS as string[]).map((name) => ({
    name,
    status: "completed",
    conclusion: "success",
    started_at: "2026-08-30T00:00:00Z",
    ...(overrides[name] ?? {}),
  }));
}

/**
 * A complete offline stand-in for npm + git + gh, so the real executor can be driven end to end.
 * `latest` is what the registry currently points `latest` at; `published` is the set of exact
 * versions that already exist.
 */
function releaseWorld({
  latest,
  targetVersion = "18.4.1",
  published = new Set<string>(),
  tagCommit = null,
  headOnMain = true,
  stagedDirty = true,
  checkRuns = greenCheckRuns(),
}: {
  latest: Record<string, string | null>;
  targetVersion?: string;
  published?: Set<string>;
  tagCommit?: string | null;
  headOnMain?: boolean;
  stagedDirty?: boolean;
  checkRuns?: CheckRun[];
}) {
  const log: string[] = [];
  const tags: Record<string, Record<string, string>> = {
    "@godxjp/ui": { ...(latest["@godxjp/ui"] ? { latest: latest["@godxjp/ui"] as string } : {}) },
    "@godxjp/ui-mcp": {
      ...(latest["@godxjp/ui-mcp"] ? { latest: latest["@godxjp/ui-mcp"] as string } : {}),
    },
  };
  const integrity: Record<string, string | null> = { "@godxjp/ui": null, "@godxjp/ui-mcp": null };
  const run = (binary: string, args: string[]): void => {
    log.push([binary, ...args].join(" "));
    if (binary !== "npm") return;
    if (args[0] === "publish") {
      const name = args[1].includes("mcp") ? "@godxjp/ui-mcp" : "@godxjp/ui";
      integrity[name] = name === "@godxjp/ui" ? "sha512-ui" : "sha512-mcp";
      tags[name][args[args.length - 1]] = targetVersion;
    }
    if (args[0] === "dist-tag" && args[1] === "add") {
      const [name, version] = args[2].split(/@(?=\d)/);
      tags[name].latest = version;
    }
  };
  const capture = (binary: string, args: string[]): Capture => {
    if (binary === "npm" && args[0] === "view" && args[2] === "dist.integrity") {
      const spec = args[1];
      const name = spec.slice(0, spec.lastIndexOf("@"));
      const version = spec.slice(spec.lastIndexOf("@") + 1);
      const value =
        version === targetVersion && integrity[name]
          ? integrity[name]
          : published.has(version)
            ? "sha512-existing"
            : null;
      return value
        ? { status: 0, stdout: JSON.stringify(value), stderr: "" }
        : { status: 1, stdout: "", stderr: "npm ERR! code E404" };
    }
    if (binary === "npm" && args[0] === "view" && args[2] === "dist-tags") {
      return { status: 0, stdout: JSON.stringify(tags[args[1]]), stderr: "" };
    }
    if (binary === "git" && args[0] === "ls-remote") {
      const tag = args[3];
      return {
        status: 0,
        stdout: tagCommit
          ? `${tagCommit}\trefs/tags/${tag}\n${tagCommit}\trefs/tags/${tag}^{}\n`
          : "",
        stderr: "",
      };
    }
    if (binary === "git" && args[0] === "rev-parse") {
      return { status: 0, stdout: `${"c".repeat(40)}\n`, stderr: "" };
    }
    if (binary === "git" && args[0] === "merge-base") {
      return { status: headOnMain ? 0 : 1, stdout: "", stderr: "" };
    }
    if (binary === "git" && args[0] === "status") return { status: 0, stdout: "", stderr: "" };
    if (binary === "git" && args[0] === "diff") {
      return { status: stagedDirty ? 1 : 0, stdout: "", stderr: "" };
    }
    if (binary === "gh") {
      return {
        status: 0,
        stdout: JSON.stringify({ total_count: checkRuns.length, check_runs: checkRuns }),
        stderr: "",
      };
    }
    throw new Error(`unexpected capture: ${binary} ${args.join(" ")}`);
  };
  return { log, tags, run, capture };
}

describe("the target version must ASCEND (latest may never move backwards)", () => {
  it("orders plain x.y.z and refuses anything it cannot compare", () => {
    expect(compareVersions("19.0.0", "18.9.1")).toBe(1);
    expect(compareVersions("18.9.1", "18.10.0")).toBe(-1);
    expect(compareVersions("18.4.0", "18.4.0")).toBe(0);
    expect(() => compareVersions("19.0.0-rc.1", "19.0.0")).toThrow("plain x.y.z");
  });

  it("accepts an ascent, refuses a downgrade and refuses an equal fresh release", () => {
    const latest = { "@godxjp/ui": "19.0.0", "@godxjp/ui-mcp": "19.0.0" };
    expect(() => assertTargetOutranksLatest({ targetVersion: "19.0.1", latest })).not.toThrow();
    expect(() => assertTargetOutranksLatest({ targetVersion: "19.0.0", latest })).toThrow(
      "does not outrank",
    );
    expect(() => assertTargetOutranksLatest({ targetVersion: "18.9.1", latest })).toThrow(
      "target is LOWER",
    );
  });

  it("never blocks a first-ever publish, and refuses a latest it cannot compare against", () => {
    expect(() =>
      assertTargetOutranksLatest({
        targetVersion: "1.0.0",
        latest: { "@godxjp/ui": null, "@godxjp/ui-mcp": undefined },
      }),
    ).not.toThrow();
    expect(() =>
      assertTargetOutranksLatest({
        targetVersion: "19.1.0",
        latest: { "@godxjp/ui": "19.0.0-beta.3" },
      }),
    ).toThrow("cannot be proven to outrank");
  });

  it("lets the two recovery modes re-drive a version that is ALREADY latest", () => {
    const latest = { "@godxjp/ui": "18.5.0", "@godxjp/ui-mcp": "18.5.0" };
    // The interrupted release got as far as promoting; re-adopting it is not a downgrade.
    expect(() =>
      assertTargetOutranksLatest({ targetVersion: "18.5.0", latest, allowEqual: true }),
    ).not.toThrow();
    // …but even a recovery may not go backwards.
    expect(() =>
      assertTargetOutranksLatest({ targetVersion: "18.4.9", latest, allowEqual: true }),
    ).toThrow("target is LOWER");
  });

  it("REFUSES a stale-checkout downgrade in the real executor, before any publish command", () => {
    const rootDir = fixture(); // package.json is at 18.4.0; --ui patch targets 18.4.1
    // …while 19.0.0 is what the registry already serves as `latest`. 18.4.1 is FRESH (nobody ever
    // published it), so the old assertFreshTargets gate would have waved it straight through.
    const world = releaseWorld({ latest: { "@godxjp/ui": "19.0.0", "@godxjp/ui-mcp": "19.0.0" } });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: runtime.runStep,
        packTargetManifests: () => artifacts(),
      }),
    ).toThrow(/does not outrank the published latest[\s\S]*target is LOWER/);
    expect(world.log.some((entry) => entry.startsWith("npm publish"))).toBe(false);
    expect(world.log.some((entry) => entry.includes("dist-tag add"))).toBe(false);
    // latest is untouched, and the manifests are restored byte-exactly.
    expect(world.tags["@godxjp/ui"].latest).toBe("19.0.0");
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toContain('"version": "18.4.0"');
  });

  it("still lets a genuine ascent through the same executor and promotes latest forwards", () => {
    const rootDir = fixture();
    const world = releaseWorld({ latest: { "@godxjp/ui": "18.4.0", "@godxjp/ui-mcp": "18.4.0" } });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    runRelease({
      rootDir,
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      runStep: runtime.runStep,
      packTargetManifests: () => artifacts(),
    });
    expect(world.tags["@godxjp/ui"].latest).toBe("18.4.1");
    expect(world.tags["@godxjp/ui-mcp"].latest).toBe("18.4.1");
  });

  it("leaves --adopt-staged working when the staged version is already latest", () => {
    const rootDir = fixture();
    const world = releaseWorld({
      latest: { "@godxjp/ui": "18.5.0", "@godxjp/ui-mcp": "18.5.0" },
      published: new Set(["18.5.0"]),
    });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    const executed: string[] = [];
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      adoptStagedVersion: "18.5.0",
      runStep: (step: string, plan: never, packed: never, progress: never) => {
        executed.push(step);
        // The registry-artifact assertions need a staged tag + matching integrity; the point of
        // this test is the ascent gate, so drive only that step for real.
        if (step === RELEASE_STEPS.VerifyTargetOutranksLatest) {
          runtime.runStep(step, plan, packed, progress);
        }
      },
      packTargetManifests: () => artifacts(),
    });
    expect(executed).toContain(RELEASE_STEPS.VerifyTargetOutranksLatest);
    expect(executed).not.toContain(RELEASE_STEPS.PublishUi);
  });
});

describe("the tag is the trigger and the claim — the release verifies it, never writes it", () => {
  it("reads a version only from a plain vX.Y.Z tag", () => {
    expect(versionFromReleaseTag("v19.1.0")).toBe("19.1.0");
    expect(versionFromReleaseTag("refs/tags/v19.1.0")).toBe("19.1.0");
    for (const bad of ["19.1.0", "v19.1", "v19.1.0-rc.1", "release-19.1.0", ""]) {
      expect(() => versionFromReleaseTag(bad)).toThrow("refusing to guess a version");
    }
  });

  it("takes the target from the tag and refuses a tag that disagrees with package.json", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      tagRef: "v18.4.0",
    });
    expect(plan.targetVersion).toBe("18.4.0");
    expect(plan.tagged).toBe(true);
    expect(plan.releaseTag).toBe("v18.4.0");
    expect(() =>
      buildReleasePlan({
        currentVersion: "18.4.0",
        uiBump: "skip",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        tagRef: "v18.5.0",
      }),
    ).toThrow("claims 18.5.0 but package.json carries 18.4.0");
  });

  it("refuses a tag on the wrong commit, a missing tag, and a commit that is not on main", () => {
    const base = {
      tag: "v18.5.0",
      targetVersion: "18.5.0",
      manifestVersion: "18.5.0",
      tagCommit: SOURCE_HEAD,
      sourceHead: SOURCE_HEAD,
      onMain: true,
    };
    expect(() => assertReleaseTagMatchesTree(base)).not.toThrow();
    expect(() => assertReleaseTagMatchesTree({ ...base, tagCommit: OTHER_HEAD })).toThrow(
      `points at ${OTHER_HEAD}`,
    );
    expect(() => assertReleaseTagMatchesTree({ ...base, tagCommit: null })).toThrow(
      "does not exist",
    );
    // A tag can be pushed at ANY commit, including one that never went through review or CI —
    // and ci.yml only runs on main, so without this the CI-green proof would be vacuous.
    expect(() => assertReleaseTagMatchesTree({ ...base, onMain: false })).toThrow(
      "not an ancestor of origin/main",
    );
    expect(() => assertReleaseTagMatchesTree({ ...base, manifestVersion: "18.4.0" })).toThrow(
      "merged to main FIRST, then tagged",
    );
  });

  it("prefers the peeled commit of an annotated tag when reading origin", () => {
    const annotated = `${OTHER_HEAD}\trefs/tags/v1.2.3\n${SOURCE_HEAD}\trefs/tags/v1.2.3^{}\n`;
    expect(commitFromLsRemote(annotated, "v1.2.3")).toBe(SOURCE_HEAD);
    expect(commitFromLsRemote(`${SOURCE_HEAD}\trefs/tags/v1.2.3\n`, "v1.2.3")).toBe(SOURCE_HEAD);
    expect(commitFromLsRemote("", "v1.2.3")).toBeNull();
  });

  it("runs a tag-triggered release end to end: no bump, no commit, no tag written", () => {
    const rootDir = fixture(); // package.json already carries 18.4.0 — the bump was merged first
    const before = readFileSync(join(rootDir, "package.json"), "utf8");
    const world = releaseWorld({
      latest: { "@godxjp/ui": "18.3.0", "@godxjp/ui-mcp": "18.3.0" },
      targetVersion: "18.4.0",
      tagCommit: SOURCE_HEAD,
      stagedDirty: false,
    });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    runRelease({
      rootDir,
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      tagRef: "v18.4.0",
      runStep: runtime.runStep,
      packTargetManifests: () => artifacts(),
    });
    expect(world.log).toEqual([
      "pnpm run verify:publish-tree",
      "pnpm install --frozen-lockfile",
      "pnpm build",
      "pnpm test",
      "node scripts/check-release-lockstep.mjs",
      "npm whoami",
      "npm publish /tmp/verified-ui.tgz --access public --tag godx-staging",
      "npm publish /tmp/verified-mcp.tgz --access public --tag godx-staging",
      "npm dist-tag add @godxjp/ui@18.4.0 latest",
      "npm dist-tag add @godxjp/ui-mcp@18.4.0 latest",
      "git add package.json mcp/package.json",
    ]);
    // Nothing to commit, no tag written, and the tree that was packed is the tree that was verified.
    expect(world.log.some((entry) => entry.startsWith("git commit"))).toBe(false);
    expect(world.log.some((entry) => entry.startsWith("git tag"))).toBe(false);
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toBe(before);
    expect(world.tags["@godxjp/ui"].latest).toBe("18.4.0");
  });

  it("refuses a tag that would downgrade latest, and one that points at another commit", () => {
    const rootDir = fixture();
    const downgrade = releaseWorld({
      latest: { "@godxjp/ui": "19.0.0", "@godxjp/ui-mcp": "19.0.0" },
      targetVersion: "18.4.0",
      tagCommit: SOURCE_HEAD,
      stagedDirty: false,
    });
    const downgradeRuntime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: downgrade.run,
      capture: downgrade.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "skip",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        tagRef: "v18.4.0",
        runStep: downgradeRuntime.runStep,
        packTargetManifests: () => artifacts(),
      }),
    ).toThrow(/Rebase this tag v18\.4\.0 onto the released HEAD/);
    expect(downgrade.log.some((entry) => entry.startsWith("npm publish"))).toBe(false);

    const wrongCommit = releaseWorld({
      latest: { "@godxjp/ui": "18.3.0", "@godxjp/ui-mcp": "18.3.0" },
      targetVersion: "18.4.0",
      tagCommit: OTHER_HEAD,
      stagedDirty: false,
    });
    const wrongCommitRuntime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: wrongCommit.run,
      capture: wrongCommit.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "skip",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        tagRef: "v18.4.0",
        runStep: wrongCommitRuntime.runStep,
        packTargetManifests: () => artifacts(),
      }),
    ).toThrow(`points at ${OTHER_HEAD}`);
    expect(wrongCommit.log.some((entry) => entry.startsWith("npm publish"))).toBe(false);
  });

  it("plans no git tag command at all — the release never creates or moves a public ref", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "skip",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      tagRef: "v18.4.0",
    });
    const commands: ReleaseCommand[] = planReleaseCommands(plan, artifacts());
    expect(commands.some((entry) => entry.binary === "git" && entry.args[0] === "tag")).toBe(false);
    expect(
      commands.some((entry) => entry.args.includes("--force") || entry.args.includes("-f")),
    ).toBe(false);
  });

  it("writes NOTHING when the tree already carries the tagged version, so the packed bytes are the verified bytes", () => {
    const rootDir = fixture();
    const before = readFileSync(join(rootDir, "package.json"), "utf8");
    const beforeMcp = readFileSync(join(rootDir, "mcp/package.json"), "utf8");
    expect(applyTargetMetadata(rootDir, "18.4.0").written).toBe(false);
    expect(readFileSync(join(rootDir, "package.json"), "utf8")).toBe(before);
    expect(readFileSync(join(rootDir, "mcp/package.json"), "utf8")).toBe(beforeMcp);
    // The legacy bump-and-commit path still writes.
    expect(applyTargetMetadata(rootDir, "18.4.1").written).toBe(true);
  });

  it("refuses to publish a tag whose working tree drifted from the verified commit", () => {
    const rootDir = fixture();
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: () => {},
      capture: (binary: string, args: string[]): Capture =>
        binary === "git" && args[0] === "status"
          ? { status: 0, stdout: " M src/index.ts\0", stderr: "" }
          : { status: 0, stdout: "", stderr: "" },
    });
    expect(() =>
      runtime.runStep(
        RELEASE_STEPS.VerifyPublishTree,
        { targetVersion: "18.4.0", tagged: true },
        artifacts(),
        { sourceHead: SOURCE_HEAD },
      ),
    ).toThrow("the working tree differs from the verified commit");
  });

  it("refuses a non-tag release when a tag for that version already claims another commit", () => {
    const rootDir = fixture();
    const world = releaseWorld({
      latest: { "@godxjp/ui": "18.4.0", "@godxjp/ui-mcp": "18.4.0" },
      tagCommit: OTHER_HEAD,
    });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runtime.runStep(
        RELEASE_STEPS.VerifyReleaseTag,
        { targetVersion: "18.4.1", tagged: false },
        artifacts(),
        { sourceHead: SOURCE_HEAD },
      ),
    ).toThrow(`tag v18.4.1 already exists at ${OTHER_HEAD}`);
    // A re-run whose tag already points at THIS commit is not an error — it is the same release.
    const rerun = releaseWorld({
      latest: { "@godxjp/ui": "18.4.0", "@godxjp/ui-mcp": "18.4.0" },
      tagCommit: SOURCE_HEAD,
    });
    const rerunRuntime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: rerun.run,
      capture: rerun.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      rerunRuntime.runStep(
        RELEASE_STEPS.VerifyReleaseTag,
        { targetVersion: "18.4.1", tagged: false },
        artifacts(),
        { sourceHead: SOURCE_HEAD },
      ),
    ).not.toThrow();
  });
});

describe("CD delegates verification to CI's verdict on the exact commit instead of re-running it", () => {
  it("names a CI check run for every gate verify:release would have run", () => {
    // verify:release = verify:static (verify:ci:static + verify:browser + pnpm test)
    //                  + check:frame-contracts + check:frame-coverage + check:frame-axe
    const gates = Object.keys(CI_PROOF_FOR_RELEASE_GATE).join(" | ");
    for (const gate of [
      "verify:ci:static",
      "check:frame-contracts",
      "check:frame-coverage",
      "pnpm test",
      "check:contrast + check:visual-audit",
      "check:frame-axe",
    ]) {
      expect(gates).toContain(gate);
    }
    expect(REQUIRED_CI_CHECK_RUNS).toContain("Build · typecheck · lint · guards");
    expect(REQUIRED_CI_CHECK_RUNS).toContain("Tests (shard 4/4)");
    expect(REQUIRED_CI_CHECK_RUNS).toContain("Contrast + visual audit");
    expect(REQUIRED_CI_CHECK_RUNS).toContain(
      "Per-frame axe (chrome blocking, component allowlisted)",
    );
  });

  it("names only check runs the CI workflows actually produce", () => {
    // A check run is a JOB, never a step. If a job is renamed or folded into another one, the
    // release would refuse every tag with "never ran: <name>" — so that rename must fail HERE.
    const root = join(import.meta.dirname, "../../..");
    const workflow = (file: string): string =>
      readFileSync(join(root, ".github/workflows", file), "utf8");
    const jobNames = [workflow("ci.yml"), workflow("ci-browser.yml")]
      .join("\n")
      .split("\n")
      .filter((line) => /^ {4}name: /.test(line))
      .map((line) => line.slice("    name: ".length).trim());
    // `Tests (shard N/4)` is one job templated over a matrix; compare against the template.
    const produced = new Set(jobNames);
    for (const name of REQUIRED_CI_CHECK_RUNS as string[]) {
      if (name === "lockstep") {
        // release-integrity.yml's job has no `name:`, so its check run is the job id.
        expect(workflow("release-integrity.yml")).toMatch(/^ {2}lockstep:$/m);
        continue;
      }
      const shard = /^Tests \(shard (\d)\/4\)$/.exec(name);
      expect(produced).toContain(shard ? "Tests (shard ${{ matrix.shard }}/4)" : name);
    }
  });

  it("accepts a fully green commit and counts every required gate", () => {
    expect(assertCiProvenance({ sha: SOURCE_HEAD, checkRuns: greenCheckRuns() })).toEqual({
      verified: (REQUIRED_CI_CHECK_RUNS as string[]).length,
    });
  });

  it("treats absence, incompleteness and non-success as refusal", () => {
    expect(() => assertCiProvenance({ sha: SOURCE_HEAD, checkRuns: [] })).toThrow("never ran");
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: greenCheckRuns({
          "Tests (shard 2/4)": { status: "in_progress", conclusion: null },
        }),
      }),
    ).toThrow("still running: Tests (shard 2/4)");
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: greenCheckRuns({
          "Build · typecheck · lint · guards": { conclusion: "failure" },
        }),
      }),
    ).toThrow("not successful: Build · typecheck · lint · guards (failure)");
    // `skipped` is not evidence the gate ran; it is refused like any other non-success.
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: greenCheckRuns({ "Contrast + visual audit": { conclusion: "skipped" } }),
      }),
    ).toThrow("not successful: Contrast + visual audit (skipped)");
  });

  it("refuses a truncated page, and lets a DECLARED-exempt red check through", () => {
    expect(() =>
      assertCiProvenance({ sha: SOURCE_HEAD, checkRuns: greenCheckRuns(), totalCount: 400 }),
    ).toThrow("truncated");
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: [
          ...greenCheckRuns(),
          {
            name: "rendered-runtime (data-entry-core)",
            status: "completed",
            conclusion: "failure",
          },
        ],
      }),
    ).not.toThrow();
  });

  it("still refuses a red check that is NOT declared exempt", () => {
    // The exemption is a named list, not a general softening. Anything unexpected still blocks —
    // otherwise "declare the exception" would have quietly become "ignore red checks".
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: [
          ...greenCheckRuns(),
          { name: "some-other-gate", status: "completed", conclusion: "failure" },
        ],
      }),
    ).toThrow("other red check: some-other-gate (failure)");
  });

  it("counts the newest attempt, so a re-run that turned a job green is what decides", () => {
    expect(() =>
      assertCiProvenance({
        sha: SOURCE_HEAD,
        checkRuns: [
          ...greenCheckRuns(),
          {
            name: "Tests (shard 1/4)",
            status: "completed",
            conclusion: "failure",
            started_at: "2026-08-29T00:00:00Z",
          },
        ],
      }),
    ).not.toThrow();
  });

  it("blocks the publish when CI has not proven the commit, before any publish command", () => {
    const rootDir = fixture();
    const world = releaseWorld({
      latest: { "@godxjp/ui": "18.4.0", "@godxjp/ui-mcp": "18.4.0" },
      checkRuns: greenCheckRuns({ "Tests (shard 3/4)": { conclusion: "failure" } }),
    });
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: world.run,
      capture: world.capture,
      repositorySlug: "godxjp/godxjp-ui",
    });
    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        sourceHead: SOURCE_HEAD,
        runStep: runtime.runStep,
        packTargetManifests: () => artifacts(),
      }),
    ).toThrow("CI has not proven this commit green");
    expect(world.log.some((entry) => entry.startsWith("npm publish"))).toBe(false);
  });

  it("swaps the whole suite for the narrow publish-tree verification, and back again under --full-verify", () => {
    const delta = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    const full = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
      fullVerify: true,
    });
    expect(verifyRootScriptFor(delta)).toBe(VERIFY_ROOT_SCRIPTS.delta);
    expect(verifyRootScriptFor(full)).toBe(VERIFY_ROOT_SCRIPTS.full);
    expect(releaseCommandForStep(RELEASE_STEPS.VerifyRoot, full, artifacts()).args).toEqual([
      "run",
      "verify:release",
    ]);
    // Either way the plan still carries the provenance gate — you can add work, never remove it.
    for (const plan of [delta, full]) {
      expect(plan.steps.indexOf(RELEASE_STEPS.VerifyCommitProvenance)).toBeLessThan(
        plan.steps.indexOf(RELEASE_STEPS.PublishUi),
      );
    }
  });

  it("--full-verify satisfies provenance locally without asking GitHub anything", () => {
    const rootDir = fixture();
    let ghCalls = 0;
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: () => {},
      capture: (binary: string): Capture => {
        if (binary === "gh") ghCalls += 1;
        return { status: 0, stdout: "{}", stderr: "" };
      },
    });
    runtime.runStep(
      RELEASE_STEPS.VerifyCommitProvenance,
      { fullVerify: true, targetVersion: "18.4.1" },
      artifacts(),
      { sourceHead: SOURCE_HEAD },
    );
    expect(ghCalls).toBe(0);
  });

  it("refuses the narrow verification if a plan ever drops the provenance gate", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
      sourceHead: SOURCE_HEAD,
    });
    const commands: ReleaseCommand[] = planReleaseCommands(plan, artifacts());
    expect(assertReleaseCommandPlan(commands, plan)).toBe(commands);
    const withoutProvenance = {
      ...plan,
      steps: plan.steps.filter((step: string) => step !== RELEASE_STEPS.VerifyCommitProvenance),
    };
    expect(() => assertReleaseCommandPlan(commands, withoutProvenance)).toThrow(
      "would publish a tree nobody verified",
    );
    // …and the ordering invariant already makes such a plan unbuildable: PREFLIGHT_STEPS is
    // enforcement, not documentation, so dropping the gate is rejected before any command exists.
    expect(() => assertPreflightOrder(withoutProvenance.steps)).toThrow(
      `Release plan omits preflight gate "${RELEASE_STEPS.VerifyCommitProvenance}" before publish.`,
    );
    expect(() =>
      assertPreflightOrder(
        plan.steps.filter((step: string) => step !== RELEASE_STEPS.VerifyTargetOutranksLatest),
      ),
    ).toThrow(`omits preflight gate "${RELEASE_STEPS.VerifyTargetOutranksLatest}"`);
  });
});
