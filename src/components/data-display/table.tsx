import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { tableHeadHeightClass } from "../../lib/control-styles";
import { useScrollsHorizontally } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type {
  BreakpointProp,
  FlushProp,
  LabelProp,
  TableCellIndentProp,
  TableColumnPriorityProp,
  TablePresetProp,
  TableRowToneProp,
  WidthProp,
} from "../../props/vocabulary";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Whether the Table owns its own horizontal-scroll region (default `true`). When `true` a table
   * wider than its container scrolls inside a keyboard-reachable wrapper (WCAG 2.1.1 / axe
   * `scrollable-region-focusable`).
   */
  scrollable?: boolean;
  /**
   * Reach for this whenever the table carries rowSpan/colSpan merged cells — without column rules
   * the merge relationships are unreadable. Colour comes from the `--table-border-color` token
   * (default `--border`).
   */
  bordered?: boolean;
  /**
   * Zebra rows — every even LOGICAL body row wears `--table-row-striped-background`, so a wide list
   * row is easy to follow across its columns. An expanded detail row (a `<tr data-expanded-row>`
   * under its record) is skipped when counting and takes its record's stripe. Leave it out to
   * inherit the theme default (`--table-row-striped-alpha`, `0%` unless a service turns striping on
   * for every table); `true` / `false` override that default for this table only.
   */
  striped?: boolean;
  /**
   * Named collection contract. `"default"` (the default) emits no attribute and keeps the plain
   * table exactly as it is.
   */
  preset?: TablePresetProp;
  /**
   * PER-INSTANCE column measures for `preset="action-collection"`, in place of re-pointing its
   * `--table-action-collection-*` knobs from a consumer stylesheet.
   *
   * Those knobs are global by design, and that is exactly the problem: two collections on the same
   * screen do not share a column budget. A console that widened `actions` globally so a Japanese
   * status badge would stop breaking to one character per line — an SC 1.4.10 reflow failure —
   * collapsed a sibling table's name column to ~15px in the same change. The only way out was a
   * scoped class in consumer CSS, and the comment that shipped with it said so: "until the package
   * can express a per-table measure, the retune stays on the collection needing it".
   *
   * Emitted as inline custom properties, the same contract `Flex width` uses for a call-site
   * measurement: the value is a raw length the design system cannot know, so it rides in `style`
   * and leaves `data-column-widths` on the DOM so each one stays countable.
   */
  columnWidths?: {
    /** `--table-action-collection-actions-width` — the row-action column above the collapse step. */
    actions?: string;
    /** `--table-action-collection-actions-width-compact` — the same column below it. */
    actionsCompact?: string;
    /** `--table-action-collection-meta-width-compact` — a `meta`-priority column below the step. */
    metaCompact?: string;
    /**
     * `--table-action-collection-min-inline-size-compact` — the legibility FLOOR the compact tier
     * keeps before the wrapper scrolls. The preset sizes its compact tier for one column per
     * priority; a collection carrying several of the same priority needs a wider floor or its
     * free-text column is squeezed toward zero.
     */
    minInlineSizeCompact?: string;
  };
  /** Defaults to `"sm"` (40rem). Ignored while `preset` is `"default"`. */
  collapseBelow?: BreakpointProp;
  /**
   * Accessible name for the horizontal-scroll REGION — the `tabindex="0"` wrapper a keyboard user
   * lands on to scroll a table wider than its container, NOT the `<table>` itself (pass `aria-label`
   * for that; it reaches the table element as it always has).
   *
   * Optional on purpose. A consumer is never forced to invent a name for every table: left out, the
   * region takes the localized `dataTable.scrollRegion` default ("Scrollable table"), which is what
   * a screen-reader user needs to hear anyway — that the arrow keys now scroll something. Pass a
   * plain string when the page can say WHICH table ("Pending approvals"); a non-string node cannot
   * be an `aria-label`, so it falls back to the default (the PermissionMatrix `label` contract).
   *
   * The region is only announced while it HAS overflow to reach: no overflow, no tab stop, no role
   * and no name, because a focus stop that scrolls nothing is noise. (gh#817)
   */
  label?: LabelProp;
};

/**
 * The scroll region's accessible name. A `label` is only usable as an `aria-label` when it is a
 * plain string, and no consumer is obliged to supply one at all — so anything else takes the
 * localized default, which still tells the user what the stop is for. Shared with `DataTable`, so
 * both tables name their region the same way.
 */
export function scrollRegionLabel(
  label: LabelProp | undefined,
  t: (key: string) => string,
): string {
  return typeof label === "string" && label.trim() !== "" ? label : t("dataTable.scrollRegion");
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      scrollable = true,
      bordered = false,
      striped,
      preset = "default",
      collapseBelow = "sm",
      columnWidths,
      label,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const scrollRef = React.useRef<HTMLDivElement>(null);
    // Measured, not assumed — see `useScrollsHorizontally`. `scrollable={false}` means an ancestor
    // owns the scroll region, so nothing is measured and nothing is emitted here.
    const scrolls = useScrollsHorizontally(scrollRef, scrollable);
    return (
      // A table wider than its container scrolls horizontally in this wrapper; keep it
      // keyboard-reachable so it can be scrolled without a pointer (WCAG 2.1.1 / axe
      // scrollable-region-focusable). That stop must not be ANONYMOUS: an unnamed, unroled focus
      // stop announces nothing at all, so it carries `role="group"` + an accessible name (gh#817).
      // `group`, not `region`: a named `region` IS a landmark, and a page with three tables would
      // then ship three same-named landmarks (axe `landmark-unique`) — the reason the role was left
      // off in the first place. `group` is announced, takes a name, and is not a landmark.
      // When `scrollable` is false an ancestor owns the scroll region, so this is a bare
      // positioning box (no `overflow`, no tab stop) to avoid a redundant nested scroller.
      // step attribute; with `preset="default"` neither is emitted, so the box is byte-identical.
      <div
        ref={scrollRef}
        className={cn(
          scrollable ? "relative w-full overflow-auto" : "relative w-full",
          preset === "action-collection" && "ui-table-collection",
          preset === "stacked-record-collection" && "ui-table-stacked-collection",
        )}
        data-preset={preset === "default" ? undefined : preset}
        data-collapse-below={preset === "default" ? undefined : collapseBelow}
        data-column-widths={columnWidths ? "" : undefined}
        style={
          columnWidths
            ? ({
                "--table-action-collection-actions-width": columnWidths.actions,
                "--table-action-collection-actions-width-compact": columnWidths.actionsCompact,
                "--table-action-collection-meta-width-compact": columnWidths.metaCompact,
                "--table-action-collection-min-inline-size-compact":
                  columnWidths.minInlineSizeCompact,
              } as React.CSSProperties)
            : undefined
        }
        {...(scrolls
          ? { role: "group", "aria-label": scrollRegionLabel(label, t), tabIndex: 0 }
          : {})}
      >
        {/* ui-audit-disable-next-line no-raw-table — this IS the Table primitive; it renders the native element. */}
        <table
          ref={ref}
          data-slot="table"
          // Tri-state on purpose: no attribute inherits the theme's `--table-row-striped-alpha`.
          data-striped={striped === undefined ? undefined : striped ? "" : "false"}
          // Type metrics live on `[data-slot="table"]` in table-layout.css
          className={cn("w-full caption-bottom", bordered && "ui-table-bordered", className)}
          {...props}
        />
      </div>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // "The last row draws no rule" is an idiom, not a service-tunable constant, so it is a CSS
  // rule (`[data-slot="table-body"] .ui-table-row:last-child`) rather than a utility. That only
  // works because TableRow's own bottom rule moved to `.ui-table-row` in the same layer: while
  <tbody ref={ref} data-slot="table-body" className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

/**
 * The row's STATE — same wash/rail/`--surface-*` grounding `DataTable`'s own `rowTone` already
 * writes onto `data-tone` (gh#866). Typed here so a hand-composed row can discover it instead of
 * reaching for the raw attribute; the attribute keeps working (`TableRow data-tone="warning"`
 * is untouched — this is an addition, not a migration), and `tone` writes the same attribute.
 */
type TableRowTone = { tone?: TableRowToneProp };

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & TableRowTone
>(({ className, tone, ...props }, ref) => (
  <tr
    ref={ref}
    data-tone={tone}
    className={cn(
      // The row rule itself is `.ui-table-row` in table-layout.css (--table-row-border-width),
      // NOT a `border-b` utility — a utility sits in `@layer utilities` and would outrank the
      //
      // THE WASH NOW READS THE SAME TOKEN THE PINNED-COLUMN MIRROR ALREADY DID (gh#894). A bare
      // `hover:bg-accent/70` could not be retuned by any theme — the pin-column mirror right
      // below this file's own selectors (table-layout.css, data-display-layout.css) already
      // reads `--table-row-hover-background-alpha`, so the row that actually owns the fill was
      // the one piece a theme could not reach. The shared default stays 0.7 (unchanged; gh#700
      // needs it >= ~0.68 or a striped row's hover stops being a visible step) — a tone Badge
      // composed over a hovered GLASS row still measures 4.02–4.34:1 on four of five seeds, and
      // clearing that needs glass's OWN lower value for this token (its theme file, not this
      // one). What this line fixes is that a theme now CAN set that value at all.
      //
      // `color-mix(…)`, not `hsl(var(--accent) / var(--x, 70%))`: Tailwind's arbitrary-property
      // parser treats a bare `/` inside the bracket as ITS OWN opacity-modifier boundary — that
      // spelling measured 0.1 alpha in Chromium (not 0.7), silently. `color-mix` has no `/` for
      // it to misread, matching the same idiom `toneSuccessClass` already uses (control-styles.ts).
      "ui-table-row data-[state=selected]:bg-primary/[0.06] transition-colors hover:[background-color:color-mix(in_oklab,hsl(var(--accent))_var(--table-row-hover-background-alpha,70%),transparent)]",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/**
 * Column priority carried by BOTH the header cell and the body cells of a column. Read only by
 * `Table preset="action-collection"` below its collapse step, where it selects the column's
 * token-owned measure; unset columns take the remaining space.
 */
type TableCellPriority = { priority?: TableColumnPriorityProp };

/** Logical column alignment, wrapping and measure, shared by header and body cells.
 * Numeric cells use tabular figures and end alignment unless align is explicit. */
type TableCellAxes = {
  align?: "start" | "center" | "end";
  numeric?: boolean;
  wrap?: boolean;
  width?: WidthProp;
};

/** `WidthProp` follows React's own style semantics: a bare number is px, a string is a CSS length. */
function cellWidth(width: WidthProp | undefined): string | undefined {
  if (width === undefined) return undefined;
  return typeof width === "number" ? `${width}px` : width;
}

/**
 * Rendered into the DOM unconditionally (so it exists for the preset's CSS to reveal) but visually
 * hidden above the collapse step, where the real `<th>` already carries the label — an ordinary
 * table with no `label` prop supplied gains no extra markup.
 */
type TableCellLabel = { label?: React.ReactNode };

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> & TableCellPriority & TableCellAxes
>(({ className, priority, align, numeric, wrap, width, style, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    data-priority={priority}
    data-align={align}
    data-numeric={numeric ? "" : undefined}
    data-wrap={wrap ? "" : undefined}
    className={cn(tableHeadHeightClass, className)}
    style={width === undefined ? style : { ...style, inlineSize: cellWidth(width) }}
    {...props}
  />
));
TableHead.displayName = "TableHead";

/**
 * The cell's CONTENT owns its inset — an expanded detail panel, a nested table, a full-bleed media
 * strip. The cell drops its own padding so the child reaches the cell edges; without it the only
 * route was a zero-padding utility at the call site, which no service theme can reach.
 */
type TableCellFlush = { flush?: FlushProp };

/**
 * Hierarchy depth. The indent is `--table-cell-space-x + depth × --table-cell-indent-space-step`,
 * computed in table-layout.css off the level this prop publishes as `--table-cell-indent-level`,
 * so a service retunes (or flattens) the step without touching JSX — the route TreeSelect's
 * `--tree-select-depth` already takes. Logical, so an RTL tree indents from the inline start.
 */
type TableCellIndent = { indent?: TableCellIndentProp };

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> &
    TableCellPriority &
    TableCellLabel &
    TableCellFlush &
    TableCellIndent &
    TableCellAxes
>(
  (
    {
      className,
      priority,
      label,
      flush,
      indent,
      align,
      numeric,
      wrap,
      width,
      children,
      style,
      ...props
    },
    ref,
  ) => (
    <td
      ref={ref}
      data-slot="table-cell"
      data-priority={priority}
      data-flush={flush ? "" : undefined}
      data-indent={indent === undefined ? undefined : indent}
      data-align={align}
      data-numeric={numeric ? "" : undefined}
      data-wrap={wrap ? "" : undefined}
      className={cn(className)}
      style={
        indent === undefined && width === undefined
          ? style
          : ({
              ...style,
              ...(indent === undefined ? null : { "--table-cell-indent-level": indent }),
              ...(width === undefined ? null : { inlineSize: cellWidth(width) }),
            } as React.CSSProperties)
      }
      {...props}
    >
      {label !== undefined ? (
        <span className="ui-table-stacked-collection-label" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {children}
    </td>
  ),
);
TableCell.displayName = "TableCell";
