import { type ReactNode } from "react";
import { cn } from "../cn";

/**
 * List — header + items + optional footer surface.
 *
 * Two consumption modes:
 *
 * Data-driven: pass `dataSource` + `renderItem`.
 *
 * Prop vocabulary follows cardinal rule 23 §B: `size` for dimensional
 * scale, `bordered` boolean for surface treatment, `cols` for grid
 * mode (column count). NEVER Ant's `itemLayout` / `grid` object —
 * `cols` is the one knob.
 *
 * @example data-driven
 *   <List
 *     dataSource={users}
 *     renderItem={(u) => (
 *       <UserRow avatar={<Avatar src={u.photo} />} title={u.name} description={u.role} />
 *     )}
 *   />
 *
 */

export interface ListProps<T = unknown> {
  /** Data array; required for data-driven mode. Omit when using children. */
  dataSource?: T[];
  /** Render fn for each datum. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Optional header content. */
  header?: ReactNode;
  /** Optional footer (e.g. pagination). */
  footer?: ReactNode;
  /** Title rendered above the list as a heading. */
  title?: ReactNode;
  /** Empty state when dataSource is empty (defaults to plain "No data"). */
  empty?: ReactNode;
  /** Dimensional scale. Default "default". */
  size?: "small" | "default" | "large";
  /** Wrap the list in a bordered surface. */
  bordered?: boolean;
  /** Show dividers between items. Defaults to true when `bordered`. */
  split?: boolean;
  /** Render a loading placeholder instead of items. */
  loading?: boolean;
  /** Grid mode — number of columns. Omit for list (1 column) layout. */
  cols?: number;
  className?: string;
}

export function List<T = unknown>({
  dataSource,
  renderItem,
  header,
  footer,
  title,
  empty,
  size = "default",
  bordered = false,
  split,
  loading = false,
  cols,
  className,
}: ListProps<T>) {
  const splitOn = split ?? bordered;

  const items: ReactNode = (() => {
    if (loading) {
      return <div className="list-loading">Loading…</div>;
    }
    if (dataSource !== undefined) {
      if (dataSource.length === 0) {
        return (
          <div className="list-empty">
            {empty ?? <span className="muted">No data</span>}
          </div>
        );
      }
      if (!renderItem) return null;
      return dataSource.map((item, i) => {
        const node = renderItem(item, i);
        return (
          <li key={i} className="list-item">
            {node}
          </li>
        );
      });
    }
    return null;
  })();

  const isGrid = typeof cols === "number" && cols > 1;

  return (
    <div
      className={cn(
        "list",
        `list-size-${size}`,
        isGrid && "list-grid",
        className,
      )}
      data-bordered={bordered || undefined}
      data-split={splitOn || undefined}
      data-cols={isGrid ? cols : undefined}
    >
      {title !== undefined && <div className="list-title">{title}</div>}
      {header !== undefined && <div className="list-header">{header}</div>}
      {isGrid ? (
        <ul className="list-items list-grid-inner">{items}</ul>
      ) : (
        <ul className="list-items">{items}</ul>
      )}
      {footer !== undefined && <div className="list-footer">{footer}</div>}
    </div>
  );
}
