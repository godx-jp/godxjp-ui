#!/usr/bin/env node
/**
 * check-frame-coverage-ledger — the issue #163 preview-contract CI gate.
 *
 * Architecture mirrors the issue #171 screen-reader evidence gate: a JSON-Schema'd document,
 * a locked policy registry, a promotion gate, and a baseline that can be EXTENDED but never
 * WEAKENED.
 *
 * It fails for (issue #163 item 4):
 *   1. a public component/subcomponent with no frame           → new zero-frame owner
 *   2. a public prop/state with neither a covered case nor a reasoned N/A → unclassified cell
 *   3. a fabricated verdict                                    → recomputed cell ≠ ledger cell
 *   4. a frame runtime error                                   → runtime gate unwired/deleted
 *   5. horizontal overflow / clipped interactive control       → geometry baseline grew
 *   6. an axe violation                                        → axe baseline grew
 *
 * RATCHET. The pre-existing `untested` backlog is enormous (that is the honest state of #163),
 * so it is RECORDED as a baseline rather than failing the build on day one. What fails is
 * REGRESSION: coverage falling, a new export landing with no frame, a known gap being quietly
 * marked covered, the required viewport matrix being trimmed, or a sweep baseline growing.
 *
 * Usage: node scripts/check-frame-coverage-ledger.mjs [--format json]
 */
import fs from "node:fs";
import path from "node:path";
import {
  DIMENSIONS,
  DIMENSION_BY_ID,
  DIMENSION_IDS,
  EMBEDDABLE_EXPORTS,
  KNOWN_GAPS,
  KNOWN_GAP_IDS,
  LEDGER_PATH,
  SCHEMA_PATH,
  LEDGER_SCHEMA_VERSION,
  REPO_ROOT,
  REQUIRED_CONTAINER_WIDTHS,
  REQUIRED_VIEWPORTS,
  RUNTIME_GATE_SCRIPTS,
  axeSweep,
  deriveComponents,
  geometrySweep,
  loadApiManifest,
  loadCaseEvidence,
  loadDiscovery,
  naKey,
  readJson,
  totalsFor,
  validateCase,
} from "./frame-coverage-contract.mjs";

const asJson = process.argv.includes("--format") && process.argv.includes("json");
const ledgerPath = process.env.FRAME_COVERAGE_LEDGER ?? LEDGER_PATH;
const errors = [];
const isoUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

if (!fs.existsSync(ledgerPath)) {
  console.error(`- ${path.relative(REPO_ROOT, ledgerPath)} is missing`);
  process.exit(1);
}
const ledger = readJson(ledgerPath);

// ---------------------------------------------------------------------------
// 1. Document shape + locked policy registry.
// ---------------------------------------------------------------------------
if (ledger.schemaVersion !== LEDGER_SCHEMA_VERSION) {
  errors.push(`schemaVersion must be ${LEDGER_SCHEMA_VERSION}`);
}
for (const field of ["policy", "baseline", "cases", "components"]) {
  if (!ledger[field]) errors.push(`ledger.${field} is required`);
}
if (!Array.isArray(ledger.cases)) errors.push("ledger.cases must be an array");

const declaredViewports = ledger.policy?.viewports?.required ?? [];
for (const width of REQUIRED_VIEWPORTS) {
  if (!declaredViewports.includes(width)) {
    errors.push(
      `policy.viewports.required cannot drop the mandated width ${width} (issue #163 §5)`,
    );
  }
}
for (const width of REQUIRED_CONTAINER_WIDTHS) {
  if (!(ledger.policy?.viewports?.containerWidths ?? []).includes(width)) {
    errors.push(`policy.viewports.containerWidths cannot drop the container-width case ${width}`);
  }
}
for (const name of EMBEDDABLE_EXPORTS) {
  if (!(ledger.policy?.viewports?.embeddable ?? []).includes(name)) {
    errors.push(`policy.viewports.embeddable cannot drop the embeddable export ${name}`);
  }
}
const declaredDimensions = new Map(
  (ledger.policy?.dimensions ?? []).map((dimension) => [dimension.id, dimension]),
);
for (const dimension of DIMENSIONS) {
  const declared = declaredDimensions.get(dimension.id);
  if (!declared) {
    errors.push(`policy.dimensions cannot drop the contract dimension ${dimension.id}`);
    continue;
  }
  if (declared.promotion !== dimension.promotion) {
    errors.push(`policy.dimensions.${dimension.id}: promotion route cannot be weakened`);
  }
  if (!declared.untestedReason?.trim()) {
    errors.push(`policy.dimensions.${dimension.id}: untestedReason is required`);
  }
}

// ---------------------------------------------------------------------------
// 1b. Schema lockstep. There is no JSON-Schema validator dependency in this repo (and this
//     gate must add none), so instead of validating loosely we assert that the published
//     schema, the code registry and the data can never drift apart, and we enforce the
//     schema's own cell grammar on every cell.
// ---------------------------------------------------------------------------
let cellPattern = null;
if (!fs.existsSync(SCHEMA_PATH)) {
  errors.push("frame-coverage.ledger.schema.json is missing");
} else {
  const schema = readJson(SCHEMA_PATH);
  if (schema.properties?.schemaVersion?.const !== LEDGER_SCHEMA_VERSION) {
    errors.push("schema: properties.schemaVersion.const has drifted from the code contract");
  }
  const schemaDimensions = schema.$defs?.dimensionId?.enum ?? [];
  if (schemaDimensions.join(",") !== DIMENSION_IDS.join(",")) {
    errors.push(
      `schema: $defs.dimensionId.enum has drifted from the code registry (${schemaDimensions.length} vs ${DIMENSION_IDS.length} dimensions)`,
    );
  }
  const pattern = schema.$defs?.cell?.pattern;
  if (!pattern) errors.push("schema: $defs.cell.pattern is missing");
  else cellPattern = new RegExp(pattern);
}

// ---------------------------------------------------------------------------
// 2. Runtime-error gates must stay wired (issue #163 item 4, "frame runtime error").
// ---------------------------------------------------------------------------
const packageJson = readJson(path.join(REPO_ROOT, "package.json"));
const scriptBlob = Object.values(packageJson.scripts ?? {}).join(" \n ");
for (const script of RUNTIME_GATE_SCRIPTS) {
  if (!fs.existsSync(path.join(REPO_ROOT, script))) {
    errors.push(`runtime gate ${script} has been deleted — frame runtime errors would go unseen`);
    continue;
  }
  if (!scriptBlob.includes(path.basename(script))) {
    errors.push(`runtime gate ${script} is no longer wired into any package.json script`);
  }
}

// ---------------------------------------------------------------------------
// 3. Reviewed not-applicable waivers.
// ---------------------------------------------------------------------------
const reviewedNa = new Set();
for (const review of ledger.policy?.notApplicable ?? []) {
  const label = `${review.target ?? "<missing>"}.${review.dimension ?? "<missing>"}`;
  for (const field of ["target", "dimension", "reason", "reviewedBy", "reviewedIn", "reviewedAt"]) {
    if (typeof review[field] !== "string" || !review[field].trim()) {
      errors.push(`not-applicable ${label}: missing ${field}`);
    }
  }
  if (!DIMENSION_BY_ID.has(review.dimension)) {
    errors.push(`not-applicable ${label}: unknown dimension`);
  }
  if ((review.reason ?? "").trim().length < 40) {
    errors.push(`not-applicable ${label}: reason must explain why the dimension cannot exist`);
  }
  if (!/^https:\/\//.test(review.reviewedIn ?? "")) {
    errors.push(`not-applicable ${label}: reviewedIn must be an HTTPS review link`);
  }
  if (!isoUtc.test(review.reviewedAt ?? "")) {
    errors.push(`not-applicable ${label}: reviewedAt must be an ISO-8601 UTC timestamp`);
  }
  if (reviewedNa.has(naKey(review.target, review.dimension))) {
    errors.push(`not-applicable ${label}: duplicate waiver`);
  }
  reviewedNa.add(naKey(review.target, review.dimension));
  const gap = KNOWN_GAPS.find((entry) => entry.targets.includes(review.target));
  if (gap?.dimensions.includes(review.dimension)) {
    errors.push(
      `not-applicable ${label}: this is an issue #163 "Initial known gap" — it must be COVERED or stay UNTESTED, it cannot be waived`,
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Declared cases — the only human route to `covered` for behavioural dimensions.
// ---------------------------------------------------------------------------
const caseIds = new Set();
for (const record of ledger.cases ?? []) {
  errors.push(...validateCase(record));
  if (caseIds.has(record?.id)) errors.push(`case ${record.id}: duplicate case id`);
  caseIds.add(record?.id);
}

// ---------------------------------------------------------------------------
// 5. Recompute every verdict from the real inputs and diff against the ledger.
//    This is the anti-fabrication core: a hand-written `covered` that no evidence
//    chain supports is a mismatch, and a mismatch fails the build.
// ---------------------------------------------------------------------------
const discovery = loadDiscovery();
const manifest = loadApiManifest();
const caseEvidence = loadCaseEvidence();
const rows = deriveComponents({ discovery, manifest, caseEvidence, ledger });
const totals = totalsFor(rows);
const rowByExport = new Map(rows.map((row) => [row.export, row]));

function compact(value) {
  if (value.status === "untested") return "untested";
  if (value.status === "not-applicable") return `not-applicable:${value.via}`;
  if (value.via === "prop-evidence") return `covered:prop-evidence:${value.prop}`;
  return `covered:declared-case:${value.cases.join("+")}`;
}

for (const row of rows) {
  const entry = ledger.components?.[row.export];
  if (!entry) {
    errors.push(
      `${row.export}: public export is not registered in the ledger — run \`pnpm gen:frame-coverage-ledger\``,
    );
    continue;
  }
  for (const id of DIMENSION_IDS) {
    const declared = entry.dimensions?.[id];
    if (typeof declared !== "string" || !declared.trim()) {
      errors.push(
        `${row.export}.${id}: no verdict declared (neither a covered case nor a reasoned N/A)`,
      );
      continue;
    }
    if (cellPattern && !cellPattern.test(declared)) {
      errors.push(`${row.export}.${id}: "${declared}" is not a valid verdict cell`);
      continue;
    }
    const expected = compact(row.dimensions[id]);
    if (declared !== expected) {
      errors.push(
        `${row.export}.${id}: ledger says "${declared}" but the evidence recomputes to "${expected}" — a verdict cannot be hand-written`,
      );
    }
  }
}
for (const name of Object.keys(ledger.components ?? {})) {
  if (!rowByExport.has(name)) {
    errors.push(`${name}: ledger registers an export that is no longer public — regenerate`);
  }
}

// ---------------------------------------------------------------------------
// 6. Frames. A public component with no frame is a hard failure unless it is in the
//    recorded baseline; the baseline set may only SHRINK.
// ---------------------------------------------------------------------------
const knownMissing = new Set(ledger.baseline?.knownMissingFrames ?? []);
const actualMissing = new Set(rows.filter((row) => !row.hasFrame).map((row) => row.owner));
for (const owner of actualMissing) {
  if (!knownMissing.has(owner)) {
    errors.push(
      `${owner}: public export(s) landed with no /frame route — author docs/${owner}.tsx (issue #163 item 4.1)`,
    );
  }
}
for (const owner of knownMissing) {
  if (!actualMissing.has(owner)) {
    errors.push(
      `baseline.knownMissingFrames still lists ${owner}, which now HAS a frame — regenerate so the ratchet tightens`,
    );
  }
}
for (const row of rows) {
  for (const frame of row.frames) {
    if (!fs.existsSync(path.join(REPO_ROOT, frame))) {
      errors.push(`${row.export}: declared frame ${frame} does not resolve`);
    }
  }
}

// ---------------------------------------------------------------------------
// 7. The ratchet. Coverage may only improve.
// ---------------------------------------------------------------------------
for (const row of rows) {
  const entry = ledger.components?.[row.export];
  if (!entry?.baseline) continue;
  const count = (status) =>
    DIMENSION_IDS.filter((id) => row.dimensions[id].status === status).length;
  const covered = count("covered");
  const notApplicable = count("not-applicable");
  if (covered < entry.baseline.covered) {
    errors.push(
      `${row.export}: REGRESSION — covered dimensions fell from ${entry.baseline.covered} to ${covered}`,
    );
  }
  if (notApplicable > entry.baseline.notApplicable) {
    errors.push(
      `${row.export}: REGRESSION — reasoned not-applicable dimensions rose from ${entry.baseline.notApplicable} to ${notApplicable}; a real contract dimension was converted into an N/A`,
    );
  }
}
if (totals.covered < (ledger.baseline?.covered ?? 0)) {
  errors.push(
    `REGRESSION — total covered dimension cells fell from ${ledger.baseline.covered} to ${totals.covered}`,
  );
}

const geometry = geometrySweep();
if (geometry.available && geometry.failingCells > (ledger.baseline?.geometryFailingCells ?? 0)) {
  errors.push(
    `REGRESSION — frame-geometry overflow/clipped-control failures rose from ${ledger.baseline.geometryFailingCells} to ${geometry.failingCells} frame×width cell(s)`,
  );
}
const axe = axeSweep();
if (axe.available && axe.failingFrames > (ledger.baseline?.axeFailingFrames ?? 0)) {
  errors.push(
    `REGRESSION — frames carrying axe violations rose from ${ledger.baseline.axeFailingFrames} to ${axe.failingFrames}`,
  );
}

// ---------------------------------------------------------------------------
// 8. Issue #163 "Initial known gaps" — tracked, never forgotten, never silently closed.
// ---------------------------------------------------------------------------
const ledgerGaps = new Map((ledger.policy?.knownGaps ?? []).map((gap) => [gap.id, gap]));
for (const id of KNOWN_GAP_IDS) {
  if (!ledgerGaps.has(id)) {
    errors.push(`policy.knownGaps cannot drop the issue #163 known gap ${id}`);
  }
}
for (const gap of KNOWN_GAPS) {
  for (const target of gap.targets) {
    const row = rowByExport.get(target);
    if (!row) {
      errors.push(`known gap ${gap.id}: target ${target} is not a registered public export`);
      continue;
    }
    for (const dimensionId of gap.dimensions) {
      if (!DIMENSION_BY_ID.has(dimensionId)) {
        errors.push(`known gap ${gap.id}: unknown dimension ${dimensionId}`);
        continue;
      }
      const status = row.dimensions[dimensionId].status;
      if (status === "not-applicable") {
        errors.push(
          `known gap ${gap.id}: ${target}.${dimensionId} became not-applicable — a known gap cannot be waived away`,
        );
      }
      if (status === "covered" && !(ledgerGaps.get(gap.id)?.resolvedBy ?? []).length) {
        errors.push(
          `known gap ${gap.id}: ${target}.${dimensionId} reads covered but the gap has no resolvedBy case reference`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------
const openGaps = KNOWN_GAPS.filter((gap) =>
  gap.targets.some((target) =>
    gap.dimensions.some(
      (dimensionId) => rowByExport.get(target)?.dimensions[dimensionId]?.status === "untested",
    ),
  ),
);
const report = {
  schemaVersion: LEDGER_SCHEMA_VERSION,
  standard: "docs/FRAME-COVERAGE-STANDARD.md",
  ledger: path.relative(REPO_ROOT, ledgerPath),
  verdictLegend: {
    covered: "an executed case proves this dimension",
    untested: "NO executed case — this is NOT a pass",
    "not-applicable": "the dimension cannot exist here, with a written reason",
  },
  totals,
  baseline: ledger.baseline,
  sweeps: { geometry, axe },
  declaredCases: (ledger.cases ?? []).length,
  reviewedNotApplicable: (ledger.policy?.notApplicable ?? []).length,
  knownGaps: KNOWN_GAPS.length,
  openKnownGaps: openGaps.map((gap) => gap.id),
  errors,
};

const outDir = path.join(REPO_ROOT, "audit-evidence/frame-coverage");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ledger.json"), `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  if (asJson) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else
    console.error(
      `frame-coverage ledger gate failed (${errors.length}):\n${errors.map((error) => `- ${error}`).join("\n")}`,
    );
  process.exit(1);
}

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(0);
}
const percent = ((totals.covered / totals.dimensionCells) * 100).toFixed(1);
console.log(
  `frame-coverage ledger valid: ${totals.exports} public export(s) × ${DIMENSION_IDS.length} dimension(s) = ${totals.dimensionCells} cells — ` +
    `${totals.covered} covered (${percent}%) / ${totals.untested} UNTESTED / ${totals.notApplicable} reasoned N-A; ` +
    `${totals.exportsWithFrame}/${totals.exports} export(s) reach a frame, ${totals.fullyClassified} fully classified; ` +
    `${report.declaredCases} declared case(s), ${report.openKnownGaps.length}/${KNOWN_GAPS.length} known gap(s) still open. ` +
    `UNTESTED IS NOT A PASS.`,
);
