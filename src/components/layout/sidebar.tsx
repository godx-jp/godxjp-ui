import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type {
  SidebarItemData,
  SidebarItemProp,
  SidebarProp,
} from "../../props/components/layout.prop";

export type {
  SidebarItemData,
  SidebarProductProp as SidebarProduct,
  SidebarProp,
  SidebarProp as SidebarProps,
} from "../../props/components/layout.prop";

type RenderItem = (item: SidebarItemData) => React.ReactNode;

type SidebarHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type SidebarSectionProps = {
  label?: string;
  collapsed?: boolean;
  children?: React.ReactNode;
};
type SidebarItemProps = {
  item: SidebarItemData;
  active?: boolean;
  sub?: boolean;
  onActivate?: (id: string) => void;
  renderItem?: RenderItem;
};

export function SidebarHeader({ children, className, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("sb-brand", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarSection({
  label,
  collapsed = false,
  children,
  className,
  ...props
}: SidebarSectionProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("sb-section", className)} {...props}>
      {label && !collapsed ? <div className="sb-section-label">{label}</div> : null}
      <div className="sb-nav">{children}</div>
    </div>
  );
}

export function SidebarItem({
  item,
  active = false,
  sub = false,
  onActivate,
  renderItem,
  children,
  ...props
}: SidebarItemProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  const Icon = item.icon;
  const showBadge = item.badge !== undefined && item.badge !== "";
  const disabled = item.disabled || props.disabled;
  const content = children ?? (renderItem ? renderItem(item) : undefined);
  return (
    <button
      type="button"
      className={cn("sb-nav-item", sub && "sb-nav-item--sub")}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
      {...props}
      onClick={() => {
        if (disabled) return;
        onActivate?.(item.id);
      }}
    >
      {content ? (
        content
      ) : (
        <>
          {!sub ? (
            <span className="sb-icon">
              <Icon aria-hidden="true" />
            </span>
          ) : null}
          <span className="sb-label">{item.label}</span>
          {showBadge ? <span className="sb-badge">{item.badge}</span> : null}
        </>
      )}
    </button>
  );
}

function isItemActive(item: SidebarItemProp, activeId: string): boolean {
  if (item.id === activeId) return true;
  return (item.children ?? []).some((child) => isItemActive(child, activeId));
}

type RowProps = {
  item: SidebarItemProp;
  activeId: string;
  onSelect?: (id: string) => void;
  sub?: boolean;
  renderItem?: RenderItem;
};

function NavLeaf({ item, activeId, onSelect, sub = false, renderItem }: RowProps) {
  const active = item.id === activeId;
  return (
    <SidebarItem
      item={item}
      active={active}
      onActivate={onSelect}
      sub={sub}
      renderItem={renderItem}
    />
  );
}

function NavLeafsInGroup({
  children,
  activeId,
  onSelect,
  renderItem,
}: {
  children: SidebarItemProp[];
  activeId: string;
  onSelect?: (id: string) => void;
  renderItem?: RenderItem;
}) {
  return children.map((child) => (
    <NavLeaf
      key={child.id}
      item={child}
      activeId={activeId}
      onSelect={onSelect}
      sub
      renderItem={renderItem}
    />
  ));
}

function NavGroup({ item, activeId, onSelect, renderItem }: RowProps) {
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
          {children.length > 0 ? (
            <NavLeafsInGroup activeId={activeId} onSelect={onSelect} renderItem={renderItem}>
              {children}
            </NavLeafsInGroup>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Collapsed rail row — the icon only. HOVER (or keyboard focus) shows the label as a portaled
 * tooltip; CLICK navigates a leaf, or opens the group's submenu as a portaled menu. Both overlays
 * ported to the page root so they are never clipped by the sidebar's overflow.
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

  if (!hasChildren) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

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
  children,
  renderItem,
  footer,
}: SidebarProp) {
  const { t } = useTranslation();
  const resolvedSections = sections ?? [];

  return (
    <div className="sb-root" data-collapsed={collapsed ? "true" : undefined}>
      {brand !== undefined ? (
        <SidebarHeader>{brand}</SidebarHeader>
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
          {!collapsed ? (
            <span className="sb-product-meta">
              <span className="sb-product-name">{product.name}</span>
              {product.role ? <span className="sb-product-tenant">{product.role}</span> : null}
            </span>
          ) : null}
          {!collapsed ? (
            <span className="sb-product-caret">
              <ChevronDown aria-hidden="true" />
            </span>
          ) : null}
        </button>
      ) : null}

      <nav className="sb-nav-scroll" aria-label={t("layout.sidebar.ariaLabel")}>
        {children ??
          resolvedSections.map((section, sectionIndex) => (
            <SidebarSection
              key={section.label ?? sectionIndex}
              label={section.label}
              collapsed={collapsed}
            >
              {section.items.map((item) =>
                collapsed ? (
                  <CollapsedRow key={item.id} item={item} activeId={activeId} onSelect={onSelect} />
                ) : item.children && item.children.length > 0 ? (
                  <NavGroup
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onSelect={onSelect}
                    renderItem={renderItem}
                  />
                ) : (
                  <NavLeaf
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onSelect={onSelect}
                    renderItem={renderItem}
                  />
                ),
              )}
            </SidebarSection>
          ))}
      </nav>

      {footer ? <div className="sb-footer">{footer}</div> : null}
    </div>
  );
}
