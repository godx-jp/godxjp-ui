import type { AxiosInstance } from "axios";
import { getGodxConfig } from "./holder";

export interface ApplyGodxConfigHeadersOptions {
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
 * GodxConfig holder at REQUEST time, so values stay fresh as the user
 * changes them — no need to re-install on every config update.
 *
 * Returns an `eject()` callback that removes the interceptor.
 *
 * Usage in `lib/api.ts`:
 *   import { meApi } from "./api"
 *   import { applyGodxConfigHeaders } from "@godxjp/ui/preferences"
 *   applyGodxConfigHeaders(meApi)
 */
export function applyGodxConfigHeaders(
  client: AxiosInstance,
  options: ApplyGodxConfigHeadersOptions = {},
): () => void {
  const acceptLanguageHeader =
    options.acceptLanguageHeader ?? "Accept-Language";
  const timezoneHeader = options.timezoneHeader ?? "X-Timezone";
  const sendLocale = options.sendLocale !== false;
  const sendTimezone = options.sendTimezone !== false;

  const id = client.interceptors.request.use((config) => {
    const current = getGodxConfig();
    if (sendLocale && current.locale) {
      config.headers.set(acceptLanguageHeader, current.locale);
    }
    if (sendTimezone && current.timezone) {
      config.headers.set(timezoneHeader, current.timezone);
    }
    return config;
  });

  return () => client.interceptors.request.eject(id);
}
