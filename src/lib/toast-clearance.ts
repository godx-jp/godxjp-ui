/**
 * Toast clearance for sticky action bars (gh#1271).
 *
 * The Toaster stacks bottom-right, and a page's sticky action bar (`PageContainer stickyFooter`,
 * `MobileShell actions` + `tabBar`) is pinned to the same edge — so without this a stack of three
 * success toasts sits on top of the submit button that raised them. The bar publishes its own
 * block size on `<html>` as `--toast-sticky-bar-height`; the Toaster adds that length to its bottom
 * offset (`sonner.tsx`). The tier file declares the property `0px`, so with no bar mounted — or
 * the bar hidden — the toaster's offset is exactly what it was before.
 *
 * Internal: reachable from no published subpath.
 */
import { type RefObject, useEffect } from "react";

/** The custom property the Toaster reads. Declared `0px` in `src/tokens/components/feedback.css`. */
export const TOAST_STICKY_BAR_PROPERTY = "--toast-sticky-bar-height";

/**
 * While `enabled`, publish the summed border-box block size of `refs` on `<html>` and keep it
 * current with a `ResizeObserver`; remove it when disabled or unmounted.
 *
 * `offsetHeight`, not `getBoundingClientRect()`: the reveal footer slides in with a `transform`,
 * and a transform must not leak into the clearance mid-transition. Everything runs in an effect,
 * so SSR never touches `document`. One page-level bar at a time is the assumed shape: a second
 * mounted bar overwrites the first's value, and either unmount clears it.
 */
export function useToastStickyBarClearance(
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  enabled: boolean,
): void {
  useEffect(() => {
    const elements = refs.map((ref) => ref.current).filter((el): el is HTMLElement => el != null);
    if (!enabled || elements.length === 0 || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const html = document.documentElement;
    const publish = () => {
      const height = elements.reduce((sum, el) => sum + el.offsetHeight, 0);
      html.style.setProperty(TOAST_STICKY_BAR_PROPERTY, `${height}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    for (const el of elements) observer.observe(el);
    return () => {
      observer.disconnect();
      html.style.removeProperty(TOAST_STICKY_BAR_PROPERTY);
    };
    // `refs` is a fresh array literal per render. What matters is WHICH bands are mounted, and a
    // caller lists only the mounted ones, so `refs.length` (with `enabled`) tracks exactly that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refs.length]);
}
