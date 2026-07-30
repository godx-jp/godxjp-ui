import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error The release core stays dependency-free JavaScript for direct Node CLI use.
import { RELEASE_STEPS, buildReleasePlan, runRelease } from "../../../scripts/release-core.mjs";

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

afterEach(() => {
  for (const workspace of workspaces.splice(0)) {
    rmSync(workspace, { force: true, recursive: true });
  }
});

describe("coordinated release workflow", () => {
  it("places every target preflight before the first immutable publish", () => {
    const plan = buildReleasePlan({
      currentVersion: "18.4.0",
      uiBump: "patch",
      mcpBump: "sync",
    });
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
    ]);
    expect(plan.steps.slice(firstPublish)).toEqual([
      RELEASE_STEPS.PublishUi,
      RELEASE_STEPS.PublishMcp,
      RELEASE_STEPS.CommitTargetMetadata,
    ]);
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
    expect(packageJson(rootDir)).toMatchObject({
      version: "18.4.1",
      godxUiMcp: "18.4.1",
    });
    expect(packageJson(rootDir, "mcp")).toMatchObject({
      version: "18.4.1",
      godxUiCompatibility: "18.4.x",
    });
    expect(result.packedManifests.ui).toMatchObject({
      version: "18.4.1",
      godxUiMcp: "18.4.1",
    });
    expect(result.packedManifests.mcp).toMatchObject({
      version: "18.4.1",
      godxUiCompatibility: "18.4.x",
    });
  }, 20_000);

  it("fails closed without reaching pack or publish when an MCP gate fails", () => {
    const rootDir = releaseFixture();
    const executed: string[] = [];
    let packed = false;

    expect(() =>
      runRelease({
        rootDir,
        uiBump: "patch",
        mcpBump: "sync",
        runStep: (step: string) => {
          executed.push(step);
          if (step === RELEASE_STEPS.TestMcp) {
            throw new Error("MCP test failed");
          }
        },
        packTargetManifests: () => {
          packed = true;
          return {};
        },
      }),
    ).toThrow("MCP test failed");

    expect(executed).toEqual([
      RELEASE_STEPS.VerifyRoot,
      RELEASE_STEPS.InstallMcp,
      RELEASE_STEPS.BuildMcp,
      RELEASE_STEPS.TestMcp,
    ]);
    expect(packed).toBe(false);
    expect(executed).not.toContain(RELEASE_STEPS.PublishUi);
    expect(executed).not.toContain(RELEASE_STEPS.PublishMcp);
  });
});
