/**
 * Local UI-audit catalog — the agent-facing mirror of `scripts/ui-audit.mjs`.
 *
 * The CLI (`scripts/ui-audit.mjs`) is the single source of truth for the EXECUTABLE
 * rules; this catalog documents each rule's category, the international standard it
 * enforces, and the concrete fix, so an agent can (a) self-audit from the MCP and
 * (b) know to RUN the audit locally BEFORE any visual review.
 *
 * Drift is prevented by `scripts/check-audit-sync.mjs`, which diffs the rule ids here
 * against `node scripts/ui-audit.mjs --rules`. Add a rule to the CLI → add it here.
 *
 * HOW TO RUN (from the consuming app, warnings are agent guidance — non-blocking):
 *   node node_modules/@godxjp/ui/scripts/ui-audit.mjs            # human report
 *   node node_modules/@godxjp/ui/scripts/ui-audit.mjs --format json
 *   node node_modules/@godxjp/ui/scripts/ui-audit.mjs --rules    # this catalog, from source
 */

export type AuditRuleCategory = "tokens" | "composition" | "api" | "a11y" | "i18n" | "rtl" | "copy";

export interface AuditRule {
  /** Stable id — MUST match the id in scripts/ui-audit.mjs. */
  id: string;
  severity: "error" | "warn";
  category: AuditRuleCategory;
  /** International standard / spec this rule enforces (null = house design-system rule). */
  standard: string | null;
  /** One-line "do this instead". */
  fix: string;
}

/** Shell command an agent runs to audit the consumer's UI locally before a visual pass. */
export const AUDIT_COMMAND =
  "node node_modules/@godxjp/ui/scripts/ui-audit.mjs  (add --format json for machine output, --rules to print this catalog)";

export const AUDIT_RULES: AuditRule[] = [
  // ── tokens (house design-system: semantic tokens only) ──────────────────
  {
    id: "no-raw-palette-color",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "Use semantic tokens (bg-primary, text-muted-foreground), never raw palette (bg-blue-500).",
  },
  {
    id: "no-arbitrary-hex",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No hardcoded hex in className; read design-system color tokens.",
  },
  {
    id: "no-arbitrary-spacing",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No p-[13px]/gap-[7px]; use the token scale / <Flex gap> / <PageContainer>.",
  },
  {
    id: "no-arbitrary-size",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No w-[37px]/h-[260px]; use token sizes or a sizing prop (min-w-[…] allowed).",
  },
  {
    id: "no-arbitrary-typography",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No text-[20px]/leading-[1.7]; use the golden-ratio type-scale tokens.",
  },
  {
    id: "no-arbitrary-radius",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No rounded-[6px]; use rounded-sm/md/lg radius tokens.",
  },
  {
    id: "no-dark-color-override",
    severity: "warn",
    category: "tokens",
    standard: null,
    fix: "Drop dark: color overrides — semantic tokens already adapt.",
  },
  {
    id: "raw-white-black",
    severity: "warn",
    category: "tokens",
    standard: null,
    fix: "Prefer semantic tokens (text-primary-foreground, bg-background) over raw white/black.",
  },
  {
    id: "no-domain-tracking-token",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "No package-tracking/domain tokens; use semantic tokens or app theme overrides.",
  },
  {
    id: "no-space-xy",
    severity: "error",
    category: "tokens",
    standard: null,
    fix: "Use <Flex gap> instead of space-x/y-*.",
  },

  // ── composition (real primitives, no raw HTML / hand-rolled) ─────────────
  {
    id: "no-raw-select",
    severity: "error",
    category: "composition",
    standard: "HTML Living Standard (WHATWG)",
    fix: "Use <Select> from @godxjp/ui, not a raw <select>.",
  },
  {
    id: "no-raw-table",
    severity: "error",
    category: "composition",
    standard: "HTML Living Standard (WHATWG)",
    fix: "Use the <Table>/<DataTable> family, not a raw <table>.",
  },
  {
    id: "no-raw-input",
    severity: "error",
    category: "composition",
    standard: "HTML Living Standard (WHATWG)",
    fix: "Use <Input> from @godxjp/ui, not a raw <input>.",
  },
  {
    id: "no-raw-textarea",
    severity: "warn",
    category: "composition",
    standard: "HTML Living Standard (WHATWG)",
    fix: "Use <Textarea> from @godxjp/ui, not a raw <textarea>.",
  },
  {
    id: "no-raw-button",
    severity: "error",
    category: "composition",
    standard: "HTML Living Standard (WHATWG)",
    fix: "Use <Button> from @godxjp/ui, not a raw <button>.",
  },
  {
    id: "card-manual-padding",
    severity: "error",
    category: "composition",
    standard: null,
    fix: "Wrap the body in <CardContent>; don't hand-roll padding on <Card>.",
  },
  {
    id: "card-needs-content",
    severity: "error",
    category: "composition",
    standard: null,
    fix: "<Card> body must be in <CardContent> (no padding otherwise); flush only for a full-bleed table.",
  },
  {
    id: "bare-control-needs-formfield",
    severity: "warn",
    category: "composition",
    standard: "WCAG 2.2 SC 1.3.1 · 3.3.2 · @godxjp/ui FormField (cardinal rule 227)",
    fix: "Wrap a labelled control in <FormField label=…> — it owns label↔control id wiring, aria/error, AND the field rhythm; never pair a bare <Label> with an <Input>.",
  },
  {
    id: "manual-field-error",
    severity: "warn",
    category: "composition",
    standard: "WCAG 2.2 SC 3.3.1",
    fix: "Use <FormField error=…>, not a hand-rolled <p class='text-destructive'>.",
  },
  {
    id: "manual-field-helper",
    severity: "warn",
    category: "composition",
    standard: null,
    fix: "Use <FormField helper=…>, not a hand-rolled helper <p>.",
  },

  // ── api (controlled-vocabulary props) ────────────────────────────────────
  {
    id: "status-tone-not-variant",
    severity: "error",
    category: "api",
    standard: null,
    fix: "Badge/Tag/StatCard status uses tone, not variant (variant is structural).",
  },
  {
    id: "value-callback-on-value-change",
    severity: "error",
    category: "api",
    standard: null,
    fix: "Abstract value components use onValueChange, not onChange.",
  },

  // ── a11y (WCAG 2.2 + WAI-ARIA APG) ───────────────────────────────────────
  {
    id: "icon-button-needs-name",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 SC 4.1.2 · 1.1.1 · WAI-ARIA 1.2",
    fix: "Add aria-label={t('…')} to <Button size='icon'>; the glyph is aria-hidden.",
  },
  {
    id: "img-needs-alt",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 SC 1.1.1 · HTML Living Standard",
    fix: "Add alt to every <img> (alt='' if decorative); prefer <Avatar>/<AspectRatio>.",
  },
  {
    id: "no-positive-tabindex",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 SC 2.4.3 · WAI-ARIA APG",
    fix: "Use tabIndex 0 or -1 only; never positive — it breaks focus order.",
  },
  {
    id: "hand-rolled-close-glyph",
    severity: "warn",
    category: "a11y",
    standard: "WAI-ARIA 1.2 (dialog) · WCAG 2.2 SC 4.1.2",
    fix: "Pass onDismiss to <Alert>, or use <Dialog>/<Sheet>'s built-in labelled close — not a bare ✕.",
  },

  // ── i18n (ECMA-402 Intl + ISO + IANA) ────────────────────────────────────
  {
    id: "no-emoji-in-ui",
    severity: "warn",
    category: "i18n",
    standard: "Unicode UTS #51 · WCAG 2.2 SC 1.1.1",
    fix: "No emoji in product UI; quiet i18n copy + Lucide icon + Badge tone.",
  },
  {
    id: "no-emoji-flag",
    severity: "warn",
    category: "i18n",
    standard: "ISO 3166-1 · ECMA-402 Intl.DisplayNames · Unicode UTS #51",
    fix: "Derive country names from Intl.DisplayNames; no emoji flags.",
  },
  {
    id: "hardcoded-currency",
    severity: "warn",
    category: "i18n",
    standard: "ISO 4217 · ECMA-402 Intl.NumberFormat",
    fix: "Format money with Intl.NumberFormat({ style: 'currency', currency }), not ¥{amount}.",
  },
  {
    id: "raw-intl-date",
    severity: "warn",
    category: "i18n",
    standard: "ISO 8601 · IANA tz · ECMA-402 Intl.DateTimeFormat",
    fix: "Use formatDate from @godxjp/ui/datetime, not hand-built or locale-default dates.",
  },

  // ── rtl (CSS Logical Properties) ─────────────────────────────────────────
  {
    id: "no-physical-direction",
    severity: "warn",
    category: "rtl",
    standard: "W3C CSS Logical Properties L1 · WCAG 2.2 (1.3.2)",
    fix: "Use logical utilities (ms-/me-/ps-/pe-, start-/end-, text-start/end, border-s/e, rounded-s/e).",
  },

  // ── copy (dxs-kintai DNA) ────────────────────────────────────────────────
  {
    id: "no-em-dash-in-copy",
    severity: "warn",
    category: "copy",
    standard: "@godxjp/ui dxs-kintai typography",
    fix: "No em-dash (—) in copy; use a middot · or two calm sentences.",
  },
];

export function auditRulesByCategory(category?: AuditRuleCategory): AuditRule[] {
  return category ? AUDIT_RULES.filter((r) => r.category === category) : AUDIT_RULES;
}

export function findAuditRule(id: string): AuditRule | undefined {
  return AUDIT_RULES.find((r) => r.id === id);
}
