import { ChevronDown } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../primitives/cn";
import type { ForgeProduct } from "../../data/products";

// Sidebar item shape — what consumers pass to <Sidebar nav={…} />.
//
// `icon` is a lucide component (or any React component that accepts a
// `size` prop). `badge` is a numeric or string count rendered after
// the label.
export interface SidebarItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  /** Optional numeric badge (e.g. open issue count). */
  badge?: string | number;
  /** Disabled rows are dimmed and unclickable. */
  disabled?: boolean;
}

export interface SidebarSection {
  /** Section label shown above the nav items. */
  label?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  /** Currently active route id — must match an item's `id`. */
  activeId: string;
  /** Click handler — called with the item's `id`. */
  onSelect: (id: string) => void;
  sections: SidebarSection[];
  /** Product = the org-shaped tenant shown in the top product chip. */
  product: ForgeProduct;
  /** Click to open the product switcher dropdown (owned by parent). */
  onProductClick?: () => void;
  collapsed?: boolean;
  footer?: ReactNode;
}

export function Sidebar({
  activeId,
  onSelect,
  sections,
  product,
  onProductClick,
  collapsed = false,
  footer,
}: SidebarProps) {
  const { t } = useTranslation();
  void t; // future-proof — tooltips will localize here.

  return (
    <>
      {/* Top product chip — opens product switcher. */}
      <button
        type="button"
        className="sb-product"
        onClick={onProductClick}
        aria-label={product.name}
      >
        <span
          className="sb-logo-mark"
          style={{ background: product.color }}
        >
          {product.name[0]?.toUpperCase() ?? "?"}
        </span>
        {!collapsed && (
          <span
            className="sb-product-meta col flex-1 min-w-0"
            style={{ display: "flex" }}
          >
            <span className="sb-product-name">{product.name}</span>
            <span className="sb-product-tenant">{product.role}</span>
          </span>
        )}
        {!collapsed && (
          <span className="sb-product-tenant shrink-0">
            <ChevronDown size={14} />
          </span>
        )}
      </button>

      {/* Nav sections — grouped, separated by a thin divider. */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, i) => (
          <div key={section.label ?? i} className="sb-section">
            {section.label && !collapsed && (
              <div className="sb-section-label">{section.label}</div>
            )}
            <div className="sb-nav" role="navigation">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeId;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={cn("sb-nav-item")}
                    data-active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={item.disabled}
                    onClick={() => !item.disabled && onSelect(item.id)}
                  >
                    <span className="sb-icon">
                      <Icon size={16} />
                    </span>
                    <span className="sb-label">{item.label}</span>
                    {item.badge !== undefined && item.badge !== "" && (
                      <span className="sb-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {footer && <div className="sb-footer">{footer}</div>}
    </>
  );
}
