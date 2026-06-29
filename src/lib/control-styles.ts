/** Shared control sizing — reads `--control-height`, `--font-size-*` from density / theme. */
export const controlFieldClass =
  "ui-control w-full rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50";

export const controlMultilineClass =
  "ui-control-multiline w-full rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Open-state ring for popup-style triggers (Select / Cascader / TreeSelect / SearchSelect).
 * Radix moves focus INTO the popup on open, so the trigger loses `:focus-visible` and — without
 * this — an open popover shows only a border change (no ring), inconsistent with a focused Input.
 * Opacity `/50` matches the real focus ring used by Button / Input / Select. Apply alongside
 * `focus-visible:ring-*` on any trigger that toggles `data-state="open"`.
 */
export const controlOpenRingClass =
  "data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]";

export const controlTriggerClass =
  "ui-control flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-input bg-background shadow-sm transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";

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

export const toneDestructiveClass = "border-destructive/30 bg-destructive/10 text-error-strong";

export const toneMutedClass = "border-border bg-muted text-muted-foreground";

export const toneNeutralClass = "border-border bg-muted text-muted-foreground";
