import type { ReactNode } from "react";
import { cn } from "../cn";

// PageContent — canonical page container for every screen rendered
// inside <AppShell>. Inspired by Ant Design's PageContainer:
//
//   <PageContent
//     title="Profile"
//     subtitle="Display name, avatar, pronouns, locale, timezone"
//     breadcrumb={<Breadcrumb>…</Breadcrumb>}
//     extra={<Button>Save</Button>}
//     footer={<Button>Cancel</Button>}
//   >
//     {/* main content */}
//   </PageContent>
//
// Every prop is optional. Padding defaults to the canonical "default"
// step (16px @ default density, 12px compact, 20px comfortable) sourced
// from the `--density-page` token so spacing stays uniform across the
// whole system. Pass `padding="none"` to opt out (full-bleed dashboards,
// editor canvases, etc.).
//
// Per CLAUDE.md hard rule #15 + rule 12 Clause 1, services do NOT
// re-implement a page header / hero / content wrapper. Compose this
// instead.

// Aliased to the shared `PaddingProp` so Card / PageHeader / PageContent
// all speak the same vocabulary (`tight` / `default` / `cozy` / `none`).
// Renamed from the previous density-style names (`compact` / `comfortable`).
import type { PaddingProp } from "../../props";
export type PageContentPadding = PaddingProp;

export interface PageContentProps {
  /** Page title — usually rendered as <h1>. */
  title?: ReactNode;
  /** Short page description under the title. */
  subtitle?: ReactNode;
  /**
   * Right-aligned slot in the header — typically primary actions
   * (Save, Cancel, New, etc.) or settings buttons.
   */
  extra?: ReactNode;
  /** Optional breadcrumb rendered above the title. */
  breadcrumb?: ReactNode;
  /** Optional tabs row rendered under the title block, above content. */
  tabs?: ReactNode;
  /** Main content. */
  children?: ReactNode;
  /** Page-level footer (sticky-feeling band under content). */
  footer?: ReactNode;
  /** Padding step — default = system-wide standard. */
  padding?: PageContentPadding;
  /**
   * Header behaviour. `default` shows the title block; `none` skips it
   * entirely (when the page itself renders its own custom header).
   */
  header?: "default" | "none";
  className?: string;
}

// Padding is encoded as a data attribute resolved by tokens-ext.css
// (`.page-content[data-padding="default"] { padding: var(--density-page); }` etc.).
// Going through Tailwind utilities is unreliable because v4's content
// scanner doesn't always pick up token-named arbitrary spacing across
// package boundaries; a CSS class is deterministic.

export function PageContent({
  title,
  subtitle,
  extra,
  breadcrumb,
  tabs,
  children,
  footer,
  padding = "default",
  header = "default",
  className,
}: PageContentProps) {
  const showHeader =
    header !== "none" && (breadcrumb || title || subtitle || extra);

  return (
    <section
      className={cn("page-content", className)}
      data-padding={padding}
    >
      {showHeader && (
        <header className="page-content-header">
          {breadcrumb && (
            <div className="page-content-breadcrumb">{breadcrumb}</div>
          )}
          <div className="page-content-titlebar">
            <div className="page-content-titlegroup">
              {title && <h1 className="page-content-title">{title}</h1>}
              {subtitle && (
                <p className="page-content-subtitle">{subtitle}</p>
              )}
            </div>
            {extra && <div className="page-content-extra">{extra}</div>}
          </div>
          {tabs && <div className="page-content-tabs">{tabs}</div>}
        </header>
      )}
      {children !== undefined && (
        <div className="page-content-body">{children}</div>
      )}
      {footer && <footer className="page-content-footer">{footer}</footer>}
    </section>
  );
}
