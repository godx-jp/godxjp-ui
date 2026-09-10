import * as React from "react";

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

export function OverlayPortalProvider({ container, children }: OverlayPortalProviderProps) {
  return (
    <OverlayPortalContext.Provider value={container}>{children}</OverlayPortalContext.Provider>
  );
}

/**
 * The container this overlay should render into. An explicit prop wins, so one panel can be placed
 * elsewhere without unmounting the provider around it.
 *
 * Not exported from the public barrel: this is a contract between the provider and the overlays
 * this library ships, not a knob for consumers — a consumer that needs the value has a provider.
 */
export function useOverlayPortalContainer(override?: Element): Element | undefined {
  const fromContext = React.useContext(OverlayPortalContext);

  return override ?? fromContext;
}
