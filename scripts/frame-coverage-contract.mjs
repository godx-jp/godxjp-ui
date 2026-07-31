/**
 * frame-coverage-contract — the single source of truth for the issue #163 preview contract.
 *
 * Both the generator (gen-frame-coverage-ledger.mjs) and the CI gate
 * (check-frame-coverage-ledger.mjs) import this module, so the dimension registry, the
 * applicability derivation and the promotion rules can never drift between "what we write
 * into the ledger" and "what CI enforces".
 *
 * Design mirrors the issue #171 screen-reader evidence gate: JSON-Schema + policy registry +
 * promotion gate. The three verdicts are the ones the issue mandates:
 *
 *   covered         — an EXECUTED case proves the dimension. Never inferred.
 *   untested        — no executed case. This is the DEFAULT and it is NOT a pass.
 *   not-applicable  — the dimension cannot exist for this export, WITH a written reason.
 *
 * "The absence of a demonstrated state must not be interpreted as a pass." (issue #163)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const LEDGER_PATH = path.join(REPO_ROOT, "preview/frame-coverage.ledger.json");
export const SCHEMA_PATH = path.join(REPO_ROOT, "frame-coverage.ledger.schema.json");
export const GEOMETRY_BASELINE_PATH = path.join(REPO_ROOT, "scripts/frame-geometry.baseline.json");
export const AXE_BASELINE_PATH = path.join(REPO_ROOT, "scripts/frame-axe.baseline.json");

export const LEDGER_SCHEMA_VERSION = 2;

/** Issue #163 §5. Locked — the gate refuses a ledger that drops any of these. */
export const REQUIRED_VIEWPORTS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

/** Container-width cases required in addition to the viewport matrix for embeddable exports. */
export const REQUIRED_CONTAINER_WIDTHS = [240, 320, 480, 640, 960];

/** The nine legacy contract axes of docs/FRAME-COVERAGE-STANDARD.md. */
export const AXES = [
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

const OWNERSHIP_PROPS = [
  "value",
  "defaultValue",
  "onValueChange",
  "checked",
  "defaultChecked",
  "onCheckedChange",
  "open",
  "defaultOpen",
  "onOpenChange",
  "selected",
  "defaultSelected",
  "onSelectedChange",
  "page",
  "defaultPage",
  "onPageChange",
  // Imperative-ownership escape hatches (Carousel hands its embla instance to the caller via
  // `setApi`) — taking ownership of the instance is the controlled mode for those components.
  "api",
  "setApi",
];

const STATE_PROPS = [
  "disabled",
  "readOnly",
  "loading",
  "invalid",
  "required",
  "error",
  "success",
  "empty",
  "pending",
  "busy",
];

/**
 * The 14 contract dimensions of issue #163 item 2, each mapped onto one of the nine
 * FRAME-COVERAGE-STANDARD axes.
 *
 * `applicability`
 *   prop      — applicable only when the generated public API exposes that prop. When it does
 *               not, the dimension is `not-applicable` with a MACHINE-VERIFIED written reason
 *               (re-derived by the gate on every run, so it cannot rot into a false N/A).
 *   anyProp   — applicable when any of the listed props exists.
 *   universal — always applicable. Leaving it is only possible through a reviewed
 *               `policy.notApplicable` entry (human reason + reviewer + review link).
 *
 * `promotion`
 *   prop-evidence  — may be promoted to `covered` automatically from component-case-evidence.json,
 *                    which is itself fail-closed: every literal branch of the union must be
 *                    enumerated and every evidence path must resolve to a repository file.
 *   declared-case  — may ONLY be promoted by a hand-authored, reviewed case in the ledger that
 *                    names a resolvable frame + case heading + resolvable evidence files.
 */
export const DIMENSIONS = [
  {
    id: "variants",
    title: "Variants",
    axis: "visual",
    applicability: { kind: "prop", prop: "variant" },
    promotion: "prop-evidence",
    untestedReason:
      "No executed case demonstrates every `variant` branch of this export. UNTESTED — not a pass.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no `variant` prop on this export, so there is no variant axis to demonstrate.",
  },
  {
    id: "tones",
    title: "Tones",
    axis: "visual",
    applicability: { kind: "prop", prop: "tone" },
    promotion: "prop-evidence",
    untestedReason:
      "No executed case demonstrates every `tone` branch of this export. UNTESTED — not a pass.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no `tone` prop on this export, so there is no tone axis to demonstrate.",
  },
  {
    id: "sizes",
    title: "Sizes",
    axis: "visual",
    applicability: { kind: "prop", prop: "size" },
    promotion: "prop-evidence",
    untestedReason:
      "No executed case demonstrates every `size` branch of this export. UNTESTED — not a pass.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no `size` prop on this export, so there is no size axis to demonstrate.",
  },
  {
    id: "shapes",
    title: "Shapes",
    axis: "visual",
    applicability: { kind: "prop", prop: "shape" },
    promotion: "prop-evidence",
    untestedReason:
      "No executed case demonstrates every `shape` branch of this export. UNTESTED — not a pass.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no `shape` prop on this export, so there is no shape axis to demonstrate.",
  },
  {
    id: "density",
    title: "Spacing / density",
    axis: "visual",
    applicability: { kind: "prop", prop: "density" },
    promotion: "prop-evidence",
    untestedReason:
      "No executed case demonstrates every `density` branch of this export. UNTESTED — not a pass.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no `density` prop on this export, so there is no density axis to demonstrate.",
  },
  {
    id: "ownership",
    title: "Controlled / uncontrolled / reset",
    axis: "ownership",
    applicability: { kind: "anyProp", props: OWNERSHIP_PROPS },
    promotion: "declared-case",
    untestedReason:
      "No executed case drives this export both controlled and uncontrolled and proves reset behaviour. Prop-level evidence that a `value`/`defaultValue` prop renders does NOT prove ownership semantics.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no controlled/uncontrolled state pair (value/defaultValue/onValueChange, checked/…, open/…, selected/…, page/…) on this export.",
  },
  {
    id: "states",
    title: "Disabled / read-only / loading / empty / error / success",
    axis: "state",
    applicability: { kind: "anyProp", props: STATE_PROPS },
    promotion: "declared-case",
    untestedReason:
      "No executed case walks this export through its disabled, read-only, loading, empty, error and success states.",
    notApplicableReason:
      "The generated public API surface (component-api-manifest.json) exposes no disabled/readOnly/loading/invalid/required/error/success/empty state prop on this export.",
  },
  {
    id: "async",
    title: "Async: loading / reject / retry / cancel / offline",
    axis: "async",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed case exercises the async lifecycle (loading, reject, retry, cancel, stale/background refresh, offline). Per docs/FRAME-COVERAGE.md a blanket primitive-default not-applicable is FORBIDDEN — every export must eventually be classified explicitly.",
  },
  {
    id: "responsive",
    title: "Responsive viewport matrix",
    axis: "responsive",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    requiresViewports: true,
    untestedReason:
      "No executed case records this export rendering correctly across the required 320/375/390/768/1024/1280/1440/1920 matrix. The frame-geometry sweep proves only the absence of horizontal overflow and clipped controls on the frames it swept; it is not a responsive-layout case.",
  },
  {
    id: "rtl",
    title: "RTL / direction",
    axis: "international",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed RTL case exists for this export. `?dir=rtl` being available on every /frame route makes RTL EXERCISABLE; it does not make it exercised.",
  },
  {
    id: "contentStress",
    title: "Long / localized content stress",
    axis: "contentStress",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed case stresses this export with long Japanese/Vietnamese strings, large numbers, or missing/invalid data.",
  },
  {
    id: "keyboard",
    title: "Keyboard / focus order / focus return",
    axis: "accessibility",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed case asserts keyboard traversal, focus order and focus restoration for this export.",
  },
  {
    id: "accessibleName",
    title: "Accessible name / description / error association",
    axis: "accessibility",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed case asserts the COMPUTED accessible name, description and error association for this export. An axe pass is a rule scan, not a naming contract.",
  },
  {
    id: "reducedMotion",
    title: "Preferences: reduced motion / forced colors / 200% zoom / coarse touch",
    axis: "preferences",
    applicability: { kind: "universal" },
    promotion: "declared-case",
    untestedReason:
      "No executed case renders this export under prefers-reduced-motion, forced-colors, 200% zoom or a coarse pointer.",
  },
];

export const DIMENSION_IDS = DIMENSIONS.map((dimension) => dimension.id);
export const DIMENSION_BY_ID = new Map(DIMENSIONS.map((dimension) => [dimension.id, dimension]));

/**
 * Exports that are DESIGNED to be embedded inside a caller-sized container. These must
 * additionally demonstrate the container-width cases (issue #163 §5) before `responsive`
 * may be promoted. Locked — the gate refuses a ledger that shrinks this list.
 */
export const EMBEDDABLE_EXPORTS = [
  "Alert",
  "AreaChart",
  "BarChart",
  "Card",
  "Carousel",
  "DataTable",
  "EmptyState",
  "LineChart",
  "Pagination",
  "PieChart",
  "Progress",
  "Skeleton",
  "Tabs",
  "Timeline",
  "Toolbar",
  "TreeList",
];

/**
 * Issue #163 "Initial known gaps to encode". Locked in code so the list cannot be quietly
 * deleted from the ledger. Each entry must resolve to a registered export and a registered
 * dimension, and must still read `untested` unless a declared case resolves it.
 */
export const KNOWN_GAPS = [
  {
    id: "button-contract-gaps",
    targets: ["Button"],
    dimensions: ["states", "contentStress", "rtl", "keyboard", "reducedMotion"],
    cases: [
      "implicit form `type` inside a form",
      "loading combined with asChild",
      "count / overflowCount / showZero overflow",
      "long Japanese and Vietnamese labels",
      "RTL",
      "coarse touch target",
    ],
  },
  {
    id: "card-contract-gaps",
    targets: ["Card"],
    dimensions: ["variants", "density", "rtl", "accessibleName"],
    cases: [
      "`variant` × `accent` × `size` matrix",
      '`density="tight"` spacing mode',
      "nested heading levels",
      "RTL accent rail",
    ],
  },
  {
    id: "card-subcomponent-contract-gaps",
    targets: ["CardBar", "CardContent", "CardFooter", "CardHeader"],
    dimensions: ["rtl", "accessibleName", "contentStress"],
    cases: [
      "CardBar `extra` slot",
      "CardContent `tight` / `flush` / `solo`",
      "CardFooter `flush` / `separated`",
      "CardHeader `banded`",
      "RTL",
    ],
  },
  {
    id: "empty-state-contract-gaps",
    targets: ["EmptyState"],
    dimensions: ["variants", "contentStress", "accessibleName"],
    cases: [
      "`section` variant",
      "`compact` variant",
      "without icon / description / action",
      "heading level (`titleAs` / `titleLevel`) and live-region semantics",
    ],
  },
  {
    id: "progress-contract-gaps",
    targets: ["Progress"],
    dimensions: ["tones", "contentStress"],
    cases: ["destructive tone", "`over={true}` (value beyond 100%)"],
  },
  {
    id: "carousel-contract-gaps",
    targets: ["Carousel"],
    dimensions: ["ownership", "contentStress", "keyboard", "reducedMotion", "rtl"],
    cases: [
      "single slide",
      "plugins / setApi",
      "autoplay pause",
      "arrow-key traversal alongside tabs",
      "touch / swipe",
      "RTL",
    ],
  },
  {
    id: "data-table-contract-gaps",
    targets: ["DataTable"],
    dimensions: ["states", "async", "keyboard", "accessibleName", "density"],
    cases: [
      "error / prerequisite / background refresh",
      "server and manual modes (manualPagination / manualSorting / manualFiltering)",
      "zero-page and single-page pagination",
      "accessible table and action-column labels",
      "invalid row ids (getRowId)",
      "keyboard behaviour",
      "virtualization",
    ],
  },
  {
    id: "charts-contract-gaps",
    targets: ["LineChart", "BarChart", "AreaChart", "PieChart"],
    dimensions: ["async", "reducedMotion", "keyboard", "contentStress", "responsive", "rtl"],
    cases: [
      "loading / error",
      "reduced motion",
      "keyboard datum navigation",
      "invalid / null / NaN data",
      "mobile axis collision",
      "RTL",
    ],
  },
  {
    id: "locale-stress-gaps",
    targets: ["Timeline", "TreeList", "PasswordStrength"],
    dimensions: ["contentStress", "accessibleName"],
    cases: [
      "long localized Japanese / Vietnamese content",
      "hard-coded screen-reader strings that never reach `t()`",
    ],
  },
];

export const KNOWN_GAP_IDS = KNOWN_GAPS.map((gap) => gap.id);

/** Runtime-error gates that issue #163 item 4 relies on. Locked — they may not be unwired. */
export const RUNTIME_GATE_SCRIPTS = [
  "scripts/check-data-entry-frame-runtime.mjs",
  "scripts/check-layout-nav-frames.mjs",
  "scripts/check-provider-feedback-query-runtime.mjs",
  "scripts/check-display-runtime-evidence.mjs",
];

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * The real public surface. Discovery is delegated to scripts/check-frame-coverage.mjs so the
 * #163 ledger, the #171 screen-reader gate and the legacy per-export ledger all enumerate
 * exports and resolve frames the exact same way.
 */
export function loadDiscovery() {
  const stdout = execFileSync(
    process.execPath,
    [path.join(REPO_ROOT, "scripts/check-frame-coverage.mjs"), "--allow-missing-frames"],
    { encoding: "utf8", cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
}

export function loadApiManifest() {
  return readJson(path.join(REPO_ROOT, "component-api-manifest.json"));
}

export function loadCaseEvidence() {
  return readJson(path.join(REPO_ROOT, "component-case-evidence.json"));
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

/** Is `dimension` applicable to `exportName`, judged against the generated API manifest? */
export function isApplicable(dimension, contract) {
  const props = new Set((contract?.props ?? []).map((prop) => prop.name));
  switch (dimension.applicability.kind) {
    case "prop":
      return props.has(dimension.applicability.prop);
    case "anyProp":
      return dimension.applicability.props.some((prop) => props.has(prop));
    default:
      return true;
  }
}

/**
 * Prop-evidence promotion. Returns the evidence paths when component-case-evidence.json
 * enumerates EVERY literal branch of the dimension's prop with at least one resolvable
 * rendered/test evidence reference; otherwise null.
 *
 * This is deliberately narrow: it only applies to the five strictly prop-shaped dimensions,
 * where "every branch has a rendered case" IS the contract. It never promotes a behavioural
 * dimension (ownership, states, async, responsive, rtl, keyboard, accessibleName, motion).
 */
export function propEvidenceFor(dimension, exportName, contract, caseEvidence) {
  if (dimension.promotion !== "prop-evidence") return null;
  const propName = dimension.applicability.prop;
  const prop = (contract?.props ?? []).find((entry) => entry.name === propName);
  if (!prop) return null;
  const evidence = caseEvidence.components?.[exportName]?.props?.[propName];
  if (!evidence?.evidence?.length || !evidence?.cases?.length) return null;
  const missingBranch = prop.values.some(
    (value) => !evidence.cases.some((candidate) => Object.is(candidate, value)),
  );
  if (missingBranch) return null;
  const unresolved = evidence.evidence.filter(
    (reference) =>
      typeof reference !== "string" ||
      path.isAbsolute(reference) ||
      reference.startsWith("..") ||
      !fs.existsSync(path.join(REPO_ROOT, reference)),
  );
  if (unresolved.length) return null;
  return {
    prop: propName,
    branches: evidence.cases,
    evidence: evidence.evidence,
  };
}

/** Reviewed human N/A lookup key. */
export function naKey(target, dimensionId) {
  return `${target}::${dimensionId}`;
}

/**
 * Build the authoritative per-export dimension verdicts. `ledger` supplies only the
 * hand-authored inputs (declared cases + reviewed not-applicable reviews); every other
 * value is DERIVED, so a hand edit cannot manufacture a `covered`.
 */
export function deriveComponents({ discovery, manifest, caseEvidence, ledger }) {
  const reviewedNa = new Map();
  for (const review of ledger?.policy?.notApplicable ?? []) {
    reviewedNa.set(naKey(review.target, review.dimension), review);
  }
  const declaredCases = new Map();
  for (const record of ledger?.cases ?? []) {
    for (const dimensionId of record.dimensions ?? []) {
      const key = naKey(record.export, dimensionId);
      if (!declaredCases.has(key)) declaredCases.set(key, []);
      declaredCases.get(key).push(record);
    }
  }

  const rows = [];
  for (const entry of discovery.entries) {
    const contract = manifest.components?.[entry.export] ?? null;
    const dimensions = {};
    for (const dimension of DIMENSIONS) {
      const applicable = isApplicable(dimension, contract);
      if (!applicable && dimension.notApplicableReason) {
        dimensions[dimension.id] = {
          status: "not-applicable",
          via: "api-manifest",
          reason: dimension.notApplicableReason,
        };
        continue;
      }
      const review = reviewedNa.get(naKey(entry.export, dimension.id));
      if (review) {
        dimensions[dimension.id] = {
          status: "not-applicable",
          via: "reviewed",
          reason: review.reason,
        };
        continue;
      }
      const promoted = propEvidenceFor(dimension, entry.export, contract, caseEvidence);
      if (promoted) {
        dimensions[dimension.id] = {
          status: "covered",
          via: "prop-evidence",
          prop: promoted.prop,
          branches: promoted.branches,
          evidence: promoted.evidence,
        };
        continue;
      }
      const cases = declaredCases.get(naKey(entry.export, dimension.id)) ?? [];
      const valid = cases.filter((record) => validateCase(record).length === 0);
      if (valid.length) {
        dimensions[dimension.id] = {
          status: "covered",
          via: "declared-case",
          cases: valid.map((record) => record.id),
        };
        continue;
      }
      dimensions[dimension.id] = { status: "untested", reason: dimension.untestedReason };
    }

    const axes = {};
    for (const axis of AXES) {
      const mapped = DIMENSIONS.filter((dimension) => dimension.axis === axis).map(
        (dimension) => dimensions[dimension.id],
      );
      if (mapped.every((value) => value.status === "not-applicable")) {
        axes[axis] = `N/A: ${mapped[0].reason}`;
      } else if (mapped.every((value) => value.status !== "untested")) axes[axis] = "covered";
      else axes[axis] = "untested";
    }

    rows.push({
      export: entry.export,
      group: contract?.group ?? entry.owner.split("/")[0],
      owner: entry.owner,
      frameId: entry.frameId,
      frames: entry.frameFile ? [entry.frameFile] : [],
      hasFrame: Boolean(entry.hasFrame ?? entry.frameFile),
      embeddable: EMBEDDABLE_EXPORTS.includes(entry.export),
      dimensions,
      axes,
    });
  }
  return rows.sort((a, b) => a.export.localeCompare(b.export));
}

/**
 * A declared case may promote a dimension ONLY when every field resolves. Returns the list
 * of problems (empty = valid). Used by both the generator (to refuse promotion) and the gate
 * (to fail the build) so a malformed case can never silently become a `covered`.
 */
export function validateCase(record) {
  const problems = [];
  const label = record?.id ?? "<missing id>";
  for (const field of ["id", "export", "frame", "case", "verifiedBy", "verifiedIn", "verifiedAt"]) {
    if (typeof record?.[field] !== "string" || !record[field].trim()) {
      problems.push(`case ${label}: missing ${field}`);
    }
  }
  if (!Array.isArray(record?.dimensions) || !record.dimensions.length) {
    problems.push(`case ${label}: dimensions must be a non-empty array`);
  }
  for (const dimensionId of record?.dimensions ?? []) {
    if (!DIMENSION_BY_ID.has(dimensionId)) {
      problems.push(`case ${label}: unknown dimension ${dimensionId}`);
    } else if (DIMENSION_BY_ID.get(dimensionId).promotion !== "declared-case") {
      problems.push(
        `case ${label}: dimension ${dimensionId} is promoted from component-case-evidence.json, not from a declared case`,
      );
    }
  }
  if (record?.frame && !fs.existsSync(path.join(REPO_ROOT, record.frame))) {
    problems.push(`case ${label}: frame ${record.frame} does not resolve to a repository file`);
  }
  if (!Array.isArray(record?.evidence) || !record.evidence.length) {
    problems.push(`case ${label}: at least one executed evidence reference is required`);
  }
  for (const reference of record?.evidence ?? []) {
    if (
      typeof reference !== "string" ||
      path.isAbsolute(reference) ||
      reference.startsWith("..") ||
      !fs.existsSync(path.join(REPO_ROOT, reference))
    ) {
      problems.push(`case ${label}: evidence path does not resolve: ${reference}`);
    }
  }
  if (!/^https:\/\//.test(record?.verifiedIn ?? "")) {
    problems.push(`case ${label}: verifiedIn must be an HTTPS review link`);
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(record?.verifiedAt ?? "")) {
    problems.push(`case ${label}: verifiedAt must be an ISO-8601 UTC timestamp`);
  }
  if (record?.dimensions?.includes("responsive")) {
    const widths = record.viewports ?? [];
    const missing = REQUIRED_VIEWPORTS.filter((width) => !widths.includes(width));
    if (missing.length) {
      problems.push(
        `case ${label}: a responsive case must record every required width; missing ${missing.join(", ")}`,
      );
    }
    if (EMBEDDABLE_EXPORTS.includes(record.export)) {
      const containers = record.containerWidths ?? [];
      const missingContainers = REQUIRED_CONTAINER_WIDTHS.filter(
        (width) => !containers.includes(width),
      );
      if (missingContainers.length) {
        problems.push(
          `case ${label}: ${record.export} is embeddable, so a responsive case must also record container widths ${missingContainers.join(", ")}`,
        );
      }
    }
  }
  return problems;
}

/** Roll the per-export verdicts into the counters the ratchet compares. */
export function totalsFor(rows) {
  const perDimension = Object.fromEntries(
    DIMENSION_IDS.map((id) => [id, { covered: 0, untested: 0, "not-applicable": 0 }]),
  );
  let covered = 0;
  let untested = 0;
  let notApplicable = 0;
  for (const row of rows) {
    for (const id of DIMENSION_IDS) {
      const status = row.dimensions[id].status;
      perDimension[id][status]++;
      if (status === "covered") covered++;
      else if (status === "untested") untested++;
      else notApplicable++;
    }
  }
  return {
    exports: rows.length,
    exportsWithFrame: rows.filter((row) => row.hasFrame).length,
    exportsWithoutFrame: rows.filter((row) => !row.hasFrame).length,
    frames: new Set(rows.filter((row) => row.hasFrame).map((row) => row.frameId)).size,
    dimensionCells: rows.length * DIMENSION_IDS.length,
    covered,
    untested,
    notApplicable,
    fullyClassified: rows.filter((row) =>
      DIMENSION_IDS.every((id) => row.dimensions[id].status !== "untested"),
    ).length,
    perDimension,
  };
}

/**
 * Roll the 14 compact dimension cells of one ledger component up to the nine legacy
 * FRAME-COVERAGE-STANDARD axes, for scripts/frame-coverage.mjs and docs/FRAME-COVERAGE-REPORT.md.
 * An axis is `covered` only when EVERY dimension on it is covered — one untested dimension
 * keeps the whole axis UNTESTED, which is the conservative direction issue #163 demands.
 */
export function axesFromCells(cells = {}) {
  const axes = {};
  for (const axis of AXES) {
    const mapped = DIMENSIONS.filter((dimension) => dimension.axis === axis).map(
      (dimension) => cells[dimension.id] ?? "untested",
    );
    if (mapped.every((value) => value.startsWith("not-applicable"))) {
      axes[axis] = "N/A: no dimension on this axis exists in this export's public API";
    } else if (mapped.every((value) => !value.startsWith("untested"))) {
      // Every dimension is either proven or reasoned away, and at least one is proven.
      axes[axis] = "covered";
    } else axes[axis] = "UNTESTED";
  }
  return axes;
}

/** Executed geometry sweep evidence, read from the shrink-only frame-geometry baseline. */
export function geometrySweep() {
  if (!fs.existsSync(GEOMETRY_BASELINE_PATH)) {
    return { available: false, failingFrames: 0, failingCells: 0 };
  }
  const baseline = readJson(GEOMETRY_BASELINE_PATH);
  const frames = baseline.frames ?? {};
  let failingCells = 0;
  const byWidth = {};
  for (const widths of Object.values(frames)) {
    for (const width of widths) {
      failingCells++;
      byWidth[width] = (byWidth[width] ?? 0) + 1;
    }
  }
  return {
    available: true,
    recordedAt: baseline.generatedAt ?? null,
    widths: baseline.widths ?? [],
    failingFrames: Object.keys(frames).length,
    failingCells,
    byWidth,
  };
}

/** Executed axe sweep evidence, read from the shrink-only frame-axe baseline. */
export function axeSweep() {
  if (!fs.existsSync(AXE_BASELINE_PATH)) return { available: false, failingFrames: 0 };
  const baseline = readJson(AXE_BASELINE_PATH);
  const component = baseline.component ?? {};
  return {
    available: true,
    recordedAt: baseline.generatedAt ?? null,
    failingFrames: Object.keys(component).length,
    failingRules: [...new Set(Object.values(component).flat())].sort(),
  };
}
