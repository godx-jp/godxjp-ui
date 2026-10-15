/**
 * The element that REALLY has focus, through shadow roots (gh#1340).
 *
 * `document.activeElement` stops at the shadow HOST: with the app mounted in a shadow root (GoDX
 * Dock, `OverlayPortalProvider`), every `node.contains(document.activeElement)` in this library
 * read "focus is not in here" while focus sat on an input inside the panel.
 *
 * With `scope`, the walk starts at that node's own root (`getRootNode().activeElement`), which also
 * sees into a CLOSED shadow root the node lives in; it returns `null` when focus is not inside that
 * root at all. Without it, the walk starts at `document` and descends through open shadow roots.
 */
export function getActiveElement(scope?: Node | null): Element | null {
  if (typeof document === "undefined") return null;
  const root = scope?.getRootNode();
  let active: Element | null =
    root instanceof Document || root instanceof ShadowRoot
      ? root.activeElement
      : document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
