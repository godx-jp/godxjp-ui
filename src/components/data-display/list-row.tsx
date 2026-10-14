import * as React from "react";
import { Slot } from "../../lib/slot";

import { useTranslation } from "../../i18n/use-translation";
import type { ListRowDensityProp } from "../../props/components/data-display.prop";
import { cn } from "../../lib/utils";
import { TRUNCATION_FOCUSABLE, truncatedPart } from "../../lib/truncation";
import { Text } from "../general/typography";

/**
 * A TRUNCATED TITLE MUST STAY READABLE (gh#1298). The row truncates its title and description, and
 * a cut title had no `title` and no keyboard route to the rest — measured on a linked-issue row,
 * scrollWidth 745 / clientWidth 728, unreadable. The same treatment DataTable `ellipsis` got
 * (gh#1262, gh#1269): each line is MEASURED, and only while it is actually cut it gets
 * `data-truncated`, a `title` with the text of the part that is cut (a `Text ellipsis` inside the
 * title, not a badge beside it), and — when nothing in the row takes focus already — a tab stop.
 * While the row holds keyboard focus the cut lines unfold (data-display-layout.css). While the row
 * holds focus its lines are skipped by the re-measure (unfolded, they measure as fitting) and
 * re-measured on focusout; a consumer's own `title` is never overwritten.
 */
function useTruncatedLines(rowRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const mark = React.useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const rowFocusable =
      row.matches(TRUNCATION_FOCUSABLE) || row.querySelector(TRUNCATION_FOCUSABLE) !== null;
    for (const line of row.querySelectorAll<HTMLElement>('[data-slot="list-row-body"] > *')) {
      // While the row holds focus its cut lines are UNFOLDED and measure as fitting — keep them.
      if (row.contains(document.activeElement) && line.dataset.truncated !== undefined) continue;
      const ownTitle = line.dataset.truncatedTitle !== undefined;
      const part = truncatedPart(line);
      if (part) {
        line.dataset.truncated = "";
        if ((!line.title || ownTitle) && (part === line || !part.title)) {
          line.title = (part.textContent ?? "").replace(/\s+/g, " ").trim();
          line.dataset.truncatedTitle = "";
        }
        if (!rowFocusable || line.dataset.truncatedStop !== undefined) {
          line.tabIndex = 0;
          line.dataset.truncatedStop = "";
        }
      } else if (line.dataset.truncated !== undefined) {
        delete line.dataset.truncated;
        if (ownTitle) {
          line.removeAttribute("title");
          delete line.dataset.truncatedTitle;
        }
        if (line.dataset.truncatedStop !== undefined) {
          line.removeAttribute("tabindex");
          delete line.dataset.truncatedStop;
        }
      }
    }
  }, [rowRef]);
  React.useEffect(() => {
    if (enabled) mark();
  });
  React.useEffect(() => {
    const row = rowRef.current;
    if (!enabled || !row || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(mark);
    observer.observe(row);
    const refold = () => requestAnimationFrame(mark);
    row.addEventListener("focusout", refold);
    return () => {
      observer.disconnect();
      row.removeEventListener("focusout", refold);
    };
  }, [enabled, mark, rowRef]);
}

/**
 * ListRow vertical/inline geometry — `default` (the roomy entity row) or `compact` (the
 * inline-actions row: avatar + title + small trailing Buttons on one line in a narrow card).
 * A ListRow-local subset of the density vocabulary — it has no `comfortable` step.
 */
export type ListRowDensity = ListRowDensityProp;

/**
 * ListRow — a single-line entity row (indicator · leading · title/description · trailing) for
 * SHORT lists inside a Card: active sessions, API tokens, linked accounts, passkeys, MFA factors,
 * invitations, notifications. Use it INSTEAD of a hand-rolled `<div className="flex items-center
 * justify-between border-b …">`.
 */
export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Render element — `div` (default) or `li` when the parent is a `<ul>`/`<ol>`.
   *
   * With `asChild`, the child owns the row element, so `as` steps out and becomes the
   * LIST ITEM around it: `<li data-slot="list-row-item"><a data-slot="list-row">`. That is
   * the only reading under which both props can hold at once, and it is the shape a list
   * of links needs — the alternative, wrapping the row yourself, moves every row into a
   * wrapper of its own and the row-to-row divider (keyed on `:not(:last-child)` among
   * siblings) stops matching entirely.
   */
  as?: "div" | "li";
  /** Use the supplied link as the entire row. Do not nest interactive trailing controls. */
  asChild?: boolean;
  /** Leading slot — a decorative icon or an Avatar. Mark a purely decorative icon `aria-hidden`. */
  leading?: React.ReactNode;
  /** Primary line — rendered in medium weight. */
  title: React.ReactNode;
  /** Secondary line under the title (muted, xs). */
  description?: React.ReactNode;
  /** Trailing slot — the row action(s): a Button / DropdownMenu trigger, a Badge, or a Switch. */
  trailing?: React.ReactNode;
  /** Cross-axis alignment of the columns — `center` (default) or `start` for multi-line content. */
  align?: "center" | "start";
  /**
   * How title/description resolve content too long for the row — `truncate` (default: one line
   * with an ellipsis) or `wrap` (multi-line; long unbroken tokens break so the row never widens).
   */
  overflow?: "truncate" | "wrap";
  /** Retune per theme with `--list-row-compact-*`. */
  density?: ListRowDensity;
  /**
   * Read/unread state — renders the indicator dot (with localized `sr-only` text, never colour
   * alone) and the tokenized unread surface. OMIT the prop entirely for rows that have no read
   * state; pass `false` for a read row so its title stays on the same optical axis as unread ones.
   */
  unread?: boolean;
}

export const ListRow = React.forwardRef<HTMLDivElement, ListRowProps>(
  (
    {
      as = "div",
      asChild = false,
      children,
      leading,
      title,
      description,
      trailing,
      align = "center",
      overflow = "truncate",
      density = "default",
      unread,
      className,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const rowRef = React.useRef<HTMLDivElement | null>(null);
    const setRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rowRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    useTruncatedLines(rowRef, overflow !== "wrap");
    // `asChild` hands the row element to the child, so it cannot ALSO be `as`. When both
    // are set the row is the child and `as` becomes the list item wrapping it.
    const item = asChild && as !== "div" ? (as as React.ElementType) : null;
    const Comp = (asChild ? Slot : as) as React.ElementType;
    const truncate = overflow !== "wrap";
    const content = (
      <>
        {unread !== undefined ? (
          <span data-slot="list-row-indicator">
            <span className="sr-only">
              {unread ? t("dataDisplay.listRow.unread") : t("dataDisplay.listRow.read")}
            </span>
          </span>
        ) : null}
        {leading != null ? <span data-slot="list-row-leading">{leading}</span> : null}
        <span data-slot="list-row-body">
          <Text weight="medium" truncate={truncate}>
            {title}
          </Text>
          {description != null ? (
            <Text size="xs" tone="muted" truncate={truncate}>
              {description}
            </Text>
          ) : null}
        </span>
        {trailing != null ? <span data-slot="list-row-trailing">{trailing}</span> : null}
      </>
    );
    const row = (
      <Comp
        ref={setRef}
        data-slot="list-row"
        data-align={align === "start" ? "start" : undefined}
        data-overflow={overflow === "wrap" ? "wrap" : undefined}
        data-density={density === "compact" ? "compact" : undefined}
        data-unread={unread === true ? "" : undefined}
        className={cn("ui-list-row", className)}
        {...props}
      >
        {asChild && React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement, undefined, content)
          : content}
      </Comp>
    );
    if (item === null) {
      return row;
    }
    const Item = item;
    return <Item data-slot="list-row-item">{row}</Item>;
  },
);
ListRow.displayName = "ListRow";
