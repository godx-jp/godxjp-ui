import * as React from "react";

/**
 * WHICH SURFACE a navigation component is rendering into.
 *
 * `AppShell` reuses the very same `sidebar` / `navRail` nodes for the mobile drawer that it docks
 * on desktop — that is the point of the default, since a consumer should not have to build its
 * navigation twice. But those nodes carry `collapsed`, and collapse is a DESKTOP answer: it trades
 * labels for horizontal room in a docked column. A drawer has no such pressure, and below the
 * breakpoint it is the ONLY navigation there is.
 *
 * Shipping both together produced a drawer of anonymous icons: a consumer collapsed its sidebar at
 * 1280px, resized to 393px, opened the drawer, and got the organization mark plus five unlabelled
 * glyphs — captured in that repo's own browser test, which is named "desktop sidebar collapse
 * stays independent from the mobile navigation drawer" and had been asserting exactly this.
 *
 * The node cannot be un-collapsed from the outside once it is built, so the surface announces
 * itself instead and the navigation components read it. Not exported from the public barrel: this
 * is a contract between `AppShell` and the navigation it hosts, not a consumer knob.
 */
export type NavSurface = "docked" | "drawer";

const NavSurfaceContext = React.createContext<NavSurface>("docked");

export function NavSurfaceProvider({
  surface,
  children,
}: {
  surface: NavSurface;
  children: React.ReactNode;
}) {
  return <NavSurfaceContext.Provider value={surface}>{children}</NavSurfaceContext.Provider>;
}

/** `"docked"` outside an AppShell drawer — so a standalone `Sidebar` keeps its own `collapsed`. */
export function useNavSurface(): NavSurface {
  return React.useContext(NavSurfaceContext);
}
