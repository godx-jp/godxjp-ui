import { ChevronRight } from "lucide-react";
import type { ElementType } from "react";

import type { BreadcrumbProp } from "../../props/vocabulary/navigation.prop";

export type BreadcrumbProps = {
  items: BreadcrumbProp;
  linkComponent?: ElementType;
};

export function Breadcrumb({ items, linkComponent: LinkComponent = "a" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="ui-breadcrumb">
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
