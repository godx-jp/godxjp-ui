import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * PageHeader — canonical page chrome strip with title + subtitle +
 * breadcrumb slot + action slot.
 *
 * Mirrors `K:comp-pageheader.html` (three reference patterns: compact,
 * overflow, stacked). The atomic CSS classes (`.ph`, `.ph-bar`,
 * `.ph-title`, `.ph-actions`, `.ph-tabs`, `.ph-body`) live in
 * `shell.css`. React owns the slot composition — visual values stay in
 * tokens.
 *
 * Variant semantics:
 *
 *   - `compact`  → 1 row, title truncates with ellipsis, actions never
 *                  wrap. Use for index pages with a single primary
 *                  CTA + 0–2 secondary actions.
 *   - `overflow` → 1 row, primary action + 2–3 icon buttons + "…"
 *                  overflow. Same height as `compact`; the variant flag
 *                  just signals intent in the JSX.
 *   - `stacked`  → 2 rows; meta / breadcrumb + tabs go on a second
 *                  row. Use when the page navigates between sub-views.
 *
 * Slots:
 *   - `breadcrumb`  → rendered above the title (xs muted text per
 *                     canonical). Passing this auto-bumps the layout to
 *                     "stacked" if `variant` is "compact".
 *   - `title`       → h1 (16px / 500 weight, ellipsis truncate)
 *   - `subtitle`    → adjacent baseline text (`.sub`, xs muted)
 *   - `actions`     → right-aligned slot, flex-shrink:0 / no wrap
 *   - `tabs`        → second-row tab strip (`.ph-tabs`); pair with
 *                     `<Tabs variant="line">` or a list of `<a>`
 *   - `body`        → third-row body strip (`.ph-body`), small muted
 *                     descriptive copy
 *
 * @example compact
 *   <PageHeader
 *     title="従業員シフト · カレンダー"
 *     subtitle="月単位の一括割当"
 *     actions={<><Button size="small">＋ 一括割当</Button></>}
 *   />
 *
 * @example stacked + tabs
 *   <PageHeader
 *     variant="stacked"
 *     breadcrumb={<Breadcrumb>...</Breadcrumb>}
 *     title="店舗別 · 月次レポート"
 *     actions={...}
 *     tabs={<nav>...</nav>}
 *   />
 */

export type PageHeaderVariant = "compact" | "overflow" | "stacked";

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Breadcrumb slot rendered above the title (auto-stacks). */
  breadcrumb?: ReactNode;
  /** Right-aligned action slot — icon buttons, buttons, segmented controls. */
  actions?: ReactNode;
  /** Tab strip on a dedicated second row (`.ph-tabs`). */
  tabs?: ReactNode;
  /** Descriptive body strip below the bar (`.ph-body`). */
  body?: ReactNode;
  /** Layout variant — defaults to `compact`. */
  variant?: PageHeaderVariant;
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      subtitle,
      breadcrumb,
      actions,
      tabs,
      body,
      variant,
      className,
      ...rest
    },
    ref,
  ) {
    // Auto-promote layout when richer slots are present.
    const resolved: PageHeaderVariant =
      variant ?? (breadcrumb || tabs ? "stacked" : "compact");

    const isStacked = resolved === "stacked";

    return (
      <section
        ref={ref}
        className={cn("ph", `ph-${resolved}`, className)}
        {...rest}
      >
        <div className="ph-bar">
          <div
            className={cn("ph-title", isStacked && "ph-title-stacked")}
          >
            {breadcrumb !== undefined && (
              <div className="ph-breadcrumb">{breadcrumb}</div>
            )}
            <div className="ph-title-row">
              <h1 className="ph-h1">{title}</h1>
              {subtitle !== undefined && (
                <span className="sub">{subtitle}</span>
              )}
            </div>
          </div>
          {actions !== undefined && (
            <div className="ph-actions">{actions}</div>
          )}
        </div>
        {tabs !== undefined && <div className="ph-tabs">{tabs}</div>}
        {body !== undefined && <div className="ph-body">{body}</div>}
      </section>
    );
  },
);
