/** Shared control sizing — reads `--control-height`, `--font-size-*` from density / theme. */
export const controlFieldClass =
  "ui-control w-full rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50";

export const controlMultilineClass =
  "ui-control-multiline w-full rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50";

export const controlTriggerClass =
  "ui-control flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-input bg-background shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";

export const controlIconClass = "size-[length:var(--control-height)] shrink-0";

export const controlIconSmClass = "size-[calc(var(--control-height)-0.5rem)] shrink-0";

/** Leading/affix icon inside an input row (search, command) — sized to `--control-icon-size`. */
export const controlIconLeadingClass = "size-[length:var(--control-icon-size)] shrink-0";

export const tableRowHeightClass = "h-[length:var(--table-row-height)]";

export const tableHeadHeightClass = "h-[length:var(--table-row-height)]";

export const tableCellPaddingClass = "py-[length:var(--table-cell-padding-y)]";

/** Semantic status / badge tones — always use tokens, never raw Tailwind palette. */
export const toneSuccessClass = "border-success/30 bg-success/10 text-success";

export const toneWarningClass = "border-warning/30 bg-warning/10 text-warning-foreground";

export const toneInfoClass = "border-info/30 bg-info/10 text-info";

export const toneDestructiveClass = "border-destructive/30 bg-destructive/10 text-destructive";

export const toneMutedClass = "border-border bg-muted text-muted-foreground";

export const toneNeutralClass = "border-border bg-muted text-muted-foreground";
