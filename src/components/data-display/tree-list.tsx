import type { ReactNode } from "react";
import { ChevronRight, Package } from "lucide-react";

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
          data-depth={item.depth ?? 0}
          aria-current={item.active ? "true" : undefined}
          key={item.id}
        >
          <ChevronRight aria-hidden="true" />
          <Package aria-hidden="true" />
          <div className="ui-tree-item-body">
            <div className="ui-tree-item-title">
              {item.active ? <span className="sr-only">Current: </span> : null}
              {item.title}
            </div>
            {item.description ? (
              <div className="ui-tree-item-description">{item.description}</div>
            ) : null}
          </div>
          {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
        </li>
      ))}
    </ul>
  );
}
