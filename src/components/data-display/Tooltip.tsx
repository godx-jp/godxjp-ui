import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
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
 *      Auto-wires the Radix Root + Trigger(asChild) + Content.
 *
 * Shared timing across the app is configured once on
 * `<GodxConfigProvider>` — the consumer never imports a separate
 * `TooltipProvider`. The provider internally mounts the Radix Provider
 * so every nested `<Tooltip>` picks up the same `delayDuration` /
 * `skipDelayDuration`. Per-tooltip overrides flow through the
 * `delayDuration` prop on `<Tooltip>` itself.
 *
 * Styled via the canonical `.tooltip-content` class from
 * `src/styles/shell/35-badge-tag-misc.css` (cardinal rule 21 — reads
 * tokens, honours every axis).
 */

/**
 * Internal marker context — populated by `InternalTooltipProvider`
 * (mounted by `<GodxConfigProvider>`) so data-driven `<Tooltip>` calls
 * can detect they're already inside a Provider and skip
 * double-wrapping. Not exported.
 */
const TooltipProviderPresenceContext = createContext<boolean>(false);

type InternalTooltipProviderProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Provider
>;

/**
 * `InternalTooltipProvider` — wraps Radix's `Tooltip.Provider` AND
 * populates the internal presence-marker context so nested data-driven
 * `<Tooltip>` calls dedupe automatically.
 *
 * This is an internal surface (not exported from `@godxjp/ui`).
 * `<GodxConfigProvider>` mounts it once at the root so every consumer
 * gets shared tooltip timing without ever importing this directly.
 */
export function InternalTooltipProvider({
  children,
  ...rest
}: InternalTooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider {...rest}>
      <TooltipProviderPresenceContext.Provider value={true}>
        {children}
      </TooltipProviderPresenceContext.Provider>
    </TooltipPrimitive.Provider>
  );
}

interface TooltipFloatingProps
  extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

function TooltipFloating({ className, sideOffset = 4, ...rest }: TooltipFloatingProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn("tooltip-content", className)}
        {...rest}
      />
    </TooltipPrimitive.Portal>
  );
}

export interface TooltipProps {
  /** Tooltip text / content. When set, primitive auto-wires the
   * Radix Root + Trigger(asChild) + Content around the child trigger
   * element — the consumer just provides the trigger node. When
   * omitted, the primitive renders children without tooltip wiring. */
  content?: ReactNode;
  /** Trigger element (data-driven mode) OR Radix Root children
   * (compositional mode). */
  children?: ReactNode;
  /** Anchor side per cardinal rule 23 §B `placement` vocabulary.
   * Default `top`. Honoured only in data-driven mode. */
  placement?: "top" | "right" | "bottom" | "left";
  /** Open / close delay in ms. Default 200. Overrides the
   * app-wide default set on `<GodxConfigProvider>` for this single
   * tooltip; without an override the Provider's shared timing wins. */
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
  if (content === undefined) return <>{children}</>;
  // Data-driven — auto-wire Root + Trigger + Content. Wrap with an
  // ad-hoc Provider ONLY when there's no ancestor Provider (e.g.
  // isolated Storybook render without <GodxConfigProvider>); otherwise
  // the outer Provider's timing would be silently overridden
  // (cardinal rule 31 — no double-wrap).
  const root = (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipFloating side={placement}>{content}</TooltipFloating>
    </TooltipPrimitive.Root>
  );
  if (hasAncestorProvider) return root;
  return (
    <InternalTooltipProvider delayDuration={delayDuration}>
      {root}
    </InternalTooltipProvider>
  );
}
