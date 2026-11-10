import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import type { CSSProperties, ElementType, ReactNode } from "react";

import { useTranslation } from "../../i18n/use-translation";
import { BreadcrumbCrumbText, shownCrumb, trailEllipsis } from "./breadcrumb-ellipsis";
import type {
  BreadcrumbCurrentItemProp,
  BreadcrumbItemProp,
  BreadcrumbItemRenderProp,
  BreadcrumbProp,
  BreadcrumbSeparatorProp,
} from "../../props/vocabulary/navigation.prop";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";

export type BreadcrumbProps = {
  items: BreadcrumbProp;
  /** Last item is current by default; none keeps an ancestor-only trail linked. */
  currentItem?: BreadcrumbCurrentItemProp;
  linkComponent?: ElementType;
  /** Override the `<nav>` landmark's accessible name. Defaults to a localized "Breadcrumb". */
  ariaLabel?: string;
  /**
   * Ant Design `separator`. Defaults to the chevron glyph. A string (`"/"`) or any node replaces
   * it; `""` removes it. It is always `aria-hidden` — the trail's structure is carried by the
   * `<ol>`/`<li>`, never by the glyph, so a screen reader never hears "slash" between segments.
   */
  separator?: BreadcrumbSeparatorProp;
  /**
   * Ant Design `itemRender`. Replaces the anchor/text of ONE segment while this component keeps
   * owning the `<nav>`, the `<ol>`/`<li>`, the separators and `aria-current` — the parts that make
   * the trail a landmark. Use it to hand the trail a router `<Link>` (Inertia, react-router).
   */
  itemRender?: BreadcrumbItemRenderProp;
  /**
   * Fold the middle of a long trail (GDX-1489; the name and defaults are MUI Breadcrumbs', antd
   * has none). When there are MORE than `maxItems` crumbs, the first `itemsBeforeCollapse` and the
   * last `itemsAfterCollapse` stay, and the ones between become one "…" menu button whose entries
   * link to them. Unset: never folds. The current page is always among the last ones kept.
   */
  maxItems?: number;
  /** Crumbs kept before the fold. Default 1. */
  itemsBeforeCollapse?: number;
  /** Crumbs kept after the fold, the current page included. Default 1. */
  itemsAfterCollapse?: number;
};

/** One rendered position of the trail: a real crumb, or the fold standing for the hidden ones. */
type TrailEntry =
  | { kind: "item"; item: BreadcrumbItemProp; index: number }
  | { kind: "fold"; hidden: BreadcrumbItemProp[] };

function foldTrail(
  items: BreadcrumbProp,
  maxItems: number | undefined,
  before: number,
  after: number,
): TrailEntry[] {
  const all = items.map((item, index) => ({ kind: "item" as const, item, index }));
  const keepBefore = Math.max(0, Math.floor(before));
  const keepAfter = Math.max(1, Math.floor(after));
  if (maxItems === undefined || items.length <= maxItems || keepBefore + keepAfter >= items.length)
    return all;
  return [
    ...all.slice(0, keepBefore),
    { kind: "fold", hidden: items.slice(keepBefore, items.length - keepAfter) },
    ...all.slice(items.length - keepAfter),
  ];
}

export function Breadcrumb({
  items,
  currentItem = "last",
  linkComponent: LinkComponent = "a",
  ariaLabel,
  separator,
  itemRender,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
}: BreadcrumbProps) {
  const { t } = useTranslation();
  // `undefined` = "not asked for" → the default glyph. `""`/null = "asked for none" → nothing.
  const separatorNode: ReactNode =
    separator === undefined ? <ChevronRight aria-hidden="true" /> : separator;

  return (
    <nav aria-label={ariaLabel ?? t("navigation.breadcrumb.ariaLabel")} className="ui-breadcrumb">
      <ol
        className="ui-breadcrumb-list"
        data-ellipsis={trailEllipsis(
          items.map((item, index) =>
            shownCrumb(item, index === items.length - 1 && currentItem === "last"),
          ),
        )}
      >
        {foldTrail(items, maxItems, itemsBeforeCollapse, itemsAfterCollapse).map(
          (entry, position) => {
            const separatorSpan =
              position > 0 ? (
                <span className="ui-breadcrumb-separator" aria-hidden="true">
                  {separatorNode}
                </span>
              ) : null;
            if (entry.kind === "fold") {
              return (
                <li key="fold" className="ui-breadcrumb-item" data-fold="">
                  {separatorSpan}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="ui-breadcrumb-menu-trigger ui-breadcrumb-fold ui-focus-ring"
                      aria-label={t("navigation.breadcrumb.showHidden")}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent placement="bottomStart">
                      {entry.hidden.map((hidden, i) => (
                        <DropdownMenuItem key={hidden.to ?? i} asChild={hidden.to !== undefined}>
                          {hidden.to !== undefined ? (
                            <LinkComponent href={hidden.to} to={hidden.to}>
                              {hidden.label}
                            </LinkComponent>
                          ) : (
                            hidden.label
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            }
            const { index } = entry;
            const isLast = index === items.length - 1;
            const isCurrent = isLast && currentItem === "last";
            const item = shownCrumb(entry.item, isCurrent);

            return (
              <li
                key={item.to ?? index}
                className="ui-breadcrumb-item"
                data-ellipsis={item.ellipsis ? "" : undefined}
                data-current={isCurrent ? "" : undefined}
                style={
                  isCurrent && position > 0
                    ? ({ "--breadcrumb-crumbs-before": position } as CSSProperties)
                    : undefined
                }
              >
                {/* The separator LEADS the crumb it introduces (gh#1308): the item is one unbreakable
                  box, so a wrapped trail carries `›` onto the next line with the crumb instead of
                  leaving it alone at the end of the line before. */}
                {separatorSpan}
                {renderBreadcrumbSegment({
                  item,
                  index,
                  isLast,
                  isCurrent,
                  items,
                  itemRender,
                  LinkComponent,
                })}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  );
}

/**
 * One segment's INNER content. Three shapes, in priority order: a caller's `itemRender`, the
 * sibling dropdown (`item.menu`, antd `BreadcrumbItemType.menu`), then the plain link/current text
 * the trail has always rendered.
 */
function renderBreadcrumbSegment({
  item,
  index,
  isLast,
  isCurrent,
  items,
  itemRender,
  LinkComponent,
}: {
  item: BreadcrumbItemProp;
  index: number;
  isLast: boolean;
  isCurrent: boolean;
  items: BreadcrumbProp;
  itemRender?: BreadcrumbItemRenderProp;
  LinkComponent: ElementType;
}): ReactNode {
  if (itemRender) return itemRender(item, { index, isLast, items });

  if (item.menu) {
    const { items: menuItems, onSelect } = item.menu;
    return (
      <DropdownMenu>
        {/* The trigger is a real <button>: a segment that opens a menu is a control, and a
         * decorated <a> would announce as a link that goes nowhere (WAI-ARIA menu button). */}
        <DropdownMenuTrigger className="ui-breadcrumb-menu-trigger ui-focus-ring">
          {item.label}
          <ChevronDown className="ui-breadcrumb-menu-icon" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottomStart">
          {menuItems.map((entry) => (
            <DropdownMenuItem
              key={entry.value}
              disabled={entry.disabled}
              onSelect={onSelect ? () => onSelect(entry.value) : undefined}
              asChild={entry.to !== undefined}
            >
              {entry.to !== undefined ? (
                <LinkComponent href={entry.to} to={entry.to}>
                  {entry.label}
                </LinkComponent>
              ) : (
                entry.label
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (item.to && !isCurrent) {
    return (
      <BreadcrumbCrumbText item={item}>
        <LinkComponent href={item.to} to={item.to} className="ui-breadcrumb-link">
          {item.label}
        </LinkComponent>
      </BreadcrumbCrumbText>
    );
  }

  return (
    <BreadcrumbCrumbText item={item}>
      <span className="ui-breadcrumb-current" aria-current={isCurrent ? "page" : undefined}>
        {item.label}
      </span>
    </BreadcrumbCrumbText>
  );
}
