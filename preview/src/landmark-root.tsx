import * as React from "react";

export type LandmarkRootProps = React.HTMLAttributes<HTMLElement> & {
  /** `data-*` markers the harness routes put on its root (e.g. `data-rtl-root`). */
  [dataAttribute: `data-${string}`]: unknown;
};

/**
 * The ONE landmark decision shared by every preview harness route (`/frame/**` and
 * `/isolate/**`).
 *
 * A harness page needs exactly ONE top-level `<main>` — but whether that `main` belongs to
 * US (a bare component/fragment demo, e.g. a Card showcase with no page shell) or to the
 * STORY ITSELF (a full-screen recipe rendering `AppShell` / `AuthShell` / `CenteredShell`,
 * which already emit their own `<main>`) is a RUNTIME fact about the rendered tree. It is
 * not knowable from story metadata — every catalog entry defaults to `layout: "fullscreen"`
 * regardless of content — and it must never be re-derived from a hand-maintained story-id
 * list: `/isolate` used to keep one, it drifted behind the catalog, and every shell story
 * added after it was written got double-wrapped (`landmark-no-duplicate-main` +
 * `landmark-main-is-top-level` on real shipped frames). One detector, imported twice, is
 * the only shape that cannot drift.
 *
 * Detection: render, then look for a `<main>` / `role="main"` in our own subtree. If the
 * story owns one, become a plain `<div>` (avoids `landmark-no-duplicate-main` /
 * `landmark-main-is-top-level`); otherwise stay the REAL `<main>` element (avoids
 * `landmark-one-main`).
 *
 * We render the actual `<main>` TAG, never a `role="main"` div: several axe landmark checks
 * (e.g. `landmark-banner-is-top-level`'s body-context match for the toolbar `<header>`) walk
 * ancestors by native tag name (`article, aside, main, nav, section`), not computed role — a
 * `<div role="main">` would NOT be recognised as sectioning content by that walk, so a
 * `<header>` inside it would wrongly start resolving to a top-level `banner` landmark.
 *
 * LIFECYCLE / FIRST PAINT. The probe needs a mounted subtree, so it cannot run in a render
 * body — but `useLayoutEffect` runs synchronously after commit and BEFORE the browser
 * paints, so the corrected tag is in the DOM for the FIRST paint: there is no flash and no
 * window in which axe (or a screenshot) can observe the wrong landmark. Both harness entry
 * points are client-only (`createRoot`, no SSR/hydration), so the `useLayoutEffect`-on-server
 * warning does not apply here. The one real cost is that flipping the host tag remounts the
 * demo subtree once — accepted, and already the behaviour `/frame/**` shipped with.
 *
 * The effect intentionally has NO dependency array: stories are lazily loaded and can swap
 * their rendered tree after mount, so the landmark answer is re-derived on every render
 * (`setAsMain` bails out when the answer is unchanged, so this settles in one extra pass).
 */
export function LandmarkRoot({ children, ...rest }: LandmarkRootProps) {
  const ref = React.useRef<HTMLElement>(null);
  // Optimistic default: an own `<main>` (the common case — most demos are bare
  // component/fragment showcases with no page shell of their own).
  const [asMain, setAsMain] = React.useState(true);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const hasOwnMain = node.querySelector('main, [role="main"]') != null;
    setAsMain(!hasOwnMain);
  });

  const Tag = asMain ? "main" : "div";
  return (
    // A union intrinsic tag collapses its ref type to the narrower `HTMLDivElement`; the probe
    // only ever uses plain `HTMLElement` APIs, so the cast is local and safe.
    <Tag ref={ref as React.Ref<HTMLDivElement>} {...rest}>
      {children}
    </Tag>
  );
}
