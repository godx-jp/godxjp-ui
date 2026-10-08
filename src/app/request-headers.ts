import type { AppRequestHeaders } from "./types";
import {
  APP_REQUEST_HEADER_DATE_FORMAT,
  APP_REQUEST_HEADER_LOCALE,
  APP_REQUEST_HEADER_TIME_FORMAT,
  APP_REQUEST_HEADER_TIMEZONE,
} from "./types";
import { getAppSettingsState } from "./settings-scope";
import { resolveDefaultDateFormat } from "./date-format-labels";
import { resolveDefaultTimeFormat } from "./time-format-labels";
import { getBrowserTimezone } from "./timezones";
import { resolveDefaultLocale } from "../i18n/locale-tags";

/**
 * The headers nothing chose (v32, gh#1219). They used to be a fixed `vi` / `Asia/Ho_Chi_Minh` /
 * `dmy`, which told every backend a Vietnamese user in Ho Chi Minh was calling. Now they follow the
 * current scope: its locale (else `<html lang>` if registered, else `en`), its timezone (else the
 * browser's from `Intl` on a client, `UTC` on a server), and that locale's own formats from `Intl`.
 */
function defaultHeaders(): AppRequestHeaders {
  const { i18n, datetime } = getAppSettingsState();
  const locale = i18n?.locale ?? datetime?.locale ?? resolveDefaultLocale();
  return {
    [APP_REQUEST_HEADER_LOCALE]: locale,
    [APP_REQUEST_HEADER_TIMEZONE]:
      datetime?.timezone ?? (typeof window === "undefined" ? "UTC" : getBrowserTimezone()),
    [APP_REQUEST_HEADER_TIME_FORMAT]: datetime?.timeFormat ?? resolveDefaultTimeFormat(locale),
    [APP_REQUEST_HEADER_DATE_FORMAT]: datetime?.dateFormat ?? resolveDefaultDateFormat(locale),
  };
}

/** Sync locale/timezone into the CURRENT scope for HTTP clients (via `getAppRequestHeaders`). */
export function syncAppRequestHeaders(headers: Partial<AppRequestHeaders>): void {
  const state = getAppSettingsState();
  state.headers = { ...state.headers, ...headers };
}

/** Read the current scope's preference headers — wire to API client `setAppHeaderProvider`. */
export function getAppRequestHeaders(): AppRequestHeaders {
  return { ...defaultHeaders(), ...getAppSettingsState().headers };
}

/** Reset the current scope's headers to defaults — for tests only. */
export function resetAppRequestHeaders(): void {
  getAppSettingsState().headers = undefined;
}
