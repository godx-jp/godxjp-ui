import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
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
 * Collapsed rail row — the icon only. HOVER (or keyboard focus) shows the label as a portaled
 * tooltip; CLICK navigates a leaf, or opens the group's submenu as a portaled menu. Both overlays
 * portal to the page root so they are never clipped by the sidebar's overflow.
 */
function CollapsedRow({ item, activeId, onSelect }: RowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const Icon = item.icon;
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  const iconButton = (
    <button
      type="button"
      className="sb-nav-item"
      data-active={active ? "true" : undefined}
      aria-current={!hasChildren && active ? "page" : undefined}
      aria-label={item.label}
      aria-haspopup={hasChildren ? "menu" : undefined}
      aria-expanded={hasChildren ? menuOpen : undefined}
      aria-disabled={item.disabled}
      onClick={() => {
        if (!hasChildren && !item.disabled) onSelect?.(item.id);
      }}
    >
      <span className="sb-icon">
        <Icon aria-hidden="true" />
      </span>
    </button>
  );

  // Leaf: hover → label tooltip, click → navigate.
  if (!hasChildren) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  // Group: hover → label tooltip, click → open the submenu menu. The tooltip auto-closes on click.
  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{iconButton}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        role="menu"
        className="sb-flyout-pop"
      >
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
              setMenuOpen(false);
              if (!child.disabled) onSelect?.(child.id);
            }}
          >
            <span className="sb-label">{child.label}</span>
          </button>
        ))}
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
