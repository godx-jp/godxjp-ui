import type { AxiosInstance } from "axios";
import { getPreferences } from "./holder";

export interface ApplyPreferenceHeadersOptions {
  /**
   * Override the Accept-Language header name. RFC 7231 §5.3.5 names
   * the canonical header; only override if proxying to a backend that
   * requires a different name (very rare).
   */
  acceptLanguageHeader?: string;
  /**
   * Override the timezone header name. There is no international
   * standard header for client time zone; we ship `X-Timezone` by
   * convention. Backend reads as IANA tz name (RFC 6557 / ECMA-402).
   */
  timezoneHeader?: string;
  /** Skip Accept-Language if false (default true). */
  sendLocale?: boolean;
  /** Skip X-Timezone if false (default true). */
  sendTimezone?: boolean;
}

/**
 * Wire an axios instance to send the current user's locale + timezone
 * on every request. The interceptor reads from the module-level
 * preferences holder at REQUEST time, so values stay fresh as the
 * user changes them — no need to re-install on every preference
 * update.
 *
 * Returns an `eject()` callback that removes the interceptor.
 *
 * Usage in `lib/api.ts`:
 *   import { meApi } from "./api"
 *   import { applyPreferenceHeaders } from "@godxjp/ui/preferences"
 *   applyPreferenceHeaders(meApi)
 */
export function applyPreferenceHeaders(
  client: AxiosInstance,
  options: ApplyPreferenceHeadersOptions = {},
): () => void {
  const acceptLanguageHeader =
    options.acceptLanguageHeader ?? "Accept-Language";
  const timezoneHeader = options.timezoneHeader ?? "X-Timezone";
  const sendLocale = options.sendLocale !== false;
  const sendTimezone = options.sendTimezone !== false;

  const id = client.interceptors.request.use((config) => {
    const prefs = getPreferences();
    if (sendLocale && prefs.locale) {
      config.headers.set(acceptLanguageHeader, prefs.locale);
    }
    if (sendTimezone && prefs.timezone) {
      config.headers.set(timezoneHeader, prefs.timezone);
    }
    return config;
  });

  return () => client.interceptors.request.eject(id);
}
