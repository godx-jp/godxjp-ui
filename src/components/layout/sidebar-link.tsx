import * as React from "react";

import type { SidebarLinkComponentProp, SidebarLinkProp } from "../../props/components/layout.prop";

/**
 * Adapt a framework router `Link` to {@link SidebarLinkComponentProp} (gh#213) — a dependency-free
 * factory, so `@godxjp/ui` still ships ZERO router/framework dependencies.
 *
 * It lives in its own module (imports only React + the prop types) so `@godxjp/ui/inertia` can build
 * on it without pulling the whole Sidebar — and its Collapsible/Popover/Tooltip tree — into a
 * form-only consumer's bundle.
 *
 * It normalizes only the two things that differ between routers:
 * 1. **Which prop carries the destination** — `"href"` (Inertia, Next.js) or `"to"` (React Router,
 *    TanStack Router).
 * 2. **A row with no destination** — a disabled row must never mount a router link (Inertia and
 *    React Router both require a string destination and would navigate to `""`); it falls back to an
 *    inert `<a>` that keeps the canonical row class and `aria-disabled`. That fallback carries an
 *    explicit `role="link"`: an `<a>` without `href` has NO implicit role, so a screen reader would
 *    announce it as plain text and `aria-label` would be a prohibited attribute — which is exactly
 *    how the icon-only collapsed rail (where the label lives on `aria-label`) would have lost the
 *    name of every disabled row. Callers that supply their own role — the collapsed flyout's
 *    `menuitem` — still win, because `rest` is spread after it.
 *
 * Everything else — the icon, the label, the badge, `data-active`/`aria-current`, the collapsed
 * rail's `aria-label` — is composed by the LIBRARY and arrives as `children`. The consumer never
 * reconstructs row markup, which is what makes the reported "every sidebar icon disappeared"
 * regression impossible.
 *
 * @example
 * ```tsx
 * // React Router / TanStack Router — destination prop is `to`.
 * import { Link } from "react-router-dom";
 * const RouterLink = createSidebarLink(Link, "to");
 * <Sidebar linkComponent={RouterLink} sections={sections} activeId={activeId} />
 *
 * // Inertia / Next.js — destination prop is `href` (the default).
 * import { Link } from "@inertiajs/react";
 * const InertiaLink = createSidebarLink(Link);
 * ```
 */
export function createSidebarLink<P extends { className?: string; children?: React.ReactNode }>(
  Link: React.ComponentType<P>,
  hrefProp: "href" | "to" = "href",
): SidebarLinkComponentProp {
  const Adapter = React.forwardRef<HTMLAnchorElement, SidebarLinkProp>(function SidebarLinkAdapter(
    { href, ...rest },
    ref,
  ) {
    if (!href) return <a ref={ref} role="link" {...rest} />;
    const routed = { [hrefProp]: href, ...rest, ref } as unknown as P &
      React.RefAttributes<unknown>;
    return <Link {...routed} />;
  });
  return Adapter as unknown as SidebarLinkComponentProp;
}
