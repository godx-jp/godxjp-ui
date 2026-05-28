import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { BreadcrumbProp } from "../../props/vocabulary/navigation.prop";

export type BreadcrumbProps = {
  items: BreadcrumbProp;
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="ui-breadcrumb">
      <ol className="ui-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.to ?? index} className="ui-breadcrumb-item">
              {item.to && !isLast ? (
                <Link to={item.to} className="ui-breadcrumb-link">
                  {item.label}
                </Link>
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
