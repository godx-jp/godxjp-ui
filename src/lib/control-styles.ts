/** Shared control sizing — reads `--control-height`, `--font-size-*` from density / theme. */
export const controlFieldClass =
  "ui-control w-full rounded-[var(--control-radius)] border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const controlMultilineClass =
  "ui-control-multiline w-full rounded-[var(--control-radius)] border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Multiline control with its own chrome removed, for a textarea EMBEDDED in a surface that
 * already draws the box — a chat composer inside a Card, an inline edit cell, a comment box in
 * a panel. Two nested rounded borders is the tell that this was missing.
 *
 * These are utilities, not tokens, ON PURPOSE. `.ui-control-multiline` reads
 * `--control-border-width` / `--control-shadow` from `@layer components`, but the default class
 * ALSO carries Tailwind's `border` in `@layer utilities`, which wins whatever the token says —
 * the same structural inertness gh#260 found on Badge's font size. So the variant cannot be a
 * token override by a consumer; it has to drop the utilities here.
 *
 * The focus ring goes with them: the surface owns focus, via `focus-within` on the wrapper.
 */
export const controlMultilineGhostClass =
  "ui-control-multiline w-full min-h-0 border-0 bg-transparent shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Open-state ring for popup-style triggers (Select / Cascader / TreeSelect / SearchSelect).
 * Radix moves focus INTO the popup on open, so the trigger loses `:focus-visible` and — without
 * this — an open popover shows only a border change (no ring), inconsistent with a focused Input.
 * Opacity `/50` matches the real focus ring used by Button / Input / Select. Apply alongside
 * `focus-visible:ring-*` on any trigger that toggles `data-state="open"`.
 */
export const controlOpenRingClass = "ui-control-trigger";

export const controlTriggerClass =
  "ui-control ui-control-trigger flex items-center justify-between gap-2 whitespace-nowrap rounded-[var(--control-radius)] border border-input bg-background shadow-sm transition-[color,box-shadow] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";

export const controlIconClass = "size-[length:var(--control-height)] shrink-0";

export const controlIconSmClass = "size-[calc(var(--control-height)-0.5rem)] shrink-0";

/** Leading/affix icon inside an input row (search, command) — sized to `--control-icon-size`. */
export const controlIconLeadingClass = "size-[length:var(--control-icon-size)] shrink-0";

export const tableRowHeightClass = "h-[length:var(--table-row-height)]";

export const tableHeadHeightClass = "h-[length:var(--table-row-height)]";

export const tableCellPaddingClass = "py-[length:var(--table-cell-padding-y)]";

/** Semantic status / badge tones — always use tokens, never raw Tailwind palette. The TEXT uses the
 * AA-strong status colours (text-*-strong, darker than the fill) so a small status label clears
 * WCAG AA on the soft tint; the border/fill keep the brighter wa-iro role. */
export const toneSuccessClass = "border-success/30 bg-success/10 text-success-strong";

export const toneWarningClass = "border-warning/30 bg-warning/10 text-warning-strong";

export const toneInfoClass = "border-info/30 bg-info/10 text-info-strong";

/** Soft BRAND pill — a tinted primary tone (border/fill keep the brand role; the TEXT uses the
 * AA-strong brand colour `text-primary-strong`, darker than the fill, so a small brand label clears
 * WCAG AA on the soft tint — `text-primary` alone is only 4.04:1 in light). For a SOLID brand fill
 * use the Badge `default` variant instead. */
export const tonePrimaryClass = "border-primary/30 bg-primary/10 text-primary-strong";

export const toneDestructiveClass = "border-destructive/30 bg-destructive/10 text-error-strong";

export const toneMutedClass = "border-border bg-muted text-muted-foreground";

export const toneNeutralClass = "border-border bg-muted text-muted-foreground";
