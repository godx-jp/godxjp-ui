import * as React from "react";

import { cn } from "../../lib/utils";
import { Text } from "../general/typography";

/**
 * ListRow — a single-line entity row (leading · title/description · trailing) for SHORT lists
 * inside a Card: active sessions, API tokens, linked accounts, passkeys, MFA factors, invitations.
 * Use it INSTEAD of a hand-rolled `<div className="flex items-center justify-between border-b …">`.
 * DataTable is too heavy for a 2–4 item list, and nesting a Card per row would be card-in-card —
 * ListRow is the in-between surface. Drop rows into a `<Card><CardContent flush>…` and they stack
 * with a quiet divider; the trailing slot holds the row's action (Button / DropdownMenu / Switch).
 */
export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Render element — `div` (default) or `li` when the parent is a `<ul>`/`<ol>`. */
  as?: "div" | "li";
  /** Leading slot — a decorative icon or an Avatar. Mark a purely decorative icon `aria-hidden`. */
  leading?: React.ReactNode;
  /** Primary line — rendered in medium weight; truncates to a single line. */
  title: React.ReactNode;
  /** Secondary line under the title (muted, xs); truncates to a single line. */
  description?: React.ReactNode;
  /** Trailing slot — the row action(s): a Button / DropdownMenu trigger, a Badge, or a Switch. */
  trailing?: React.ReactNode;
  /** Cross-axis alignment of the columns — `center` (default) or `start` for multi-line content. */
  align?: "center" | "start";
}

export const ListRow = React.forwardRef<HTMLDivElement, ListRowProps>(
  (
    { as = "div", leading, title, description, trailing, align = "center", className, ...props },
    ref,
  ) => {
    const Comp = as as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="list-row"
        data-align={align === "start" ? "start" : undefined}
        className={cn("ui-list-row", className)}
        {...props}
      >
        {leading != null ? <span data-slot="list-row-leading">{leading}</span> : null}
        <span data-slot="list-row-body">
          <Text weight="medium" truncate>
            {title}
          </Text>
          {description != null ? (
            <Text size="xs" tone="muted" truncate>
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
