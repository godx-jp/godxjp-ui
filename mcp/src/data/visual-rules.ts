/**
 * Visual / runtime audit catalog — the agent-facing mirror of `scripts/visual-audit.mjs`
 * (Playwright + axe-core). SEPARATE from the static `list_audit_rules` on purpose:
 * the static audit is zero-dep and runs on source; this one needs a browser (optional
 * peers) and runs against the RUNNING app, so it is a distinct, heavier step.
 *
 * Order of operations for an agent: static `ui-audit` (cheap, every save) → THIS visual
 * audit (before any visual review) → human/AI eyes only for taste judgement.
 *
 * Kept in sync with the CLI by `scripts/check-audit-sync.mjs` (diffs against
 * `node scripts/visual-audit.mjs --rules`).
 */

export type VisualRuleCategory = "a11y" | "color" | "i18n" | "layout";

export interface VisualRule {
  id: string;
  severity: "error" | "warn";
  category: VisualRuleCategory;
  standard: string;
  fix: string;
}

/** Command an agent runs against the running app before a visual pass (warnings, non-blocking). */
export const VISUAL_AUDIT_COMMAND =
  "node node_modules/@godxjp/ui/scripts/visual-audit.mjs <baseUrl> [route …]  (needs optional peers: playwright + @axe-core/playwright + a chromium; --strict for a CI gate, --format json, --rules to print this catalog)";

export const VISUAL_RULES: VisualRule[] = [
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
    standard: "@godxjp/ui dxs-kintai 渋み (OKLCH chroma ≤ 0.18)",
    fix: "Desaturate brand/primary surfaces (OKLCH chroma ≤ 0.18); read --primary tokens, no raw vivid bars.",
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
];

export function visualRulesByCategory(category?: VisualRuleCategory): VisualRule[] {
  return category ? VISUAL_RULES.filter((r) => r.category === category) : VISUAL_RULES;
}

export function findVisualRule(id: string): VisualRule | undefined {
  return VISUAL_RULES.find((r) => r.id === id);
}
