import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import type { ListRowDensityProp } from "../../props/components/data-display.prop";
import { cn } from "../../lib/utils";
import { Text } from "../general/typography";

/**
 * ListRow vertical/inline geometry — `default` (the roomy entity row) or `compact` (the
 * inline-actions row: avatar + title + small trailing Buttons on one line in a narrow card).
 * A ListRow-local subset of the density vocabulary — it has no `comfortable` step.
 */
export type ListRowDensity = ListRowDensityProp;

/**
 * ListRow — a single-line entity row (indicator · leading · title/description · trailing) for
 * SHORT lists inside a Card: active sessions, API tokens, linked accounts, passkeys, MFA factors,
 * invitations, notifications.
 * Use it INSTEAD of a hand-rolled `<div className="flex items-center justify-between border-b …">`.
 * DataTable is too heavy for a 2–4 item list, and nesting a Card per row would be card-in-card —
 * ListRow is the in-between surface. Drop rows into a `<Card><CardContent flush>…` and they stack
 * with a quiet divider; the trailing slot holds the row's action (Button / DropdownMenu / Switch).
 *
 * Overflow (#224): the content column always shrinks below its intrinsic width
 * (`min-inline-size: min(--list-row-body-min-width, 100%)`) and the trailing actions wrap onto
 * their own line at narrow container widths — a long title plus two Buttons never widens the page
 * root. `overflow` picks how the long content resolves: `truncate` (default, one line + ellipsis)
 * or `wrap` (multi-line, `overflow-wrap: anywhere`).
 *
 * Density (#246): `density="compact"` is the compact inline-actions geometry — tighter block
 * padding/gap and a LOWER body threshold (`--list-row-compact-*`), so an avatar, the title and one
 * or two small trailing Buttons stay on one line inside a ~326px card column at 390px. It only
 * lowers thresholds, so the #224 wrap contract still holds.
 */
export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Render element — `div` (default) or `li` when the parent is a `<ul>`/`<ol>`. */
  as?: "div" | "li";
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
  /**
   * Row geometry — `default` (roomy entity row) or `compact` (#246): tighter block padding and
   * column gap plus a lower body threshold, so a leading Avatar, the title/description and one or
   * two small trailing Buttons stay INLINE inside a narrow card (≈326px content) at 390px, and a
   * history Badge + date stays on the title's line. Retune per theme with `--list-row-compact-*`.
   */
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
    const Comp = as as React.ElementType;
    const truncate = overflow !== "wrap";
    return (
      <Comp
        ref={ref}
        data-slot="list-row"
        data-align={align === "start" ? "start" : undefined}
        data-overflow={overflow === "wrap" ? "wrap" : undefined}
        data-density={density === "compact" ? "compact" : undefined}
        data-unread={unread === true ? "" : undefined}
        className={cn("ui-list-row", className)}
        {...props}
      >
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
      </Comp>
    );
  },
);
ListRow.displayName = "ListRow";
