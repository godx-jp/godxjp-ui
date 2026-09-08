import type { CSSProperties, ReactNode } from "react";

import { Badge } from "./badge";

export type TreeListItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  depth?: number;
  active?: boolean;
  badge?: ReactNode;
};

export type TreeListProps = {
  items: TreeListItem[];
};

export function TreeList({ items }: TreeListProps) {
  return (
    <ul className="ui-tree-list">
      {items.map((item) => (
        <li
          className="ui-tree-item"
          data-active={item.active ? "true" : undefined}
          data-depth={Math.max(0, item.depth ?? 0)}
          style={{ "--tree-item-depth": Math.max(0, item.depth ?? 0) } as CSSProperties}
          aria-current={item.active ? "true" : undefined}
          key={item.id}
        >
          <div className="ui-tree-item-body">
            <div className="ui-tree-item-title">{item.title}</div>
            {item.description ? (
              <div className="ui-tree-item-description">{item.description}</div>
            ) : null}
          </div>
          {item.badge != null ? <Badge variant="secondary">{item.badge}</Badge> : null}
        </li>
      ))}
    </ul>
  );
}
