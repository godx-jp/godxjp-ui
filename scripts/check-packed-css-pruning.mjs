#!/usr/bin/env node
/** #1455/#1475: real tarball, independent install, both supported CSS compiler paths. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { build as bundle } from "esbuild";
import { build } from "vite";
import tailwindcss from "@tailwindcss/vite";

const root = process.cwd();
const flag = process.argv.indexOf("--consumer");
const scratch = flag === -1 ? mkdtempSync(join(tmpdir(), "godx-packed-css-")) : undefined;
const consumer = flag === -1 ? join(scratch, "consumer") : resolve(process.argv[flag + 1]);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const size = (css) => ({ bytes: Buffer.byteLength(css), gzip: gzipSync(css, { level: 9 }).length });
const requireThat = (ok, message) => {
  if (!ok) throw new Error(message);
};

try {
  if (scratch) {
    const [artifact] = JSON.parse(
      run("npm", ["pack", ".", "--ignore-scripts", "--json", "--pack-destination", scratch], root),
    );
    mkdirSync(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      '{"name":"packed-css-consumer","private":true,"type":"module"}',
    );
    const tw = JSON.parse(
      readFileSync(join(root, "node_modules/tailwindcss/package.json"), "utf8"),
    ).version;
    run(
      "npm",
      [
        "install",
        join(scratch, artifact.filename),
        `tailwindcss@${tw}`,
        "--ignore-scripts",
        "--legacy-peer-deps",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
      ],
      consumer,
    );
  }
  const installed = join(consumer, "node_modules/@godxjp/ui");
  requireThat(
    !realpathSync(installed).startsWith(root),
    "consumer must install the tarball outside the library checkout",
  );
  mkdirSync(join(consumer, "css-probe"), { recursive: true });
  const source = join(consumer, "css-probe/app.tsx");
  writeFileSync(
    source,
    'import { PageContainer, Flex } from "@godxjp/ui/layout";\nimport { Button } from "@godxjp/ui/general";\nexport const used = [PageContainer, Flex, Button];\n',
  );
  const prune = (precompiled) => {
    const out = `css-probe/pruned-${precompiled ? "plain" : "tailwind"}.css`;
    run(
      process.execPath,
      [
        join(installed, "scripts/prune-css.mjs"),
        source,
        "--exclude-family",
        "editorial",
        "--out",
        out,
        ...(precompiled ? ["--precompiled"] : []),
      ],
      consumer,
    );
    return join(consumer, out);
  };
  const plainEntry = prune(true);
  const tailwindEntry = prune(false);
  const result = {};
  async function plain(entry) {
    const built = await bundle({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      write: false,
      outfile: join(consumer, "unused.css"),
    });
    const css = built.outputFiles[0].text;
    requireThat(
      !/@(?:apply|source|theme|import)\b/.test(css),
      "precompiled output must have no Tailwind directives or unresolved imports",
    );
    return css;
  }
  async function tailwind(name, content) {
    const file = join(consumer, `css-probe/${name}.css`);
    writeFileSync(file, content);
    const built = await build({
      root: consumer,
      configFile: false,
      logLevel: "silent",
      plugins: [tailwindcss()],
      build: { write: false, cssMinify: "lightningcss", rollupOptions: { input: file } },
    });
    return built.output
      .filter((f) => f.type === "asset" && f.fileName.endsWith(".css"))
      .map((f) => String(f.source))
      .join("\n");
  }
  const allPlain = await plain(join(installed, "dist/styles.css"));
  const prunedPlain = await plain(plainEntry);
  const allTailwind = await tailwind("all", '@import "@godxjp/ui/styles";\n@source "./app.tsx";');
  const application = await tailwind(
    "application",
    '@import "@godxjp/ui/styles/application";\n@source "./app.tsx";',
  );
  const prunedTailwind = await tailwind(
    "pruned",
    readFileSync(tailwindEntry, "utf8") + '\n@source "./app.tsx";',
  );
  for (const [name, css] of Object.entries({
    allPlain,
    prunedPlain,
    allTailwind,
    application,
    prunedTailwind,
  })) {
    requireThat(css.includes(".ui-button"), `${name} must retain Button`);
    requireThat(css.includes(".ui-page-container"), `${name} must retain PageContainer`);
    if (!name.startsWith("all")) {
      requireThat(
        !/\.ui-(?:editorial-(?:section|hero)|catalog-card|holding-grid)[\s:{[]/.test(css),
        `${name} must omit editorial, catalog and holding layouts`,
      );
    }
    result[name] = size(css);
  }
  requireThat(
    result.prunedPlain.gzip < result.allPlain.gzip,
    "precompiled pruning must save gzip bytes",
  );
  requireThat(
    result.application.gzip < result.allTailwind.gzip,
    "application family entry must save gzip bytes",
  );
  requireThat(
    result.prunedTailwind.gzip < result.application.gzip,
    "content pruning must save more than family pruning",
  );
  const evidenceFlag = process.argv.indexOf("--evidence");
  if (evidenceFlag !== -1) {
    const evidence = resolve(process.argv[evidenceFlag + 1]);
    mkdirSync(evidence, { recursive: true });
    for (const [name, css] of Object.entries({
      allPlain,
      prunedPlain,
      allTailwind,
      application,
      prunedTailwind,
    })) {
      writeFileSync(join(evidence, `${name}.css`), css);
    }
    writeFileSync(join(evidence, "css-sizes.json"), JSON.stringify(result, null, 2) + "\n");
  }
  console.log(
    JSON.stringify({ command: "node scripts/check-packed-css-pruning.mjs", result }, null, 2),
  );
} finally {
  if (scratch) rmSync(scratch, { recursive: true, force: true });
}
