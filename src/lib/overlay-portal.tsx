import * as React from "react";
import { useLayoutEffect } from "@react-aria/utils";
import { enableShadowDOM } from "react-stately/private/flags/flags";

/**
 * WHERE EVERY OVERLAY IN THIS LIBRARY IS RENDERED.
 *
 * A popover, a dialog, a sheet, a tooltip and a menu all portal out of the tree that declared them
 * — they have to, or an `overflow: hidden` ancestor clips them and a `z-index` neighbour covers
 * them. The destination is `document.body`, which is the right answer everywhere except one place:
 * a SHADOW ROOT.
 *
 * There the default sends the panel out of the tree that carries this library's stylesheet, into a
 * host document that has never heard of it. Measured on an embedded bar: `border: 0`, `radius: 0`,
 * `background: transparent`, and the anchor maths 40px off because the trigger and the panel no
 * longer share a tree. On a host that happens to load this library too, the panel picks up the
 * HOST's copy and looks almost right — which is worse, because it hides the defect until the first
 * consumer that does not.
 *
 * ONE PROVIDER RATHER THAN A PROP PER COMPONENT. Where overlays render is a fact about the tree,
 * not about any one control: an app mounted in a shadow root needs every overlay moved, and a
 * consumer that had to remember six props would get five of them right. The provider is also what
 * makes a component composable — `AppLauncher` owns its own popover, and no prop a consumer passes
 * to the launcher could reach it.
 */
const OverlayPortalContext = React.createContext<Element | undefined>(undefined);

export interface OverlayPortalProviderProps {
  /**
   * The element overlays are rendered into. Pass the shadow root, or any element inside it.
   * `undefined` restores the default, so a subtree can opt back out.
   */
  container: Element | undefined;
  children: React.ReactNode;
}

/**
 * REACT ARIA IS SHADOW-BLIND UNTIL IT IS TOLD OTHERWISE, and moving the portal is only half of what
 * an embedded overlay needs.
 *
 * `react-aria` ships a full shadow-DOM implementation — `contains()` that climbs through hosts and
 * slots, an `activeElement` that descends into shadow roots, an event target read off
 * `composedPath()` — and every one of those helpers begins by asking a global flag whether shadow
 * DOM is enabled, defaulting to the light-DOM answer. The light-DOM answers are all WRONG inside a
 * shadow root, and they fail in the direction that looks like a bug in this library:
 *
 *   • `document.activeElement` stops at the shadow HOST, so a focus scope believes focus never
 *     entered the dialog. It does not trap, and Escape reaches nothing.
 *   • `node.contains(target)` cannot cross the boundary, so the click that OPENED the overlay reads
 *     as a click OUTSIDE it and an `isDismissable` overlay closes itself on the way up. Measured on
 *     the embedded bar: the launchpad opened and shut on one press.
 *
 * The flag is global and one-way, and this provider is the only place in the library that knows a
 * shadow root is in play — a consumer mounts it precisely because its tree lives in one. Enabled at
 * module scope rather than in an effect so the first render is already correct; the light-DOM paths
 * it replaces are the same code with the boundary walk skipped, so a page with no shadow root
 * behaves identically.
 */
enableShadowDOM();

export function OverlayPortalProvider({ container, children }: OverlayPortalProviderProps) {
  return (
    <OverlayPortalContext.Provider value={container}>{children}</OverlayPortalContext.Provider>
  );
}

/**
 * THE SECOND REASON A PORTAL DESTINATION IS NOT JUST A PLACE: it is also where the overlay's
 * TOKENS come from (gh#877).
 *
 * Custom-property inheritance stops at the portal boundary. A region that themes itself — the
 * `[data-tenant]` wrapper this repo's own docs tell consumers to write, a `tenantTheme(hex).vars`
 * style, a `.dark` on a region rather than on `<html>` — themes its own subtree and NOTHING it
 * opens. Measured on `/isolate/feedback-dialog` with the trigger inside such a scope:
 *
 *     inside the scope    --primary 204 100% 37%   --radius 20px   --card 0 0% 20%
 *     the opened Dialog   --primary 268.7 100% 50% --radius calc(0.375rem * 1) --card 60 33% 99%
 *
 * `ThemeScope` closes that. It renders a host element at the portal destination carrying the
 * computed DIFF between the scope and `document.documentElement`, and hands that host to every
 * overlay below it. Inheritance is then real DOM containment: one host, not a stamp per popup.
 *
 * WHY A DIFF OF COMPUTED VALUES rather than the declarations some provider happens to hold.
 * Computed values already include everything inherited, so the diff IS the merged token set
 * expressed as a delta — and it does not care WHO set a token. Measured on a scope themed the
 * plain-CSS way (`[data-tenant="acme"] { --primary; --radius; --card }`, no provider involved):
 * 2085 custom properties at root, 3 differing. Re-measured in Chromium on the docs screen, where
 * the region also carries a customer brand: 2087 properties in scope, 11 differing, 1.2ms median
 * to enumerate and diff (0.7 + 0.5, 20 runs). Stamping "the
 * provider's own declarations" instead would have left the plain-CSS path — the DOCUMENTED one —
 * broken, which is the argument that decided this design.
 *
 * WHY NOT MOVE THE PORTAL INTO THE SCOPE. `OverlayPortalProvider container=` can already do that
 * and it stays an explicit opt-in for the shadow-DOM case it was built for. As a default it
 * reintroduces exactly what the portal exists to avoid: a themed wrapper that happens to sit
 * inside an `overflow: hidden`, a `transform` or a `contain` ancestor clips its own overlays. A
 * colour bug traded for a layout bug, and the layout bug is harder to see.
 */
const OVERLAY_THEME_HOST_ATTRIBUTE = "data-overlay-theme-host";

/** Refresh the nearest `ThemeScope` host. `undefined` when there is no `ThemeScope` above. */
const OverlayThemeRefreshContext = React.createContext<(() => void) | undefined>(undefined);

function collectCustomPropertyNames(style: CSSStyleDeclaration, into: Set<string>): void {
  for (let index = 0; index < style.length; index += 1) {
    const name = style[index];

    if (name.startsWith("--")) into.add(name);
  }
}

/**
 * Write onto `host` every custom property whose computed value at `scope` differs from its
 * computed value at `document.documentElement`, and remove the ones that no longer differ.
 *
 * The host is a child of the portal destination, which inherits from the root, so root ⊕ diff is
 * exactly the scope. Returns the number of properties carried — the measurement gh#877 asks for.
 *
 * Names are taken from BOTH computed styles: a real engine reports every property in scope on
 * either one, and reading both is what catches a token declared only below root.
 */
function syncOverlayThemeHost(host: HTMLElement, scope: Element): number {
  const view = scope.ownerDocument.defaultView;

  if (!view) return 0;

  const rootStyle = view.getComputedStyle(scope.ownerDocument.documentElement);
  const scopeStyle = view.getComputedStyle(scope);
  const names = new Set<string>();

  collectCustomPropertyNames(rootStyle, names);
  collectCustomPropertyNames(scopeStyle, names);

  const carried = new Set<string>();

  for (const name of names) {
    const value = scopeStyle.getPropertyValue(name);

    if (value === rootStyle.getPropertyValue(name)) continue;
    carried.add(name);
    if (host.style.getPropertyValue(name) !== value) host.style.setProperty(name, value);
  }

  for (let index = host.style.length - 1; index >= 0; index -= 1) {
    const name = host.style[index];

    if (name.startsWith("--") && !carried.has(name)) host.style.removeProperty(name);
  }

  return carried.size;
}

export interface ThemeScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * A themed region whose overlays keep the region's tokens.
 *
 * Put the theme on it — `style={tenantTheme(hex).vars}`, `data-tenant="acme"`, `className="dark"`
 * — or on any ancestor, or in a stylesheet that never mentions React at all. The scope is read
 * from the DOM, not from props, so all three paths behave the same.
 *
 * The element itself is `display: contents` by default, so dropping it into an existing flex or
 * grid row changes no layout; pass `style={{ display: "block" }}` if you want a box.
 */
export function ThemeScope({ children, style, ...props }: ThemeScopeProps) {
  const scopeRef = React.useRef<HTMLDivElement | null>(null);
  const hostRef = React.useRef<HTMLElement | null>(null);
  const parentContainer = React.useContext(OverlayPortalContext);
  const [host, setHost] = React.useState<HTMLElement>();

  const refresh = React.useCallback(() => {
    const scope = scopeRef.current;
    const currentHost = hostRef.current;

    if (scope && currentHost) syncOverlayThemeHost(currentHost, scope);
  }, []);

  /*
   * The host is created imperatively rather than portalled as JSX because it must exist BEFORE the
   * first overlay below asks for a container, and because the diff is written straight onto the
   * node — a refresh then costs one style write, not a React render of the whole scope.
   */
  useLayoutEffect(() => {
    const scope = scopeRef.current;

    if (!scope) return;

    const doc = scope.ownerDocument;
    const parent = parentContainer ?? doc.body;
    const element = doc.createElement("div");

    element.setAttribute(OVERLAY_THEME_HOST_ATTRIBUTE, "");
    element.style.display = "contents";
    syncOverlayThemeHost(element, scope);
    parent.appendChild(element);
    hostRef.current = element;
    setHost(element);

    return () => {
      element.remove();
      hostRef.current = null;
      setHost(undefined);
    };
  }, [parentContainer]);

  /*
   * THE DIFF IS A SNAPSHOT, and a dark-mode toggle or a tenant switch changes the scope after it
   * was taken — including while an overlay is already open, when nothing remounts to re-read it.
   * A theme is applied by writing an attribute (`data-theme`, `data-tenant`, `class`, `style`)
   * somewhere between this element and `<html>`, so that chain is what is observed. It is short —
   * a dozen elements — and attribute records are only delivered when one actually changes.
   */
  React.useEffect(() => {
    const scope = scopeRef.current;

    if (!scope || !host) return;

    const view = scope.ownerDocument.defaultView;

    if (!view?.MutationObserver) return;

    const observer = new view.MutationObserver(refresh);

    for (let element: Element | null = scope; element; element = element.parentElement) {
      observer.observe(element, { attributes: true });
    }

    return () => observer.disconnect();
  }, [host, refresh]);

  return (
    /*
     * `host ?? parentContainer`, never a bare `host`: the host only exists from the first layout
     * effect onward, and for that first commit an overlay below must still see whatever container
     * was already in force — otherwise mounting a ThemeScope inside an `OverlayPortalProvider`
     * would briefly send a `defaultOpen` panel back to `document.body`, out of the shadow root.
     */
    <OverlayPortalContext.Provider value={host ?? parentContainer}>
      <OverlayThemeRefreshContext.Provider value={refresh}>
        <div ref={scopeRef} style={{ display: "contents", ...style }} {...props}>
          {children}
        </div>
      </OverlayThemeRefreshContext.Provider>
    </OverlayPortalContext.Provider>
  );
}

/**
 * The container this overlay should render into. An explicit prop wins, so one panel can be placed
 * elsewhere without unmounting the provider around it.
 *
 * Not exported from the public barrel: this is a contract between the provider and the overlays
 * this library ships, not a knob for consumers — a consumer that needs the value has a provider.
 *
 * The effect re-reads the enclosing `ThemeScope` when an overlay mounts. A `MutationObserver`
 * covers a theme changed by an attribute; this covers the rest — a stylesheet added late, a
 * `@media` or `@supports` branch that flipped since the snapshot was taken. It costs one enumerate
 * + diff (1.2ms median over 2087 properties, measured in Chromium) per overlay mount and NOTHING
 * when no `ThemeScope` is above, because the context is then `undefined`.
 */
export function useOverlayPortalContainer(override?: Element): Element | undefined {
  const fromContext = React.useContext(OverlayPortalContext);
  const refreshOverlayTheme = React.useContext(OverlayThemeRefreshContext);

  useLayoutEffect(() => {
    refreshOverlayTheme?.();
  }, [refreshOverlayTheme]);

  return override ?? fromContext;
}
