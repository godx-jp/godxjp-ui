import { forwardRef } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../cn"

export interface BreadcrumbOption {
  label: ReactNode
  href?: string
  current?: boolean
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbOption[]
  separator?: ReactNode
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator = "/", ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("breadcrumb", className)}
      {...props}
    >
      {items.map((item, index) => (
        <span key={`${item.href ?? "crumb"}-${index}`} className="breadcrumb-node">
          {item.href ? (
            <a
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cn("breadcrumb-crumb", item.current && "current")}
            >
              {item.label}
            </a>
          ) : (
            <span
              aria-current={item.current ? "page" : undefined}
              className={cn("breadcrumb-crumb", item.current && "current")}
            >
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span aria-hidden="true" className="breadcrumb-sep">
              {separator}
            </span>
          )}
        </span>
      ))}
    </nav>
  ),
)
Breadcrumb.displayName = "Breadcrumb"
