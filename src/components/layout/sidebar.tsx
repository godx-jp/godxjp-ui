import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
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
  collapsed: boolean;
  onSelect?: (id: string) => void;
  sub?: boolean;
};

/** A leaf nav row — icon + label (+ badge). When collapsed it carries a hover flyout tooltip. */
function NavLeaf({ item, activeId, collapsed, onSelect, sub = false }: RowProps) {
  const Icon = item.icon;
  const active = item.id === activeId;

  return (
    <button
      type="button"
      className={cn("sb-nav-item", sub && "sb-nav-item--sub")}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      aria-disabled={item.disabled}
      aria-label={collapsed ? item.label : undefined}
      onClick={() => {
        if (!item.disabled) onSelect?.(item.id);
      }}
    >
      {!sub ? (
        <span className="sb-icon">
          <Icon aria-hidden="true" />
        </span>
      ) : null}
      {!collapsed && <span className="sb-label">{item.label}</span>}
      {!collapsed && item.badge !== undefined && item.badge !== "" ? (
        <span className="sb-badge">{item.badge}</span>
      ) : null}
      {collapsed && !sub ? <span className="sb-flyout">{item.label}</span> : null}
    </button>
  );
}

/** A group row with a collapsible submenu. Auto-open when a child is active; parent reads active too. */
function NavGroup({ item, activeId, collapsed, onSelect }: RowProps) {
  const Icon = item.icon;
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];

  // Collapsed rail: no room to expand inline — reveal the submenu as a hover/focus flyout.
  // The flyout is a SIBLING of the trigger (never nest buttons) so its child links are valid.
  if (collapsed) {
    return (
      <div className="sb-nav-fly">
        <button
          type="button"
          className="sb-nav-item"
          data-active={active ? "true" : undefined}
          aria-label={item.label}
          aria-haspopup="menu"
        >
          <span className="sb-icon">
            <Icon aria-hidden="true" />
          </span>
        </button>
        <span className="sb-flyout sb-flyout--group" role="menu">
          <span className="sb-flyout-title">{item.label}</span>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              role="menuitem"
              className="sb-nav-item sb-nav-item--sub"
              data-active={child.id === activeId ? "true" : undefined}
              aria-current={child.id === activeId ? "page" : undefined}
              onClick={() => {
                if (!child.disabled) onSelect?.(child.id);
              }}
            >
              <span className="sb-label">{child.label}</span>
            </button>
          ))}
        </span>
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={active}>
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
            <NavLeaf
              key={child.id}
              item={child}
              activeId={activeId}
              collapsed={false}
              onSelect={onSelect}
              sub
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
                item.children && item.children.length > 0 ? (
                  <NavGroup
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    collapsed={collapsed}
                    onSelect={onSelect}
                  />
                ) : (
                  <NavLeaf
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    collapsed={collapsed}
                    onSelect={onSelect}
                  />
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
