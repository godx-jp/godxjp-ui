import type { AppRequestHeaders } from "./types";
import {
  APP_REQUEST_HEADER_DATE_FORMAT,
  APP_REQUEST_HEADER_LOCALE,
  APP_REQUEST_HEADER_TIME_FORMAT,
  APP_REQUEST_HEADER_TIMEZONE,
} from "./types";

const DEFAULT_HEADERS: AppRequestHeaders = {
  [APP_REQUEST_HEADER_LOCALE]: "vi",
  [APP_REQUEST_HEADER_TIMEZONE]: "Asia/Ho_Chi_Minh",
  [APP_REQUEST_HEADER_TIME_FORMAT]: "24h",
  [APP_REQUEST_HEADER_DATE_FORMAT]: "dmy",
};

let currentHeaders: AppRequestHeaders = { ...DEFAULT_HEADERS };

/** Sync locale/timezone into module state for HTTP clients (via `getAppRequestHeaders`). */
export function syncAppRequestHeaders(headers: Partial<AppRequestHeaders>): void {
  currentHeaders = { ...currentHeaders, ...headers };
}

/** Read current app preference headers — wire to API client `setAppHeaderProvider`. */
export function getAppRequestHeaders(): AppRequestHeaders {
  return { ...currentHeaders };
}

/** Reset to defaults — for tests only. */
export function resetAppRequestHeaders(): void {
  currentHeaders = { ...DEFAULT_HEADERS };
}
