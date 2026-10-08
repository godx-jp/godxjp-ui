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

/** The custom property `useActionsColumnFit` publishes on the collection wrapper (gh#1067). */
const ACTIONS_CONTENT_WIDTH = "--table-action-collection-actions-content-width";
/**
 * gh#1207 — the table width at which the OTHER columns get back the room they had before the
 * actions column was fitted. Below the collapse step it raises the compact floor.
 */
const ACTIONS_FIT_MIN_INLINE_SIZE = "--table-action-collection-actions-fit-min-inline-size";

/**
 * gh#1067 — the `actions` column of `preset="action-collection"` sizes to its CONTENT when that
 * content is wider than the token measure.
 *
 * The preset is `table-layout: fixed`, which never reads cell content: a text button
 * ("Retry" / "Chạy lại") plus a `…` menu in the 3.5rem actions column overflowed its cell and —
 * being end-aligned — painted over the previous column. No CSS keyword can express "this column,
 * at least as wide as its content" in the fixed algorithm (measured in Chromium: `max-content` /
 * `fit-content` on the cells are treated as `auto` and take a share of the free space; `1px` +
 * `nowrap` is a literal 1px). antd has no priority preset; its action column is sized by `width`
 * or, in its default `auto` layout, by content — this restores the content rule for this one
 * column only.
 *
 * So the content is measured: in this preset every actions cell wraps its children in a
 * shrink-to-content box (`.ui-table-actions-content`, see TableCell), and when the widest one would reach past its cell
 * at the token measure, its width (plus the cell's own inset) is published as
 * `--table-action-collection-actions-content-width`, which the column reads in place of the
 * token. When everything fits — an icon-only actions column — nothing is published and the column
 * keeps the token measure exactly. A consumer `width` on the column is an inline `inline-size`
 * and still wins.
 */
function useActionsColumnFit(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  React.useLayoutEffect(() => {
    const box = ref.current;
    if (!enabled || !box || typeof ResizeObserver === "undefined") return undefined;
    // The width each content box had at the last measure; a ResizeObserver report of the same
    // width (e.g. the initial report for a box the frame below just measured) is not a change.
    const measuredWidths = new WeakMap<Element, number>();
    const observedContents = new Set<HTMLElement>();
    const measure = () => {
      // Measure against the TOKEN measure, never against a width this hook published earlier —
      // otherwise a column that once grew could never shrink back when its content does.
      box.style.removeProperty(ACTIONS_CONTENT_WIDTH);
      box.style.removeProperty(ACTIONS_FIT_MIN_INLINE_SIZE);
      const table = box.querySelector<HTMLElement>(":scope > table");
      const baseTableWidth = table?.getBoundingClientRect().width ?? 0;
      let actionsCell: HTMLElement | null = null;
      let baseActionsWidth = 0;
      let needed = 0;
      box.querySelectorAll<HTMLElement>(".ui-table-actions-content").forEach((content) => {
        const cell = content.parentElement;
        if (!cell) return;
        if (!actionsCell) {
          actionsCell = cell;
          baseActionsWidth = cell.getBoundingClientRect().width;
        }
        const style = getComputedStyle(cell);
        const inset = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
        const rect = content.getBoundingClientRect();
        measuredWidths.set(content, rect.width);
        // gh#1206 — below the collapse step everything in the cell wraps, so the box shrinks to
        // the cell and its buttons overflow it — end-aligned, out of its START edge, where
        // `scrollWidth` cannot see them. Measure the extent of what the box holds instead.
        let start = rect.left;
        let end = rect.right;
        content.querySelectorAll("*").forEach((child) => {
          const r = child.getBoundingClientRect();
          if (r.width === 0) return;
          start = Math.min(start, r.left);
          end = Math.max(end, r.right);
        });
        const width = end - start;
        // Fits the cell's PADDING box: it reaches no neighbour. The inset is the gutter an icon
        // target has always been allowed to use — the docs' xs `…` trigger is 26.7px in a 24px
        // content box — so an icon-only column keeps its exact token measure.
        if (width <= cell.clientWidth + 0.5) return;
        const edges =
          style.boxSizing === "border-box"
            ? inset +
              parseFloat(style.borderInlineStartWidth) +
              parseFloat(style.borderInlineEndWidth)
            : 0;
        needed = Math.max(needed, Math.ceil(width + edges));
      });
      if (needed === 0) return;
      box.style.setProperty(ACTIONS_CONTENT_WIDTH, `${needed}px`);
      /*
       * gh#1207 — the wider actions column must not come out of the other columns. 31.31.6 grew the
       * floor by `measured − token`, which holds only if the actions column stays at its token
       * width. It does not: `table-layout: fixed` spreads any width beyond the column measures over
       * EVERY column in proportion, so a wide actions column takes a large share of the growth
       * back. On GoDX ID's devices table (three text buttons, a 40rem floor) a meta column fell
       * from ~92px to 89px and 「シリアル番号」 wrapped 3+3. So the growth is MEASURED: whatever
       * share the other columns get at width T1, they get the same share at any width, so the
       * width that returns them their base total is T1 × base / now.
       */
      const fitted = actionsCell as HTMLElement | null;
      if (!table || !fitted) return;
      const baseOthers = baseTableWidth - baseActionsWidth;
      const tableWidth = table.getBoundingClientRect().width;
      const others = tableWidth - fitted.getBoundingClientRect().width;
      if (others > 0 && others < baseOthers - 0.5) {
        box.style.setProperty(
          ACTIONS_FIT_MIN_INLINE_SIZE,
          `${Math.ceil((tableWidth * baseOthers) / others)}px`,
        );
      }
    };

    // gh#1069 — every re-measure (rows changed, a box resized) is coalesced into ONE frame: a
    // measure forces layout on every actions cell, so a burst of changes pays for it once.
    let frame = 0;
    let rowsChanged = false;
    const schedule = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (rowsChanged) {
          rowsChanged = false;
          observeStructure();
          observeContents();
        }
        measure();
      });
    };

    const resize = new ResizeObserver((entries) => {
      if (entries.some((entry) => measuredWidths.get(entry.target) !== entry.contentRect.width)) {
        schedule();
      }
    });
    const observeContents = () => {
      observedContents.forEach((content) => {
        if (content.isConnected) return;
        resize.unobserve(content);
        observedContents.delete(content);
      });
      box.querySelectorAll<HTMLElement>(".ui-table-actions-content").forEach((content) => {
        if (observedContents.has(content)) return;
        observedContents.add(content);
        resize.observe(content);
      });
    };

    // Rows arrive and leave (paging, filtering, async data) without the box changing size. Only
    // that is watched — `childList` of the table (a section replaced), of each section (a row
    // added or removed) and of each row (a cell added or removed), never `subtree`: a cell's own
    // content changing is not a new actions cell, and a resized one is the ResizeObserver's job.
    const mutations = new MutationObserver(() => {
      rowsChanged = true;
      schedule();
    });
    const observeStructure = () => {
      mutations.disconnect();
      const table = box.querySelector(":scope > table");
      if (!table) return;
      mutations.observe(table, { childList: true });
      for (const section of Array.from(table.children)) {
        mutations.observe(section, { childList: true });
        for (const row of Array.from(section.children)) {
          mutations.observe(row, { childList: true });
        }
      }
    };

    resize.observe(box);
    observeStructure();
    observeContents();
    // The first measure is synchronous, so the first paint already has the fitted column.
    measure();
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      box.style.removeProperty(ACTIONS_CONTENT_WIDTH);
    };
  }, [ref, enabled]);
}

/**
 * gh#1070 — the preset a `TableCell` is rendered under. Only `action-collection` measures the
 * actions content, so only there does an actions cell wrap its children; every other table keeps
 * the plain `td > children` markup.
 */
const TablePresetContext = React.createContext<TablePresetProp>("default");

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
    useActionsColumnFit(scrollRef, preset === "action-collection");
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
        <TablePresetContext.Provider value={preset}>
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
        </TablePresetContext.Provider>
      </div>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <thead ref={ref} className={cn(className)} {...props} />);
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

/**
 * `interactive` — THE ROW IS THE TARGET (gh#929).
 *
 * `ListRow` already gives a clickable row all four of the things that make one usable: the whole
 * row as the hit area, a pointer cursor, a row-level hover, and the design system's focus ring —
 * because it wraps the `<a>` itself. A `<tr>` cannot be wrapped in an `<a>` and stay a table row,
 * so every consumer building "a list with COLUMNS whose rows are selectable" fell into the same
 * hole and patched it with page CSS, which `CONSUMER-RULES` forbids.
 *
 * Measured on a consumer (godx-jp/id, `/organization/roles`): the link occupied 160x66 of a
 * 318x83 row, so the right half of every row was dead; `cursor` computed `auto` on every `<tr>`,
 * so the hit area that did exist never advertised itself; and a bare `<Link>` in a `TableCell`
 * fell back to Chromium's default ring (`rgb(0, 95, 204) auto 1px`) instead of the system's
 * (`1px solid rgb(122, 0, 255)`), because `focus-ring.css` only names a fixed list of classes.
 *
 * This prop writes `data-interactive` and the package answers all three in CSS. It does NOT bind a
 * handler and does NOT make the row focusable: a row is not a control, and the thing a keyboard
 * user tabs to must still be a real `<a>`/`<button>` inside it — which is exactly what now gets
 * the system's ring. Pair it with your own `onClick` on the row for the pointer affordance, and
 * keep the real control in the first cell for the keyboard.
 */
type TableRowInteractive = {
  /**
   * The whole row acts as one target: pointer cursor, a row-level hover that means "clickable"
   * rather than merely "hovered", and the design-system focus ring for the real control inside it.
   * Presentation only — bind the handler yourself and keep a genuine `<a>`/`<button>` in the row.
   */
  interactive?: boolean;
};

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & TableRowTone & TableRowInteractive
>(({ className, tone, interactive, ...props }, ref) => (
  <tr
    ref={ref}
    data-tone={tone}
    data-interactive={interactive ? "" : undefined}
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
  ) => {
    const preset = React.useContext(TablePresetContext);
    // gh#1067 — the box `Table preset="action-collection"` measures to size the actions column to
    // its content (see useActionsColumnFit). Rendered only in that preset (gh#1070): every other
    // table keeps the plain `td > children` markup.
    const body =
      priority === "actions" && preset === "action-collection" ? (
        <span className="ui-table-actions-content">{children}</span>
      ) : (
        children
      );
    return (
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
        {/* gh#1102 — an EMPTY cell (a `render` that returned null on a read-only row) prints no
         * label either: a heading over nothing was a dead line in every stacked card. With neither,
         * the `<td>` is `:empty` and table-layout.css drops it from the card. */}
        {label !== undefined && children != null && children !== false && children !== "" ? (
          <span className="ui-table-stacked-collection-label" aria-hidden="true">
            {label}
          </span>
        ) : null}
        {/* gh#1106 — the same rule by RENDERED content: `render: (r) => <RowActions row={r} />`
         * whose component returns null is a non-null `children`, so the check above cannot see it.
         * A labelled cell wraps its value in a `display: contents` box; table-layout.css drops the
         * cell from the card when that box is `:empty`. Unlabelled cells keep `td > children`. */}
        {label !== undefined ? (
          <span className="ui-table-stacked-collection-value">{body}</span>
        ) : (
          body
        )}
      </td>
    );
  },
);
TableCell.displayName = "TableCell";
