import { ChevronRight } from "lucide-react";
import type { ElementType } from "react";

import { useTranslation } from "../../i18n/use-translation";
import type { BreadcrumbProp } from "../../props/vocabulary/navigation.prop";

export type BreadcrumbProps = {
  items: BreadcrumbProp;
  linkComponent?: ElementType;
  /**
   * Override the `<nav>` landmark's accessible name. Defaults to a localized "Breadcrumb".
   * Multiple Breadcrumb instances on one page/view need a DISTINCT name each — two `<nav>`
   * landmarks sharing one name/role fail axe's `landmark-unique` (WCAG 2.4.1 / 1.3.1).
   */
  ariaLabel?: string;
};

export function Breadcrumb({
  items,
  linkComponent: LinkComponent = "a",
  ariaLabel,
}: BreadcrumbProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={ariaLabel ?? t("navigation.breadcrumb.ariaLabel")} className="ui-breadcrumb">
      <ol className="ui-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.to ?? index} className="ui-breadcrumb-item">
              {item.to && !isLast ? (
                <LinkComponent href={item.to} to={item.to} className="ui-breadcrumb-link">
                  {item.label}
                </LinkComponent>
              ) : (
                <span className="ui-breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
