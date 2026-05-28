/** @deprecated Prefer PageContainer. Header-only legacy shell. */
/* eslint-disable @typescript-eslint/no-deprecated -- legacy component intentionally uses PageHeaderProp */
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import type { PageHeaderProp } from "../../props/components/layout.prop";

export type { PageHeaderProp } from "../../props/components/layout.prop";
export type { BreadcrumbItemProp as BreadcrumbItem } from "../../props/vocabulary/navigation.prop";

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProp) {
  return (
    <header className={cn("ui-page-header", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="ui-breadcrumb">
          <ol className="ui-breadcrumb-list">
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <li key={i} className="ui-inline-xs">
                  {item.to && !isLast ? (
                    <Link to={item.to} className="hover:text-foreground hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-foreground" : ""}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="size-3" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="ui-page-header-row">
        <div className="min-w-0">
          <h1 className="ui-page-title">{title}</h1>
          {description && <p className="ui-page-subtitle">{description}</p>}
        </div>
        {actions && <div className="ui-inline-sm shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
