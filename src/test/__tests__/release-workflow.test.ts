import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
const {
  RELEASE_STEPS,
  assertOnlyCoordinatedManifestChanges,
  assertRegistryArtifact,
  assertReleaseCommandPlan,
  buildReleasePlan,
  createReleaseRuntime,
  integrityFor,
  planReleaseCommands,
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
      "pnpm run verify:release @root",
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
      throw new Error(`unexpected capture: ${binary} ${args.join(" ")}`);
    };

    const runtime = createReleaseRuntime({ repositoryRoot: rootDir, run, capture });
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
      "pnpm run verify:release @root",
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
    const runtime = createReleaseRuntime({
      repositoryRoot: rootDir,
      run: (binary: string, args: string[]) => {
        log.push([binary, ...args].join(" "));
        if (binary === "pnpm" && args[0] === "build") throw new Error("mcp build failed");
      },
      capture: () => ({ status: 0, stdout: "{}", stderr: "" }),
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
      "pnpm run verify:release",
      "pnpm install --frozen-lockfile",
      "pnpm build",
      "pnpm test",
      "node scripts/check-release-lockstep.mjs",
      "npm whoami",
    ]);
    expect(plan.commands.some((entry) => entry.command.includes("npm version"))).toBe(false);
  }, 20_000);
});
