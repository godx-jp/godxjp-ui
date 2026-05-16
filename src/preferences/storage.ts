// Storage primitives — localStorage + cookie.
//
// localStorage is the primary surface (browser-only, survives reload,
// no server round-trip). Cookie is opt-in for deployments that read
// the prefs server-side (SSR / Edge / RSC). Both can be enabled.
//
// Cookie format follows RFC 6265bis-13:
//   <name>=<value>; Max-Age=<s>; Path=/; SameSite=Lax; [Secure]; [Domain=<d>]
// We DO set `Secure` automatically when the page is https.

export type PreferenceStorage = "localStorage" | "cookie" | "both";

export interface CookieOptions {
  /** Cookie domain, e.g. ".godx.jp" (omit for host-only). */
  domain?: string;
  /** Max-Age in seconds; default 365 days. */
  maxAgeSeconds?: number;
  /**
   * SameSite — "Lax" is the spec default and the right choice for
   * preferences; "Strict" breaks cross-portal nav, "None" needs Secure.
   */
  sameSite?: "Lax" | "Strict" | "None";
}

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isSecure(): boolean {
  return isBrowser() && window.location.protocol === "https:";
}

// ── localStorage ──────────────────────────────────────────────────

export function readLocalStorage(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string | null): void {
  if (!isBrowser()) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* private-browsing / quota — ignore */
  }
}

// ── Cookie ────────────────────────────────────────────────────────

export function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const target = `${name}=`;
  for (const raw of document.cookie.split(";")) {
    const c = raw.trim();
    if (c.startsWith(target)) return decodeURIComponent(c.slice(target.length));
  }
  return null;
}

export function writeCookie(
  name: string,
  value: string | null,
  options: CookieOptions = {},
): void {
  if (!isBrowser()) return;
  const sameSite = options.sameSite ?? "Lax";
  const parts: string[] = [];

  if (value === null) {
    parts.push(`${name}=`);
    parts.push("Max-Age=0");
  } else {
    parts.push(`${name}=${encodeURIComponent(value)}`);
    parts.push(`Max-Age=${options.maxAgeSeconds ?? DEFAULT_COOKIE_MAX_AGE}`);
  }
  parts.push("Path=/");
  parts.push(`SameSite=${sameSite}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (sameSite === "None" || isSecure()) parts.push("Secure");

  document.cookie = parts.join("; ");
}

// ── Combined read/write per storage policy ────────────────────────

export function readStored(
  storage: PreferenceStorage,
  key: string,
): string | null {
  if (storage === "localStorage") return readLocalStorage(key);
  if (storage === "cookie") return readCookie(key);
  // "both" — cookie wins (server-readable canonical), fall back to LS
  return readCookie(key) ?? readLocalStorage(key);
}

export function writeStored(
  storage: PreferenceStorage,
  key: string,
  value: string | null,
  cookieOptions?: CookieOptions,
): void {
  if (storage === "localStorage" || storage === "both") {
    writeLocalStorage(key, value);
  }
  if (storage === "cookie" || storage === "both") {
    writeCookie(key, value, cookieOptions);
  }
}
