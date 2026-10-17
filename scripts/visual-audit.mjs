#!/usr/bin/env node
/**
 * godxjp-ui VISUAL audit — the runtime counterpart to the static ui-audit.mjs. Static audit
 * (ui-audit.mjs) reads SOURCE with regexes — zero deps, fast, runs on every save.
 */
import { existsSync, mkdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  VISUAL_RULES,
  isOversaturated,
  oklchChroma,
  isUndersizedTarget,
  hasEmoji,
  alertControlIssues,
  missingCssLayers,
  controlHeightMismatches,
  mixedButtonHeights,
  tightCardPairs,
  starvedRowTexts,
} from "./visual-audit-rules.mjs";

/**
 * Peer versions this audit is tested against. Surfaced in the JSON `tool` field, the README, and
 * the MCP `list_visual_checks` command so agents pin a compatible range.
 */
export const TESTED_VERSIONS = {
  playwright: { range: ">=1.55 <2", tested: "1.61.1" },
};

/** Shape one product finding from a rule id (pure — unit-tested without a browser). */
export function buildFinding(ruleId, url, message) {
  const rule = allRules().find((r) => r.id === ruleId);
  return {
    url,
    rule: ruleId,
    severity: rule?.severity ?? "warn",
    standard: rule?.standard,
    message,
  };
}

/** Every rule `--rules` prints: the legacy checks plus the C01–C12 probes and checklist rules. */
export function allRules() {
  return [...VISUAL_RULES, ...PROBE_RULES];
}

/** The only completion line a passing run may print (ADR process step 5) — never "done". */
export const ACCEPTANCE_PENDING = "probes passed; independent acceptance pending";

/**
 * Assemble the machine-readable result (pure). `findings` are PRODUCT results; `errors` are
 * INFRASTRUCTURE failures (a page that would not load, axe that would not inject). `matrix` holds
 * one cell per route × viewport (per-rule status + the reviewer checklist), `unmapped` what the
 * probes found but could not map — reviewer required, never a pass.
 */
export function buildResult({
  findings = [],
  errors = [],
  pages = 0,
  viewports = [],
  matrix = [],
  unmapped = [],
  evidence,
} = {}) {
  const productErrors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  const failedToLoad = errors.filter((e) => e.stage === "navigate").length;
  // With several viewports one route can fail to load more than once, so count audited ROUTES
  // from the matrix when there is one.
  const audited = matrix.length ? new Set(matrix.map((c) => c.url)).size : pages - failedToLoad;
  const status = errors.length === 0 ? "ok" : audited > 0 ? "partial" : "error";
  // Zero machine failures earns the pending line, nothing more: the semantic checklist, the
  // unmapped items and the independent review are still open.
  const acceptance =
    status === "ok" && findings.length === 0
      ? ACCEPTANCE_PENDING
      : status === "ok"
        ? "probes failed; fix the findings and rerun"
        : "audit incomplete; infrastructure errors";
  return {
    status,
    tool: TESTED_VERSIONS,
    summary: {
      errors: productErrors.length,
      warnings: warnings.length,
      pages,
      infrastructureErrors: errors.length,
      viewports: viewports.map(viewportLabel),
      unmapped: unmapped.length,
      checklistPending: matrix.reduce((n, c) => n + c.checklist.length, 0),
    },
    acceptance,
    findings,
    unmapped,
    matrix,
    // Present only when an evidence mode ran (gh#1316): one entry per route × width × mode.
    ...(evidence ? { evidence } : null),
    errors,
  };
}

/** Assemble a BOOTSTRAP failure result (pure) — missing peers, no browser, bad args. */
export function buildBootstrapError(message, hint) {
  return {
    status: "error",
    tool: TESTED_VERSIONS,
    summary: null,
    findings: [],
    errors: [{ stage: "bootstrap", message, ...(hint ? { hint } : {}) }],
  };
}

/** Exit code for a result: 2 = could not audit, 1 = findings/partial gate, 0 = clean. */
export function exitCodeFor(result, { strict = false } = {}) {
  if (result.status === "error") return 2;
  if (result.status === "partial") return 1;
  if (strict && result.findings.length > 0) return 1;
  if (result.summary && result.summary.errors > 0) return 1;
  return 0;
}

/** Collect raw measurements from the rendered page; the PURE rules run back in node. */
/* c8 ignore start — runs inside the browser, exercised in the consumer/CI env. */
export function collectInPage() {
  const rgb = (s) => {
    const m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim());
    return { r: +r, g: +g, b: +b, a: +a };
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  // `visible` above is ELEMENT-LOCAL — it reads the node's own box and its own visibility/display,
  // and an ancestor can still clip the node out of the rendered page entirely. The visually-hidden
  // idiom (Tailwind `sr-only`, react-aria `<VisuallyHidden>`) is exactly that: a 1x1 container with
  // `overflow: hidden` + `clip: rect(0 0 0 0)` wrapping a FULL-SIZE child. The child's own
  // getBoundingClientRect stays full size, so an element-local test calls it visible.
  //
  // gh#818: every `<Select>` carries react-aria's native `<select>` in one of those containers —
  // the form-submit + browser-autofill fallback, `aria-hidden`, `tabindex="-1"`, painted nowhere.
  // Its box is the width of its concatenated option labels (85x22 for a locale picker), so
  // `target-size-min` reported one per Select on every consumer page, and the consumer read it as
  // a second, undersized language control sitting beside the styled trigger. Measured in Chromium:
  // `document.elementFromPoint` at that `<select>`'s own centre never returns the select, and at
  // the trigger's centre +/-11px it returns the trigger — there is one target, not two.
  //
  // SC 2.5.8 bounds TARGETS: "the region of the display that will accept a pointer action". A node
  // clipped to a 1px sliver accepts none at any size, so it is not a target and must not be
  // measured as one — enlarging it would be the wrong fix twice over.
  const clippedAway = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflow === "visible" && cs.clip === "auto" && cs.clipPath === "none") continue;
      const r = a.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return true;
    }
    return false;
  };

  // Accent surfaces — buttons / primary CTAs / banners whose background carries colour.
  const accents = [];
  for (const el of document.querySelectorAll(
    "button, [role=button], a[class*=primary], [data-slot=alert], [class*=banner], [class*=notification]",
  )) {
    if (!visible(el)) continue;
    const c = rgb(getComputedStyle(el).backgroundColor);
    if (c && c.a > 0.5)
      accents.push({ rgb: { r: c.r, g: c.g, b: c.b }, tag: el.tagName.toLowerCase() });
  }

  // Interactive targets — for the 24x24 minimum of WCAG 2.2 SC 2.5.8, INCLUDING the two exceptions
  // the criterion itself grants. Reporting the bare 24x24 rule flagged a 16px checkbox standing
  // alone in white space and every legal link inside a consent sentence — none of which the
  // criterion requires anyone to change. A checker that over-reports is not stricter, it is wrong,
  // and it costs the same as under-reporting: readers learn to skip the finding.
  const rawTargets = [];
  for (const el of document.querySelectorAll(
    "a[href], button, [role=button], input:not([type=hidden]), select, [tabindex]:not([tabindex='-1'])",
  )) {
    // Dropped BEFORE the list is built, not filtered after: a node nobody can point at must not
    // count as a neighbour either, or it spends the Spacing exception of the real target it sits on.
    if (!visible(el) || clippedAway(el)) continue;
    const r = el.getBoundingClientRect();
    const name = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
    rawTargets.push({
      width: Math.round(r.width),
      height: Math.round(r.height),
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      // INLINE exception: "the target is in a sentence or its size is otherwise constrained by the
      // line-height of non-target text". A box participating in a text line is exactly that; an
      // inline-block/flex control is not, so the test is the computed display, not the tag.
      inline: getComputedStyle(el).display === "inline",
      name,
    });
  }
  const targets = rawTargets.map((t) => {
    if (t.inline) return { ...t, exempt: "inline" };
    // SPACING exception: undersized is allowed when a 24px-DIAMETER circle centred on the target
    // does not intersect the circle of any other target. Two circles of radius 12 intersect when
    // their centres are closer than 24px, so that is the whole test.
    const crowded = rawTargets.some((o) => o !== t && Math.hypot(o.cx - t.cx, o.cy - t.cy) < 24);
    return { ...t, exempt: crowded ? null : "spacing" };
  });

  // Emoji that survived to the rendered DOM.
  const text = document.body ? document.body.innerText : "";

  // Notification banners — measure their anatomy.
  const alerts = [];
  for (const el of document.querySelectorAll(
    "[role=alert], [role=status], [data-slot=alert], [class*=banner], [class*=notification]",
  )) {
    if (!visible(el)) continue;
    // A screen-reader live region (`span.sr-only[role=status]`, 1x1 and clipped) is not a banner:
    // nothing is painted, so there is no anatomy to get wrong (gh#1307 — BlockEditor's own status
    // region was reported as "controls stacked vertically"). Its own box OR an ancestor's clip.
    const own = el.getBoundingClientRect();
    if (own.width <= 1 || own.height <= 1 || clippedAway(el)) continue;
    // The kit's EmptyState is a polite status region, not a banner: it has no Alert anatomy to get
    // wrong, so the banner checks do not apply to it (gh#1198).
    if (el.closest("[data-slot=empty-state]")) continue;
    const box = el.getBoundingClientRect();
    const icons = el.querySelectorAll("svg, img").length;
    const btns = [...el.querySelectorAll("button, [role=button], a[href]")];
    const actionWidthRatio = btns.length
      ? Math.max(...btns.map((b) => b.getBoundingClientRect().width)) / (box.width || 1)
      : 0;
    const cs = getComputedStyle(el);
    const direction =
      cs.display.includes("flex") && cs.flexDirection.startsWith("column")
        ? "column"
        : cs.display.includes("flex")
          ? "row"
          : "column";
    const dismiss = btns.find((b) =>
      /close|dismiss|閉じる|×|✕/i.test(b.getAttribute("aria-label") || b.textContent || ""),
    );
    let dismissCorner = null;
    if (dismiss) {
      const d = dismiss.getBoundingClientRect();
      const nearTop = d.top - box.top < box.height * 0.4;
      const nearRight = box.right - d.right < box.width * 0.25;
      dismissCorner = nearTop && nearRight ? "top-right" : "other";
    }
    alerts.push({
      iconCount: icons,
      actionWidthRatio,
      direction,
      hasDismiss: !!dismiss,
      dismissCorner,
    });
  }

  // Layer completeness — one probe per layer, each checks a rule only that layer sets.
  const probe = (layer, className, prop, bad) => {
    const el = document.createElement("div");
    el.className = className;
    // No inline `position` here. It used to be set to "absolute" to keep the node out of flow, and
    // that silently POISONED the one probe that read `position`: the dialog check asked whether
    // position !== "static" on an element the probe itself had just made absolute, so it passed
    // whether or not the layer was loaded. An empty hidden div contributes no visible layout, so
    // the flow guard was never worth a probe that cannot fail.
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    const v = getComputedStyle(el)[prop];
    el.remove();
    return { layer, ok: v !== bad && v !== "" };
  };
  const layers = [
    // gh#1307 — this read `borderRadius` on a bare `.ui-button`, and no rule in control.css gives
    // `.ui-button` a radius (the corner comes from the variant classes), so the probe read 0px
    // with the layer loaded and reported it missing on every consumer page. `display: inline-flex`
    // is what the bare `.ui-button` rule itself declares; a div without the layer stays `block`.
    probe("control", "ui-button", "display", "block"),
    probe("navigation-layout", "ui-dropdown-menu-content", "borderTopWidth", "0px"),
    // `.ui-card` is NOT a class the library sets rules on — Card renders `cn("group/card", …)`
    // and card-layout.css owns `.ui-card-bar` / `.ui-card-cover` / `.ui-card-inset*` /
    // `.ui-card-header--banded`. Probing it could never pass, so every consumer page reported a
    // permanent, meaningless `card-layout is not loaded` error. `.ui-card-inset-x` is a real rule
    // AND resolves --card-space-inset, so it proves the layer and its token chain together.
    probe("card-layout", "ui-card-inset-x", "paddingInline", "0px"),
    probe("layout", "ui-page-container", "display", "block"),
    // `.ui-dialog-content` is not a class either — dialog-layout styles the `[data-slot=
    // "dialog-content"]` attribute — so this probe named a class nothing declares AND read the
    // property the probe used to set on itself. `.ui-dialog-overlay` is a real selector and
    // z-index defaults to "auto", which nothing here writes.
    probe("dialog-layout", "ui-dialog-overlay", "zIndex", "auto"),
    probe("form-layout", "ui-form-field", "display", "inline"),
  ];
  // Control rows — every control in a row shares the control tier height.
  const rows = [];
  for (const row of document.querySelectorAll(
    ".ui-flex[data-direction=row], .ui-page-header-extra, .ui-page-footer .ui-flex, [data-slot=card-bar]",
  )) {
    if (!visible(row)) continue;
    const controls = [...row.children].filter(
      (c) =>
        visible(c) &&
        (c.matches(
          "button, [role=combobox], [role=button], input, [data-slot=avatar], .ui-control, .ui-button",
        ) ||
          c.querySelector(":scope > button, :scope > [role=combobox]")),
    );
    if (controls.length < 2) continue;
    rows.push({
      name: (row.className || row.tagName).toString().slice(0, 40),
      heights: controls.map((c) => Math.round(c.getBoundingClientRect().height)),
    });
  }
  // Button rows — every flex row (any container, not only .ui-flex: CardFooter, a dialog footer,
  // PageHeader actions) whose Buttons render at more than one height. A child counts when it IS a
  // Button or directly wraps one (a Tooltip trigger span). `h-auto` opts a Button out of the
  // control tier on purpose (a two-line list item), so it is not a row member.
  const buttonRows = [];
  const isRowButton = (el) => el.matches("[data-slot=button]") && !el.classList.contains("h-auto");
  for (const row of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(row);
    if (!cs.display.includes("flex") || !cs.flexDirection.startsWith("row") || !visible(row))
      continue;
    const buttons = [...row.children]
      .filter(visible)
      .map((c) => (isRowButton(c) ? c : c.querySelector(":scope > [data-slot=button]")))
      .filter((b) => b && isRowButton(b) && visible(b));
    if (buttons.length < 2) continue;
    buttonRows.push({
      name: (row.className || row.tagName).toString().slice(0, 40),
      heights: buttons.map((b) => b.getBoundingClientRect().height),
      sizes: buttons.map((b) => b.getAttribute("data-size") || "?"),
    });
  }
  // Sibling cards — the gap between consecutive cards in one parent.
  const cardPairs = [];
  const seen = new Set();
  for (const card of document.querySelectorAll(".ui-card, [data-slot=card]")) {
    const parent = card.parentElement;
    if (!parent || seen.has(parent)) continue;
    seen.add(parent);
    const cards = [...parent.children].filter(
      (c) => c.matches(".ui-card, [data-slot=card]") && visible(c),
    );
    for (let i = 1; i < cards.length; i++) {
      const a = cards[i - 1].getBoundingClientRect();
      const b = cards[i].getBoundingClientRect();
      const gap =
        b.top >= a.bottom - 1 ? Math.round(b.top - a.bottom) : Math.round(b.left - a.right);
      cardPairs.push({ gap });
    }
  }
  // Starved text — a text node in a control row squeezed far below what it needs.
  const rowTexts = [];
  for (const row of document.querySelectorAll(
    ".ui-flex[data-direction=row], .ui-page-footer .ui-flex",
  )) {
    for (const t of row.querySelectorAll("[data-slot=text], span, label")) {
      if (!visible(t) || t.children.length) continue;
      const cs = getComputedStyle(t);
      if (cs.overflow !== "hidden" && cs.textOverflow !== "ellipsis") continue;
      // Screen-reader-only text is clipped to 1px ON PURPOSE (a Button countLabel, a VisuallyHidden
      // field label); it is not starved content (gh#1200). Skip it by class and by geometry, so any
      // sr-only variant (absolute, at most 1×1) is covered.
      const box = t.getBoundingClientRect();
      if (
        t.closest(".sr-only, [data-slot=visually-hidden]") ||
        (cs.position === "absolute" && box.width <= 1 && box.height <= 1)
      )
        continue;
      rowTexts.push({
        text: (t.textContent || "").trim().slice(0, 30),
        visible: Math.round(t.clientWidth),
        needed: Math.round(t.scrollWidth),
      });
    }
  }
  return { accents, targets, text, alerts, layers, rows, buttonRows, cardPairs, rowTexts };
}
/* c8 ignore stop */

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Responsive probes C01–C12 (ADR "Adopt calibrated probes with independent semantic acceptance",
// 2026-10-14). The audit used to open ONE 1280×900 viewport, so every phone-width defect — a
// squeezed top-bar search, the user's name filling the bar, a 56px editor gutter, four header
// buttons in one row — passed unseen. These probes run per width.
//
// Every numeric threshold below is REPO-CHOSEN unless the rule cites WCAG; each finding carries
// its threshold and origin. Probes are ADVISORY (severity warn) until the ADR's pilot promotes
// them, and they measure only what a MAPPING names: the library's own hooks (data-slot / ui-*
// classes) or a consumer's `data-audit-*` override. Anything that looks relevant but is not
// mapped is reported as "unmapped — reviewer required", never as a pass.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** Default width matrix (ADR "Widths"). Heights are repo-chosen samples. */
export const DEFAULT_VIEWPORTS = [
  { width: 320, height: 900 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 844, height: 390 },
];

/** Repo-chosen breakpoints that decide which probes apply at a width. */
export const COMPACT_BELOW = 600;
export const DESKTOP_FROM = 1024;

/** Thresholds, each tagged with where the number comes from. */
export const PROBE_THRESHOLDS = {
  clipTolerancePx: { value: 1.5, unit: "px", origin: "repo-chosen" },
  searchMinCh: { value: 8, unit: "ch", origin: "repo-chosen" },
  editorMaxInsetPx: { value: 24, unit: "px", origin: "repo-chosen" },
  compactDirectActions: { value: 2, unit: "direct actions (+1 overflow)", origin: "repo-chosen" },
  targetMinPx: { value: 24, unit: "px", origin: "WCAG 2.2 SC 2.5.8" },
  railToggleMaxPx: { value: 8, unit: "px", origin: "repo-chosen" },
  keylineMaxPx: { value: 2, unit: "px", origin: "repo-chosen" },
  labelMaxFontPx: { value: 12, unit: "px", origin: "repo-chosen" },
  labelMinTrackingEm: { value: 0.04, unit: "em", origin: "repo-chosen" },
  compactBelowPx: { value: COMPACT_BELOW, unit: "px", origin: "repo-chosen" },
};

const RC = "repo-chosen threshold";

/** Probe + checklist catalog (mirrored in mcp/src/data/visual-rules.ts — check:audit-sync). */
export const PROBE_RULES = [
  {
    id: "c01-content-reachable",
    severity: "warn",
    category: "layout",
    standard: `WCAG 2.2 SC 1.4.10 / 1.4.4 / 1.4.12; 1.5px tolerance ${RC}`,
    kind: "probe",
    fix: "Nothing may be cut off: no horizontal scroll on the document or the app's main region, and no text/icon partly hidden by an overflow:hidden/clip ancestor. Let the container shrink its content (min-width:0 + wrap), or truncate with a recoverable full value (title / aria-label).",
  },
  {
    id: "c02-search-usable",
    severity: "warn",
    category: "layout",
    standard: `search text area ≥ 8ch after padding/icon, hint fits within 1.5px (${RC}); WCAG 1.4.10 principle`,
    kind: "probe",
    fix: "A search field narrower than 8ch is not a search field. Below the width where it fits, show a named search trigger (data-audit-role=search-trigger) that opens a full-width field; keep the scope hint visible somewhere when the placeholder no longer fits.",
  },
  {
    id: "c03-single-brand",
    severity: "warn",
    category: "layout",
    standard: "repo-chosen policy — human checklist only",
    kind: "checklist",
    fix: "Reviewer counts brand presentations in the closed and open shell: one logo+wordmark, distinct from the service name and breadcrumb.",
  },
  {
    id: "c04-compact-account-name",
    severity: "warn",
    category: "a11y",
    standard: `compact (<600px) bar shows avatar-only or measured bounded shared-device identity (${RC}); trigger name per WCAG 2.2 SC 4.1.2`,
    kind: "probe",
    fix: "Shared-device exception: Topbar identity with TopbarItem truncate keeps a bounded, ellipsised name and full title/accessible name. Otherwise below 600px the bar shows the avatar only: hide the account name (it belongs in the opened account menu) and make the avatar the trigger — accessible name + aria-haspopup, opening identity and account controls.",
  },
  {
    id: "c05-compact-editor-inset",
    severity: "warn",
    category: "layout",
    standard: `first unindented line ≤ 24px from the editor inner edge below 600px (${RC}); WCAG 1.4.10 principle`,
    kind: "probe",
    fix: "Reclaim the desktop drag-handle gutter on phones: the editor's base inset (padding included) is at most 24px below 600px; keep list indentation, and give tap/keyboard alternatives to the hover handle.",
  },
  {
    id: "c06-compact-actions",
    severity: "warn",
    category: "layout",
    standard: `≤2 direct actions + ≤1 overflow per task-action group below 600px (${RC}); targets ≥24×24 per WCAG 2.2 SC 2.5.8`,
    kind: "probe",
    fix: "On phones a task-action group shows at most two direct actions plus one overflow menu that really holds the rest; every target at least 24×24 CSS px (or a documented SC 2.5.8 exception).",
  },
  {
    id: "c07-width-control",
    severity: "warn",
    category: "layout",
    standard: "repo-chosen policy — human checklist (no library hook maps a width control)",
    kind: "checklist",
    fix: "A wide-page control must move content to an approved destination width (±1px), or be hidden on phones / labelled as a desktop-only preference that persists.",
  },
  {
    id: "c08-sidebar-field-edges",
    severity: "warn",
    category: "layout",
    standard: "repo-chosen policy — human checklist (equivalent groups are a semantic call)",
    kind: "checklist",
    fix: "Equivalent sidebar fields share left and right edges within 2px; the reviewer inventories the fields before reading any mapping.",
  },
  {
    id: "c09-progress-role",
    severity: "warn",
    category: "color",
    standard: "repo-chosen policy — human checklist (tone ↔ meaning is a semantic call)",
    kind: "checklist",
    fix: "Ordinary branded progress uses the brand role; a status tone (success/warning/destructive) only where the bar reports that status. Thickness matches the approved variant ±1px.",
  },
  {
    id: "c10-rail-toggle-attached",
    severity: "warn",
    category: "layout",
    standard: `toggle centre within 8px of the declared rail edge at ≥1024px (${RC})`,
    kind: "probe",
    fix: "An edge-mounted rail toggle sits on the rail edge it controls in both desktop states. Declare the pattern with data-audit-role=rail-toggle (+ data-audit-edge=start|end). A toggle inside `Sidebar action` is the supported placement and reports not-applicable-sidebar-action.",
  },
  {
    id: "c11-search-keyline",
    severity: "warn",
    category: "layout",
    standard: `desktop search start within 2px of the content column start (${RC})`,
    kind: "probe",
    fix: "A centred top-bar search starts on the content column's keyline, not the window's centre. Applies when the search sits in Topbar `center` (or carries data-audit-keyline).",
  },
  {
    id: "c12-tracked-uppercase-label",
    severity: "warn",
    category: "layout",
    standard: `section label uppercase AND ≤12px AND tracking ≥0.04em fails (${RC}); no WCAG font floor implied`,
    kind: "probe",
    fix: "Section labels read as sentence-case text at the body scale, not tiny tracked capitals. Literal domain codes are exempt when marked as such (<code>, <kbd>, data-audit-literal).",
  },
];

/** Checklist lines a reviewer resolves per width (C03 + the semantic qualifiers of C01–C12). */
export const REVIEW_CHECKLIST = [
  {
    rule: "c01-content-reachable",
    scope: "all",
    check:
      "Confirm each value exempted as recoverable is reachable by keyboard and touch, and that exempt scroll regions are legitimate 2-D content.",
  },
  {
    rule: "c02-search-usable",
    scope: "all",
    check:
      "Type a realistic localized query (Japanese / Vietnamese); the icon is whole and the search submits; the mapped field is the product's search.",
  },
  {
    rule: "c03-single-brand",
    scope: "all",
    check:
      "Count brand presentations in the closed and open shell: one logo+wordmark, distinct from the service name and breadcrumb.",
  },
  {
    rule: "c04-compact-account-name",
    scope: "compact",
    check:
      "Open the account menu from the avatar: identity (name, email) and account controls are inside it; the mapping names the real account slot.",
  },
  {
    rule: "c05-compact-editor-inset",
    scope: "compact",
    check:
      "Separate base inset from list indentation; block move/insert has a tap and keyboard alternative to the hover handle.",
  },
  {
    rule: "c06-compact-actions",
    scope: "compact",
    check:
      "Execute every action moved into the overflow menu; the mapped groups are the task-action groups (navigation and avatar excluded).",
  },
  {
    rule: "c07-width-control",
    scope: "all",
    check:
      "If a page-width control exists: each state reaches an approved destination width, or it is hidden on phones / a labelled desktop preference that persists across reload.",
  },
  {
    rule: "c08-sidebar-field-edges",
    scope: "all",
    check:
      "Inventory equivalent sidebar fields first, then confirm their left/right edges agree within 2px (explicit fixed-length exceptions only).",
  },
  {
    rule: "c09-progress-role",
    scope: "all",
    check:
      "Each progress bar's tone matches its meaning (brand for ordinary progress, a status tone only for status) and its thickness matches the approved variant.",
  },
  {
    rule: "c10-rail-toggle-attached",
    scope: "desktop",
    check:
      "Collapse and expand the rail: the toggle works and stays on the intended rail edge in both states; the mobile drawer uses its own control.",
  },
  {
    rule: "c11-search-keyline",
    scope: "desktop",
    check:
      "Identify the intended content column yourself and remeasure the search start against it; an end-aligned search is a deliberate layout, not a keyline miss.",
  },
  {
    rule: "c12-tracked-uppercase-label",
    scope: "all",
    check:
      "Classify flagged and unmapped small capitals: section labels fail, literal codes and metadata are exempt.",
  },
];

const PROBE_SCOPE = {
  "c01-content-reachable": "all",
  "c02-search-usable": "all",
  "c04-compact-account-name": "compact",
  "c05-compact-editor-inset": "compact",
  "c06-compact-actions": "compact",
  "c10-rail-toggle-attached": "desktop",
  "c11-search-keyline": "desktop",
  "c12-tracked-uppercase-label": "all",
};

/** Does a rule scope (all | compact | desktop) apply at this viewport width? */
export function scopeApplies(scope, width) {
  if (scope === "compact") return width < COMPACT_BELOW;
  if (scope === "desktop") return width >= DESKTOP_FROM;
  return true;
}

/** Parse `--widths 390x844,1280x900` (a bare width takes height 900). Throws on garbage. */
export function parseViewports(spec) {
  if (spec == null) return DEFAULT_VIEWPORTS;
  const out = [];
  for (const raw of String(spec).split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const m = part.match(/^(\d{2,5})(?:x(\d{2,5}))?$/i);
    if (!m) throw new Error(`--widths: "${part}" is not WIDTH or WIDTHxHEIGHT`);
    out.push({ width: Number(m[1]), height: m[2] ? Number(m[2]) : 900 });
  }
  if (out.length === 0) throw new Error("--widths: no viewport given");
  return out;
}

export const viewportLabel = (v) => `${v.width}x${v.height}`;

/** C12 predicate on one measured label (pure). */
export function isTrackedUppercaseLabel(l) {
  const T = PROBE_THRESHOLDS;
  return (
    !l.literal &&
    l.uppercase &&
    l.fontPx <= T.labelMaxFontPx.value &&
    l.trackingEm >= T.labelMinTrackingEm.value - 1e-6
  );
}

/**
 * Turn raw in-page measurements (collectProbes + interactions) into findings, unmapped items and
 * per-rule status for ONE route × viewport cell. PURE — unit-tested with synthetic measurements.
 *
 * Status per rule: fail | pass | partial (mapped elements pass, but unmapped candidates remain) |
 * unmapped (only candidates) | not-found (nothing to measure — the reviewer confirms N/A) |
 * not-applicable-at-width | not-applicable-end-aligned (C11) | not-applicable-sidebar-action (C10) |
 * checklist. Only "pass" is a machine pass, and only for what was mapped.
 */
export function evaluateProbes(raw, { url, viewport }) {
  const T = PROBE_THRESHOLDS;
  const vp = viewportLabel(viewport);
  const findings = [];
  const unmapped = [];
  const rules = {};
  const applies = (rule) => scopeApplies(PROBE_SCOPE[rule], viewport.width);
  const add = (rule, element, message, measured, threshold) =>
    findings.push({
      ...buildFinding(rule, url, message),
      viewport: vp,
      element,
      measured,
      threshold: threshold ?? null,
    });
  const noteUnmapped = (rule, list) => {
    if (!applies(rule)) return;
    for (const c of list || [])
      unmapped.push({ url, viewport: vp, rule, element: c.element, reason: c.reason });
  };
  const settle = (rule, mappedCount) => {
    if (!applies(rule)) return (rules[rule] = "not-applicable-at-width");
    const fails = findings.filter((f) => f.rule === rule).length;
    const open = unmapped.filter((u) => u.rule === rule).length;
    if (fails > 0) return (rules[rule] = "fail");
    if (mappedCount > 0) return (rules[rule] = open > 0 ? "partial" : "pass");
    return (rules[rule] = open > 0 ? "unmapped" : "not-found");
  };
  const tol = T.clipTolerancePx.value;

  // C01 — reachable content (the whole document is always mapped).
  for (const s of raw.c01?.scrollers || [])
    if (s.excess > tol)
      add(
        "c01-content-reachable",
        s.element,
        `${s.element} scrolls horizontally by ${s.excess.toFixed(1)}px (> ${tol}px, repo-chosen tolerance)`,
        { excessPx: s.excess },
        T.clipTolerancePx,
      );
  for (const c of raw.c01?.clips || []) {
    if (c.recoverable || c.px <= tol) continue;
    add(
      "c01-content-reachable",
      c.element,
      `${c.kind}${c.text ? ` "${c.text}"` : ""} in ${c.element} is cut ${c.px.toFixed(1)}px on the ${c.axis} axis by ${c.clipper} (> ${tol}px, repo-chosen tolerance)`,
      { clippedPx: +c.px.toFixed(2), axis: c.axis, clipper: c.clipper },
      T.clipTolerancePx,
    );
  }
  settle("c01-content-reachable", 1);

  // C02 — search can be identified, edited and submitted.
  const searches = raw.c02?.mapped || [];
  for (const s of searches) {
    const ch = s.chPx > 0 ? s.contentPx / s.chPx : 0;
    if (ch < T.searchMinCh.value)
      add(
        "c02-search-usable",
        s.element,
        `search text area is ${s.contentPx.toFixed(0)}px ≈ ${ch.toFixed(1)}ch after padding/icon (< ${T.searchMinCh.value}ch, repo-chosen)`,
        { contentPx: +s.contentPx.toFixed(1), ch: +ch.toFixed(2) },
        T.searchMinCh,
      );
    if (s.placeholder && s.placeholderPx > s.contentPx + tol && !s.hintElsewhere)
      add(
        "c02-search-usable",
        s.element,
        `search hint "${s.placeholder}" needs ${s.placeholderPx.toFixed(0)}px of ${s.contentPx.toFixed(0)}px and is not visible elsewhere (${tol}px tolerance, repo-chosen)`,
        { placeholderPx: +s.placeholderPx.toFixed(1), contentPx: +s.contentPx.toFixed(1) },
        T.clipTolerancePx,
      );
  }
  noteUnmapped("c02-search-usable", raw.c02?.candidates);
  settle("c02-search-usable", searches.length);

  // C04 — compact account access without the name in the bar.
  const accounts = applies("c04-compact-account-name") ? raw.c04?.mapped || [] : [];
  for (const a of accounts) {
    if (a.nameVisible && !a.compactIdentity)
      add(
        "c04-compact-account-name",
        a.element,
        `account name "${a.nameText}" is visible in the bar below ${COMPACT_BELOW}px (repo-chosen compact policy)`,
        { nameVisible: true },
        T.compactBelowPx,
      );
    if (!a.trigger) {
      add(
        "c04-compact-account-name",
        a.element,
        "the avatar is not inside an account trigger — nothing in the bar opens the account controls",
        { trigger: null },
      );
      continue;
    }
    if (!a.trigger.name)
      add(
        "c04-compact-account-name",
        a.trigger.element,
        "account trigger has no accessible name (WCAG 2.2 SC 4.1.2)",
        { accessibleName: "" },
      );
    if (!a.trigger.hasPopup)
      add(
        "c04-compact-account-name",
        a.trigger.element,
        "account trigger declares no popup (aria-haspopup / aria-expanded) — inert avatar",
        { hasPopup: false },
      );
    else if (a.trigger.opens === false)
      add(
        "c04-compact-account-name",
        a.trigger.element,
        "activating the account trigger opened no menu or dialog — inert avatar",
        { opens: false },
      );
  }
  noteUnmapped("c04-compact-account-name", raw.c04?.candidates);
  settle("c04-compact-account-name", accounts.length);

  // C05 — compact editor inset.
  const editors = applies("c05-compact-editor-inset") ? raw.c05?.mapped || [] : [];
  for (const e of editors)
    if (e.insetPx > T.editorMaxInsetPx.value + 0.5)
      add(
        "c05-compact-editor-inset",
        e.element,
        `first unindented line starts ${e.insetPx.toFixed(0)}px from the editor's inner edge (> ${T.editorMaxInsetPx.value}px below ${COMPACT_BELOW}px, repo-chosen)`,
        { insetPx: +e.insetPx.toFixed(1) },
        T.editorMaxInsetPx,
      );
  settle("c05-compact-editor-inset", editors.length);

  // C06 — compact task actions and their targets.
  const groups = applies("c06-compact-actions") ? raw.c06?.mapped || [] : [];
  for (const g of groups) {
    if (g.direct > T.compactDirectActions.value || g.overflow > 1)
      add(
        "c06-compact-actions",
        g.element,
        `task-action group shows ${g.direct} direct action(s) + ${g.overflow} overflow trigger(s) (> ${T.compactDirectActions.value} + 1 below ${COMPACT_BELOW}px, repo-chosen)`,
        { direct: g.direct, overflow: g.overflow },
        T.compactDirectActions,
      );
    if (g.singleRow && g.rows > 1)
      add(
        "c06-compact-actions",
        g.element,
        `declared single-row toolbar wraps onto ${g.rows} rows`,
        { rows: g.rows },
      );
    for (const t of g.smallTargets || [])
      add(
        "c06-compact-actions",
        t.element,
        `action "${t.name}" is ${t.width}×${t.height}px (< 24×24, WCAG 2.2 SC 2.5.8) with no Spacing/Inline exception`,
        { width: t.width, height: t.height },
        T.targetMinPx,
      );
    for (const o of g.overflowMenus || [])
      if (o.items === 0)
        add(
          "c06-compact-actions",
          o.element,
          "overflow trigger opened no menu items — the relocated actions are lost",
          { menuItems: 0 },
        );
  }
  noteUnmapped("c06-compact-actions", raw.c06?.candidates);
  settle("c06-compact-actions", groups.length);

  // C10 — edge-mounted rail toggle.
  const toggles = applies("c10-rail-toggle-attached") ? raw.c10?.mapped || [] : [];
  for (const t of toggles)
    if (t.distancePx > T.railToggleMaxPx.value)
      add(
        "c10-rail-toggle-attached",
        t.element,
        `rail toggle centre is ${t.distancePx.toFixed(1)}px from the rail's ${t.edge} edge (> ${T.railToggleMaxPx.value}px, repo-chosen)`,
        { distancePx: +t.distancePx.toFixed(1), edge: t.edge },
        T.railToggleMaxPx,
      );
  noteUnmapped("c10-rail-toggle-attached", raw.c10?.candidates);
  settle("c10-rail-toggle-attached", toggles.length);
  if (rules["c10-rail-toggle-attached"] === "not-found" && raw.c10?.sidebarAction?.length)
    rules["c10-rail-toggle-attached"] = "not-applicable-sidebar-action";

  // C11 — desktop search keyline.
  const keylines = applies("c11-search-keyline") ? raw.c11?.mapped || [] : [];
  for (const k of keylines)
    if (k.deltaPx > T.keylineMaxPx.value)
      add(
        "c11-search-keyline",
        k.element,
        `search starts ${k.deltaPx.toFixed(1)}px off the content column start (${k.column}) (> ${T.keylineMaxPx.value}px, repo-chosen)`,
        { deltaPx: +k.deltaPx.toFixed(1), column: k.column },
        T.keylineMaxPx,
      );
  noteUnmapped("c11-search-keyline", raw.c11?.candidates);
  settle("c11-search-keyline", keylines.length);
  if (rules["c11-search-keyline"] === "not-found" && raw.c11?.endAligned)
    rules["c11-search-keyline"] = "not-applicable-end-aligned";

  // C12 — tiny tracked uppercase section labels.
  const labels = raw.c12?.mapped || [];
  for (const l of labels)
    if (isTrackedUppercaseLabel(l))
      add(
        "c12-tracked-uppercase-label",
        l.element,
        `section label "${l.text}" is uppercase at ${l.fontPx}px with ${l.trackingEm.toFixed(3)}em tracking (≤ ${T.labelMaxFontPx.value}px and ≥ ${T.labelMinTrackingEm.value}em, repo-chosen)`,
        { fontPx: l.fontPx, trackingEm: +l.trackingEm.toFixed(3) },
        T.labelMaxFontPx,
      );
  noteUnmapped("c12-tracked-uppercase-label", raw.c12?.candidates);
  settle("c12-tracked-uppercase-label", labels.length);

  for (const r of PROBE_RULES) if (r.kind === "checklist") rules[r.id] = "checklist";

  const checklist = REVIEW_CHECKLIST.filter((c) => scopeApplies(c.scope, viewport.width)).map(
    (c) => ({ rule: c.rule, check: c.check, status: "pending" }),
  );
  return { findings, unmapped, cell: { url, viewport: vp, rules, checklist } };
}

/**
 * Collect raw probe geometry in the rendered page. Self-contained (serialised into Chromium) — no
 * imports, no closure over module scope.
 */
/* c8 ignore start — runs inside the browser; exercised by the visual-audit-probes spawn test. */
export function collectProbes(opts) {
  const { width, compactBelow: COMPACT, desktopFrom: DESKTOP } = opts;
  const csCache = new Map();
  const cs = (el) => {
    let v = csCache.get(el);
    if (!v) {
      v = getComputedStyle(el);
      csCache.set(el, v);
    }
    return v;
  };
  const rtl = (el) => cs(el).direction === "rtl";
  const visuallyHidden = (el) => {
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      if (a.classList.contains("sr-only") || a.getAttribute("data-slot") === "visually-hidden")
        return true;
      const s = cs(a);
      if (s.overflow === "visible" && s.clip === "auto" && s.clipPath === "none") continue;
      const r = a.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return true;
    }
    return false;
  };
  const shown = (el) => {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const s = cs(a);
      if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
    }
    return !visuallyHidden(el);
  };
  const self = (n) => {
    let s = n.tagName.toLowerCase();
    if (n.id) s += `#${n.id}`;
    const slot = n.getAttribute("data-slot");
    const role = n.getAttribute("data-audit-role");
    if (slot) s += `[data-slot=${slot}]`;
    if (role) s += `[data-audit-role=${role}]`;
    const cls = [...n.classList].find((c) => /^(ui-|app-|sb-)/.test(c)) || n.classList[0];
    if (cls && !slot && !role) s += `.${cls}`;
    return s;
  };
  const desc = (el) => {
    if (!el || el.nodeType !== 1) return "(none)";
    if (el.id) return self(el);
    const anc = el.parentElement && el.parentElement.closest("[id]");
    return anc ? `${self(anc)} ${self(el)}` : self(el);
  };
  const snippet = (s) => (s || "").replace(/\s+/g, " ").trim().slice(0, 40);
  const OVERLAY = "[role=menu], [role=dialog], [role=listbox], [data-slot=dropdown-menu-content]";
  const accName = (el) => {
    const label = el.getAttribute("aria-label");
    if (label && label.trim()) return label.trim();
    const by = el.getAttribute("aria-labelledby");
    if (by) {
      const t = by
        .split(/\s+/)
        .map((id) => (document.getElementById(id) || {}).textContent || "")
        .join(" ")
        .trim();
      if (t) return t;
    }
    return snippet(el.textContent || el.getAttribute("title") || "");
  };
  let probeSeq = document.querySelectorAll("[data-visual-audit-probe]").length;
  const tag = (el) => {
    if (!el.hasAttribute("data-visual-audit-probe"))
      el.setAttribute("data-visual-audit-probe", String(probeSeq++));
    return el.getAttribute("data-visual-audit-probe");
  };

  // ── C01: document / main horizontal excess + clipped ink ────────────────────────────────
  // `document.scrollWidth` alone is blind under AppShell: `.app-main` is overflow:auto, so a page
  // that overflows scrolls inside main and never reaches the document.
  const scrollers = [];
  const se = document.scrollingElement || document.documentElement;
  scrollers.push({ element: "document", excess: se.scrollWidth - se.clientWidth });
  for (const m of new Set(document.querySelectorAll("main, [role=main], .app-main"))) {
    const ox = cs(m).overflowX;
    if (!shown(m) || (ox !== "auto" && ox !== "scroll")) continue;
    scrollers.push({ element: desc(m), excess: m.scrollWidth - m.clientWidth });
  }

  const clips = [];
  const SKIP = "script, style, noscript, template, input, textarea, select, option";
  const items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const p = n.parentElement;
    if (!n.data.trim() || !p || p.closest(SKIP) || p.closest("svg")) continue;
    items.push({ node: n, owner: p, kind: "text" });
  }
  for (const el of document.querySelectorAll("svg, img, [role=img], canvas, video")) {
    if ((el.parentElement && el.parentElement.closest("svg")) || !el.parentElement) continue;
    items.push({ node: el, owner: el.parentElement, kind: "icon" });
  }
  for (const it of items) {
    const host = it.kind === "text" ? it.owner : it.node;
    if (!shown(host)) continue;
    let rects;
    if (it.kind === "text") {
      const range = document.createRange();
      range.selectNodeContents(it.node);
      rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      // A text line's client rect is its font's CONTENT AREA, taller than the line box when the
      // line-height is tight. Measure against the line box (half-leading trimmed) so a 1.2
      // line-height inside a truncating box is not reported as cut ink. Approximation: line box,
      // not glyph ink — check:text-ink-clip owns glyph ink.
      const lh = parseFloat(cs(it.owner).lineHeight);
      if (Number.isFinite(lh))
        rects = rects.map((r) => {
          if (r.height <= lh) return r;
          const cut = (r.height - lh) / 2;
          return { left: r.left, right: r.right, top: r.top + cut, bottom: r.bottom - cut };
        });
    } else {
      const r = it.node.getBoundingClientRect();
      rects = r.width > 0 && r.height > 0 ? [r] : [];
    }
    if (!rects.length) continue;
    const box = {
      left: Math.min(...rects.map((r) => r.left)),
      right: Math.max(...rects.map((r) => r.right)),
      top: Math.min(...rects.map((r) => r.top)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
    };
    let worst = null;
    let hidden = false;
    // Walk outward from the nearest box. Text is clipped by its OWN element too (a truncating
    // span); an icon starts at its parent. A scroll container (auto/scroll) keeps content
    // reachable on that axis, but it never excuses a hidden/clip ancestor INSIDE it.
    for (
      let a = it.owner;
      a && a !== document.body && a !== document.documentElement;
      a = a.parentElement
    ) {
      const s = cs(a);
      const clipX = s.overflowX === "hidden" || s.overflowX === "clip";
      const clipY = s.overflowY === "hidden" || s.overflowY === "clip";
      if (!clipX && !clipY) continue;
      if (a.clientWidth <= 1 || a.clientHeight <= 1) {
        hidden = true; // visually-hidden idiom — painted nowhere
        break;
      }
      const ar = a.getBoundingClientRect();
      const cl = ar.left + a.clientLeft;
      const ct = ar.top + a.clientTop;
      const clip = { left: cl, right: cl + a.clientWidth, top: ct, bottom: ct + a.clientHeight };
      if (
        box.right <= clip.left ||
        box.left >= clip.right ||
        box.bottom <= clip.top ||
        box.top >= clip.bottom
      ) {
        hidden = true; // wholly clipped = hidden content (closed drawer, slide), not cut ink
        break;
      }
      const dx = clipX ? Math.max(clip.left - box.left, box.right - clip.right, 0) : 0;
      const dy = clipY ? Math.max(clip.top - box.top, box.bottom - clip.bottom, 0) : 0;
      const px = Math.max(dx, dy);
      if (px <= 0 || (worst && px <= worst.px)) continue;
      const ownerStyle = cs(it.owner);
      const truncating =
        (dx >= dy && (s.textOverflow === "ellipsis" || ownerStyle.textOverflow === "ellipsis")) ||
        (s.webkitLineClamp && s.webkitLineClamp !== "none");
      let recoverable = false;
      if (it.kind === "text" && truncating) {
        const full = snippet(it.owner.textContent).slice(0, 20);
        const carrier = it.owner.closest("[title], [aria-label], [data-audit-recoverable]");
        recoverable =
          !!carrier &&
          (carrier.hasAttribute("data-audit-recoverable") ||
            snippet(carrier.getAttribute("title")).includes(full) ||
            snippet(carrier.getAttribute("aria-label")).includes(full));
      }
      worst = { px, axis: dx >= dy ? "x" : "y", clipper: desc(a), recoverable };
    }
    if (hidden || !worst) continue;
    clips.push({
      kind: it.kind,
      element: desc(host),
      text: it.kind === "text" ? snippet(it.node.data) : "",
      ...worst,
    });
  }

  // ── C02: search fields ───────────────────────────────────────────────────────────────────
  const ctx = document.createElement("canvas").getContext("2d");
  const textPx = (el, text) => {
    const s = cs(el);
    ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    return ctx.measureText(text).width;
  };
  const SEARCH =
    ".ui-search-input-control, [role=searchbox], input[type=search], [data-audit-role=search]";
  const searchFields = [...document.querySelectorAll(SEARCH)].filter(
    (el) => el.matches("input, textarea, [contenteditable=true]") && shown(el),
  );
  const slotOf = (el) =>
    el.closest("[data-slot=topbar-center]")
      ? "center"
      : el.closest("[data-slot=topbar-end], .app-topbar-right")
        ? "end"
        : el.closest("[data-slot=topbar-start], .app-topbar-left")
          ? "start"
          : el.closest(".app-topbar, [data-slot=topbar]")
            ? "bar"
            : null;
  const measureSearch = (el) => {
    const s = cs(el);
    const contentPx = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    const placeholder = el.getAttribute("placeholder") || "";
    const others = [
      ...(el.labels ? [...el.labels] : []),
      ...(el.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter(Boolean),
    ];
    return {
      element: desc(el),
      contentPx,
      chPx: textPx(el, "0"),
      placeholder: snippet(placeholder),
      placeholderPx: placeholder ? textPx(el, placeholder) : 0,
      hintElsewhere:
        !!placeholder &&
        others.some((o) => shown(o) && snippet(o.textContent).includes(snippet(placeholder))),
    };
  };
  const SEARCH_WORDS = /search|検索|tìm|搜索|recherche|suche|buscar|검색/i;
  const searchCandidates = [...document.querySelectorAll("input:not([type]), input[type=text]")]
    .filter(
      (el) =>
        shown(el) &&
        !el.matches(SEARCH) &&
        SEARCH_WORDS.test(
          `${el.getAttribute("aria-label") || ""} ${el.getAttribute("placeholder") || ""} ${el.name || ""}`,
        ),
    )
    .map((el) => ({
      element: desc(el),
      reason:
        "looks like a search field but carries no search mapping (SearchInput, role=searchbox, type=search or data-audit-role=search)",
    }));
  // The kit's own TopbarSearch folds to its trigger below `collapseBelow`; the consumer cannot
  // annotate that internal button, so it is mapped through its own hook (gh#1307).
  const searchTriggers = [
    ...document.querySelectorAll(
      "[data-audit-role=search-trigger], [data-slot=topbar-search] .ui-topbar-search-trigger",
    ),
  ]
    .filter(shown)
    .map((el) => ({ element: desc(el), probe: tag(el) }));

  // ── C04: account name in the compact bar ────────────────────────────────────────────────
  const BAR = [".app-topbar", "[data-slot=topbar]", "header"];
  const accounts = [];
  const accountAvatars = new Set();
  const visibleTextOutside = (region, exclude) => {
    const parts = [];
    const w = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode())
      if (n.data.trim() && !(exclude && exclude.contains(n)) && shown(n.parentElement))
        parts.push(n.data);
    return snippet(parts.join(" "));
  };
  const pushAccount = (region, nameEl, avatar, t, nameText) => {
    if (avatar) accountAvatars.add(avatar);
    const text = nameText ?? (nameEl && shown(nameEl) ? snippet(nameEl.textContent) : "");
    const label = region.querySelector('[data-slot="topbar-item-label"]');
    const identity = region.closest('[data-slot="topbar-identity"]');
    const bar = identity?.closest('[data-slot="topbar"]');
    const r = region.getBoundingClientRect();
    const b = bar?.getBoundingClientRect();
    const l = label?.getBoundingClientRect();
    // An opt-in is not an exemption by itself: measure the visible label, bounded share,
    // containment, and full-name recovery. Old full-width labels still fail C04.
    const compactIdentity = !!(
      identity &&
      b &&
      label &&
      l &&
      text &&
      region.getAttribute("data-truncate") === "true" &&
      cs(label).textOverflow === "ellipsis" &&
      cs(label).whiteSpace === "nowrap" &&
      l.width > 1 &&
      l.height > 1 &&
      l.left >= r.left - 1 &&
      l.right <= r.right + 1 &&
      r.width <= b.width * 0.4 + 1 &&
      r.left >= b.left - 1 &&
      r.right <= b.right + 1 &&
      r.left >= -1 &&
      r.right <= width + 1 &&
      region.getAttribute("title")?.includes(label.textContent) &&
      accName(region).includes(label.textContent)
    );
    accounts.push({
      compactIdentity,
      element: desc(region),
      nameVisible: !!text,
      nameText: text,
      trigger: t
        ? {
            element: desc(t),
            name: accName(t),
            hasPopup:
              (t.hasAttribute("aria-haspopup") && t.getAttribute("aria-haspopup") !== "false") ||
              t.hasAttribute("aria-expanded"),
            probe: tag(t),
          }
        : null,
    });
  };
  const accountCandidates = [];
  if (width < COMPACT) {
    // `.ui-topbar-item` as well as the slot: under `<DropdownMenuTrigger asChild>` (the usual
    // account menu) the trigger's own data-slot wins the prop merge, and only the class survives.
    for (const item of document.querySelectorAll("[data-slot=topbar-item], .ui-topbar-item")) {
      const avatar = item.querySelector("[data-slot=avatar]");
      if (!avatar || !shown(item) || item.closest(OVERLAY)) continue;
      // The label box exists only when `labelHideBelow` is set; otherwise the name is the cell's
      // plain child. So the name is any VISIBLE text in the cell outside the avatar — looking for
      // the label slot alone reported a visible name as absent, a false pass.
      pushAccount(item, null, avatar, item, visibleTextOutside(item, avatar));
    }
    for (const chip of document.querySelectorAll("[data-slot=account-chip]")) {
      if (!chip.closest(BAR.join(", ")) || !shown(chip) || chip.closest(OVERLAY)) continue;
      const avatar = chip.querySelector("[data-slot=avatar]");
      const trig = avatar && avatar.closest("button, [role=button], a[href]");
      pushAccount(
        chip,
        chip.querySelector("[data-slot=text]"),
        avatar,
        trig && chip.contains(trig) ? trig : null,
      );
    }
    for (const nameEl of document.querySelectorAll("[data-audit-role=account-name]")) {
      if (nameEl.closest(OVERLAY)) continue;
      const region = nameEl.closest("[data-audit-role=account]") || nameEl.parentElement;
      const trig =
        region.querySelector("[data-audit-role=account-trigger]") ||
        nameEl.closest("button, [role=button]") ||
        region.querySelector("button, [role=button]");
      pushAccount(region, nameEl, region.querySelector("[data-slot=avatar]"), trig);
    }
    for (const a of document.querySelectorAll(BAR.map((b) => `${b} [data-slot=avatar]`).join(", ")))
      if (shown(a) && !accountAvatars.has(a) && !a.closest(OVERLAY))
        accountCandidates.push({
          element: desc(a),
          reason:
            "avatar in the bar outside any mapped account slot (TopbarItem / AccountChip / data-audit-role=account-name)",
        });
  }

  // ── C05: compact editor inset ────────────────────────────────────────────────────────────
  const editors = [];
  if (width < COMPACT) {
    const all = [
      ...document.querySelectorAll(
        ".ui-block-editor-content, [data-audit-role=editor], [contenteditable=true]",
      ),
    ].filter(shown);
    const roots = all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
    const INDENTED = "li, ul, ol, blockquote, pre, table, figure, [data-audit-indented]";
    for (const ed of roots) {
      const r = ed.getBoundingClientRect();
      const isRtl = rtl(ed);
      const inner = isRtl ? r.right - ed.clientLeft : r.left + ed.clientLeft;
      let start = null;
      const w = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!n.data.trim() || n.parentElement.closest(INDENTED)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        const rr = [...range.getClientRects()].find((x) => x.width > 0);
        if (!rr) continue;
        start = isRtl ? rr.right : rr.left;
        break;
      }
      if (start === null) {
        const s = cs(ed);
        start = isRtl ? inner - parseFloat(s.paddingRight) : inner + parseFloat(s.paddingLeft);
      }
      editors.push({ element: desc(ed), insetPx: Math.abs(start - inner) });
    }
  }

  // ── C06: compact task-action groups ─────────────────────────────────────────────────────
  const GROUPS =
    ".ui-page-header-extra, [data-slot=card-bar-extra], .ui-filter-bar-actions, [data-audit-role=task-actions]";
  const ACTION = "button, a[href], [role=button]";
  const isOverflow = (b) =>
    b.matches("[data-slot=dropdown-menu-trigger], [data-audit-role=overflow]") ||
    ["menu", "true"].includes(b.getAttribute("aria-haspopup"));
  const groups = [];
  const actionCandidates = [];
  if (width < COMPACT) {
    const mapped = [...document.querySelectorAll(GROUPS)].filter(shown);
    for (const g of mapped) {
      if (mapped.some((o) => o !== g && o.contains(g))) continue;
      const acts = [...g.querySelectorAll(ACTION)].filter(
        (b) =>
          shown(b) &&
          !b.querySelector("[data-slot=avatar]") &&
          !b.closest("nav") &&
          !(b.parentElement && b.parentElement.closest(ACTION)),
      );
      const overflow = acts.filter(isOverflow);
      const boxes = acts.map((b) => {
        const r = b.getBoundingClientRect();
        return { b, r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });
      const smallTargets = boxes
        .filter(
          ({ b, r }) =>
            (r.width < 24 || r.height < 24) &&
            cs(b).display !== "inline" &&
            !b.hasAttribute("data-audit-target-exception") &&
            boxes.some(
              (o) =>
                o.b !== b &&
                Math.hypot(o.cx - (r.left + r.width / 2), o.cy - (r.top + r.height / 2)) < 24,
            ),
        )
        .map(({ b, r }) => ({
          element: desc(b),
          name: accName(b),
          width: Math.round(r.width),
          height: Math.round(r.height),
        }));
      groups.push({
        element: desc(g),
        direct: acts.length - overflow.length,
        overflow: overflow.length,
        rows: new Set(boxes.map(({ r }) => Math.round(r.top / 4))).size,
        singleRow: g.getAttribute("data-audit-single-row") === "true",
        smallTargets,
        overflowTriggers: overflow.map((b) => ({ element: desc(b), probe: tag(b) })),
      });
    }
    const EXCLUDE = `${BAR.join(", ")}, nav, [role=tablist], [role=radiogroup], [role=toolbar], [role=menu], [role=dialog], [role=grid], table, ${GROUPS}`;
    for (const el of document.querySelectorAll("body *")) {
      if (!cs(el).display.includes("flex") || el.closest(EXCLUDE) || !shown(el)) continue;
      const kids = [...el.children].filter(
        (c) =>
          shown(c) &&
          (c.matches(ACTION) || (c.children.length === 1 && c.firstElementChild.matches(ACTION))),
      );
      if (kids.length >= 3)
        actionCandidates.push({
          element: desc(el),
          reason: `${kids.length} buttons in one row outside any mapped task-action group (PageContainer extra / CardBar extra / FilterBar actions / data-audit-role=task-actions)`,
        });
    }
  }

  // ── C10: edge-mounted rail toggle ───────────────────────────────────────────────────────
  const toggles = [];
  const railCandidates = [];
  const sidebarActionToggles = [];
  if (width >= DESKTOP) {
    const rail = [
      ...document.querySelectorAll("[data-audit-role=rail], .app-sidebar, .sb-root"),
    ].find(shown);
    for (const t of document.querySelectorAll("[data-audit-role=rail-toggle]")) {
      if (!shown(t)) continue;
      if (!rail) {
        railCandidates.push({
          element: desc(t),
          reason:
            "declared rail toggle but no visible rail to anchor it (this state is not measurable)",
        });
        continue;
      }
      const rr = rail.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      const edge = t.getAttribute("data-audit-edge") === "start" ? "start" : "end";
      const right = (edge === "end") !== rtl(rail);
      toggles.push({
        element: desc(t),
        edge,
        distancePx: Math.abs(tr.left + tr.width / 2 - (right ? rr.right : rr.left)),
      });
    }
    const sidebar = document.querySelector("[data-audit-role=rail], .app-sidebar");
    for (const t of document.querySelectorAll("[aria-controls]")) {
      if (t.matches("[data-audit-role=rail-toggle]") || !shown(t) || !sidebar) continue;
      const target = document.getElementById(t.getAttribute("aria-controls"));
      if (!target || !sidebar.contains(target)) continue;
      // `Sidebar action` is the placement DESIGN.md prescribes for a collapse toggle — inside the
      // rail, so the edge-mounted pattern C10 measures does not apply to it (gh#1307).
      if (t.closest("[data-slot=sidebar-action]")) sidebarActionToggles.push({ element: desc(t) });
      else
        railCandidates.push({
          element: desc(t),
          reason:
            "controls the rail but the edge-mounted pattern is not declared (data-audit-role=rail-toggle) — reviewer decides whether C10 applies",
        });
    }
  }

  // ── C11: desktop search keyline ─────────────────────────────────────────────────────────
  const keylines = [];
  const keylineCandidates = [];
  let endAligned = false;
  if (width >= DESKTOP) {
    const column =
      [...document.querySelectorAll("[data-audit-role=content-column]")].find(shown) ||
      [...document.querySelectorAll(".app-main .ui-page-body, .app-main .ui-page-header")].find(
        shown,
      );
    for (const field of searchFields) {
      const root = field.closest(".ui-search-input, [data-audit-role=search]") || field;
      const keyed = !!field.closest("[data-audit-keyline]");
      const slot = slotOf(field);
      if (!keyed && slot !== "center") {
        if (slot === "end") endAligned = true;
        else if (slot)
          keylineCandidates.push({
            element: desc(root),
            reason:
              "top-bar search outside the centre slot — reviewer decides whether it follows the content keyline",
          });
        continue;
      }
      if (!column) {
        keylineCandidates.push({
          element: desc(root),
          reason:
            "no content column found (PageContainer body/header inside AppShell main, or data-audit-role=content-column)",
        });
        continue;
      }
      const cr = column.getBoundingClientRect();
      const ccs = cs(column);
      const isRtl = rtl(column);
      const colStart = isRtl
        ? cr.right - column.clientLeft - parseFloat(ccs.paddingRight)
        : cr.left + column.clientLeft + parseFloat(ccs.paddingLeft);
      const sr = root.getBoundingClientRect();
      keylines.push({
        element: desc(root),
        column: desc(column),
        deltaPx: Math.abs((isRtl ? sr.right : sr.left) - colStart),
      });
    }
  }

  // ── C12: tiny tracked uppercase section labels ──────────────────────────────────────────
  const LABELS =
    "h1, h2, h3, h4, h5, h6, [role=heading], legend, .sb-section-label, [class*=group-label], .ui-separator-label, .ui-toolbar-label, [data-slot=stat-card-label], [data-audit-role=section-label]";
  const LITERAL = "code, kbd, samp, [data-audit-literal]";
  const METADATA =
    "[data-slot=badge], [data-audit-role=metadata], button, a[href], input, select, textarea, [role=button]";
  const measureLabel = (el) => {
    const s = cs(el);
    const text = snippet(el.textContent);
    const fontPx = parseFloat(s.fontSize);
    const ls = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing);
    const cased = (text.match(/\p{L}/gu) || []).filter((c) => c.toLowerCase() !== c.toUpperCase());
    // Literal evidence: the label sits in, or consists wholly of, code/kbd/samp/data-audit-literal.
    let literal = !!el.closest(LITERAL);
    if (!literal) {
      const lit = [...el.querySelectorAll(LITERAL)].map((x) => x.textContent).join(" ");
      literal = !!lit.trim() && snippet(lit) === text;
    }
    return {
      element: desc(el),
      text,
      fontPx,
      trackingEm: fontPx ? ls / fontPx : 0,
      // Uppercase needs a script with case: `text-transform: uppercase` on ページ changes nothing.
      uppercase:
        cased.length >= 2 && (s.textTransform === "uppercase" || text === text.toUpperCase()),
      literal,
    };
  };
  const labelEls = [...document.querySelectorAll(LABELS)];
  const labels = labelEls.filter((el) => shown(el) && snippet(el.textContent)).map(measureLabel);
  const labelCandidates = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest(LABELS) || el.closest(METADATA) || el.closest(LITERAL)) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim()) || !shown(el)) continue;
    const m = measureLabel(el);
    if (m.text.length <= 60 && !m.literal && isTracked(m))
      labelCandidates.push({
        element: m.element,
        reason: `"${m.text}" is tiny tracked uppercase but not mapped as a section label or metadata — reviewer classifies`,
      });
  }
  function isTracked(m) {
    return m.uppercase && m.fontPx <= 12 && m.trackingEm >= 0.04 - 1e-6;
  }

  return {
    c01: { scrollers, clips },
    c02: {
      mapped: searchFields.map(measureSearch),
      slots: searchFields.map(slotOf),
      candidates: searchCandidates,
      triggers: searchTriggers,
    },
    c04: { mapped: accounts, candidates: accountCandidates },
    c05: { mapped: editors },
    c06: { mapped: groups, candidates: actionCandidates },
    c10: { mapped: toggles, candidates: railCandidates, sidebarAction: sidebarActionToggles },
    c11: { mapped: keylines, candidates: keylineCandidates, endAligned },
    c12: { mapped: labels, candidates: labelCandidates },
  };
}
/* c8 ignore stop */

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Evidence modes (gh#1316): `--text-spacing` (WCAG 2.2 SC 1.4.12) and `--text-zoom 200` (SC 1.4.4).
// A consumer reported "W12 0/0/0" from captures byte-identical to the base render — the override
// never applied, and nothing said so. Each mode here measures the render BEFORE and AFTER the
// override; an override that moves nothing is an infrastructure error ("override not applied"),
// never a pass. Only an applied override runs the C01 content-loss probe.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** The SC 1.4.12 values, unlayered and `!important`, so they sit above every `@layer`. */
export const TEXT_SPACING_CSS =
  "*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; " +
  "word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }";

/** Parse `--text-zoom 200` (a percent, 110–400). Throws on garbage. */
export function parseTextZoom(spec) {
  const n = Number(spec);
  if (!Number.isInteger(n) || n < 110 || n > 400)
    throw new Error(`--text-zoom: "${spec ?? ""}" is not a percent between 110 and 400`);
  return n;
}

/**
 * Did the override reach the page? (pure). `before`/`after` are `snapshotText()` results of the
 * SAME document. Applied = the override's computed values reached EVERY visible text element AND
 * the geometry moved; either half alone is not enough — a computed value with zero geometry change
 * is a render that was never re-laid out, and geometry that moved without the values is something
 * else moving.
 *
 * "Every", not "any" (gh#1320): "took > 0" reported `applied: true` on an editor whose four h2
 * blocks kept their size (ratio 0.897), so a heading smaller than its own body passed as evidence.
 * The tolerance is ZERO visible elements; what is exempt is listed on the snapshot
 * (`exempt`: hidden, zero-area / sr-only, aria-hidden, inside an svg) and never counted.
 *
 * Elements are paired by index when the two snapshots agree there, otherwise by their `key`
 * (selector + text): a bar that folds under larger text, or an editor that re-creates a block,
 * changes the list, and pairing by index alone would compare unrelated elements.
 */
export function textOverrideVerdict(mode, before, after, { zoom = 200 } = {}) {
  const used = new Set();
  const pairs = [];
  before.texts.forEach((a, i) => {
    const same = after.texts[i];
    let j = same && !used.has(i) && (same.key ?? null) === (a.key ?? null) ? i : -1;
    if (j < 0 && a.key != null)
      j = after.texts.findIndex((b, k) => !used.has(k) && b.key === a.key);
    if (j < 0) return;
    used.add(j);
    pairs.push([a, after.texts[j]]);
  });
  const n = pairs.length;
  let moved = 0;
  let maxShiftPx = 0;
  let took = 0;
  const notTaken = [];
  for (const [a, b] of pairs) {
    const shift = Math.max(
      Math.abs(a.x - b.x),
      Math.abs(a.y - b.y),
      Math.abs(a.w - b.w),
      Math.abs(a.h - b.h),
    );
    if (shift > 0.5) moved++;
    maxShiftPx = Math.max(maxShiftPx, shift);
    const ok =
      mode === "text-spacing"
        ? Math.abs(b.letterSpacingPx - 0.12 * b.fontPx) <= 0.5 &&
          Math.abs(b.wordSpacingPx - 0.16 * b.fontPx) <= 0.5
        : Math.abs(b.fontPx - (a.fontPx * zoom) / 100) <= 0.5;
    if (ok) took++;
    else if (!a.exempt && !b.exempt)
      notTaken.push({
        selector: a.selector ?? "?",
        text: a.text ?? "",
        ...(mode === "text-zoom"
          ? { fontPx: a.fontPx, expectedPx: +((a.fontPx * zoom) / 100).toFixed(2), gotPx: b.fontPx }
          : { letterSpacingPx: b.letterSpacingPx, wordSpacingPx: b.wordSpacingPx }),
      });
  }
  const delta = {
    textElements: n,
    movedTextElements: moved,
    maxShiftPx: +maxShiftPx.toFixed(1),
    documentHeightPx: +(after.docHeight - before.docHeight).toFixed(1),
    documentWidthPx: +(after.docWidth - before.docWidth).toFixed(1),
  };
  const appliedRatio = n ? +(took / n).toFixed(3) : 0;
  let reason = null;
  if (n === 0) reason = "no text to measure";
  else if (took === 0) reason = `the ${mode} values reached 0 of ${n} text elements`;
  else if (moved === 0 && delta.documentHeightPx === 0 && delta.documentWidthPx === 0)
    reason = "zero geometry delta against the unmodified render";
  else if (notTaken.length)
    reason =
      `override partially applied: ${notTaken.length} of ${n} visible text elements did not take it — ` +
      notTaken
        .slice(0, 5)
        .map((m) => `${m.selector} "${m.text}"`)
        .join(", ") +
      (notTaken.length > 5 ? `, … ${notTaken.length - 5} more` : "");
  return { applied: reason === null, reason, appliedRatio, delta, notTaken };
}

/** Text-bearing elements' boxes + computed text metrics, in document order. Runs in the page. */
/* c8 ignore start — runs inside the browser, exercised by the visual-audit-text-evidence test. */
export function snapshotText() {
  const se = document.scrollingElement || document.documentElement;
  const owners = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const p = n.parentElement;
    if (!n.data.trim() || !p || seen.has(p) || p.closest("script, style, noscript, template"))
      continue;
    seen.add(p);
    owners.push(p);
  }
  // `tag#id` or `tag.class.class`, three levels up — enough to find the element, stable across a
  // re-render that re-creates it (no data attributes, no indices).
  const step = (el) =>
    el.tagName.toLowerCase() +
    (el.id
      ? `#${el.id}`
      : [...el.classList]
          .slice(0, 2)
          .map((c) => `.${c}`)
          .join(""));
  const selectorOf = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement)
      parts.unshift(step(e));
    return parts.join(" > ");
  };
  const texts = owners.map((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const fontPx = parseFloat(s.fontSize) || 0;
    const px = (v) => (v === "normal" ? 0 : parseFloat(v) || 0);
    const selector = selectorOf(el);
    const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
    // Not text a reader sees, so never counted as "did not take the override".
    const exempt =
      r.width <= 1 ||
      r.height <= 1 ||
      s.visibility !== "visible" ||
      Number(s.opacity) === 0 ||
      !!el.closest('[aria-hidden="true"], svg');
    return {
      x: r.left + se.scrollLeft,
      y: r.top + se.scrollTop,
      w: r.width,
      h: r.height,
      fontPx,
      letterSpacingPx: px(s.letterSpacing),
      wordSpacingPx: px(s.wordSpacing),
      selector,
      text,
      key: `${selector}|${text}`,
      exempt,
    };
  });
  return { texts, docHeight: se.scrollHeight, docWidth: se.scrollWidth };
}

/** Append the SC 1.4.12 sheet LAST in <head>. A CSP without 'unsafe-inline' blocks it — measured. */
export function injectTextSpacing(css) {
  const style = document.createElement("style");
  style.setAttribute("data-visual-audit", "text-spacing");
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Text-only zoom (SC 1.4.4): every element's computed font size × factor, as one appended sheet
 * keyed by the size each element had — px-sized text grows too, line boxes and widths stay
 * author-controlled, which is exactly what a browser's text-size setting does.
 */
export function injectTextZoom(percent) {
  const sizes = new Set();
  for (const el of document.querySelectorAll("body, body *")) {
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (!px) continue;
    const key = String(Math.round(px * 100) / 100);
    el.setAttribute("data-visual-audit-fz", key);
    sizes.add(key);
  }
  const style = document.createElement("style");
  style.setAttribute("data-visual-audit", "text-zoom");
  style.textContent = [...sizes]
    .map(
      (k) =>
        `[data-visual-audit-fz="${k}"] { font-size: ${(Number(k) * percent) / 100}px !important; }`,
    )
    .join("\n");
  document.head.appendChild(style);
}
/* c8 ignore stop */

/**
 * One evidence cell: reload the route clean, measure, inject, measure again, judge, and run C01
 * only when the override applied. Screenshots (base + override) when `screenshots` is a dir.
 */
/* c8 ignore start — browser glue; exercised by the visual-audit-text-evidence spawn test. */
async function runEvidence(page, url, viewport, mode, { zoom, screenshots }) {
  const vp = viewportLabel(viewport);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(() => document.fonts?.ready);
  const shot = async (suffix) => {
    if (!screenshots) return null;
    const slug = url
      .replace(/^https?:\/\/[^/]+/, "")
      .replace(/[^\w-]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const file = path.join(screenshots, `${slug || "root"}-${vp}-${mode}-${suffix}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };
  const before = await page.evaluate(snapshotText);
  const base = await shot("base");
  if (mode === "text-spacing") await page.evaluate(injectTextSpacing, TEXT_SPACING_CSS);
  else await page.evaluate(injectTextZoom, zoom);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const after = await page.evaluate(snapshotText);
  const override = await shot("override");
  const verdict = textOverrideVerdict(mode, before, after, { zoom });
  const entry = {
    url,
    viewport: vp,
    mode,
    ...(mode === "text-zoom" ? { zoomPercent: zoom } : null),
    applied: verdict.applied,
    appliedRatio: verdict.appliedRatio,
    // The visible text elements that did NOT take the override (gh#1320): selector + snippet.
    notTaken: verdict.notTaken,
    delta: verdict.delta,
    c01: "not-run",
    screenshots: screenshots ? { base, override } : null,
  };
  if (!verdict.applied)
    return {
      entry,
      findings: [],
      error: { url, viewport: vp, stage: mode, message: `override not applied: ${verdict.reason}` },
    };
  const opts = { width: viewport.width, compactBelow: COMPACT_BELOW, desktopFrom: DESKTOP_FROM };
  const probed = evaluateProbes(await page.evaluate(collectProbes, opts), { url, viewport });
  const findings = probed.findings
    .filter((f) => f.rule === "c01-content-reachable")
    .map((f) => ({ ...f, condition: mode, message: `[${mode}] ${f.message}` }));
  entry.c01 = probed.cell.rules["c01-content-reachable"];
  return { entry, findings, error: null };
}
/* c8 ignore stop */

/**
 * Run the probes for one route × viewport, including the interactions a static read cannot
 * answer: does the avatar open a menu, does the overflow menu hold actions, does a declared
 * search trigger open a usable field. Each interaction is undone (Escape) before the next.
 */
/* c8 ignore start — browser glue; exercised by the visual-audit-probes spawn test. */
async function runProbes(page, url, viewport) {
  const opts = { width: viewport.width, compactBelow: COMPACT_BELOW, desktopFrom: DESKTOP_FROM };
  const raw = await page.evaluate(collectProbes, opts);
  const menuState = () =>
    page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.display !== "none";
      };
      const menus = [
        ...document.querySelectorAll(
          "[role=menu], [role=dialog], [data-slot=dropdown-menu-content]",
        ),
      ].filter(vis);
      const items = menus.flatMap((m) =>
        [
          ...m.querySelectorAll(
            "[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], a[href], button",
          ),
        ].filter(vis),
      );
      return { open: menus.length > 0, items: items.length };
    });
  const activate = async (probe) => {
    await page.locator(`[data-visual-audit-probe="${probe}"]`).first().click({ timeout: 3_000 });
    await page.waitForTimeout(250);
    const state = await menuState();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    return state;
  };
  for (const a of raw.c04.mapped) {
    if (!a.trigger?.hasPopup) continue;
    a.trigger.opens = await activate(a.trigger.probe).then(
      (s) => s.open,
      () => false,
    );
  }
  for (const g of raw.c06.mapped) {
    g.overflowMenus = [];
    for (const o of g.overflowTriggers)
      g.overflowMenus.push({
        element: o.element,
        items: await activate(o.probe).then(
          (s) => s.items,
          () => 0,
        ),
      });
  }
  if (raw.c02.mapped.length === 0) {
    for (const trig of raw.c02.triggers) {
      try {
        await page
          .locator(`[data-visual-audit-probe="${trig.probe}"]`)
          .first()
          .click({ timeout: 3_000 });
        await page.waitForTimeout(250);
        const opened = await page.evaluate(collectProbes, opts);
        for (const m of opened.c02.mapped)
          raw.c02.mapped.push({ ...m, element: `${m.element} (opened by ${trig.element})` });
        await page.keyboard.press("Escape");
      } catch {
        raw.c02.candidates.push({
          element: trig.element,
          reason: "declared search trigger could not be activated",
        });
      }
    }
  }
  return evaluateProbes(raw, { url, viewport });
}
/* c8 ignore stop */

/** Optional-peer loader — throws a tagged bootstrap error instead of a raw stack. */
async function loadDeps() {
  try {
    const { chromium } = await import("playwright");
    return { chromium };
  } catch (cause) {
    const err = new Error("visual-audit needs the optional peer `playwright`");
    err.bootstrap = true;
    err.hint =
      "pnpm add -D playwright && pnpm exec playwright install chromium " +
      "(or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a system Chromium).";
    err.cause = cause;
    throw err;
  }
}

/**
 * Drive the browser over every target and gather findings + infra errors. Cleanup
 * (page/context/browser) is guaranteed via finally on BOTH success and failure.
 */
/* c8 ignore start — the browser-driving glue; exercised by scripts/visual-audit-smoke.mjs in CI. */
async function audit(
  targets,
  { chromium },
  viewports = DEFAULT_VIEWPORTS,
  { storageState, modes = [], zoom = 200, screenshots } = {},
) {
  const findings = [];
  const errors = [];
  const matrix = [];
  const unmapped = [];
  const timings = [];
  const evidence = modes.length ? [] : undefined;
  let browser;
  let context;
  try {
    try {
      browser = await chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
      });
    } catch (cause) {
      const err = new Error(`could not launch Chromium: ${cause.message}`);
      err.bootstrap = true;
      err.hint =
        "install a browser: pnpm exec playwright install chromium " +
        "(or set PLAYWRIGHT_CHROMIUM_EXECUTABLE to a system Chromium).";
      throw err;
    }
    context = await browser.newContext({ viewport: viewports[0], storageState });
    const page = await context.newPage();

    for (const url of targets) {
      const started = Date.now();
      // A fresh navigation per width, never a resize of the last one: an open menu, a drawer or a
      // scroll position carried over from the previous cell would contaminate this one.
      for (const viewport of viewports) {
        const vp = viewportLabel(viewport);
        await page.setViewportSize(viewport);
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
          await page.evaluate(() => document.fonts?.ready);
        } catch (e) {
          errors.push({
            url,
            viewport: vp,
            stage: "navigate",
            message: `could not load page: ${e.message}`,
          });
          continue;
        }
        const before = findings.length;

        try {
          // 2) computed-style / layout heuristics via the PURE rules.
          const m = await page.evaluate(collectInPage);
          for (const a of m.accents) {
            if (isOversaturated(a.rgb))
              findings.push(
                buildFinding(
                  "oversaturated-accent",
                  url,
                  `<${a.tag}> background OKLCH chroma ${oklchChroma(a.rgb).toFixed(3)} > 0.18 (rgb ${a.rgb.r},${a.rgb.g},${a.rgb.b})`,
                ),
              );
          }
          for (const t of m.targets) {
            // `exempt` is set by the SC 2.5.8 Inline / Spacing carve-outs measured in the page.
            if (!t.exempt && isUndersizedTarget(t))
              findings.push(
                buildFinding(
                  "target-size-min",
                  url,
                  `target "${t.name || "(unnamed)"}" is ${t.width}×${t.height}px (< 24×24)`,
                ),
              );
          }
          if (hasEmoji(m.text)) {
            const found = (m.text.match(/\p{Extended_Pictographic}/gu) || []).slice(0, 8).join(" ");
            findings.push(
              buildFinding("emoji-rendered", url, `emoji rendered in product text: ${found}`),
            );
          }
          for (const layer of missingCssLayers(m.layers || []))
            findings.push(
              buildFinding(
                "css-layers-missing",
                url,
                `component layer "${layer}" is not loaded — its rules do not resolve`,
              ),
            );
          for (const r of controlHeightMismatches(m.rows || []))
            findings.push(
              buildFinding(
                "control-height-mismatch",
                url,
                `row "${r.name}" mixes control heights ${[...new Set(r.heights)].join("/")}px`,
              ),
            );
          for (const r of mixedButtonHeights(m.buttonRows || []))
            findings.push(
              buildFinding(
                "mixed-button-height",
                url,
                `row "${r.name}" mixes Button heights ${r.heights.map((h) => +h.toFixed(1)).join("/")}px (sizes ${r.sizes.join("/")})`,
              ),
            );
          const tight = tightCardPairs(m.cardPairs || []);
          if (tight.length)
            findings.push(
              buildFinding(
                "sibling-card-gap",
                url,
                `${tight.length} adjacent Card pair(s) closer than 8px (min gap ${Math.min(...tight.map((p) => p.gap))}px)`,
              ),
            );
          for (const t of starvedRowTexts(m.rowTexts || []))
            findings.push(
              buildFinding(
                "row-content-starved",
                url,
                `text "${t.text}" squeezed to ${t.visible}px of ${t.needed}px by a sibling in its row`,
              ),
            );
          m.alerts.forEach((al, i) => {
            for (const issue of alertControlIssues(al))
              findings.push(
                buildFinding("alert-controls-misplaced", url, `banner #${i + 1}: ${issue}`),
              );
          });
          // The checks above run at every width, but most of what they find (a missing CSS layer,
          // an emoji) is the same at all six: report it once, listing the widths it appeared at.
          for (const f of findings.splice(before)) {
            const seen = findings.find(
              (o) => o.url === f.url && o.rule === f.rule && o.message === f.message,
            );
            if (seen) seen.viewports.push(vp);
            else findings.push({ ...f, viewport: vp, viewports: [vp] });
          }
          // 3) responsive probes C01–C12 for this cell.
          const probed = await runProbes(page, url, viewport);
          findings.push(...probed.findings);
          unmapped.push(...probed.unmapped);
          matrix.push(probed.cell);
        } catch (e) {
          errors.push({
            url,
            viewport: vp,
            stage: "analyze",
            message: `audit engine failed: ${e.message}`,
          });
        }
        // 4) evidence modes (gh#1316) — each on a fresh load, after the base probes.
        for (const mode of modes) {
          try {
            const ev = await runEvidence(page, url, viewport, mode, { zoom, screenshots });
            evidence.push(ev.entry);
            findings.push(...ev.findings);
            if (ev.error) errors.push(ev.error);
          } catch (e) {
            errors.push({
              url,
              viewport: vp,
              stage: mode,
              message: `${mode} failed: ${e.message}`,
            });
          }
        }
      }
      timings.push({ url, viewports: viewports.length, ms: Date.now() - started });
    }
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }

  const result = buildResult({
    findings,
    errors,
    pages: targets.length,
    viewports,
    matrix,
    unmapped,
    evidence,
  });
  result.timings = timings;
  return result;
}
/* c8 ignore stop */

const C = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

/** Render a result to stdout in the requested format, then exit with the right code. */
/* c8 ignore start — thin process-exit glue, driven by the smoke/CLI paths. */
function finish(result, { asJson, strict, pages }) {
  const code = exitCodeFor(result, { strict });
  if (asJson) {
    // Exit only once the write has flushed: a six-width report is far larger than a pipe buffer,
    // and process.exit() right after write() cut it mid-document — invalid JSON on stdout.
    process.stdout.write(JSON.stringify(result, null, 2) + "\n", () => process.exit(code));
    return;
  }

  // Bootstrap failure — no page was audited.
  if (result.summary === null) {
    for (const e of result.errors) {
      process.stderr.write(`visual-audit failed: ${e.message}\n`);
      if (e.hint) process.stderr.write(`  ${e.hint}\n`);
    }
    process.exit(code);
  }

  for (const f of result.findings) {
    const tag = f.severity === "error" ? `${C.red}error${C.reset}` : `${C.yellow}warn ${C.reset}`;
    const at =
      f.viewports?.length > 1 ? ` @${f.viewports.join(",")}` : f.viewport ? ` @${f.viewport}` : "";
    console.log(`${tag} ${C.bold}${f.url}${at}${C.reset}  ${C.dim}[${f.rule}]${C.reset}`);
    console.log(`      ${f.message}`);
    if (f.threshold)
      console.log(
        `      ${C.dim}threshold: ${f.threshold.value}${f.threshold.unit === "px" || f.threshold.unit === "ch" || f.threshold.unit === "em" ? f.threshold.unit : ` ${f.threshold.unit}`} (${f.threshold.origin})${C.reset}`,
      );
    if (f.standard) console.log(`      ${C.dim}standard: ${f.standard}${C.reset}`);
  }
  for (const u of result.unmapped || []) {
    console.log(
      `${C.yellow}unmapped — reviewer required${C.reset} ${C.bold}${u.url} @${u.viewport}${C.reset}  ${C.dim}[${u.rule}]${C.reset}`,
    );
    console.log(`      ${u.element}: ${u.reason}`);
  }
  for (const cell of result.matrix || []) {
    const by = {};
    for (const [rule, st] of Object.entries(cell.rules)) (by[st] ??= []).push(rule.slice(0, 3));
    console.log(
      `${C.dim}cell ${cell.url} @${cell.viewport}: ${Object.entries(by)
        .map(([st, ids]) => `${st} ${ids.join(",")}`)
        .join(" · ")} · checklist ${cell.checklist.length} pending${C.reset}`,
    );
  }
  for (const ev of result.evidence || []) {
    const d = ev.delta;
    console.log(
      `${ev.applied ? C.dim : C.red}${ev.mode} ${ev.url} @${ev.viewport}: ${ev.applied ? "applied" : "NOT APPLIED"} (values on ${Math.round(ev.appliedRatio * 100)}% of text) — ${d.movedTextElements}/${d.textElements} text elements moved, max ${d.maxShiftPx}px, document height ${d.documentHeightPx >= 0 ? "+" : ""}${d.documentHeightPx}px · C01 ${ev.c01}${ev.screenshots ? ` · ${ev.screenshots.override}` : ""}${C.reset}`,
    );
  }
  for (const e of result.errors) {
    console.log(
      `${C.red}infra${C.reset} ${C.bold}${e.url ?? "(bootstrap)"}${C.reset}  ${C.dim}[${e.stage}]${C.reset}`,
    );
    console.log(`      ${e.message}`);
  }
  const { errors, warnings } = result.summary;
  console.log(
    `\ngodxjp-ui visual-audit [${result.status}]: ${C.red}${errors} error(s)${C.reset}, ` +
      `${C.yellow}${warnings} warning(s)${C.reset}` +
      (result.errors.length ? `, ${C.red}${result.errors.length} infra error(s)${C.reset}` : "") +
      ` across ${pages} page(s) × ${result.summary.viewports.length} viewport(s) [${result.summary.viewports.join(", ")}].`,
  );
  // Never "done", never a bare ✓: zero machine failures still leaves the checklist, the unmapped
  // items and the independent review open (ADR process step 5).
  console.log(`${result.acceptance}.`);
  if (result.summary.unmapped || result.summary.checklistPending)
    console.log(
      `${C.dim}${result.summary.unmapped} unmapped item(s) and ${result.summary.checklistPending} checklist line(s) await an independent reviewer (--format json lists them per width).${C.reset}`,
    );
  process.exit(code);
}
/* c8 ignore stop */

/** CLI entry — parse args, run the audit, print, exit. */
/* c8 ignore start — CLI driver, exercised via subprocess by the smoke test. */
async function main() {
  const args = process.argv.slice(2);
  const fmtIdx = args.indexOf("--format");
  const asJson = fmtIdx !== -1 && args[fmtIdx + 1] === "json";
  const strict = args.includes("--strict");

  if (args.includes("--rules")) {
    process.stdout.write(JSON.stringify(allRules(), null, 2) + "\n");
    process.exit(0);
  }

  const wIdx = args.indexOf("--widths");
  let viewports;
  try {
    viewports = parseViewports(wIdx === -1 ? null : (args[wIdx + 1] ?? ""));
  } catch (e) {
    finish(buildBootstrapError(e.message), { asJson, strict, pages: 0 });
    return;
  }

  // `--storage-state <file>` — a Playwright storageState JSON (cookies + localStorage), so a
  // signed-in route is audited signed in (gh#1307: the consumer had to patch a copy to get past
  // its login). Create one with `npx playwright codegen --save-storage=state.json <url>`.
  const ssIdx = args.indexOf("--storage-state");
  const storageState = ssIdx === -1 ? undefined : args[ssIdx + 1];
  if (ssIdx !== -1 && (!storageState || !existsSync(storageState))) {
    finish(
      buildBootstrapError(
        `--storage-state: "${storageState ?? ""}" is not a readable file`,
        "pass a Playwright storageState JSON, e.g. from `npx playwright codegen --save-storage=state.json <url>`",
      ),
      { asJson, strict, pages: 0 },
    );
    return;
  }

  // Evidence modes (gh#1316): `--text-spacing` (SC 1.4.12), `--text-zoom <percent>` (SC 1.4.4),
  // `--screenshots <dir>` for the base + override render of each.
  const modes = [];
  if (args.includes("--text-spacing")) modes.push("text-spacing");
  const tzIdx = args.indexOf("--text-zoom");
  let zoom = 200;
  if (tzIdx !== -1) {
    try {
      zoom = parseTextZoom(args[tzIdx + 1]);
    } catch (e) {
      finish(buildBootstrapError(e.message), { asJson, strict, pages: 0 });
      return;
    }
    modes.push("text-zoom");
  }
  const shIdx = args.indexOf("--screenshots");
  const screenshots = shIdx === -1 ? undefined : args[shIdx + 1];
  if (shIdx !== -1) {
    try {
      if (!screenshots || screenshots.startsWith("--")) throw new Error("no directory given");
      mkdirSync(screenshots, { recursive: true });
    } catch (e) {
      finish(buildBootstrapError(`--screenshots: ${e.message}`), { asJson, strict, pages: 0 });
      return;
    }
  }

  const VALUED = ["--format", "--widths", "--storage-state", "--text-zoom", "--screenshots"];
  const urls = args.filter((a, i) => !a.startsWith("--") && !VALUED.includes(args[i - 1]));
  if (urls.length === 0) {
    const msg =
      "no baseUrl given — usage: visual-audit.mjs [--format json] [--strict] [--widths 390x844,1280x900] [--storage-state state.json] [--text-spacing] [--text-zoom 200] [--screenshots DIR] <baseUrl> [route …] " +
      "(baseUrl is the running app; extra args are routes appended to it)";
    finish(buildBootstrapError(msg), { asJson, strict, pages: 0 });
    return;
  }

  const base = urls[0].replace(/\/$/, "");
  const routes = urls.length > 1 ? urls.slice(1) : ["/"];
  const targets = routes.map((r) =>
    r.startsWith("http") ? r : `${base}${r.startsWith("/") ? r : `/${r}`}`,
  );

  let deps;
  try {
    deps = await loadDeps();
  } catch (e) {
    finish(buildBootstrapError(e.message, e.hint), { asJson, strict, pages: targets.length });
    return;
  }

  try {
    const result = await audit(targets, deps, viewports, {
      storageState,
      modes,
      zoom,
      screenshots: screenshots && path.resolve(screenshots),
    });
    finish(result, { asJson, strict, pages: targets.length });
  } catch (e) {
    // A launch/setup failure = infrastructure error (never "zero violations").
    finish(buildBootstrapError(e.message, e.hint), { asJson, strict, pages: targets.length });
  }
}
/* c8 ignore stop */

/** True when `argvPath` (the script node was asked to run) is this module, symlinks resolved. */
export function isMainModule(argvPath, moduleUrl) {
  const real = (p) => {
    try {
      return realpathSync(p);
    } catch {
      return p;
    }
  };
  return real(argvPath) === real(fileURLToPath(moduleUrl));
}

// Run only as a CLI — importing this module (for unit tests) must NOT execute.
/* c8 ignore start */
// Compare REAL paths on both sides (gh#1198): through a symlinked node_modules, argv[1] is the
// link and import.meta.url the target, and a plain comparison skipped the audit and exited 0 — a
// silent no-op that reads exactly like a clean run.
if (process.argv[1] && isMainModule(process.argv[1], import.meta.url)) {
  main().catch((e) => {
    const asJson =
      process.argv.indexOf("--format") !== -1 &&
      process.argv[process.argv.indexOf("--format") + 1] === "json";
    if (asJson) {
      process.stdout.write(JSON.stringify(buildBootstrapError(e.message, e.hint)) + "\n");
    } else console.error(`visual-audit failed: ${e.message}`);
    process.exit(2);
  });
}
/* c8 ignore stop */
