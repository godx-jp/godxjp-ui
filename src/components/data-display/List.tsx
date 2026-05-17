import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * List — header + items + optional footer surface.
 *
 * Two consumption modes:
 *
 *  1. Data-driven: pass `dataSource` + `renderItem`. The renderItem
 *     callback returns a `<ListItem>` (or any node) per row.
 *  2. Compositional: render `<ListItem>` children inline.
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
 *       <ListItem avatar={<Avatar src={u.photo} />} title={u.name} description={u.role} />
 *     )}
 *   />
 *
 * @example compositional
 *   <List bordered>
 *     <ListItem title="Item 1" />
 *     <ListItem title="Item 2" />
 *   </List>
 */

export interface ListProps<T = unknown> {
  /** Data array; required for data-driven mode. Omit when using children. */
  dataSource?: T[];
  /** Render fn for each datum. Required when `dataSource` is provided. */
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
  children?: ReactNode;
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
  children,
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
      // `renderItem` returns a `<ListItem>` (which is itself an
      // `<li>`); wrapping it in another `<li>` produces invalid
      // nested-`<li>` HTML and a hydration warning. Clone to inject
      // the key without changing semantics.
      return dataSource.map((item, i) => {
        const node = renderItem(item, i);
        if (isValidElement(node)) {
          return cloneElement(node, { key: node.key ?? i });
        }
        return node;
      });
    }
    return children;
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

export interface ListItemProps extends Omit<ComponentProps<"li">, "title"> {
  /** Right-aligned action slot (typically buttons / links). */
  actions?: ReactNode[];
  /** Avatar / icon slot on the left side. */
  avatar?: ReactNode;
  /** Primary line of content. */
  title?: ReactNode;
  /** Secondary line beneath the title. */
  description?: ReactNode;
  /** Extra slot rendered to the right of the meta column. */
  extra?: ReactNode;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    { actions, avatar, title, description, extra, className, children, ...rest },
    ref,
  ) {
    const hasMeta = title !== undefined || description !== undefined;
    return (
      <li ref={ref} className={cn("list-item", className)} {...rest}>
        {avatar !== undefined && (
          <div className="list-item-avatar">{avatar}</div>
        )}
        {hasMeta ? (
          <div className="list-item-meta">
            {title !== undefined && (
              <div className="list-item-title">{title}</div>
            )}
            {description !== undefined && (
              <div className="list-item-desc">{description}</div>
            )}
            {children}
          </div>
        ) : (
          children !== undefined && (
            <div className="list-item-meta">{children}</div>
          )
        )}
        {extra !== undefined && (
          <div className="list-item-extra">{extra}</div>
        )}
        {actions && actions.length > 0 && (
          <div className="list-item-actions">
            {actions.map((action, i) => (
              <span key={i} className="list-item-action">
                {action}
              </span>
            ))}
          </div>
        )}
      </li>
    );
  },
);
