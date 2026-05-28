import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import type { SidebarProp } from "../../props/components/layout.prop";

export type {
  SidebarItemProp as SidebarItem,
  SidebarProductProp as SidebarProduct,
  SidebarProp,
  SidebarProp as SidebarProps,
  SidebarSectionProp as SidebarSection,
} from "../../props/components/layout.prop";

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
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeId;

                return (
                  <button
                    type="button"
                    className={cn("sb-nav-item")}
                    data-active={isActive ? "true" : undefined}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={item.disabled}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    key={item.id}
                    onClick={() => {
                      if (!item.disabled) onSelect?.(item.id);
                    }}
                  >
                    <span className="sb-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    {!collapsed && <span className="sb-label">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && item.badge !== "" ? (
                      <span className="sb-badge">{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="sb-footer">{footer}</div> : null}
    </div>
  );
}
