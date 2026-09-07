import { ChevronDown, ChevronRight } from "lucide-react";
import type { ElementType, ReactNode } from "react";

import { useTranslation } from "../../i18n/use-translation";
import type {
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
};

export function Breadcrumb({
  items,
  linkComponent: LinkComponent = "a",
  ariaLabel,
  separator,
  itemRender,
}: BreadcrumbProps) {
  const { t } = useTranslation();
  // `undefined` = "not asked for" → the default glyph. `""`/null = "asked for none" → nothing.
  const separatorNode: ReactNode =
    separator === undefined ? <ChevronRight aria-hidden="true" /> : separator;

  return (
    <nav aria-label={ariaLabel ?? t("navigation.breadcrumb.ariaLabel")} className="ui-breadcrumb">
      <ol className="ui-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.to ?? index} className="ui-breadcrumb-item">
              {renderBreadcrumbSegment({ item, index, isLast, items, itemRender, LinkComponent })}
              {!isLast ? (
                <span className="ui-breadcrumb-separator" aria-hidden="true">
                  {separatorNode}
                </span>
              ) : null}
            </li>
          );
        })}
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
  items,
  itemRender,
  LinkComponent,
}: {
  item: BreadcrumbItemProp;
  index: number;
  isLast: boolean;
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

  if (item.to && !isLast) {
    return (
      <LinkComponent href={item.to} to={item.to} className="ui-breadcrumb-link">
        {item.label}
      </LinkComponent>
    );
  }

  return (
    <span className="ui-breadcrumb-current" aria-current={isLast ? "page" : undefined}>
      {item.label}
    </span>
  );
}
