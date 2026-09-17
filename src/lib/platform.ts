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
