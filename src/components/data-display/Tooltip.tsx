import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Tooltip — Radix-backed floating label anchored to a trigger.
 *
 * Two equivalent consumption modes per cardinal rule 23 (concept-first
 * API + minimise sub-components) and rule 31 (no nested wrappers):
 *
 *   1. Data-driven (preferred) — pass `content`:
 *
 *        <Tooltip content="保存します" placement="top">
 *          <Button>保存</Button>
 *        </Tooltip>
 *
 *      Auto-wires `TooltipProvider` + `TooltipPrimitive.Root` +
 *      `TooltipTrigger(asChild)` + `TooltipContent`.
 *
 *   2. Compositional (advanced) — omit `content`, supply children:
 *
 *        <TooltipProvider>
 *          <Tooltip>
 *            <TooltipTrigger asChild><Button /></TooltipTrigger>
 *            <TooltipContent>rich JSX…</TooltipContent>
 *          </Tooltip>
 *        </TooltipProvider>
 *
 * The compositional mode exists ONLY because Radix Tooltip needs a
 * shared `TooltipProvider` ancestor when multiple tooltips share a
 * `delayDuration` config — the data-driven mode handles a single
 * tooltip per consumer call.
 *
 * Nested-provider safety: data-driven `<Tooltip>` calls detect an
 * ancestor `<TooltipProvider>` (via a private React context the
 * framework's `<TooltipProvider>` populates) and skip wrapping with
 * an inner Provider when one is already present — the outer
 * Provider's `delayDuration` is reused rather than silently
 * overridden. NOTE: this detection only fires when the ancestor is
 * the framework's `<TooltipProvider>` re-export. Consumers who use
 * Radix's `TooltipProvider` directly from `@radix-ui/react-tooltip`
 * fall back to the double-wrap behaviour — use the framework export
 * to get the dedupe.
 *
 * Styled via the canonical `.tooltip-content` class from
 * `src/styles/shell/35-badge-tag-misc.css` (cardinal rule 21 — reads
 * tokens, honours every axis).
 */

/**
 * Internal marker context — populated by the framework's
 * `<TooltipProvider>` so that data-driven `<Tooltip>` calls can
 * detect they're already inside a Provider and skip double-wrapping.
 * NOT exported (rule 28 §D — internal surface).
 */
const TooltipProviderPresenceContext = createContext<boolean>(false);

export type TooltipProviderProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Provider
>;

/**
 * `TooltipProvider` — wraps Radix's `Tooltip.Provider` AND populates
 * the internal presence-marker context so nested data-driven
 * `<Tooltip>` calls dedupe automatically.
 */
export function TooltipProvider({
  children,
  ...rest
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider {...rest}>
      <TooltipProviderPresenceContext.Provider value={true}>
        {children}
      </TooltipProviderPresenceContext.Provider>
    </TooltipPrimitive.Provider>
  );
}

export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export interface TooltipContentProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent({ className, sideOffset = 4, ...rest }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn("tooltip-content", className)}
        {...rest}
      />
    </TooltipPrimitive.Portal>
  );
});

export interface TooltipProps {
  /** Tooltip text / content. When set, primitive auto-wires
   * `TooltipProvider` + `TooltipTrigger(asChild)` + `TooltipContent`
   * around the child trigger element — the consumer just provides
   * the trigger node. When omitted, the primitive falls back to
   * compositional mode (consumer-rendered `<TooltipTrigger>` +
   * `<TooltipContent>` children). */
  content?: ReactNode;
  /** Trigger element (data-driven mode) OR Radix Root children
   * (compositional mode). */
  children?: ReactNode;
  /** Anchor side per cardinal rule 23 §B `placement` vocabulary.
   * Default `top`. Honoured only in data-driven mode. */
  placement?: "top" | "right" | "bottom" | "left";
  /** Open / close delay in ms. Default 200. Honoured in data-driven
   * mode (sets `TooltipProvider.delayDuration`); in compositional
   * mode the consumer's outer `<TooltipProvider>` controls timing. */
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const hasAncestorProvider = useContext(TooltipProviderPresenceContext);
  if (content === undefined) {
    // Compositional — consumer's <TooltipProvider> wraps and they
    // hand-roll <TooltipTrigger> + <TooltipContent> inside the
    // children. We just pass-through the Radix Root.
    return (
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {children}
      </TooltipPrimitive.Root>
    );
  }
  // Data-driven — auto-wire Root + Trigger + Content. Wrap with an
  // inner <TooltipProvider> ONLY when there's no ancestor Provider;
  // otherwise the outer Provider's delayDuration / disableHoverableContent
  // would be silently overridden by the inner one (cardinal rule 31
  // — no double-wrap).
  const root = (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={placement}>{content}</TooltipContent>
    </TooltipPrimitive.Root>
  );
  if (hasAncestorProvider) return root;
  return (
    <TooltipProvider delayDuration={delayDuration}>{root}</TooltipProvider>
  );
}
