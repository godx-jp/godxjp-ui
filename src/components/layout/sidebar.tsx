import * as React from "react";
import { CONTRAST_PIVOT, relativeLuminance } from "../../app/tenant-theme";
import { Slot } from "../../lib/slot";
import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { useNavSurface } from "./nav-surface";
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
  SidebarItemProp,
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
   * The row content stays library-composed — see {@link SidebarLinkProp}. Applied only when
   * `item.href` is set.
   */
  linkComponent?: SidebarLinkComponentProp;
  /**
   * Use it when you compose `SidebarItem` by hand instead of passing `sections` + `linkComponent`.
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
 * icon↔label gap, labels still aligned in one column with their icon-bearing siblings.
 */
function SidebarIcon({ icon: Icon }: { icon?: SidebarItemData["icon"] }) {
  return <span className="sb-icon">{Icon ? <Icon aria-hidden="true" /> : null}</span>;
}

/**
 * The TRAILING 16px glyph slot — the disclosure mark of a row that opens something. Unlike
 * `.sb-icon` the box is only rendered when there is a glyph: it carries no alignment duty (nothing
 * follows it in the row), so an empty one would only add a gap at the row's inline end.
 */
function SidebarTrailingIcon({
  icon: Icon,
}: {
  icon: NonNullable<SidebarItemData["trailingIcon"]>;
}) {
  return (
    <span className="sb-trailing-icon">
      <Icon aria-hidden="true" />
    </span>
  );
}

/**
 * Every row shape renders this: the leaf button, the `href` anchor, the `linkComponent` router
 * link, the `asChild` element and the group trigger.
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
        // absent-when-off), so a rail that never sets `badgeTone` renders the exact same node it
        // always did and no consumer selector has to out-specify a marker meaning "unchanged".
        <span
          className="sb-badge"
          data-tone={item.badgeTone === "destructive" ? "destructive" : undefined}
        >
          {item.badge}
        </span>
      ) : null}
      {item.trailingIcon ? <SidebarTrailingIcon icon={item.trailingIcon} /> : null}
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

  // 1. `asChild` — the consumer supplies the ELEMENT ONLY.
  // children (so icon/label/badge always survive) and Slot merges the row class + active state onto
  // it. The consumer's element is the row AND the sole interactive node (no nested `<button>`).
  if (asChild && React.isValidElement(children)) {
    return (
      <Slot {...stateProps} onClick={activate}>
        {React.cloneElement(children as React.ReactElement, undefined, content)}
      </Slot>
    );
  }

  // 2. DEPRECATED `renderItem` / raw `children`: row CONTENT stays consumer-authored.
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

/**
 * The collapsible submenu group of a nested `SidebarItemProp`. Exported (not from the package —
 * only within `src/components/layout`) so `NavList` renders nested items through the SAME group as
 * the rail instead of dropping `item.children` on the floor (gh#815).
 */
export function NavGroup({ item, activeId, onSelect, linkComponent, renderItem }: RowProps) {
  const active = isItemActive(item, activeId);
  const children = item.children ?? [];

  // Route-driven expansion is SYNCHRONIZED, not just an initial `defaultOpen`: the group opens
  // whenever one of its children becomes active (e.g. after an SPA navigation deep-links to a child
  // The user can still collapse/
  // expand manually; a subsequent navigation into the group re-opens it.
  const [open, setOpen] = React.useState(active);
  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="sb-nav-group">
      {/* The group's CHILDREN take the router link. */}
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
 * tooltip; CLICK navigates a leaf, or opens the group's submenu as a portaled menu.
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
 * Sidebar — data-driven vertical nav rail. Use {@link createSidebarLink} to adapt a router `Link`,
 * or `SidebarItem asChild` when composing rows by hand.
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
  /*
   * COLLAPSE IS A DESKTOP ANSWER, so it does not survive into the drawer. `AppShell` hands the
   * same node to both surfaces on purpose — a consumer should not build its navigation twice — but
   * `collapsed` trades labels for horizontal room in a docked column, and a drawer has no such
   * pressure while being the only navigation left below the breakpoint. Honouring it there turned
   * a shipped consumer's drawer into six anonymous glyphs. A standalone `Sidebar` sees "docked"
   * and keeps whatever it was given.
   *
   * Shadowing the parameter is deliberate: every read below is a rendering decision and every one
   * of them must follow the surface. A separate name would leave the original in scope for the
   * next edit to reach for by accident.
   */
  const surface = useNavSurface();
  // eslint-disable-next-line no-param-reassign
  collapsed = surface === "drawer" ? false : collapsed;

  /*
   * The brand slot follows the SAME effective value the rows do. A consumer's node is built
   * outside this component and cannot read the surface (the context is deliberately not public),
   * so a `brand` shaped by the consumer's own `collapsed` boolean showed a glyph-only lockup in a
   * full-width drawer. The escape hatch was a second hand-built Sidebar passed as
   * `AppShell.mobileNav` — which is exactly the override that turns `railInDrawer` off and drops
   * the `navRail` from mobile. Accepting a function removes the reason to build that second node.
   */
  const brandNode = typeof brand === "function" ? brand(collapsed) : brand;
  /*
   * `footer` follows the SAME rule as `brand`, and deliberately through the same two lines rather
   * than a second convention: both slots sit inside the collapsible rail, so both need the
   * effective value, and a consumer who learnt the shape once should not learn it twice.
   */
  const footerNode = typeof footer === "function" ? footer(collapsed) : footer;

  return (
    <div className="sb-root" data-collapsed={collapsed ? "true" : undefined}>
      {brand !== undefined ? (
        <SidebarHeader>{brandNode}</SidebarHeader>
      ) : product ? (
        (() => {
          // The header is a SWITCHER only when `onProductClick` is wired. Without it, it's a plain
          // brand header — render a non-interactive element with NO caret, so there's no dropdown
          // chevron promising a menu that doesn't exist (the "dead dropdown" bug).
          const interactive = onProductClick != null;
          /* THE MARK'S INK HAS TO FOLLOW THE FILL THIS LINE PAINTS (gh#884).
           *
           * The stylesheet could only ever say `white`, because the fill is the CALLER's and CSS
           * cannot measure it. Measured on the theme lab across 3 themes x 5 seeds, white on the
           * default `--attention` orange (#eb6101) is 3.38:1 — under SC 1.4.3's 4.5:1 in 15 of 15
           * cells, and the only string that failed in every single one. The pairing was already
           * solved for every other `--attention` surface in gh#643, which is where
           * `--attention-foreground` (4.68:1 on that fill) comes from; the brand mark was the one
           * place still holding the literal.
           *
           * Resolved AS THE CALL-SITE FALLBACK, never by assigning the knob (docs/TOKENS.md, the
           * freeze rule): `--sidebar-logo-mark-color` is the consumer's channel from gh#884, and an
           * inline assignment here would outrank the `[data-tenant]` scope it exists for. Written
           * as a fallback, the knob still wins whenever it is set.
           *
           * A caller-supplied colour gets the same black-or-white pivot `tenantTheme` uses for
           * `--primary-foreground`, so one rule governs both. A value CSS accepts but we cannot
           * measure — `var(--x)`, a named colour, `oklch()` — keeps the old `white`: unchanged, and
           * honest about what was measured. */
          const markLuminance = product.color != null ? relativeLuminance(product.color) : null;
          const markInk =
            product.color == null
              ? "hsl(var(--attention-foreground))"
              : markLuminance == null
                ? "white"
                : markLuminance > CONTRAST_PIVOT
                  ? "black"
                  : "white";
          const mark = (
            <span
              className="sb-logo-mark"
              style={{
                background: product.color ?? "hsl(var(--attention))",
                color: `var(--sidebar-logo-mark-color, ${markInk})`,
              }}
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

      {footerNode ? <div className="sb-footer">{footerNode}</div> : null}
    </div>
  );
}
