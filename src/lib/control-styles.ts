/** Shared control sizing — reads `--control-height`, `--font-size-*` from density / theme. */
export const controlMultilineClass =
  "ui-control-multiline aria-invalid:border-destructive data-[status=error]:border-destructive data-[status=warning]:border-warning w-full rounded-[var(--control-radius)] border-input bg-background ring-offset-background placeholder:text-muted-foreground";

/**
 * Multiline control with its own chrome removed, for a textarea EMBEDDED in a surface that already
 * draws the box — a chat composer inside a Card, an inline edit cell, a comment box in a panel.
 * Two nested rounded borders is the tell that this was missing.
 */
export const controlMultilineGhostClass =
  "ui-control-multiline data-[status=error]:border-destructive data-[status=warning]:border-warning w-full min-h-0 border-0 bg-transparent shadow-none placeholder:text-muted-foreground focus-visible:ring-0";

/**
 * Multiline control drawn as antd's `filled` variant — a tinted surface instead of a boundary.
 *
 * It is a SEPARATE string rather than `controlMultilineClass` plus a modifier because
 * `bg-background` lives in `@layer utilities`, which outranks every component-layer rule: a
 * `.ui-control--filled` appended to the outlined list would be silently overpainted and no gate
 * would catch it. The two lists differ only in which chrome utilities they carry.
 */
export const controlMultilineFilledClass =
  "ui-control-multiline ui-control--filled aria-invalid:border-destructive data-[status=error]:border-destructive data-[status=warning]:border-warning w-full rounded-[var(--control-radius)] ring-offset-background placeholder:text-muted-foreground";

/**
 * Open-state ring for popup-style triggers (Select / Cascader / TreeSelect / SearchSelect). Radix
 * moves focus INTO the popup on open, so the trigger loses `:focus-visible` and — without this —
 * an open popover shows only a border change (no ring), inconsistent with a focused Input.
 */
export const controlOpenRingClass = "ui-control-trigger";

/**
 * The trigger WITHOUT a surface — no `border-input`, no `bg-background`.
 *
 * Those two are Tailwind utilities, and `@layer utilities` beats `@layer components`, so a
 * `[data-variant]` / `[data-status]` rule in control.css can never recolour a trigger that carries
 * them (the same trap that killed `.ui-app-setting-picker-icon` in gh#366 and
 * `--control-bounded-width` in gh#375). A control that wants the antd `variant` × `status` matrix
 * therefore composes THIS class plus `ui-control-surface`, which supplies the identical resting
 * border and fill from `--control-surface-*`.
 *
 * TRUNCATION HAS TO READ AS TRUNCATION (gh#813). `line-clamp-1` clips the value and — inside the
 * trigger's `whitespace-nowrap` — never reaches a second line, so its own ellipsis never engages:
 * `YYYY-MM-DD（年-月-日）` in a 101px value box showed `YYYY-MM-DD（全`, a format string cut through
 * the middle of a glyph, with nothing to say it had been cut. Two declarations because the two
 * engines ellipsize by different mechanisms, both measured on
 * `/isolate/navigation-app-setting-picker` (dateFormat, ja, 1280×1000, value box 101px / text
 * 160px):
 *
 *   text-ellipsis      Blink honours `text-overflow` on the clamped box → `YYYY-MM-DD…`.
 *                      Gecko ignores it there (still `YYYY-MM-DD（全`).
 *   whitespace-normal  lets `-webkit-line-clamp` clamp a real line, which is the ellipsis Gecko
 *                      DOES paint → `YYYY-MM-D…` in Firefox, `YYYY-MM-DD…` in Chromium.
 *
 * The clamp keeps it to one line, so a wrappable value cannot grow the control.
 */
export const controlTriggerBaseClass =
  "ui-control ui-control-trigger flex items-center justify-between gap-2 whitespace-nowrap rounded-[var(--control-radius)] transition-[color,box-shadow] [&>[data-slot=select-value]]:line-clamp-1 [&>[data-slot=select-value]]:whitespace-normal [&>[data-slot=select-value]]:text-ellipsis";

export const controlTriggerClass = `${controlTriggerBaseClass} border-input bg-background`;

/** `controlTriggerBaseClass` + the token-driven surface — the select-family trigger. */
export const controlSurfaceTriggerClass = `${controlTriggerBaseClass} ui-control-surface`;

export const controlIconClass = "size-[length:var(--control-height)] shrink-0";

export const controlIconSmClass = "size-[calc(var(--control-height)-0.5rem)] shrink-0";

/** Leading/affix icon inside an input row (search, command) — sized to `--control-icon-size`. */
export const controlIconLeadingClass = "size-[length:var(--control-icon-size)] shrink-0";

export const tableRowHeightClass = "h-[length:var(--table-row-height)]";

export const tableHeadHeightClass = "h-[length:var(--table-row-height)]";

export const tableCellPaddingClass = "py-[length:var(--table-cell-padding-y)]";

/** Semantic status / badge tones — always use tokens, never raw Tailwind palette. The TEXT uses the
 * AA-strong status colours (text-*-strong, darker than the fill) so a small status label clears
 * WCAG AA on the soft tint; the border keeps the brighter wa-iro role.
 *
 * THE FILL IS AN ARBITRARY PROPERTY, NOT `bg-success/10`, AND THAT IS THE WHOLE OF gh#866 HERE.
 * `bg-<role>/10` can only ever be the role at 10% — a derivation — so a brand that ships an
 * independently chosen pale surface (`--success #126342` with `--success-soft #E8F5EF`, a mint
 * that is not that green at any alpha) could not reach the chip. `[background-color:…]` is the
 * same utility layer and the same specificity as the class it replaces, so nothing about the
 * cascade moves; it just reads `--surface-<role>` first and falls back to the wash Tailwind itself emits,
 * `color-mix(in oklab, … 10%, transparent)` — the verbose spelling is deliberate, because
 * `hsl(var(--success) / 0.1)` rasterises one 8-bit step off it on `warning` (252,245,225 vs
 * 252,246,225 over the page ground) and "near enough" is not a default this repo ships.
 * Written at the CALL SITE rather than bound at `:root`, per docs/TOKENS.md · "Role-mirror knobs
 * MUST be `initial`", so a scoped `[data-tenant]` reaches it instead of freezing on `<html>`. */
export const toneSuccessClass =
  "border-success/30 [background-color:var(--surface-success,color-mix(in_oklab,hsl(var(--success))_10%,transparent))] text-success-strong";

export const toneWarningClass =
  "border-warning/30 [background-color:var(--surface-warning,color-mix(in_oklab,hsl(var(--warning))_10%,transparent))] text-warning-strong";

export const toneInfoClass =
  "border-info/30 [background-color:var(--surface-info,color-mix(in_oklab,hsl(var(--info))_10%,transparent))] text-info-strong";

/** Soft BRAND pill — a tinted primary tone (border/fill keep the brand role; the TEXT uses the
 * AA-strong brand colour `text-primary-strong`, darker than the fill, so a small brand label clears
 * WCAG AA on the soft tint — `text-primary` alone is only 4.04:1 in light). For a SOLID brand fill
 * use the Badge `default` variant instead. */
export const tonePrimaryClass = "border-primary/30 bg-primary/10 text-primary-strong";

export const toneDestructiveClass =
  "border-destructive/30 [background-color:var(--surface-destructive,color-mix(in_oklab,hsl(var(--destructive))_10%,transparent))] text-error-strong";

export const toneMutedClass = "border-border bg-muted text-muted-foreground";

export const toneNeutralClass = "border-border bg-muted text-muted-foreground";
