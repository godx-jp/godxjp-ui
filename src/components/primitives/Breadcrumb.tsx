import { forwardRef } from "react"
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react"
import { cn } from "./cn"

// Breadcrumb — canonical nav breadcrumb atom.
//
// Renders the `.breadcrumb` CSS class from tokens.css. Consumers
// compose crumbs via the exported helpers:
//
//   <Breadcrumb>
//     <BreadcrumbItem href="/overview">GoDX</BreadcrumbItem>
//     <BreadcrumbSep />
//     <BreadcrumbItem current>Profile</BreadcrumbItem>
//   </Breadcrumb>
//
// `href` is optional — if omitted, BreadcrumbItem renders a <span>.
// Wrap in your router's link component via the `asChild` pattern when
// you need `<Link>` semantics:
//
//   <BreadcrumbItem>
//     <NavLink to="/overview">GoDX</NavLink>
//   </BreadcrumbItem>

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("breadcrumb", className)}
      {...props}
    >
      {children}
    </nav>
  ),
)
Breadcrumb.displayName = "Breadcrumb"

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLElement> {
  href?: string
  current?: boolean
  children: ReactNode
}

export const BreadcrumbItem = forwardRef<HTMLElement, BreadcrumbItemProps>(
  ({ className, href, current, children, ...props }, ref) => {
    const cls = cn("breadcrumb-crumb", current && "current", className)
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-current={current ? "page" : undefined}
          className={cls}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        aria-current={current ? "page" : undefined}
        className={cls}
        {...props}
      >
        {children}
      </span>
    )
  },
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export function BreadcrumbSep() {
  return (
    <span aria-hidden="true" className="breadcrumb-sep">
      /
    </span>
  )
}
