#!/usr/bin/env node
/**
 * Fail closed when the tarball that would be published is missing a public subpath export used by
 * downstream applications. Source barrels and component tests are insufficient: npm publishes
 * `dist`, so a stale or absent build can expose an older API even while `src` is correct.
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
      // page, so it is pinned in the PACKED artifact, not just in the source barrel.
      "ErrorSurface",
      "Breadcrumb",
      "Sidebar",
      "SidebarHeader",
      "SidebarItem",
      "SidebarSection",
      "Topbar",
      "ResponsiveGrid",
      "MasterDetail",
    ],
    types: [
      "PageContainerProp",
      "SidebarRenderItemProp",
      "MasterDetailProps",
      "ErrorSurfaceProp",
      "ErrorSurfaceProps",
      "ErrorSurfaceMaintenanceProp",
      "ErrorSurfaceModeProp",
      "ErrorSurfaceStatusProp",
    ],
    files: [
      "dist/components/layout/master-detail.js",
      "dist/components/layout/master-detail.d.ts",
      "dist/components/layout/error-surface.js",
      "dist/components/layout/error-surface.d.ts",
    ],
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
    // Pinned in the PACKED artifact
    // regresses silently at publish time).
    runtime: ["TwoFactorSetup", "Banner"],
    types: ["TwoFactorSetupProps", "BannerProp", "BannerProps"],
    files: [
      "dist/components/feedback/two-factor-setup.js",
      "dist/components/feedback/two-factor-setup.d.ts",
      "dist/components/feedback/banner.js",
      "dist/components/feedback/banner.d.ts",
    ],
  },
  {
    // so nothing pinned the public names a list page imports.
    subpath: "./navigation",
    runtime: ["FilterBar", "FilterBarGroup", "Toolbar", "ToolbarGroup"],
    types: ["FilterBarProp", "FilterBarProps", "FilterBarChipProp", "FilterBarGroupProps"],
    files: [
      "dist/components/navigation/filter-bar.js",
      "dist/components/navigation/filter-bar.d.ts",
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

/** Extract the packed tarball into a fresh consumer's node_modules and link its runtime deps. */
function installPackedUi(consumer, tarball, manifest) {
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
  return consumer;
}

/**
 * So this fixture is deliberately the consumer's point of view and nothing else — it extracts the
 * real tarball into a fresh `node_modules`, then: 1. BUILDS a production Vite bundle that imports
 * `ErrorSurface` from `@godxjp/ui/layout`, proving the public subpath resolves and bundles from
 * the packed files; 2.
 */
function buildErrorSurfaceConsumer(tarball, manifest) {
  const consumer = installPackedUi(
    join(packDirectory, "error-surface-consumer"),
    tarball,
    manifest,
  );

  mkdirSync(join(consumer, "src"), { recursive: true });
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ name: "error-surface-consumer", private: true, type: "module" }, null, 2),
  );
  writeFileSync(
    join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
  );
  writeFileSync(
    join(consumer, "src/main.jsx"),
    `import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorSurface } from "@godxjp/ui/layout";

createRoot(document.getElementById("root")).render(
  <ErrorSurface
    mode="system"
    status={503}
    title="Service temporarily unavailable"
    description="We are performing scheduled maintenance."
    maintenance={{ start: "2026-08-02T18:00:00Z", end: "2026-08-02T20:00:00Z", timeZone: "Asia/Tokyo", progress: 40 }}
    action={<button type="button">Reload</button>}
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
    throw new Error("error surface consumer Vite build did not emit dist/index.html");
  }

  // server-rendered exception page does. ──────────────────────────────────────────────────────
  writeFileSync(
    join(consumer, "render.mjs"),
    `import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorSurface } from "@godxjp/ui/layout";

const application = renderToStaticMarkup(
  h(ErrorSurface, {
    mode: "application",
    status: 403,
    title: "You do not have access to this page",
    description: "Ask an administrator to grant you the Reports role.",
    requestId: "01J9Z0M7Q2K5S7WQ3T5N8V2H4B",
    permission: "reports.view",
    organization: "Acme KK",
    action: h("button", { type: "button" }, "Back to dashboard"),
  }),
);

const system = renderToStaticMarkup(
  h(ErrorSurface, {
    mode: "system",
    status: 503,
    title: "Service temporarily unavailable",
    maintenance: {
      start: "2026-08-02T18:00:00Z",
      end: "2026-08-02T20:00:00Z",
      timeZone: "Asia/Tokyo",
      progress: 40,
    },
    action: h("button", { type: "button" }, "Reload"),
  }),
);

const failures = [];
const expect = (label, ok) => { if (!ok) failures.push(label); };

// application mode: the surface block ONLY — no shell, no page geometry manufactured.
expect('application: data-mode', application.includes('data-mode="application"'));
expect('application: status code', application.includes(">403<"));
// The library's OWN metadata labels are localized (default locale, no provider), so assert the
// SHAPE: an sr-only sibling whose text is a phrase around 403, not the bare digits.
const srOnly = application.match(/class="sr-only">([^<]*)</);
expect('application: HTTP status phrase', Boolean(srOnly) && srOnly[1].includes("403") && srOnly[1].trim().length > 3);
expect('application: title', application.includes("You do not have access to this page"));
expect('application: exactly one action', (application.match(/<button/g) ?? []).length === 1);
expect('application: request id row', application.includes("01J9Z0M7Q2K5S7WQ3T5N8V2H4B"));
expect('application: permission row', application.includes("reports.view"));
expect('application: organization row', application.includes("Acme KK"));
expect('application: semantic metadata dl', application.includes("<dt") && application.includes("<dd"));
expect('application: builds NO page shell', !application.includes("ui-centered-shell"));

// system mode: the surface OWNS the page — package-owned viewport-centred geometry.
expect('system: centred shell', system.includes("ui-centered-shell"));
expect('system: centred column', system.includes('data-align="center"'));
expect('system: data-mode', system.includes('data-mode="system"'));
expect('system: status code', system.includes(">503<"));
expect('system: ISO-8601 time element', /<time [^>]*datetime="2026-08-02T18:00:00Z"/i.test(system));
expect('system: maintenance progress meter', system.includes('role="progressbar"'));
expect('system: exactly one action', (system.match(/<button/g) ?? []).length === 1);

if (failures.length > 0) {
  console.error("packed ErrorSurface render contract failed:\\n  " + failures.join("\\n  "));
  process.exit(1);
}
console.log("packed ErrorSurface rendered in both modes");
`,
  );

  execFileSync(process.execPath, ["render.mjs"], {
    cwd: consumer,
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "inherit"],
  });
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
  buildErrorSurfaceConsumer(tarball, manifest);

  console.log(
    `packed public contract OK — @godxjp/ui@${manifest.version} (${artifact.filename}, ${packedFiles.size} files); compact trend Vite consumer built without recharts; ErrorSurface imported, built and server-rendered from the tarball in both modes`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  rmSync(packDirectory, { recursive: true, force: true });
}
