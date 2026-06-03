/** PageContainer — mandatory shell for every admin page (Ant Design PageHeader equivalent). */
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { densityClass, pageContainerVariantClass } from "../../lib/variants";
import type { PageContainerProp, PageInsetProp } from "../../props/components/layout.prop";

export type {
  PageContainerProp,
  PageContainerProp as PageContainerProps,
} from "../../props/components/layout.prop";
export type {
  BreadcrumbItemProp,
  BreadcrumbItemProp as BreadcrumbItem,
} from "../../props/vocabulary/navigation.prop";

export function PageContainerInset({ className, children, ...props }: PageInsetProp) {
  return (
    <div className={cn("ui-page-container-inset", className)} {...props}>
      {children}
    </div>
  );
}

function PageContainerRoot({
  title,
  subtitle,
  extra,
  footer,
  breadcrumb,
  linkComponent: LinkComponent = "a",
  density = "default",
  variant = "default",
  stickyFooter = false,
  children,
  className,
}: PageContainerProp) {
  return (
    <div
      className={cn(
        "ui-page-container",
        densityClass[density],
        pageContainerVariantClass[variant],
        stickyFooter && "ui-page-container--sticky-footer",
        className,
      )}
    >
      <header className="ui-page-header">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="ui-breadcrumb">
            <ol className="ui-breadcrumb-list">
              {breadcrumb.map((item, i) => {
                const isLast = i === breadcrumb.length - 1;
                return (
                  <li key={i} className="ui-inline-xs">
                    {item.to && !isLast ? (
                      <LinkComponent
                        href={item.to}
                        to={item.to}
                        className="hover:text-foreground hover:underline"
                      >
                        {item.label}
                      </LinkComponent>
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
            {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
          </div>
          {extra && <div className="ui-page-header-extra">{extra}</div>}
        </div>
      </header>

      {children != null && <div className="ui-page-body">{children}</div>}

      {footer && <footer className="ui-page-footer">{footer}</footer>}
    </div>
  );
}

export const PageContainer = Object.assign(PageContainerRoot, {
  Inset: PageContainerInset,
});
