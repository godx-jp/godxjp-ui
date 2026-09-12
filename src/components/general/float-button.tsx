"use client";

import * as React from "react";
import { ChevronUp, FileText, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useMediaQuery } from "../../lib/hooks";
import { numberFormat } from "../../lib/intl-cache";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { Button } from "./button";

import type {
  FloatButtonBackTopProp,
  FloatButtonGroupProp,
  FloatButtonPlacementProp,
  FloatButtonProp,
  FloatButtonShapeProp,
  FloatButtonTooltipProp,
  FloatButtonTypeProp,
} from "../../props/components/general.prop";

export type {
  FloatButtonBackTopProp,
  FloatButtonBackTopProp as FloatButtonBackTopProps,
  FloatButtonBadgeProp,
  FloatButtonGroupProp,
  FloatButtonGroupProp as FloatButtonGroupProps,
  FloatButtonPlacementProp,
  FloatButtonProp,
  FloatButtonProp as FloatButtonProps,
  FloatButtonShapeProp,
  FloatButtonTooltipProp,
  FloatButtonTriggerProp,
  FloatButtonTypeProp,
} from "../../props/components/general.prop";

/**
 * What a `FloatButton` inherits from the `FloatButton.Group` above it.
 *
 * `shape` so a group cannot hold a circle and a square in the same stack, and `individual` so a
 * square group can draw ONE joined slab (antd renders `Space.Compact` there) while a circle group
 * keeps its buttons apart. Both are antd's, and both are read from context rather than cloned onto
 * the children, so a consumer's own wrapper component between the group and its buttons still
 * inherits — `React.Children.map` would not reach through one.
 */
const GroupContext = React.createContext<{
  shape: FloatButtonShapeProp;
  individual: boolean;
} | null>(null);

/** antd's default corner glyph when the button carries neither an icon nor content. */
const DEFAULT_ICON = <FileText aria-hidden="true" />;

/**
 * antd's two `type`s named in this library's `Button` vocabulary.
 *
 * `default` is NOT `Button variant="default"` — antd's default float button is a white surface
 * with a hairline and a shadow, which is this library's `outline`. antd's `primary` is the brand
 * fill, which is this library's `default`. Getting this pair backwards is the easy mistake, so the
 * map is written out once instead of inlined at three call sites.
 */
const BUTTON_VARIANT = {
  default: "outline",
  primary: "default",
} as const satisfies Record<FloatButtonTypeProp, "outline" | "default">;

/** Whether a node would actually paint. antd's `isReactRenderable`, which drives BOTH the default
 * icon and the circle-with-text warning. */
function isRenderable(node: React.ReactNode): boolean {
  return node != null && node !== false && node !== true && node !== "";
}

/**
 * antd's `convertToTooltipProps`: a bare node is the tooltip's title; the object form is passed
 * through; `null`/`undefined` means no tooltip at all.
 */
function toTooltipProps(tooltip: FloatButtonProp["tooltip"]): FloatButtonTooltipProp | null {
  if (tooltip == null) return null;
  if (typeof tooltip === "object" && !React.isValidElement(tooltip) && "title" in tooltip) {
    return tooltip as FloatButtonTooltipProp;
  }
  return { title: tooltip as React.ReactNode };
}

/**
 * The corner count/dot mark.
 *
 * A `<span>` inside the control rather than a wrapper around it, because the button is the
 * POSITIONED box here (`position: fixed` on the control itself, see float-button-layout.css) and a
 * wrapper would take that role away from it. antd wraps, because its badge is a general-purpose
 * component; here the mark exists only on this control.
 */
function FloatButtonBadge({
  badge,
  locale,
}: {
  badge: NonNullable<FloatButtonProp["badge"]>;
  locale: string;
}) {
  const { count, dot, overflowCount = 99, showZero = false, color } = badge;
  if (!dot) {
    if (count == null) return null;
    if (count === 0 && !showZero) return null;
  }
  const label = dot
    ? null
    : count != null && count > overflowCount
      ? `${numberFormat(locale).format(overflowCount)}+`
      : numberFormat(locale).format(count ?? 0);
  return (
    <span
      data-slot="float-button-badge"
      data-dot={dot ? "" : undefined}
      className="ui-float-button-badge"
      style={
        color ? ({ "--float-button-badge-background": color } as React.CSSProperties) : undefined
      }
    >
      {label}
    </span>
  );
}

/**
 * FloatButton — Ant Design's corner action, ported from antd 6.6.3.
 *
 * A control pinned to the viewport corner, above the page, for a tool that has to stay reachable
 * and is not part of this page's content: a composer, an assistant, "back to top". `Button` is in
 * the layout flow, so pinning one meant a consumer writing `position: fixed` at the call site —
 * page-local CSS `ui-audit` blocks, with no legal replacement (gh#558). `Popover` answers where the
 * PANEL goes, not where the trigger goes; `Banner` is a full-bleed strip.
 *
 * The corner insets are `--float-button-offset-block-end` / `--float-button-offset-inline-end`, so
 * a service that has a sticky action bar in the way moves the mark by retuning one token instead of
 * writing a media query at the call site.
 */
const FloatButtonRoot = React.forwardRef<HTMLElement, FloatButtonProp>(function FloatButton(
  {
    icon,
    description,
    content,
    type = "default",
    shape = "circle",
    tooltip,
    href,
    target,
    badge,
    disabled,
    htmlType = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  const { locale } = useTranslation();
  const group = React.useContext(GroupContext);
  const mergedShape = group?.shape ?? shape;
  // antd resolves the deprecated name the same way round: `content` wins, `description` still works.
  const mergedContent = isRenderable(content) ? content : description;
  const hasContent = isRenderable(mergedContent);
  const mergedIcon = !hasContent && icon == null ? DEFAULT_ICON : icon;

  if (process.env.NODE_ENV !== "production" && mergedShape === "circle" && hasContent) {
    console.warn(
      "[@godxjp/ui] FloatButton: `content` is supported only when `shape` is `square` — a circle has no room for a line of text.",
    );
  }

  const tooltipProps = toTooltipProps(tooltip);
  /*
   * An icon-only control needs a NAME, and a tooltip is not one: it never reaches a touch user and
   * it is gone for anyone reading with the screen off (WCAG 4.1.2). When the tooltip's title is a
   * plain string it says exactly what the name should say, so it becomes the name too. An explicit
   * `aria-label` always wins, and a rich-node tooltip is left alone — flattening arbitrary JSX into
   * a string is how a name turns into "undefined".
   */
  const ariaLabel =
    rest["aria-label"] ??
    (!hasContent && typeof tooltipProps?.title === "string" ? tooltipProps.title : undefined);

  const inner = (
    <>
      {isRenderable(mergedIcon) ? (
        <span data-slot="float-button-icon" className="ui-float-button-icon">
          {mergedIcon}
        </span>
      ) : null}
      {hasContent ? (
        <span data-slot="float-button-content" className="ui-float-button-content">
          {mergedContent}
        </span>
      ) : null}
      {children}
      {badge ? <FloatButtonBadge badge={badge} locale={locale} /> : null}
    </>
  );

  const shared = {
    "data-slot": "float-button",
    "data-type": type,
    "data-shape": mergedShape,
    "data-individual": (group?.individual ?? true) ? "" : undefined,
    "data-icon-only": hasContent ? undefined : "",
    className: cn("ui-float-button", className),
    variant: BUTTON_VARIANT[type],
    shape: mergedShape === "circle" ? ("pill" as const) : ("default" as const),
    size: "icon-lg" as const,
  };

  const node = href ? (
    <Button {...shared} asChild>
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={target}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? "" : undefined}
      >
        {inner}
      </a>
    </Button>
  ) : (
    <Button
      {...shared}
      {...rest}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={htmlType}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {inner}
    </Button>
  );

  if (!tooltipProps || !isRenderable(tooltipProps.title)) return node;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent
        side={tooltipProps.side}
        align={tooltipProps.align}
        sideOffset={tooltipProps.sideOffset}
      >
        {tooltipProps.title}
      </TooltipContent>
    </Tooltip>
  );
});

const PLACEMENTS: readonly FloatButtonPlacementProp[] = ["top", "left", "right", "bottom"];

/**
 * FloatButton.Group — a stack of corner actions, optionally behind one trigger.
 *
 * Two modes, and `trigger` is the switch, exactly as in antd: WITHOUT it every child is visible and
 * no trigger is drawn; WITH it the children collapse behind a trigger that opens them on click or
 * on hover.
 */
function FloatButtonGroup({
  children,
  trigger,
  open,
  onOpenChange,
  closeIcon,
  placement,
  shape = "circle",
  type = "default",
  icon,
  disabled,
  className,
  onClick,
  ...rest
}: FloatButtonGroupProp) {
  const { t } = useTranslation();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isMenuMode = trigger === "click" || trigger === "hover";
  const mergedPlacement = PLACEMENTS.includes(placement as FloatButtonPlacementProp)
    ? (placement as FloatButtonPlacementProp)
    : "top";
  /* antd: a circle group keeps its buttons apart; a square group draws one joined slab. */
  const individual = shape === "circle";

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = open != null;
  const isOpen = isControlled ? open : uncontrolledOpen;

  if (process.env.NODE_ENV !== "production" && isControlled && !trigger) {
    console.warn(
      "[@godxjp/ui] FloatButton.Group: `open` needs to be used together with `trigger`.",
    );
  }

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled || next === isOpen) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [disabled, isOpen, isControlled, onOpenChange],
  );

  /*
   * Click-outside, and the two ways it goes wrong in a shadow root.
   *
   * antd binds on `document` and tests `root.contains(event.target)`. Inside a shadow root the
   * target is RETARGETED to the host before a document listener sees it, so that test is false for
   * a click on the group's OWN trigger: the menu closes on the same click that opened it, every
   * time, and only inside a shadow root — which is exactly where the GoDX Dock mounts
   * (`OverlayPortalProvider`). `composedPath()` is the retargeting-proof answer: it lists the real
   * nodes the event travelled through, shadow content and host alike.
   *
   * The listener stays on the DOCUMENT, and that half is not incidental. Binding to the group's own
   * `getRootNode()` instead — the obvious-looking fix, and the one this first shipped with — closes
   * the retargeting hole and opens a worse one: an event that happens OUTSIDE the shadow tree never
   * reaches a listener bound inside it, so a click anywhere else on the page would leave the menu
   * open forever. Mutation testing is what found that; the two shadow-root tests pin both halves.
   *
   * This is the first of the two things gh#558 asked for beyond the antd port.
   */
  React.useEffect(() => {
    if (trigger !== "click") return;
    const root = rootRef.current;
    if (!root) return;
    const doc = root.ownerDocument;
    const onDocClick = (event: Event) => {
      if (event.composedPath().includes(root)) return;
      setOpen(false);
    };
    doc.addEventListener("click", onDocClick, { capture: true });
    return () => doc.removeEventListener("click", onDocClick, { capture: true });
  }, [trigger, setOpen]);

  const listContext = React.useMemo(() => ({ shape, individual }), [shape, individual]);
  const triggerContext = React.useMemo(() => ({ shape, individual: true }), [shape]);

  const list = (
    <GroupContext.Provider value={listContext}>
      <div data-slot="float-button-list" className="ui-float-button-list">
        {children}
      </div>
    </GroupContext.Provider>
  );

  return (
    <div
      ref={rootRef}
      data-slot="float-button-group"
      data-placement={isMenuMode ? mergedPlacement : undefined}
      data-menu-mode={isMenuMode ? "" : undefined}
      data-individual={individual ? "" : undefined}
      data-state={isMenuMode ? (isOpen ? "open" : "closed") : undefined}
      className={cn("ui-float-button-group", className)}
      onMouseEnter={trigger === "hover" ? () => setOpen(true) : undefined}
      onMouseLeave={trigger === "hover" ? () => setOpen(false) : undefined}
    >
      {isMenuMode ? (isOpen ? list : null) : list}
      {isMenuMode ? (
        <GroupContext.Provider value={triggerContext}>
          <FloatButtonRoot
            {...rest}
            type={type}
            disabled={disabled}
            icon={isOpen ? (closeIcon ?? <X aria-hidden="true" />) : icon}
            aria-label={rest["aria-label"] ?? t("ui.floatButton.actions")}
            aria-expanded={isOpen}
            className="ui-float-button-trigger"
            onClick={(event) => {
              if (trigger === "click") setOpen(!isOpen);
              onClick?.(event as React.MouseEvent<HTMLButtonElement>);
            }}
          />
        </GroupContext.Provider>
      ) : null}
    </div>
  );
}

/** antd's `easeInOutCubic`, the curve its own `scrollTo` uses. Ported so `duration` means the same
 * number of milliseconds of the same motion it means in an antd app. */
function easeInOutCubic(t: number, b: number, c: number, d: number): number {
  const cc = c - b;
  let tt = t / (d / 2);
  if (tt < 1) return (cc / 2) * tt * tt * tt + b;
  tt -= 2;
  return (cc / 2) * (tt * tt * tt + 2) + b;
}

function readScrollTop(target: HTMLElement | Window | Document | null): number {
  if (!target) return 0;
  // `pageYOffset` is the browser's answer; `documentElement.scrollTop` is the same number and is
  // the one a non-browser DOM (jsdom, a test) actually moves. Reading both is not belt-and-braces:
  // it is the difference between a BackTop that can be tested and one that can only be eyeballed.
  if (target === window) return window.pageYOffset || window.document.documentElement.scrollTop;
  if ("documentElement" in target && target.documentElement) {
    return (target as Document).documentElement.scrollTop;
  }
  return (target as HTMLElement).scrollTop;
}

function writeScrollTop(target: HTMLElement | Window | Document | null, value: number): void {
  if (!target) return;
  if (target === window) {
    window.scrollTo(window.pageXOffset, value);
  } else if ("documentElement" in target && target.documentElement) {
    (target as Document).documentElement.scrollTop = value;
  } else {
    (target as HTMLElement).scrollTop = value;
  }
}

function readScrollProgress(target: HTMLElement | Window | Document | null): number {
  if (!target) return 0;
  const element =
    target === window
      ? window.document.documentElement
      : "documentElement" in target && target.documentElement
        ? (target as Document).documentElement
        : (target as HTMLElement);
  if (!element) return 0;
  const max = Math.max(element.scrollHeight - element.clientHeight, 0);
  if (max <= 0) return 0;
  return Math.min(Math.max(readScrollTop(target) / max, 0), 1);
}

/**
 * FloatButton.BackTop — the corner action that returns a scroll container to the top.
 *
 * `target` is antd's, and it is the answer to the objection that a document-bound BackTop competes
 * with a shell that owns its own scroll: pass `() => element` and this watches that element, not
 * the document. Under `prefers-reduced-motion` the scroll is instant rather than tweened
 * (WCAG 2.3.3), which is antd's behaviour too.
 */
function FloatButtonBackTop({
  visibilityHeight = 400,
  target,
  duration = 450,
  showProgress = false,
  onClick,
  icon,
  tooltip,
  className,
  ...rest
}: FloatButtonBackTopProp) {
  const { t } = useTranslation();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const nodeRef = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(visibilityHeight === 0);
  const [progress, setProgress] = React.useState(0);

  const getTarget = React.useCallback(
    (): HTMLElement | Window | Document | null =>
      target ? target() : (nodeRef.current?.ownerDocument ?? window),
    [target],
  );

  React.useEffect(() => {
    const container = getTarget();
    let frame = 0;
    const sync = () => {
      frame = 0;
      setVisible(readScrollTop(container) >= visibilityHeight);
      if (showProgress) setProgress(readScrollProgress(container));
    };
    // One read per animation frame. A scroll event can fire many times per frame, and each read of
    // `scrollTop` forces layout — the throttle is antd's `throttleByAnimationFrame`.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };
    sync();
    container?.addEventListener("scroll", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      container?.removeEventListener("scroll", onScroll);
    };
  }, [getTarget, showProgress, visibilityHeight]);

  const scrollToTop = (event: React.MouseEvent<HTMLElement>) => {
    const container = getTarget();
    const from = readScrollTop(container);
    if (reduceMotion || duration <= 0) {
      writeScrollTop(container, 0);
    } else {
      const startedAt = Date.now();
      const step = () => {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= duration) {
          writeScrollTop(container, 0);
          return;
        }
        writeScrollTop(container, easeInOutCubic(elapsed, from, 0, duration));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    onClick?.(event);
  };

  if (!visible) return null;

  return (
    <FloatButtonRoot
      {...rest}
      ref={nodeRef}
      className={cn("ui-float-button-back-top", className)}
      data-progress={showProgress ? "" : undefined}
      icon={icon ?? <ChevronUp aria-hidden="true" />}
      tooltip={tooltip ?? t("ui.floatButton.backTop")}
      onClick={scrollToTop}
      style={
        showProgress
          ? ({
              ...rest.style,
              "--float-button-progress-offset": `${progress}turn`,
            } as React.CSSProperties)
          : rest.style
      }
    />
  );
}

FloatButtonGroup.displayName = "FloatButton.Group";
FloatButtonBackTop.displayName = "FloatButton.BackTop";

/**
 * The compound, exactly as antd exports it: one name, two sub-parts on it. A consumer porting a
 * screen writes `<FloatButton.Group>` / `<FloatButton.BackTop>` unchanged.
 */
export const FloatButton = Object.assign(FloatButtonRoot, {
  Group: FloatButtonGroup,
  BackTop: FloatButtonBackTop,
});
