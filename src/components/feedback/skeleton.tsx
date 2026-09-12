// Skeleton family — shaped placeholders for loading states. Always pick the
// shape closest to the final layout; spinner-overlay is forbidden.
//
// The element presets and `SkeletonArticle` below are a port of antd 6's `components/skeleton/`
// (MIT): `Skeleton.tsx` owns the avatar/title/paragraph default matrix, `Element.tsx` the size and
// shape classes, `style/index.ts` the geometry. What is NOT ported is antd's chrome layer — it
// styles through CSS-in-JS design tokens and a `prefixCls`, where this library paints from CSS
// layers and the token tiers, and docs/DESIGN-AUTHORITY.md refuses `prefixCls`, `classNames` and
// `styles` by name. antd's wrapper-div-plus-inner-span per element is dropped for the same reason:
// it exists to hang two generated class sets, and one element carries both here.
import * as React from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { tableCellPaddingClass, tableRowHeightClass } from "../../lib/control-styles";
import type {
  SkeletonArticleProp,
  SkeletonAvatarProp,
  SkeletonButtonProp,
  SkeletonImageProp,
  SkeletonInputProp,
  SkeletonNodeProp,
  SkeletonProp,
  SkeletonWidth,
} from "../../props/components/feedback.prop";

export type {
  SkeletonProp,
  SkeletonProp as SkeletonProps,
  SkeletonWidth,
  SkeletonArticleProp,
  SkeletonArticleProp as SkeletonArticleProps,
  SkeletonAvatarProp,
  SkeletonAvatarProp as SkeletonAvatarProps,
  SkeletonButtonProp,
  SkeletonButtonProp as SkeletonButtonProps,
  SkeletonInputProp,
  SkeletonInputProp as SkeletonInputProps,
  SkeletonNodeProp,
  SkeletonNodeProp as SkeletonNodeProps,
  SkeletonImageProp,
  SkeletonImageProp as SkeletonImageProps,
} from "../../props/components/feedback.prop";

/** A measure reaches the DOM as a custom property, never as a raw `width` (rule #45). */
function measureStyle(width?: SkeletonWidth): React.CSSProperties | undefined {
  if (width === undefined) return undefined;
  const value = typeof width === "number" ? `${width}px` : width;
  return { "--skeleton-line-width": value } as React.CSSProperties;
}

function SkeletonBlock({ active, loading, className, children, ...props }: SkeletonProp) {
  // antd Skeleton.tsx: `loading || !("loading" in props)` — an OMITTED `loading` still renders the
  // placeholder, so the gate opens only when a consumer explicitly passes `false`.
  if (loading === false) return <>{children}</>;
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      data-active={active ? "" : undefined}
      className={cn("ui-skeleton-block", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * The five antd element presets are ONE block with a geometry attribute — they differ only in the
 * box they stand in for, and every box is derived from the `--control-height` tier the real
 * control sizes from (antd's `Element.tsx` does the same from `controlHeight`).
 */
function SkeletonElement({
  kind,
  size,
  shape,
  block,
  active,
  className,
  children,
}: {
  kind: "avatar" | "button" | "input" | "node" | "image";
  size?: SkeletonAvatarProp["size"];
  shape?: string;
  block?: boolean;
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SkeletonBlock
      active={active}
      data-skeleton-element={kind}
      data-size={size}
      data-shape={shape}
      data-block={block ? "" : undefined}
      className={className}
    >
      {children}
    </SkeletonBlock>
  );
}

/** Stands in for an `Avatar` — circle for a person, square for an entity mark. */
export function SkeletonAvatar({ size, shape = "circle", active, className }: SkeletonAvatarProp) {
  return (
    <SkeletonElement
      kind="avatar"
      size={size}
      shape={shape}
      active={active}
      className={className}
    />
  );
}

/** Stands in for a `Button` — two control-heights wide, like antd's `controlHeight * 2`. */
export function SkeletonButton({ size, shape, block, active, className }: SkeletonButtonProp) {
  return (
    <SkeletonElement
      kind="button"
      size={size}
      shape={shape}
      block={block}
      active={active}
      className={className}
    />
  );
}

/** Stands in for an `Input` — five control-heights wide, like antd's `controlHeight * 5`. */
export function SkeletonInput({ size, block, active, className }: SkeletonInputProp) {
  return (
    <SkeletonElement kind="input" size={size} block={block} active={active} className={className} />
  );
}

/** A square placeholder for a media or custom slot; `children` centre inside it. */
export function SkeletonNode({ active, children, className }: SkeletonNodeProp) {
  return (
    <SkeletonElement kind="node" active={active} className={className}>
      {children}
    </SkeletonElement>
  );
}

/** `SkeletonNode` carrying the image glyph — antd ships its own path; here it is the DS icon. */
export function SkeletonImage({ active, className }: SkeletonImageProp) {
  return (
    <SkeletonElement kind="image" active={active} className={className}>
      <ImageIcon aria-hidden="true" focusable="false" className="ui-skeleton-image-glyph" />
    </SkeletonElement>
  );
}

/* The three default matrices below are antd's `Skeleton.tsx`, value for value. */

function avatarDefaults(hasTitle: boolean, hasParagraph: boolean): SkeletonAvatarProp {
  if (hasTitle && !hasParagraph) return { size: "lg", shape: "square" };
  return { size: "lg", shape: "circle" };
}

function titleDefaultWidth(hasAvatar: boolean, hasParagraph: boolean): SkeletonWidth | undefined {
  if (!hasAvatar && hasParagraph) return "38%";
  if (hasAvatar && hasParagraph) return "50%";
  return undefined;
}

function paragraphDefaults(
  hasAvatar: boolean,
  hasTitle: boolean,
): { rows: number; width?: SkeletonWidth } {
  return {
    rows: !hasAvatar && hasTitle ? 3 : 2,
    width: !hasAvatar || !hasTitle ? "61%" : undefined,
  };
}

/** antd Paragraph.tsx `getWidth` — an array measures every row, a single value the LAST row. */
function rowWidth(
  index: number,
  rows: number,
  width?: SkeletonWidth | SkeletonWidth[],
): SkeletonWidth | undefined {
  if (Array.isArray(width)) return width[index];
  return rows - 1 === index ? width : undefined;
}

/**
 * SkeletonArticle — antd's own `<Skeleton>` shape: an optional avatar beside a heading line and a
 * paragraph. Reach for it for a comment, a profile card or a feed item; `Skeleton` stays the bare
 * block, and `SkeletonRows` / `SkeletonTable` / `SkeletonDetail` / `SkeletonStat` stay the house
 * shapes for a list, a table, a record and a KPI tile.
 */
export function SkeletonArticle({
  avatar = false,
  title = true,
  paragraph = true,
  round,
  active,
  loading,
  children,
  className,
}: SkeletonArticleProp) {
  if (loading === false) return <>{children}</>;

  const hasAvatar = Boolean(avatar);
  const hasTitle = Boolean(title);
  const hasParagraph = Boolean(paragraph);

  const avatarProps = {
    ...avatarDefaults(hasTitle, hasParagraph),
    ...(typeof avatar === "object" ? avatar : {}),
  };
  const titleWidth =
    (typeof title === "object" ? title.width : undefined) ??
    titleDefaultWidth(hasAvatar, hasParagraph);

  const paragraphBase = paragraphDefaults(hasAvatar, hasTitle);
  const paragraphProps = typeof paragraph === "object" ? paragraph : {};
  const rows = paragraphProps.rows ?? paragraphBase.rows;
  const paragraphWidth = paragraphProps.width ?? paragraphBase.width;

  return (
    <div
      aria-busy="true"
      data-slot="skeleton-article"
      data-avatar={hasAvatar ? "" : undefined}
      data-active={active ? "" : undefined}
      data-round={round ? "" : undefined}
      className={cn("ui-skeleton-article", className)}
    >
      {hasAvatar ? (
        <div className="ui-skeleton-article-header">
          <SkeletonAvatar {...avatarProps} />
        </div>
      ) : null}
      {hasTitle || hasParagraph ? (
        <div className="ui-skeleton-article-section">
          {hasTitle ? (
            <SkeletonBlock className="ui-skeleton-article-title" style={measureStyle(titleWidth)} />
          ) : null}
          {hasParagraph ? (
            // Deliberately divs, not antd's <ul><li>: its rows carry no text, so a real list would
            // announce "list, 3 items" out of an already `aria-busy` region.
            <div className="ui-skeleton-article-paragraph">
              {Array.from({ length: rows }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="ui-skeleton-article-line"
                  style={measureStyle(rowWidth(index, rows, paragraphWidth))}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Skeleton — the placeholder BLOCK, and the namespace antd hangs its element presets on. The
 * statics are the antd spelling (`Skeleton.Button`); the same components are also named exports, so
 * a consumer importing `SkeletonButton` finds it in the catalog.
 */
export const Skeleton = Object.assign(SkeletonBlock, {
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Input: SkeletonInput,
  Node: SkeletonNode,
  Image: SkeletonImage,
  Article: SkeletonArticle,
});

interface SkeletonRowsProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/** Skeleton for a flat list of rows (use inside a Card or section). */
export function SkeletonRows({ rows = 6, columns = 4, className }: SkeletonRowsProps) {
  return (
    <div className={cn("ui-skeleton-rows", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ui-skeleton-row">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "ui-skeleton-line",
                j === 0 ? "w-1/4" : j === columns - 1 ? "w-1/6" : "flex-1",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching the DataTable layout — header row + N body rows. */
export function SkeletonTable({ rows = 8, columns = 5 }: SkeletonRowsProps) {
  return (
    <div className="ui-skeleton-table" aria-busy="true">
      <div className={cn("ui-skeleton-table-head", tableCellPaddingClass, tableRowHeightClass)}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className={cn("ui-skeleton-caption", j === 0 ? "w-1/5" : "flex-1")} />
        ))}
      </div>
      <div className="ui-skeleton-table-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn("ui-skeleton-table-row", tableCellPaddingClass, tableRowHeightClass)}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className={cn("ui-skeleton-line", j === 0 ? "w-1/5" : "flex-1")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching a Card detail layout — title + 6 metadata rows. */
export function SkeletonDetail() {
  return (
    <div className="ui-skeleton-detail ui-skeleton-detail-stack" aria-busy="true">
      <Skeleton className="ui-skeleton-title w-1/3" />
      <Skeleton className="ui-skeleton-line w-1/2" />
      <div className="ui-skeleton-detail-box ui-skeleton-detail-stack">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ui-skeleton-detail-stack">
            <Skeleton className="ui-skeleton-detail-label" />
            <Skeleton className="ui-skeleton-detail-value" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching a stat card / dashboard tile. */
export function SkeletonStat() {
  return (
    <div className="ui-skeleton-stat" aria-busy="true">
      <Skeleton className="ui-skeleton-detail-label" />
      <Skeleton className="ui-skeleton-stat-value" />
      <Skeleton className="ui-skeleton-stat-caption" />
    </div>
  );
}
