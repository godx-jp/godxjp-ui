import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type {
  SidebarItemData,
  SidebarItemProp,
  SidebarLinkComponentProp,
  SidebarProp,
  SidebarRenderItemProp,
} from "../../props/components/layout.prop";

export type {
  SidebarItemData,
  SidebarLinkComponentProp,
  SidebarLinkProp,
  SidebarProductProp as SidebarProduct,
  SidebarProp,
  SidebarProp as SidebarProps,
  SidebarRenderItemProp,
} from "../../props/components/layout.prop";

type RenderItem = (item: SidebarItemData, rowProps: SidebarRenderItemProp) => React.ReactNode;

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
  /**
   * Framework-router link element TYPE (gh#213). The row content stays library-composed — see
   * {@link SidebarLinkProp}. Applied only when `item.href` is set.
   */
  linkComponent?: SidebarLinkComponentProp;
  /**
   * Radix-style element swap: the single child element (a router `<Link>`) BECOMES the row and the
   * library injects its composed icon + label + badge as that element's children (gh#213). Use it
   * when you compose `SidebarItem` by hand instead of passing `sections` + `linkComponent`.
   */
  asChild?: boolean;
  /** @deprecated Use `linkComponent` / `asChild` — see {@link SidebarProp.renderItem}. */
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

/**
 * The 16px leading icon slot. The `.sb-icon` box is ALWAYS rendered (never conditionally dropped)
 * so a row whose data carries no `icon` keeps canonical geometry — same 32px row height, same 10px
 * icon↔label gap, labels still aligned in one column with their icon-bearing siblings. Rendering
 * `item.icon` unguarded crashed the whole shell ("Element type is invalid… got: undefined") for
 * API-driven / untyped nav data; `icon` stays REQUIRED in `SidebarItemProp`, this is the runtime
 * safety net. Colour comes from `--sidebar-nav-icon-foreground` (see `Sidebar`).
 */
function SidebarIcon({ icon: Icon }: { icon?: SidebarItemData["icon"] }) {
  return <span className="sb-icon">{Icon ? <Icon aria-hidden="true" /> : null}</span>;
}

/**
 * THE canonical row composition — the single place that decides what a Sidebar row contains
 * (gh#213). Every row shape renders this: the leaf button, the `href` anchor, the `linkComponent`
 * router link, the `asChild` element and the group trigger. Because the LIBRARY owns it, a consumer
 * that supplies only a `<Link>` element can no longer drop the icon or the badge — the production
 * regression that motivated the issue.
 *
 * - `sub` rows are label-only (the submenu indents under the parent's icon column).
 * - `iconOnly` is the collapsed rail: the label moves to `aria-label` + a portaled tooltip, and the
 *   badge is dropped (the rail hides `.sb-label`/`.sb-badge` in CSS anyway).
 */
function SidebarRowContent({
  item,
  sub = false,
  iconOnly = false,
}: {
  item: SidebarItemData;
  sub?: boolean;
  iconOnly?: boolean;
}) {
  if (iconOnly) return <SidebarIcon icon={item.icon} />;
  const showBadge = item.badge !== undefined && item.badge !== "";
  return (
    <>
      {!sub ? <SidebarIcon icon={item.icon} /> : null}
      <span className="sb-label">{item.label}</span>
      {showBadge ? (
        // `data-tone` is emitted ONLY for the emphasis tone (rule #44: present-when-on,
        // absent-when-off), so a rail that never sets `badgeTone` renders the exact same node it
        // always did and no consumer selector has to out-specify a marker meaning "unchanged".
        <span
          className="sb-badge"
          data-tone={item.badgeTone === "destructive" ? "destructive" : undefined}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );
}

export function SidebarItem({
  item,
  active = false,
  sub = false,
  onActivate,
  linkComponent: LinkComponent,
  asChild = false,
  renderItem,
  children,
  ...props
}: SidebarItemProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  const disabled = item.disabled || props.disabled;
  const rowClass = cn("sb-nav-item", sub && "sb-nav-item--sub");
  const stateProps: SidebarRenderItemProp = {
    className: rowClass,
    "data-active": active ? "true" : undefined,
    "aria-current": active ? ("page" as const) : undefined,
    "aria-disabled": disabled ? true : undefined,
  };
  const content = <SidebarRowContent item={item} sub={sub} />;
  const activate = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onActivate?.(item.id);
  };

  // 1. `asChild` — the consumer supplies the ELEMENT ONLY. We clone it with the library-composed
  // children (so icon/label/badge always survive) and Slot merges the row class + active state onto
  // it. The consumer's element is the row AND the sole interactive node (no nested `<button>`).
  if (asChild && React.isValidElement(children)) {
    return (
      <Slot {...stateProps} onClick={activate}>
        {React.cloneElement(children as React.ReactElement, undefined, content)}
      </Slot>
    );
  }

  // 2. DEPRECATED `renderItem` / raw `children`: row CONTENT stays consumer-authored. `rowProps` now
  // carries the composed `children`, so spreading it restores the canonical row (gh#213).
  const custom =
    children ?? (renderItem ? renderItem(item, { ...stateProps, children: content }) : undefined);
  if (custom !== undefined) {
    return <Slot {...stateProps}>{custom}</Slot>;
  }

  // 3. Framework router link — the LIBRARY composes the row and passes it as `children`; the
  // consumer's component only renders the `<a>`. Requires a destination: a router link without an
  // href is not a link, so an href-less row keeps the button shape below.
  if (LinkComponent && item.href) {
    return (
      <LinkComponent
        {...stateProps}
        href={disabled ? undefined : item.href}
        aria-disabled={disabled || undefined}
        onClick={activate}
      >
        {content}
      </LinkComponent>
    );
  }

  // 4. A declarative `href` renders the row AS the link — the anchor is the sole interactive element.
  if (item.href) {
    return (
      <a
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={disabled ? undefined : item.href}
        {...stateProps}
        aria-disabled={disabled || undefined}
        onClick={activate}
      >
        {content}
      </a>
    );
  }

  // 5. Default: a plain action row that reports its selection through `onActivate` (SPA router visit).
  // A nav row is NOT a <Button>: it owns the `.sb-nav-item` row composition (icon + label + badge,
  // active/collapsed state, 32px height) driven by the --sidebar-nav-* tokens. Wrapping it in
  // <Button> would layer Button's own variant padding and focus treatment on top of that, and a
  // <Button> inside the link/anchor branches is the gh#165 nested-interactive defect.
  return (
    // ui-audit-disable-next-line no-raw-button — raw <button> is the correct element here.
    <button type="button" {...stateProps} aria-disabled={disabled} {...props} onClick={activate}>
      {content}
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
  linkComponent?: SidebarLinkComponentProp;
  renderItem?: RenderItem;
};

function NavLeaf({ item, activeId, onSelect, sub = false, linkComponent, renderItem }: RowProps) {
  const active = item.id === activeId;
  return (
    <SidebarItem
      item={item}
      active={active}
      onActivate={onSelect}
      sub={sub}
      linkComponent={linkComponent}
      renderItem={renderItem}
    />
  );
}

function NavLeafsInGroup({
  children,
  activeId,
  onSelect,
  linkComponent,
  renderItem,
}: {
  children: SidebarItemProp[];
  activeId: string;
  onSelect?: (id: string) => void;
  linkComponent?: SidebarLinkComponentProp;
  renderItem?: RenderItem;
}) {
  return children.map((child) => (
    <NavLeaf
      key={child.id}
      item={child}
      activeId={activeId}
      onSelect={onSelect}
      sub
      linkComponent={linkComponent}
      renderItem={renderItem}
    />
  ));
}

function NavGroup({ item, activeId, onSelect, linkComponent, renderItem }: RowProps) {
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];

  // Route-driven expansion is SYNCHRONIZED, not just an initial `defaultOpen`: the group opens
  // whenever one of its children becomes active (e.g. after an SPA navigation deep-links to a child
  // route), so the newly-active row is always revealed — the old `defaultOpen={active}` only set the
  // mount-time state and left a later-activated child hidden (gh#165). The user can still collapse/
  // expand manually; a subsequent navigation into the group re-opens it.
  const [open, setOpen] = React.useState(active);
  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="sb-nav-group">
      {/*
        The group trigger is a DISCLOSURE, not a link: WAI-ARIA APG requires the element that owns
        `aria-expanded` and controls the submenu to be a `<button>`, so `linkComponent` is deliberately
        NOT applied here (a link wrapping a chevron button would re-introduce the nested-interactive
        defect of gh#165). Its ROW COMPOSITION is library-owned like every other shape — icon slot,
        label and badge come from `SidebarRowContent`, the chevron stays outside `.sb-icon` so it reads
        the row colour (gh#228). The group's CHILDREN take the router link.
      */}
      <CollapsibleTrigger
        className="sb-nav-item sb-nav-group-trigger"
        data-active={active ? "true" : undefined}
      >
        <SidebarRowContent item={item} />
        <ChevronDown className="sb-chevron" aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="sb-nav-sub">
          {children.length > 0 ? (
            <NavLeafsInGroup
              activeId={activeId}
              onSelect={onSelect}
              linkComponent={linkComponent}
              renderItem={renderItem}
            >
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
function CollapsedRow({ item, activeId, onSelect, linkComponent: LinkComponent }: RowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
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
      <SidebarIcon icon={item.icon} />
    </button>
  );

  // A collapsed LEAF with an `href` takes the consumer's router link too (gh#213) — the library
  // still composes the icon-only content and keeps the accessible name on `aria-label`, so the rail
  // never degrades to an unnamed icon or loses the browser's own link affordances
  // (context-menu → open-in-new-tab, middle-click).
  const iconLink =
    LinkComponent && !hasChildren && item.href ? (
      <LinkComponent
        className="sb-nav-item"
        data-active={active ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        aria-label={item.label}
        href={item.disabled ? undefined : item.href}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }
          onSelect?.(item.id);
        }}
      >
        <SidebarRowContent item={item} iconOnly />
      </LinkComponent>
    ) : null;

  if (!hasChildren) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{iconLink ?? iconButton}</TooltipTrigger>
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
        {children.map((child) => {
          const childActive = child.id === activeId;
          const select = (event: React.MouseEvent<HTMLElement>) => {
            setMenuOpen(false);
            if (child.disabled) {
              event.preventDefault();
              return;
            }
            onSelect?.(child.id);
          };
          const flyoutState = {
            role: "menuitem" as const,
            className: "sb-nav-item",
            "data-active": childActive ? ("true" as const) : undefined,
            "aria-current": childActive ? ("page" as const) : undefined,
            "aria-disabled": child.disabled || undefined,
          };
          // Flyout entries are LEAVES, so the router link applies here as well — the collapsed rail
          // is no longer a place where a consumer's `<Link>` silently reverts to a `<button>`.
          return LinkComponent && child.href ? (
            <LinkComponent
              key={child.id}
              {...flyoutState}
              href={child.disabled ? undefined : child.href}
              onClick={select}
            >
              <SidebarRowContent item={child} sub />
            </LinkComponent>
          ) : (
            // A collapsed-rail flyout entry is a `menuitem`-styled nav row owning `.sb-nav-item`
            // composition, not a <Button> — same contract as the leaf row above.
            // ui-audit-disable-next-line no-raw-button
            <button key={child.id} type="button" {...flyoutState} onClick={select}>
              <SidebarRowContent item={child} sub />
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export { createSidebarLink } from "./sidebar-link";

/**
 * Sidebar — data-driven vertical nav rail.
 *
 * ROUTER LINKS (gh#213): pass `linkComponent` and the LIBRARY keeps composing every row (icon slot,
 * label, badge, active state, the icon-only collapsed rail and its tooltip name) — the consumer
 * supplies only the link ELEMENT. Use {@link createSidebarLink} to adapt a router `Link`, or
 * `SidebarItem asChild` when composing rows by hand. `renderItem` is DEPRECATED: it left row content
 * to the consumer, so a `<Link>{item.label}</Link>` dropped every icon and badge.
 *
 * THEMING (gh#228): the row/label and the nav ICON read SEPARATE component tokens, so a service can
 * match a canonical shell's darker 16px icons without page-local CSS and without re-tinting every
 * muted text globally:
 *
 * - `--sidebar-nav-item-foreground` (row + label, incl. sub rows) · default `hsl(var(--muted-foreground))`
 * - `--sidebar-nav-item-hover-foreground` · default `hsl(var(--foreground))`
 * - `--sidebar-nav-item-disabled-foreground` · default = the resting row colour
 * - `--sidebar-nav-icon-foreground` (`.sb-icon`, incl. the collapsed rail + group triggers) ·
 *   default `currentColor` = the row colour
 * - `--sidebar-nav-icon-{hover,active,disabled}-foreground` · each defaults to the base icon knob
 *
 * The active row keeps `--sidebar-item-active-background` / `--sidebar-item-active-foreground`.
 * These are COLOUR knobs only — icon size stays `--sidebar-nav-icon-size` (16px) and row geometry
 * stays `--sidebar-nav-item-height` / `-gap` / `-padding-x`.
 */
export function Sidebar({
  ariaLabel: ariaLabelCamel,
  activeId,
  onSelect,
  sections,
  product,
  onProductClick,
  brand,
  collapsed = false,
  children,
  linkComponent,
  renderItem,
  footer,
  "aria-label": ariaLabel,
}: SidebarProp) {
  const { t } = useTranslation();
  const resolvedSections = sections ?? [];

  return (
    <div className="sb-root" data-collapsed={collapsed ? "true" : undefined}>
      {brand !== undefined ? (
        <SidebarHeader>{brand}</SidebarHeader>
      ) : product ? (
        (() => {
          // The header is a SWITCHER only when `onProductClick` is wired. Without it, it's a plain
          // brand header — render a non-interactive element with NO caret, so there's no dropdown
          // chevron promising a menu that doesn't exist (the "dead dropdown" bug).
          const interactive = onProductClick != null;
          const mark = (
            <span
              className="sb-logo-mark"
              style={{ background: product.color ?? "hsl(var(--attention))" }}
            >
              {product.name[0]?.toUpperCase() ?? "?"}
            </span>
          );
          const meta = !collapsed ? (
            <span className="sb-product-meta">
              <span className="sb-product-name">{product.name}</span>
              {product.role ? <span className="sb-product-tenant">{product.role}</span> : null}
            </span>
          ) : null;
          return interactive ? (
            <button
              type="button"
              className="sb-product"
              onClick={onProductClick}
              aria-label={product.name}
            >
              {mark}
              {meta}
              {!collapsed ? (
                <span className="sb-product-caret">
                  <ChevronDown aria-hidden="true" />
                </span>
              ) : null}
            </button>
          ) : (
            <div className="sb-product sb-product-static">
              {mark}
              {meta}
            </div>
          );
        })()
      ) : null}

      <nav
        className="sb-nav-scroll"
        aria-label={ariaLabel ?? ariaLabelCamel ?? t("layout.sidebar.ariaLabel")}
      >
        {children ??
          resolvedSections.map((section, sectionIndex) => (
            <SidebarSection
              key={section.label ?? sectionIndex}
              label={section.label}
              collapsed={collapsed}
            >
              {section.items.map((item) =>
                collapsed ? (
                  <CollapsedRow
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onSelect={onSelect}
                    linkComponent={linkComponent}
                  />
                ) : item.children && item.children.length > 0 ? (
                  <NavGroup
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onSelect={onSelect}
                    linkComponent={linkComponent}
                    renderItem={renderItem}
                  />
                ) : (
                  <NavLeaf
                    key={item.id}
                    item={item}
                    activeId={activeId}
                    onSelect={onSelect}
                    linkComponent={linkComponent}
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
