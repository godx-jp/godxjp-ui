import { padStyle, padStepToken } from "../../lib/variants";
import type { GapProp, PadProp, PadRawProp } from "../../props/vocabulary";
import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { isDevelopment } from "../../lib/dev";
import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
import type { HeadingLevelProp } from "../../props/vocabulary";
import type { CardTabItemProp } from "../../props/components/data-display.prop";
import { Tabs, type TabsExtraProp, type TabsProps } from "../navigation/tabs";

export type {
  CardTabItemProp,
  CardTabItemProp as CardTabItemProps,
} from "../../props/components/data-display.prop";

/** Semantic accent tone. `accentPlacement` decides WHERE it is drawn — a leading-edge
 *  stripe (default) or the full perimeter. */
type CardAccent = "primary" | "success" | "warning" | "info" | "attention" | "destructive";
/**
 * Where the semantic `accent` tone is drawn. - `"edge"` (default) — the leading-edge stripe on
 * `border-inline-start` only, at the `--card-accent-rail-width` measure (6px). This is what
 * `variant="featured"` does, except the tone is yours instead of `--primary`, so a card can shout
 * "action required" (`accent="attention"`) or "this failed" (`accent="destructive"`) without
 * borrowing the brand colour.
 */
type CardAccentPlacement = "edge" | "perimeter";
/**
 * Surface fill and edge. `outline` is antd's `outlined` — it drops the FILL and keeps the
 * hairline; `borderless` is antd's `variant="borderless"` (its deprecated `bordered={false}`) —
 * it drops the HAIRLINE and keeps the fill. They are two different cards, which is why both
 * values exist: neither one substitutes for the other.
 */
type CardVariant = "default" | "muted" | "outline" | "borderless" | "featured";
/** Padding density — base 16px · tight 12px · cozy 20px. */
type CardDensity = "tight" | "cozy";

// Border WIDTH lives in the components layer (.ui card CSS), not a Tailwind `border` utility:
// the utility would beat the components-layer accent rail rule, pinning the accent stripe to 1px.
// A consumer `className="border-2"` still wins (utilities > components), as before.
//
// NOTE — there is deliberately no `size` prop.
// variants (`md: ""`, `compact: ""`) and no CSS ever read the `data-size` it emitted, so
// Card sizing is `density`
// axis would only duplicate it. Removed 2026-08-24.

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: CardAccent;
  /**
   * Where `accent` is drawn — `"edge"` (default, the leading-edge stripe) or `"perimeter"`
   * (a full attention border in the accent tone). Inert without `accent`.
   */
  accentPlacement?: CardAccentPlacement;
  variant?: CardVariant;
  density?: CardDensity;
  /**
   * Lift the card on hover (antd `hoverable`) — the resting elevation steps up to
   * `--card-hover-shadow` and the pointer becomes a `pointer`.
   *
   * This is a PRESENTATION flag, not an interaction: it announces nothing and binds no handler.
   * A card that looks clickable has to BE clickable for everyone, so pair it with a real control
   * — a `Link`/`Button` in the header or footer, or the whole card rendered as one via
   * {@link CardProps.asChild} — never with a bare `onClick` on this div, which a keyboard or
   * screen-reader user cannot reach.
   */
  hoverable?: boolean;
  /**
   * Borrow the child's element for the card box instead of rendering a `div` — the package's
   * standard Slot passthrough (`Button`, `AspectRatio`, `ListRow`). The card's chrome and every
   * `data-*` flag move onto that element, so a card rendered as an `<a>` or a `<button>` measures
   * byte for byte like the `div` it replaces and stays a SINGLE tab stop.
   *
   * This is the other half of `hoverable`: `<Card asChild hoverable><a href="…">` is "the whole
   * card rendered as one control", reachable by keyboard and announced as one link.
   *
   * NESTING CAVEAT — the card is now ONE control, so it may not contain another. An
   * `<a>`/`<button>` (a `Link`, a `Button`, a menu trigger) inside a card-as-link or
   * card-as-button is invalid HTML: the inner control is unreachable or mis-announced, and
   * `tabList` — a strip of `button` triggers — is for the same reason not drawn under `asChild`.
   * A card that needs interactive children is not one control: drop `asChild` and put the
   * `Link`/`Button` inside it instead, as `hoverable` also allows.
   *
   * Exactly one child, as everywhere else in this package: two children have no element to
   * borrow, so `Slot`'s `React.Children.only` throws — the same error `Button asChild` throws.
   */
  asChild?: boolean;
  /**
   * Ant Design `tabList` — the tab strip that lives IN THE CARD'S HEAD, under the title, inside
   * the same border and on the same surface, so the card and its tabs read as one object. The
   * card's remaining children become the selected tab's body.
   *
   * Ported name for name and semantic for semantic (docs/DESIGN-AUTHORITY.md): the entry is
   * antd's `{ key, tab, disabled }`, not the `Tabs` component's `{ value, label, content }`.
   * @see CardTabItemProp for why the two item shapes stay apart.
   */
  tabList?: CardTabItemProp[];
  /** Ant Design `activeTabKey` — the controlled selection. Pair it with `onTabChange`. */
  activeTabKey?: string;
  /**
   * Ant Design `defaultActiveTabKey` — the uncontrolled initial selection. Without it the first
   * entry of `tabList` opens, which is antd's own fallback.
   */
  defaultActiveTabKey?: string;
  /** Ant Design `onTabChange` — fires with the newly selected `key`, however the selection moved. */
  onTabChange?: (key: string) => void;
  /**
   * Ant Design `tabBarExtraContent`, RENAMED to `extra` and made logical — the one deviation from
   * antd's spelling here, and it follows the precedent this package already set on
   * `TabsProp.extra` ("Ant Design `tabBarExtraContent`, renamed and made logical"). A second
   * spelling of a slot the package has already named once is exactly what
   * `check:prop-vocabulary` exists to prevent, and antd's `{ left, right }` keys cannot mirror
   * for an RTL locale where `{ start, end }` can.
   *
   * Inert without `tabList`: antd draws this content in the tab bar, and with no tab bar there is
   * nowhere for it to go. A header-level action is `<CardAction>` inside `<CardHeader>`.
   */
  extra?: TabsExtraProp;
  /**
   * Ant Design `tabProps` — passed straight down to the `Tabs` that draws the strip, so
   * `variant`, `size`, `centered`, `overflow`, `indicator` and the rest are reachable.
   *
   * The four fields the CARD owns are omitted rather than passed through: `items` is built from
   * `tabList`, and `value` / `defaultValue` / `onValueChange` are what `activeTabKey` /
   * `defaultActiveTabKey` / `onTabChange` already say. antd drops the same fields — it spreads
   * `tabProps` first and then writes its own `items`/`activeKey`/`onChange` over them — so this
   * is that behaviour made visible in the type instead of silent at runtime.
   */
  tabProps?: Omit<
    TabsProps,
    "items" | "value" | "defaultValue" | "onValueChange" | "extra" | "children"
  >;
};

/**
 * Which tab is open, given what the caller asked for. Mirrors `resolveFallbackTabValue` in
 * navigation/tabs.tsx, and for the same gh#175 reason: a disabled tab cannot be the open one, and
 * with EVERY tab disabled nothing is open at all — so the card body has no tab to belong to and
 * is not rendered, exactly as the strip shows no selection.
 */
function resolveActiveCardTabKey(
  tabList: CardTabItemProp[],
  requested: string | undefined,
): string | undefined {
  if (requested !== undefined) {
    const item = tabList.find((entry) => entry.key === requested);
    if (item && !item.disabled) return requested;
  }
  return tabList.find((entry) => !entry.disabled)?.key;
}

/**
 * Split the card's children into the three bands a `tabList` needs: what sits ABOVE the strip
 * (cover, header), what becomes the selected tab's BODY, and what sits BELOW the panel (footer).
 *
 * By element TYPE, not by index: the head and the foot of a card are named slots, and a consumer
 * who writes `<CardFooter>` before `<CardContent>` still means "footer". Anything that is not one
 * of the three named slots is body — which is what makes a bare `<Card tabList>{rows}</Card>`
 * behave exactly as antd's does, where `children` IS the body.
 */
function splitCardBands(children: React.ReactNode): {
  head: React.ReactNode[];
  body: React.ReactNode[];
  foot: React.ReactNode[];
} {
  const head: React.ReactNode[] = [];
  const body: React.ReactNode[] = [];
  const foot: React.ReactNode[] = [];

  for (const child of React.Children.toArray(children)) {
    const type = React.isValidElement(child) ? child.type : undefined;
    if (type === CardCover || type === CardHeader) head.push(child);
    else if (type === CardFooter) foot.push(child);
    else body.push(child);
  }

  return { head, body, foot };
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      accent,
      accentPlacement,
      variant,
      density,
      hoverable,
      tabList,
      activeTabKey,
      defaultActiveTabKey,
      onTabChange,
      extra,
      tabProps,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    // `asChild` hands the card BOX to the child, and a card head tab strip is a row of `button`
    // triggers — inside a link or a button that is invalid HTML, so the strip is dropped rather
    // than nested. Said out loud in development for the same reason AppShell says it about its
    // own ignored slots: a silently missing tab strip is a bug report.
    const slotted = asChild && Boolean(tabList?.length);
    if (isDevelopment() && slotted) {
      console.warn(
        "Card: `asChild` renders the whole card as ONE control, so `tabList` is ignored and the " +
          "tab strip is NOT drawn — a strip of `button` triggers inside a link/button is invalid " +
          "HTML. Drop `asChild` and put a `Link`/`Button` inside the card instead.",
      );
    }
    /*
     * `CardHeader` + `CardContent solo` is a CONTRADICTION, not a taste (gh#745).
     *
     * `solo` means "there is no header above me, so I own the card's block padding" — the CSS
     * reads it as `padding-block` on the body precisely because nothing else carries those edges.
     * With a header present the two statements cannot both be true, and the cascade settles it
     * silently in favour of the padding: the consumer sees an empty strip above and below their
     * edge-to-edge rows and has nothing on screen to explain it. A consumer shipped exactly that
     * and could only find it by reading the package's CSS.
     *
     * Said out loud in development, for the reason the `asChild` + `tabList` warning above exists:
     * a contradiction the cascade resolves quietly is a bug report. Nothing is changed at runtime
     * — dropping `solo` is the consumer's call, because the alternative reading (they meant to
     * drop the header) is equally plausible from here.
     */
    if (isDevelopment()) {
      const slots = React.Children.toArray(children).filter(React.isValidElement);
      const hasHeader = slots.some((child) => child.type === CardHeader);
      const soloBody = slots.some(
        (child) =>
          child.type === CardContent &&
          (child.props as CardContentProps | undefined)?.solo === true,
      );
      if (hasHeader && soloBody) {
        console.warn(
          "Card: `CardContent solo` says there is NO header above it, so it takes the card's own " +
            "block padding — but this card also renders a `CardHeader`. The two cannot both hold, " +
            "and the padding wins, which is the empty strip above your content. Drop `solo` to " +
            "keep the header, or drop the header if the body really is alone.",
        );
      }
    }
    const tabs = slotted ? undefined : tabList;
    const Comp = asChild ? Slot : "div";
    // The selection MIRROR, for the uncontrolled (`defaultActiveTabKey`) half. `activeTabKey`
    // always wins when it is passed, so a controlled card never has two sources of truth. It is
    // resolved on every render rather than seeded once, because `tabList` can arrive after the
    // first paint (a fetched set of views) and a key seeded from an empty list would strand the
    // body behind a selection that never becomes real.
    const [mirroredKey, setMirroredKey] = React.useState<string | undefined>(undefined);
    const activeKey = tabs?.length
      ? resolveActiveCardTabKey(tabs, activeTabKey ?? mirroredKey ?? defaultActiveTabKey)
      : undefined;
    const handleTabChange = React.useCallback(
      (key: string) => {
        setMirroredKey(key);
        onTabChange?.(key);
      },
      [onTabChange],
    );

    const { head, body, foot } = tabs?.length
      ? splitCardBands(children)
      : { head: undefined, body: undefined, foot: undefined };

    return (
      <Comp
        ref={ref}
        className={cn("group/card", className)}
        data-slot="card"
        data-accent={accent}
        data-hoverable={hoverable ? "" : undefined}
        // INERT DEFAULT: `edge` emits no attribute at all, so every existing accented Card keeps
        // the exact DOM and the exact leading-rail geometry it had.
        data-accent-placement={accentPlacement === "perimeter" ? "perimeter" : undefined}
        data-variant={variant && variant !== "default" ? variant : undefined}
        data-density={density}
        // The hook card-layout.css keys the head band on. A card WITHOUT `tabList` emits nothing
        // and keeps the exact DOM it had.
        data-tab-list={tabs?.length ? "" : undefined}
        {...props}
      >
        {tabs?.length ? (
          <>
            {head}
            <Tabs
              // The card head's strip is antd's: a rail of text triggers under the title, not the
              // package's default pill strip floating on the card surface. `tabProps` still wins.
              variant="line"
              {...tabProps}
              // Card-owned, so they are written AFTER the spread — the same precedence antd's own
              // Card uses when it writes its `items`/`activeKey`/`onChange` over `tabProps`.
              items={tabs.map((item) => ({
                value: item.key,
                label: item.tab,
                disabled: item.disabled,
                // The body belongs to the SELECTED tab and to no other: the card has exactly one
                // set of children, so handing them to every panel would render them N times the
                // moment `destroyOnHidden={false}` kept the hidden panels mounted.
                content: item.key === activeKey ? body : null,
              }))}
              value={activeKey}
              onValueChange={handleTabChange}
              extra={extra}
              // The strip has to stand on the CARD's column, or the first tab does not line up
              // with the title above it. It goes on as an arbitrary-value UTILITY reading the card
              // token, never as a components-layer rule: the line strip already claims `px-*` in
              // the utilities layer, which outranks `@layer components` outright — which is why
              // the `[data-slot="card"] [data-slot="tabs-list"]` rule below it never painted.
              listClassName={cn("px-[var(--card-space-inset)]", tabProps?.listClassName)}
            />
            {foot}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Card.displayName = "Card";

/** Full-bleed cover media — first child; header below uses section top (φ⁰), not shell. */
export type CardCoverProps = React.HTMLAttributes<HTMLDivElement>;

export const CardCover = React.forwardRef<HTMLDivElement, CardCoverProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-cover" className={cn("ui-card-cover", className)} {...props} />
  ),
);
CardCover.displayName = "CardCover";

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Muted background + border-bottom — section band (mirror footer `separated`). */
  banded?: boolean;
};

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, banded, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      data-banded={banded ? "" : undefined}
      className={cn(banded && "ui-card-header--banded", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Semantic heading level (`h1`–`h4`). Default `3`. */
  level?: HeadingLevelProp;
  /**
   * Render a different element than the `level` heading. Use `"p"` / `"div"` when the card title
   * is a styled label rather than a section heading in the outline (so it is not announced as a
   * heading and cannot skip a level).
   */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
};

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, level = 3, as, ...props }, ref) =>
    React.createElement(
      as ?? `h${level}`,
      { ref, "data-slot": "card-title", className, ...props },
      children,
    ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} data-slot="card-description" className={className} {...props} />
));
CardDescription.displayName = "CardDescription";

export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Edge-to-edge body (tables, tabs list). Horizontal padding removed. */
  flush?: boolean;
  /** No gap after header — pair with tabs / flush toolbar. */
  tight?: boolean;
  /** No header above — top padding matches card shell. */
  solo?: boolean;
};

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, flush, tight, solo, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      data-flush={flush ? "" : undefined}
      data-tight={tight ? "" : undefined}
      data-solo={solo ? "" : undefined}
      className={className}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Top border + symmetric action band — form Save/Cancel, table summary. */
  separated?: boolean;
  /** Full-bleed footer (the conventional `actions` bar). */
  flush?: boolean;
  /**
   * Split the footer into EQUAL-WIDTH cells divided by vertical rules — antd's `actions` row.
   *
   * A different band from `separated`, which packs its children at the inline end at their
   * natural widths: that is the right shape for a Save/Cancel pair and the wrong one for antd's
   * divided strip. Self-sufficient — it draws its own top rule and full-bleed edges, because
   * upstream's actions row is never anything else.
   */
  actions?: boolean;
};

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, separated, flush, actions, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      data-separated={separated ? "" : undefined}
      data-flush={flush ? "" : undefined}
      data-actions={actions ? "" : undefined}
      className={className}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export type CardBarProps = React.HTMLAttributes<HTMLDivElement> & {
  pad?: PadProp;
  padRaw?: PadRawProp;
  gap?: GapProp;
  surface?: "muted";
  border?: "none" | "block-start" | "block-end" | "both";
  /** Right-aligned actions slot (settings/save), Ant `tabBarExtraContent`-style. */
  extra?: React.ReactNode;
};

/**
 * CardBar — a horizontal bar (view tabs, toolbar, filter chips) that can sit at ANY position
 * inside a Card. It draws its own separators FROM its position: a top bar gets a bottom border, a
 * bottom bar gets a top border, a middle bar gets both, and a sole child gets none (the card
 * border is enough).
 */
export const CardBar = React.forwardRef<HTMLDivElement, CardBarProps>(
  ({ className, children, extra, pad, padRaw, gap, surface, border, style, ...props }, ref) => (
    <div
      ref={ref}
      data-surface={surface}
      data-border={border}
      data-pad-raw={padRaw === undefined ? undefined : ""}
      style={{
        ...style,
        ...padStyle(pad, padRaw),
        ...(gap === undefined ? undefined : { gap: padStepToken(gap) }),
      }}
      data-slot="card-bar"
      className={cn("ui-card-bar", className)}
      {...props}
    >
      <div data-slot="card-bar-main" className="ui-card-bar-main">
        {children}
      </div>
      {extra != null ? (
        <div data-slot="card-bar-extra" className="ui-card-bar-extra">
          {extra}
        </div>
      ) : null}
    </div>
  ),
);
CardBar.displayName = "CardBar";

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /**
   * Optional leading icon, rendered as a tinted medallion above the metric. Decorative
   * (aria-hidden) — the label carries the meaning.
   */
  icon?: LucideIcon;
  /** Optional compact trend text beside the value. Avoid badge-like deltas. */
  delta?: React.ReactNode;
  /** KPI layout: stacked = design default, inline = label left / value right. */
  layout?: "stacked" | "inline";
  /** Align the metric group. */
  align?: "start" | "end";
  /** Flip delta semantics for metrics where lower is better. */
  inverse?: boolean;
  /** Semantic leading-edge rail (Card accent) — flags a KPI needing attention. */
  accent?: CardAccent;
  /** Where `accent` is drawn — `"edge"` (default rail) or `"perimeter"` (full attention border). */
  accentPlacement?: CardAccentPlacement;
};

function getDeltaTone(
  delta: React.ReactNode,
  inverse: boolean,
): "positive" | "negative" | undefined {
  const text = typeof delta === "string" || typeof delta === "number" ? String(delta).trim() : "";
  const sign = text.match(/^[+\-−]/)?.[0];

  if (!sign) return undefined;

  const isPositive = sign === "+";
  const semanticPositive = inverse ? !isPositive : isPositive;

  return semanticPositive ? "positive" : "negative";
}

/** KPI / stat tile — token-driven layout aligned to dashboard KPI cards. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  layout = "stacked",
  align = "start",
  inverse = false,
  accent,
  accentPlacement,
  className,
  ...props
}: StatCardProps) {
  const deltaTone = getDeltaTone(delta, inverse);

  return (
    <Card
      accent={accent}
      accentPlacement={accentPlacement}
      className={cn("ui-stat-card", className)}
      data-stat-card=""
      data-stat-layout={layout}
      data-stat-align={align}
      {...props}
    >
      {Icon ? (
        <span data-slot="stat-card-icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <div data-slot="stat-card-body">
        <div data-slot="stat-card-label">{label}</div>
        {hint && layout === "inline" ? <div data-slot="stat-card-hint">{hint}</div> : null}
      </div>
      <div>
        <div data-slot="stat-card-value-row">
          <span data-slot="stat-card-value">{value}</span>
          {delta ? (
            <span
              data-slot="stat-card-delta"
              data-delta-tone={deltaTone}
              className={cn(
                deltaTone === "positive" && "text-success-strong",
                deltaTone === "negative" && "text-error-strong",
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>
        {hint && layout !== "inline" ? <div data-slot="stat-card-hint">{hint}</div> : null}
      </div>
    </Card>
  );
}

/** Header actions slot — compose beside CardTitle inside CardHeader; the header owns positioning. */
export const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-action" className={className} {...props} />
  ),
);
CardAction.displayName = "CardAction";
