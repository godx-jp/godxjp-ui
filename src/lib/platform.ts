/**
 * Whether the user agent runs on an Apple platform (macOS, iOS, iPadOS), where the primary
 * shortcut modifier is ⌘ (`metaKey`) rather than Ctrl (`ctrlKey`).
 *
 * `navigator.userAgentData.platform` is the standards answer (Chromium); `navigator.platform` is
 * the deprecated but universally present fallback (Safari and Firefox still report `MacIntel` /
 * `iPhone` / `iPad` there). Outside a browser there is no platform, so the answer is `false` — a
 * server render therefore describes the Ctrl shortcut.
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = data?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Has the user asked for reduced motion (WCAG 2.3.3)?
 *
 * Read at the moment of the gesture rather than subscribed to, because every caller asks the same
 * question at the same instant: "am I allowed to tween THIS scroll / THIS transition". A falsy or
 * unsupported environment — SSR, jsdom, a browser without `matchMedia`, a `matchMedia` that throws
 * on an unknown feature — answers `false`, which is the ordinary animated behaviour rather than a
 * crash.
 *
 * It lives here rather than beside its first caller because it had already been written twice
 * (`src/form/form-root.tsx`, `src/components/layout/legal-document-shell.tsx`) before a third
 * caller needed it.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
