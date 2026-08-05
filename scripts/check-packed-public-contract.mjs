#!/usr/bin/env node
/**
 * Fail closed when the tarball that would be published is missing a public subpath export used by
 * downstream applications. Source barrels and component tests are insufficient: npm publishes
 * `dist`, so a stale or absent build can expose an older API even while `src` is correct.
 *
 * Run after `pnpm build`. The release gate and release-integrity workflow both do this before any
 * registry operation.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const root = process.cwd();
const packDirectory = mkdtempSync(join(tmpdir(), "godxjp-ui-public-contract-"));

const contracts = [
  {
    subpath: "./layout",
    runtime: [
      "PageContainer",
      "Flex",
      "AppShell",
      "OrgSwitcher",
      "AuthShell",
      "AuthDivider",
      "AuthIdentity",
      "AuthFooter",
      "AuthStack",
      "CenteredShell",
      "Breadcrumb",
      "Sidebar",
      "SidebarHeader",
      "SidebarItem",
      "SidebarSection",
      "Topbar",
      "ResponsiveGrid",
      "MasterDetail",
    ],
    types: ["PageContainerProp", "SidebarRenderItemProp", "MasterDetailProps"],
    files: ["dist/components/layout/master-detail.js", "dist/components/layout/master-detail.d.ts"],
  },
  {
    subpath: "./data-entry",
    runtime: ["CommandPalette"],
    types: ["CommandPaletteProps"],
    files: [
      "dist/components/data-entry/command-palette.js",
      "dist/components/data-entry/command-palette.d.ts",
    ],
  },
  {
    subpath: "./data-display",
    runtime: ["ServiceLauncherCard", "ServiceLauncherCardSkeleton"],
    types: ["ServiceLauncherCardProps", "ServiceLauncherCardSkeletonProps"],
    files: [
      "dist/components/data-display/service-launcher-card.js",
      "dist/components/data-display/service-launcher-card.d.ts",
    ],
  },
  {
    subpath: "./feedback",
    runtime: ["TwoFactorSetup"],
    types: ["TwoFactorSetupProps"],
    files: [
      "dist/components/feedback/two-factor-setup.js",
      "dist/components/feedback/two-factor-setup.d.ts",
    ],
  },
  {
    subpath: "./charts/compact-bar-trend",
    runtime: ["CompactBarTrend"],
    types: ["CompactBarTrendProp", "CompactBarTrendProps"],
    files: [
      "dist/components/charts/compact-bar-trend.js",
      "dist/components/charts/compact-bar-trend.d.ts",
    ],
  },
];

function tarballText(tarball, path) {
  return execFileSync("tar", ["-xzO", "-f", tarball, `package/${path}`], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function linkInstalledPackage(consumerModules, name) {
  const source = join(root, "node_modules", ...name.split("/"));
  const destination = join(consumerModules, ...name.split("/"));
  if (!existsSync(source)) throw new Error(`consumer fixture dependency is not installed: ${name}`);
  mkdirSync(dirname(destination), { recursive: true });
  symlinkSync(source, destination, "junction");
}

function buildCompactTrendConsumer(tarball, manifest) {
  const consumer = join(packDirectory, "compact-trend-consumer");
  const consumerModules = join(consumer, "node_modules");
  const installedUi = join(consumerModules, "@godxjp", "ui");
  mkdirSync(installedUi, { recursive: true });
  execFileSync("tar", ["-xzf", tarball, "-C", installedUi, "--strip-components=1"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (const dependency of [...Object.keys(manifest.dependencies ?? {}), "react", "react-dom"]) {
    linkInstalledPackage(consumerModules, dependency);
  }
  if (existsSync(join(consumerModules, "recharts"))) {
    throw new Error("compact trend consumer fixture must not contain the optional recharts peer");
  }

  mkdirSync(join(consumer, "src"), { recursive: true });
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ name: "compact-trend-consumer", private: true, type: "module" }, null, 2),
  );
  writeFileSync(
    join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
  );
  writeFileSync(
    join(consumer, "src/main.jsx"),
    `import React from "react";
import { createRoot } from "react-dom/client";
import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";

createRoot(document.getElementById("root")).render(
  <CompactBarTrend
    label="Organizations"
    data={[{ day: "Mon", count: 2 }, { day: "Tue", count: 5 }]}
    categoryKey="day"
    valueKey="count"
  />,
);
`,
  );

  execFileSync(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "build"], {
    cwd: consumer,
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!existsSync(join(consumer, "dist/index.html"))) {
    throw new Error("compact trend consumer Vite build did not emit dist/index.html");
  }
}

try {
  const result = JSON.parse(
    execFileSync(
      "npm",
      ["pack", ".", "--ignore-scripts", "--json", "--pack-destination", packDirectory],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ),
  );
  const artifact = result.at(0);
  if (!artifact?.filename || !Array.isArray(artifact.files)) {
    throw new Error("npm pack did not report a tarball and file manifest.");
  }

  const tarball = join(packDirectory, artifact.filename);
  const packedFiles = new Set(artifact.files.map((file) => file.path));
  const manifest = JSON.parse(tarballText(tarball, "package.json"));
  const errors = [];

  for (const contract of contracts) {
    const exported = manifest.exports?.[contract.subpath];
    const runtimePath = exported?.import?.replace(/^\.\//, "");
    const typesPath = exported?.types?.replace(/^\.\//, "");

    if (!runtimePath || !typesPath) {
      errors.push(`${contract.subpath}: package exports must include import and types targets`);
      continue;
    }

    for (const path of [runtimePath, typesPath, ...contract.files]) {
      if (!packedFiles.has(path)) errors.push(`${contract.subpath}: packed file missing ${path}`);
    }

    if (!packedFiles.has(runtimePath) || !packedFiles.has(typesPath)) continue;
    const runtimeBarrel = tarballText(tarball, runtimePath);
    const typeBarrel = tarballText(tarball, typesPath);

    for (const name of contract.runtime) {
      if (!new RegExp(`\\b${name}\\b`).test(runtimeBarrel)) {
        errors.push(`${contract.subpath}: runtime export missing ${name}`);
      }
    }
    for (const name of contract.types) {
      if (!new RegExp(`\\b${name}\\b`).test(typeBarrel)) {
        errors.push(`${contract.subpath}: declaration export missing ${name}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`packed public contract failed:\n  ${errors.join("\n  ")}`);
  }

  buildCompactTrendConsumer(tarball, manifest);

  console.log(
    `packed public contract OK — @godxjp/ui@${manifest.version} (${artifact.filename}, ${packedFiles.size} files); compact trend Vite consumer built without recharts`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  rmSync(packDirectory, { recursive: true, force: true });
}
