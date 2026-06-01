import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { cn } from "../../lib/utils";
import type { SidebarItemProp, SidebarProp } from "../../props/components/layout.prop";

export type {
  SidebarItemProp as SidebarItem,
  SidebarProductProp as SidebarProduct,
  SidebarProp,
  SidebarProp as SidebarProps,
  SidebarSectionProp as SidebarSection,
} from "../../props/components/layout.prop";

/** An item is active when it is the active id, or — for a group — when any descendant is. */
function isItemActive(item: SidebarItemProp, activeId: string): boolean {
  if (item.id === activeId) return true;
  return (item.children ?? []).some((child) => isItemActive(child, activeId));
}

type RowProps = {
  item: SidebarItemProp;
  activeId: string;
  onSelect?: (id: string) => void;
  sub?: boolean;
};

/** A leaf nav row (expanded rail) — icon + label (+ badge). */
function NavLeaf({ item, activeId, onSelect, sub = false }: RowProps) {
  const Icon = item.icon;
  const active = item.id === activeId;

  return (
    <button
      type="button"
      className={cn("sb-nav-item", sub && "sb-nav-item--sub")}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      aria-disabled={item.disabled}
      onClick={() => {
        if (!item.disabled) onSelect?.(item.id);
      }}
    >
      {!sub ? (
        <span className="sb-icon">
          <Icon aria-hidden="true" />
        </span>
      ) : null}
      <span className="sb-label">{item.label}</span>
      {item.badge !== undefined && item.badge !== "" ? (
        <span className="sb-badge">{item.badge}</span>
      ) : null}
    </button>
  );
}

/** A group row with an inline collapsible submenu (expanded rail). Auto-open + active when a child is. */
function NavGroup({ item, activeId, onSelect }: RowProps) {
  const Icon = item.icon;
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];

  return (
    <Collapsible defaultOpen={active} className="sb-nav-group">
      <CollapsibleTrigger
        className="sb-nav-item sb-nav-group-trigger"
        data-active={active ? "true" : undefined}
      >
        <span className="sb-icon">
          <Icon aria-hidden="true" />
        </span>
        <span className="sb-label">{item.label}</span>
        <ChevronDown className="sb-chevron" aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="sb-nav-sub">
          {children.map((child) => (
            <NavLeaf key={child.id} item={child} activeId={activeId} onSelect={onSelect} sub />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Collapsed rail row — the icon, with a hover/focus flyout that PORTALS out of the rail (so it is
 * never clipped by the sidebar's overflow). A leaf shows its label as a tooltip; a group reveals
 * its submenu so collapsed items stay identifiable and reachable.
 */
function CollapsedRow({ item, activeId, onSelect }: RowProps) {
  const [open, setOpen] = React.useState(false);
  const Icon = item.icon;
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="sb-nav-item"
          data-active={active ? "true" : undefined}
          aria-current={!hasChildren && active ? "page" : undefined}
          aria-label={item.label}
          aria-haspopup={hasChildren ? "menu" : undefined}
          aria-disabled={item.disabled}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
          onClick={() => {
            if (!hasChildren && !item.disabled) onSelect?.(item.id);
          }}
        >
          <span className="sb-icon">
            <Icon aria-hidden="true" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        role={hasChildren ? "menu" : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={cn("sb-flyout-pop", !hasChildren && "sb-flyout-pop--label")}
      >
        {hasChildren ? (
          <>
            <div className="sb-flyout-title">{item.label}</div>
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                role="menuitem"
                className="sb-nav-item"
                data-active={child.id === activeId ? "true" : undefined}
                aria-current={child.id === activeId ? "page" : undefined}
                onClick={() => {
                  hide();
                  if (!child.disabled) onSelect?.(child.id);
                }}
              >
                <span className="sb-label">{child.label}</span>
              </button>
            ))}
          </>
        ) : (
          <span className="sb-flyout-label">{item.label}</span>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function Sidebar({
  activeId,
  onSelect,
  sections,
  product,
  onProductClick,
  brand,
  collapsed = false,
  footer,
}: SidebarProp) {
  return (
    <div className="sb-root" data-collapsed={collapsed ? "true" : undefined}>
      {brand !== undefined ? (
        <div className="sb-brand">{brand}</div>
      ) : product ? (
        <button
          type="button"
          className="sb-product"
          onClick={onProductClick}
          aria-label={product.name}
        >
          <span
            className="sb-logo-mark"
            style={{ background: product.color ?? "hsl(var(--attention))" }}
          >
            {product.name[0]?.toUpperCase() ?? "?"}
          </span>
          {!collapsed && (
            <span className="sb-product-meta">
              <span className="sb-product-name">{product.name}</span>
              {product.role ? <span className="sb-product-tenant">{product.role}</span> : null}
            </span>
          )}
          {!collapsed && (
            <span className="sb-product-caret">
              <ChevronDown aria-hidden="true" />
            </span>
          )}
        </button>
      ) : null}

      <div className="sb-nav-scroll">
        {sections.map((section, sectionIndex) => (
          <div className="sb-section" key={section.label ?? sectionIndex}>
            {section.label && !collapsed ? (
              <div className="sb-section-label">{section.label}</div>
            ) : null}
            <div className="sb-nav" role="navigation">
              {section.items.map((item) =>
                collapsed ? (
                  <CollapsedRow key={item.id} item={item} activeId={activeId} onSelect={onSelect} />
                ) : item.children && item.children.length > 0 ? (
                  <NavGroup key={item.id} item={item} activeId={activeId} onSelect={onSelect} />
                ) : (
                  <NavLeaf key={item.id} item={item} activeId={activeId} onSelect={onSelect} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="sb-footer">{footer}</div> : null}
    </div>
  );
}
