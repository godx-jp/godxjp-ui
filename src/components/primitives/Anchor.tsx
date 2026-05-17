import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "./cn";

/**
 * Anchor — in-page scroll-spy navigation.
 *
 * Compositional API:
 *   <Anchor orientation="vertical">
 *     <AnchorLink href="#intro">Intro</AnchorLink>
 *     <AnchorLink href="#install">Install</AnchorLink>
 *     <AnchorLink href="#api">API</AnchorLink>
 *   </Anchor>
 *
 * Data-driven API:
 *   <Anchor items={[{ href: "#intro", label: "Intro" }, …]} />
 *
 * Vocabulary (§23.B):
 *   - `orientation` — axis of stack ("vertical" default | "horizontal")
 *   - `sticky` — pin-on-scroll boolean
 *   - `offset` — pixel offset for IntersectionObserver root margin
 *   - `value` / `defaultValue` / `onValueChange` — controlled/uncontrolled
 *     active section (the active hash; mirrors Tabs/Select selection
 *     vocabulary; auto-detected via IntersectionObserver when uncontrolled)
 */

export type AnchorOrientation = "horizontal" | "vertical";

export interface AnchorItem {
  href: string;
  label: ReactNode;
}

export interface AnchorProps
  extends Omit<ComponentProps<"nav">, "defaultValue" | "onChange"> {
  orientation?: AnchorOrientation;
  sticky?: boolean;
  /** Pixel offset from the top of the viewport for scroll-spy detection. */
  offset?: number;
  /** Data-driven children. If omitted, render compositional `<AnchorLink>` children. */
  items?: AnchorItem[];
  /** Controlled active href (`#intro` etc.). */
  value?: string;
  /** Uncontrolled initial active href. */
  defaultValue?: string;
  onValueChange?: (href: string) => void;
}

export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    orientation = "vertical",
    sticky,
    offset = 0,
    items,
    value,
    defaultValue,
    onValueChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [internalActive, setInternalActive] = useState<string | undefined>(
    defaultValue,
  );
  const active = value ?? internalActive;

  const hrefs = useMemo(() => {
    if (items) return items.map((i) => i.href);
    // Compositional path — caller handles its own children; scroll-spy
    // still walks the DOM via document.querySelectorAll inside the effect.
    return [];
  }, [items]);

  // Scroll-spy: watch each target section's visibility.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const allHrefs = hrefs.length
      ? hrefs
      : Array.from(document.querySelectorAll<HTMLAnchorElement>(".anchor-link"))
          .map((a) => a.getAttribute("href") ?? "")
          .filter((h) => h.startsWith("#"));

    const targets = allHrefs
      .map((h) => document.querySelector(h))
      .filter((el): el is Element => el !== null);
    if (!targets.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const hash = `#${visible[0].target.id}`;
        if (value === undefined) setInternalActive(hash);
        onValueChange?.(hash);
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: [0.1, 0.5, 0.9],
      },
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [hrefs, offset, value, onValueChange]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      const top = (el as HTMLElement).offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
      if (value === undefined) setInternalActive(href);
      onValueChange?.(href);
    },
    [offset, value, onValueChange],
  );

  const renderedChildren = items
    ? items.map((it) => (
        <AnchorLink
          key={it.href}
          href={it.href}
          active={active === it.href}
          onClick={(e) => handleClick(e, it.href)}
        >
          {it.label}
        </AnchorLink>
      ))
    : children;

  return (
    <AnchorContext.Provider value={{ active, onClick: handleClick }}>
      <nav
        ref={ref}
        className={cn("anchor", className)}
        data-orientation={orientation}
        data-sticky={sticky ? "true" : undefined}
        aria-orientation={orientation}
        {...rest}
      >
        {renderedChildren}
      </nav>
    </AnchorContext.Provider>
  );
});

// ─── Compositional <AnchorLink> ──────────────────────────────────

interface AnchorContextValue {
  active?: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const AnchorContext = createContext<AnchorContextValue | null>(null);

export interface AnchorLinkProps extends ComponentProps<"a"> {
  href: string;
  /** Active state override — defaults to the parent Anchor's scroll-spy. */
  active?: boolean;
}

export const AnchorLink = forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  function AnchorLink({ href, active, onClick, className, children, ...rest }, ref) {
    const ctx = useContext(AnchorContext);
    // Stable id for screen-reader navigation breadcrumb.
    const ariaId = useId();
    const isActive = active ?? (ctx?.active === href);
    const handle = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && ctx) ctx.onClick(e, href);
    };
    return (
      <a
        ref={ref}
        href={href}
        id={`anchor-${ariaId}`}
        className={cn("anchor-link", className)}
        data-active={isActive ? "true" : undefined}
        aria-current={isActive ? "location" : undefined}
        onClick={handle}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
