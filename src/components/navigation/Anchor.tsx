import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Anchor — in-page scroll-spy navigation.
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
  items: AnchorItem[];
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
    ...rest
  },
  ref,
) {
  const [internalActive, setInternalActive] = useState<string | undefined>(
    defaultValue,
  );
  const active = value ?? internalActive;

  const hrefs = useMemo(() => items.map((i) => i.href), [items]);

  // Scroll-spy: watch each target section's visibility.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const allHrefs = hrefs;

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
      // Use getBoundingClientRect + window.scrollY so the scroll
      // target is correct regardless of `offsetParent` — when
      // sections are nested inside a flex/grid container (e.g.
      // a docs layout with sidebar + content), `offsetTop` is
      // measured relative to that parent, not the document, so
      // window.scrollTo lands at the wrong place.
      const rect = (el as HTMLElement).getBoundingClientRect();
      const top = rect.top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      if (value === undefined) setInternalActive(href);
      onValueChange?.(href);
    },
    [offset, value, onValueChange],
  );

  return (
    <nav
      ref={ref}
      className={cn("anchor", className)}
      data-orientation={orientation}
      data-sticky={sticky ? "true" : undefined}
      aria-orientation={orientation}
      {...rest}
    >
      {items.map((item) => {
        const isActive = active === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className="anchor-link"
            data-active={isActive ? "true" : undefined}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => handleClick(event, item.href)}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
});
