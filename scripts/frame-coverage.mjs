#!/usr/bin/env node
/**
 * frame-coverage — preview-contract coverage tracker.
 *
 * Cross-references the public component inventory (mcp/src/data/components.ts) against the
 * frames that actually exist (docs tsx files) and a declared coverage LEDGER
 * (preview/frame-coverage.ledger.json), then reports — per exported component — which
 * contract axes are covered vs missing. A component with no frame, or a contract
 * dimension with neither a case nor a reasoned N/A, is reported as UNTESTED (never a
 * silent pass), per docs/FRAME-COVERAGE-STANDARD.md.
 *
 * Browser-free (pure filesystem) so it runs in the fast `verify` lane without Chromium.
 * Emits audit-evidence/frame-coverage/coverage.json + a tracked docs/FRAME-COVERAGE-REPORT.md
 * checklist. Report-only by default; `--strict` exits 1 on any zero-frame non-deprecated
 * component (for the end-state gate once component agents finish authoring frames).
 *
 * Usage: node scripts/frame-coverage.mjs [--strict] [--format json]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT, loadComponentInventory, kebab } from "./frame-harness.mjs";
import { axesFromCells } from "./frame-coverage-contract.mjs";

const LEDGER_PATH = path.join(REPO_ROOT, "preview/frame-coverage.ledger.json");
const OUT_DIR = path.join(REPO_ROOT, "audit-evidence/frame-coverage");
const REPORT_MD = path.join(REPO_ROOT, "docs/FRAME-COVERAGE-REPORT.md");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";

const DIMENSIONS = [
  "visual",
  "state",
  "ownership",
  "contentStress",
  "responsive",
  "international",
  "accessibility",
  "preferences",
  "async",
];

/** Groups under docs/ that are not per-component contract frames. */
const NON_COMPONENT_GROUPS = new Set(["showcase", "foundation"]);

/**
 * Component export → frame slug, for components documented inside a shared/sibling frame
 * (subcomponents, chart variants, aliases). Anything not here is matched by kebab(name).
 */
const FRAME_ALIAS = {
  AlertDialogRoot: "alert-dialog",
  CardContent: "card",
  Field: "form-field",
  // FormErrors is meaningless outside a Form (it reads Form's error bag + claim registry), so it
  // is demoed inside the form frame beside the fields that claim their keys, not in its own frame.
  FormErrors: "form",
  Toaster: "toast",
  formatDate: "format-date",
  SkeletonTable: "skeleton",
  Radio: "radio-group",
  CheckboxGroup: "checkbox",
  Text: "typography",
  Heading: "typography",
  LineChart: "charts",
  BarChart: "charts",
  AreaChart: "charts",
  PieChart: "charts",
  UploadCropDialog: "upload",
  // alert frame beside the inline variant it re-measures, not in a frame of its own.
  Banner: "alert",
};

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

/** Derive { group, slug } for a docs frame file. */
function frameOf(relPath) {
  const parts = relPath.replace(/\.tsx$/, "").split("/");
  parts.shift(); // drop "docs"
  const group = parts[0];
  const exIdx = parts.indexOf("examples");
  let seg;
  if (exIdx > 0) seg = parts[exIdx - 1];
  else {
    const last = parts[parts.length - 1];
    seg = last === "index" ? parts[parts.length - 2] : last;
  }
  return { group, slug: kebab(seg), relPath };
}

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return { components: {} };
  return JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
}

function main() {
  const inventory = loadComponentInventory();
  const files = walk(path.join(REPO_ROOT, "docs")).map((f) => path.relative(REPO_ROOT, f));
  const frames = files.map(frameOf).filter((f) => !NON_COMPONENT_GROUPS.has(f.group));
  const frameSlugs = new Set(frames.map((f) => f.slug));
  const framesBySlug = {};
  for (const f of frames) (framesBySlug[f.slug] ??= []).push(f.relPath);

  const ledger = loadLedger();

  const rows = [];
  const usedSlugs = new Set();
  for (const c of inventory) {
    const slug = FRAME_ALIAS[c.name] ?? kebab(c.name);
    const hasFrame = frameSlugs.has(slug);
    if (hasFrame) usedSlugs.add(slug);
    // the nine FRAME-COVERAGE-STANDARD axes, so roll them up through the shared contract module
    // rather than re-deriving (and drifting) here.
    const entry = ledger.components?.[c.name];
    const decl = entry ? axesFromCells(entry.dimensions) : {};
    const dims = {};
    for (const d of DIMENSIONS) {
      const v = decl[d];
      // "covered" | "N/A:<reason>" rolled up from the ledger, else UNTESTED
      dims[d] = typeof v === "string" && v.length ? v : "UNTESTED";
    }
    rows.push({
      component: c.name,
      group: c.group,
      deprecated: !!c.deprecated,
      frameSlug: slug,
      hasFrame,
      frames: framesBySlug[slug] ?? [],
      dimensions: dims,
    });
  }

  // Orphan frames — a frame with no owning inventory component (recipes, compounds).
  const orphanFrames = [...frameSlugs].filter((s) => !usedSlugs.has(s)).sort();

  const missing = rows.filter((r) => !r.hasFrame && !r.deprecated).map((r) => r.component);
  const covered = DIMENSIONS.reduce((acc, d) => {
    acc[d] = {
      covered: rows.filter((r) => r.dimensions[d] === "covered").length,
      na: rows.filter((r) => r.dimensions[d]?.startsWith("N/A")).length,
      untested: rows.filter((r) => r.dimensions[d] === "UNTESTED").length,
    };
    return acc;
  }, {});

  const summary = {
    components: rows.length,
    withFrame: rows.filter((r) => r.hasFrame).length,
    missingFrame: missing.length,
    orphanFrames: orphanFrames.length,
    fullyCovered: rows.filter(
      (r) => r.hasFrame && DIMENSIONS.every((d) => r.dimensions[d] !== "UNTESTED"),
    ).length,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const coverage = {
    generatedAt: new Date().toISOString(),
    standard: "docs/FRAME-COVERAGE-STANDARD.md",
    dimensions: DIMENSIONS,
    summary,
    dimensionTotals: covered,
    missingFrame: missing,
    orphanFrames,
    components: rows,
  };
  writeFileSync(path.join(OUT_DIR, "coverage.json"), JSON.stringify(coverage, null, 2) + "\n");
  writeReport(coverage);

  if (asJson) {
    process.stdout.write(JSON.stringify(coverage, null, 2) + "\n");
    process.exit(strict && missing.length ? 1 : 0);
  }

  const C = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    reset: "\x1b[0m",
  };
  console.log(`${C.bold}Frame coverage (issue #163)${C.reset}`);
  console.log(
    `  components: ${summary.components}  ·  with ≥1 frame: ${C.green}${summary.withFrame}${C.reset}  ·  ` +
      `zero-frame: ${summary.missingFrame ? C.red : C.green}${summary.missingFrame}${C.reset}  ·  ` +
      `fully covered (all axes): ${summary.fullyCovered ? C.green : C.yellow}${summary.fullyCovered}${C.reset}`,
  );
  if (missing.length) {
    console.log(`  ${C.red}UNTESTED — no frame:${C.reset} ${missing.join(", ")}`);
  }
  console.log(`  ${C.bold}dimension coverage (covered / N·A / UNTESTED):${C.reset}`);
  for (const d of DIMENSIONS) {
    const t = covered[d];
    console.log(
      `    ${d.padEnd(14)} ${C.green}${t.covered}${C.reset} / ${t.na} / ${C.yellow}${t.untested}${C.reset}`,
    );
  }
  if (orphanFrames.length)
    console.log(
      `  ${C.dim}orphan frames (recipe/compound, no 1:1 export): ${orphanFrames.join(", ")}${C.reset}`,
    );
  console.log(
    `  report → docs/FRAME-COVERAGE-REPORT.md · evidence → audit-evidence/frame-coverage/coverage.json`,
  );

  if (strict && missing.length) {
    console.log(
      `${C.red}✗ frame-coverage --strict: ${missing.length} public component(s) have no frame.${C.reset}`,
    );
    process.exit(1);
  }
  process.exit(0);
}

function writeReport(cov) {
  const lines = [];
  lines.push("# Frame coverage report");
  lines.push("");
  lines.push(
    `> Generated by \`scripts/frame-coverage.mjs\` (issue #163). Do not edit by hand — run \`pnpm check:frame-coverage\`.`,
  );
  lines.push(
    `> Standard: [FRAME-COVERAGE-STANDARD.md](./FRAME-COVERAGE-STANDARD.md). A missing dimension is **UNTESTED**, never a pass.`,
  );
  lines.push("");
  lines.push(`- Public components: **${cov.summary.components}**`);
  lines.push(
    `- With ≥1 frame: **${cov.summary.withFrame}** · zero-frame: **${cov.summary.missingFrame}**`,
  );
  lines.push(`- Fully covered (every contract axis declared): **${cov.summary.fullyCovered}**`);
  lines.push("");
  if (cov.missingFrame.length) {
    lines.push("## UNTESTED — no `/frame/**` route");
    lines.push("");
    for (const m of cov.missingFrame) lines.push(`- [ ] \`${m}\``);
    lines.push("");
  }
  lines.push("## Per-component contract axes");
  lines.push("");
  lines.push("Legend: ✓ covered · N/A reasoned skip · · UNTESTED (blank cell = UNTESTED).");
  lines.push("");
  const head = ["Component", "Frame", ...cov.dimensions.map((d) => d.slice(0, 5))];
  lines.push(`| ${head.join(" | ")} |`);
  lines.push(`| ${head.map(() => "---").join(" | ")} |`);
  for (const r of cov.components) {
    const cells = cov.dimensions.map((d) => {
      const v = r.dimensions[d];
      if (v === "covered") return "✓";
      if (v?.startsWith("N/A")) return "N/A";
      return "·";
    });
    const frameCell = r.hasFrame ? "✓" : r.deprecated ? "dep" : "**✗**";
    lines.push(`| ${r.component} | ${frameCell} | ${cells.join(" | ")} |`);
  }
  lines.push("");

  /**
   * `--check` IS NOT AN EXTRA HERE, for a reason this repo has now paid for twice.
   *
   * `docs/FRAME-COVERAGE-REPORT.md` is TRACKED, and nothing asserted it was fresh — so it drifted
   * from 152 public components to 163 (zero-frame 17 → 21) without a single red build, and the
   * agent-facing answer to "what is untested" was three releases stale. That is the same shape as
   * the stale MCP token catalog: a file regenerated when somebody remembered, and otherwise wrong.
   *
   * It also has a second cost that is easy to miss. Because this script always WRITES, any job that
   * runs `check:frame-coverage` leaves a dirty tree behind — and the release tool refuses to
   * publish a tree that differs from the verified commit. The v23.4.9 release aborted on exactly
   * that, at the last step, after a full green verify:
   *
   *     ✗ Refusing to publish tag v23.4.9: the working tree differs from the verified commit
   *     -  M docs/FRAME-COVERAGE-REPORT.md
   */
  const body = lines.join("\n") + "\n";
  if (process.argv.includes("--check")) {
    let current = "";
    try {
      current = readFileSync(REPORT_MD, "utf8");
    } catch {
      /* missing → stale */
    }
    if (current !== body) {
      console.error(
        `✗ check:frame-coverage-report — docs/FRAME-COVERAGE-REPORT.md is stale. ` +
          `Run \`node scripts/frame-coverage.mjs\`.`,
      );
      // Say WHAT moved: the two counts are the whole story in most cases.
      const count = (text, label) => text.match(new RegExp(`${label}: \\*\\*(\\d+)\\*\\*`))?.[1] ?? "?";
      console.error(
        `    public components: ${count(current, "Public components")} → ${count(body, "Public components")}`,
      );
      console.error(`    zero-frame: ${count(current, "zero-frame")} → ${count(body, "zero-frame")}`);
      process.exit(1);
    }
    console.log(`✓ check:frame-coverage-report — the tracked report matches the frames on disk.`);
    return;
  }
  writeFileSync(REPORT_MD, body);
}

main();
