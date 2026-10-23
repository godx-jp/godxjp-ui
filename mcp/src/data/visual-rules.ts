/**
 * Visual / runtime audit catalog — the agent-facing mirror of `scripts/visual-audit.mjs`
 * (Playwright + axe-core). SEPARATE from the static `list_audit_rules` on purpose: the static
 * audit is zero-dep and runs on source; this one needs a browser (optional peers) and runs against
 * the RUNNING app, so it is a distinct, heavier step.
 */

export type VisualRuleCategory = "a11y" | "color" | "i18n" | "layout";

export interface VisualRule {
  id: string;
  severity: "error" | "warn";
  category: VisualRuleCategory;
  standard: string;
  fix: string;
  /**
   * Responsive rules C01–C12 (ADR 2026-10-14): `probe` = measured per width, advisory until the
   * pilot promotes it; `checklist` = a human reviewer resolves it, the audit never passes it.
   */
  kind?: "probe" | "checklist";
}

/** Command an agent runs against the running app before a visual pass (warnings, non-blocking). */
export const VISUAL_AUDIT_COMMAND =
  "node node_modules/@godxjp/ui/scripts/visual-audit.mjs [--widths 390x844,1280x900] [--storage-state state.json] [--text-spacing] [--text-zoom 200] [--screenshots DIR] [--playwright-module PATH] [--executable-path CHROME] <baseUrl> [route …]  (--playwright-module points at an existing playwright or playwright-core install (e.g. the npx cache) — resolution order is that path, then the playwright peer, then playwright-core, and the bootstrap error lists everything tried; --executable-path is the Chrome passed to chromium.launch, over PLAYWRIGHT_CHROMIUM_EXECUTABLE; --storage-state takes a Playwright storageState JSON so signed-in routes are audited signed in; --text-spacing / --text-zoom 200 re-render each width with the WCAG 1.4.12 / 1.4.4 override and add evidence[] (geometry delta vs the unmodified render, C01 under the override, screenshot paths with --screenshots) — a zero delta is an infra error 'override not applied', never a pass, and visible text that did not take the override is listed in notTaken[] (selector + text) and fails the cell 'override partially applied' (hidden, aria-hidden, sr-only and svg text exempt); every route at 320×900, 390×844, 768×1024, 1024×900, 1280×900, 844×390 by default; findings carry viewport + element + threshold origin; JSON adds unmapped[] (reviewer required, never a pass), matrix[] (per-width rule status + reviewer checklist) and acceptance — at best 'probes passed; independent acceptance pending', never done. Optional peers, TESTED range: playwright >=1.55 <2 [1.61.1] + @axe-core/playwright >=4.10 <5 [4.12.1] + axe-core >=4.10 <5 [4.12.1] + a chromium via `playwright install chromium`; --strict for a CI gate, --format json ALWAYS emits valid JSON with a status of ok|partial|error separating infra errors[] from product findings[], --rules to print this catalog)";

export const VISUAL_RULES: VisualRule[] = [
  {
    id: "css-layers-missing",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui styles contract (styles / styles/core are the only entries)",
    fix: "Import `@godxjp/ui/styles` (or `styles/core` without fonts — 86 KB instead of 367 KB gzip, since the bundled @font-face declarations are most of the CSS, gh#971); never cherry-pick *-layout.css — a missing layer renders naked menus and unsized Select rows.",
  },
  {
    id: "control-height-mismatch",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui control tier (--control-height) · Nielsen consistency heuristic",
    fix: "Every control in one row must share --control-height; replace hand-rolled pills with Avatar/Button/Badge, never restyle a control's height.",
  },
  {
    id: "mixed-button-height",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui Button size (one size per row) · Nielsen consistency heuristic",
    fix: "Buttons in one flex row must render at one height (within 0.5px): one `size` per row; icon-sm pairs with sm, icon-xs with xs, icon with default. Runtime twin of the static mixed-button-size rule.",
  },
  {
    id: "sibling-card-gap",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui spacing scale (docs/SPACING.md)",
    fix: 'Adjacent Cards need one space step between them — <Flex direction="col" gap>, <ResponsiveGrid>, or direct children of PageContainer.',
  },
  {
    id: "row-content-starved",
    severity: "warn",
    category: "layout",
    standard: "WCAG 2.2 SC 1.4.10 reflow",
    fix: 'A sibling (a w-full SelectTrigger) takes the row\'s width and truncates its neighbours — give the Select width="auto" or move it out of the row.',
  },
  {
    id: "axe-violations",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 A/AA · WAI-ARIA 1.2 (axe-core engine)",
    fix: "Fix each axe node — contrast (1.4.3), name/role/value (4.1.2), ARIA, landmarks. Runs on the REAL DOM, catching what static analysis cannot.",
  },
  {
    id: "target-size-min",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 SC 2.5.8 (24×24 AA) · 2.5.5 (44×44 AAA)",
    fix: "Interactive targets must be ≥24×24 CSS px; size from the --control-height tier.",
  },
  {
    id: "oversaturated-accent",
    severity: "warn",
    category: "color",
    standard: "@godxjp/ui reference-design 渋み (OKLCH chroma ≤ 0.18)",
    fix: "Desaturate brand/primary surfaces (OKLCH chroma ≤ 0.18); read --primary tokens, no raw vivid bars. The accent @godxjp/ui itself ships is exempt (gh#823) — this finding is always a colour someone chose.",
  },
  {
    id: "emoji-rendered",
    severity: "warn",
    category: "i18n",
    standard: "Unicode UTS #51 · WCAG 2.2 SC 1.1.1",
    fix: "Remove emoji from rendered product text; quiet i18n copy + Lucide icon + Badge tone.",
  },
  {
    id: "alert-controls-misplaced",
    severity: "warn",
    category: "layout",
    standard: "@godxjp/ui Alert anatomy · WAI-ARIA 1.2 · WCAG 2.2 SC 4.1.2",
    fix: "Use <Alert>: one leading tone icon, <Alert.Actions> trailing-right normal width, onDismiss × top-right, one horizontal row.",
  },
  {
    id: "c01-content-reachable",
    severity: "warn",
    category: "layout",
    standard: "WCAG 2.2 SC 1.4.10 / 1.4.4 / 1.4.12; 1.5px tolerance repo-chosen threshold",
    kind: "probe",
    fix: "Nothing may be cut off: no horizontal scroll on the document or the app's main region, and no text/icon partly hidden by an overflow:hidden/clip ancestor. Let the container shrink its content (min-width:0 + wrap), or truncate with a recoverable full value (title / aria-label). Kit Breadcrumb ellipsis requires the complete label in both title and aria-label on its clipping element; a tooltip alone or a partial label is insufficient.",
  },
  {
    id: "c02-search-usable",
    severity: "warn",
    category: "layout",
    standard:
      "search text area ≥ 8ch after padding/icon, hint fits within 1.5px (repo-chosen threshold); WCAG 1.4.10 principle",
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
    standard:
      "compact (<600px) bar shows avatar-only or measured bounded shared-device identity (repo-chosen threshold); trigger name per WCAG 2.2 SC 4.1.2",
    kind: "probe",
    fix: "Shared-device exception: Topbar identity with TopbarItem truncate keeps a bounded, ellipsised name and full title/accessible name. Otherwise below 600px the bar shows the avatar only: hide the account name (it belongs in the opened account menu) and make the avatar the trigger — accessible name + aria-haspopup, opening identity and account controls.",
  },
  {
    id: "c05-compact-editor-inset",
    severity: "warn",
    category: "layout",
    standard:
      "first unindented line ≤ 24px from the editor inner edge below 600px (repo-chosen threshold); WCAG 1.4.10 principle",
    kind: "probe",
    fix: "Reclaim the desktop drag-handle gutter on phones: the editor's base inset (padding included) is at most 24px below 600px; keep list indentation, and give tap/keyboard alternatives to the hover handle.",
  },
  {
    id: "c06-compact-actions",
    severity: "warn",
    category: "layout",
    standard:
      "≤2 direct actions + ≤1 overflow per task-action group below 600px (repo-chosen threshold); targets ≥24×24 per WCAG 2.2 SC 2.5.8",
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
    standard:
      "toggle centre within 8px of the declared rail edge at ≥1024px (repo-chosen threshold)",
    kind: "probe",
    fix: "An edge-mounted rail toggle sits on the rail edge it controls in both desktop states. Declare the pattern with data-audit-role=rail-toggle (+ data-audit-edge=start|end). A toggle inside `Sidebar action` is the supported placement and reports not-applicable-sidebar-action.",
  },
  {
    id: "c11-search-keyline",
    severity: "warn",
    category: "layout",
    standard: "desktop search start within 2px of the content column start (repo-chosen threshold)",
    kind: "probe",
    fix: "A centred top-bar search starts on the content column's keyline, not the window's centre. Applies when the search sits in Topbar `center` (or carries data-audit-keyline).",
  },
  {
    id: "c12-tracked-uppercase-label",
    severity: "warn",
    category: "layout",
    standard:
      "section label uppercase AND ≤12px AND tracking ≥0.04em fails (repo-chosen threshold); no WCAG font floor implied",
    kind: "probe",
    fix: "Section labels read as sentence-case text at the body scale, not tiny tracked capitals. Literal domain codes are exempt when marked as such (<code>, <kbd>, data-audit-literal).",
  },
];

export function visualRulesByCategory(category?: VisualRuleCategory): VisualRule[] {
  return category ? VISUAL_RULES.filter((r) => r.category === category) : VISUAL_RULES;
}

export function findVisualRule(id: string): VisualRule | undefined {
  return VISUAL_RULES.find((r) => r.id === id);
}
