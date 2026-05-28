/** Date-only display preset — sent as `x-date-format` to backend. */
import { getTimePattern, type AppTimeFormat } from "./time-formats";

export type AppDateFormat = "iso" | "dmy" | "mdy";

export const APP_DATE_FORMATS = ["iso", "dmy", "mdy"] as const satisfies readonly AppDateFormat[];

export const APP_REQUEST_HEADER_DATE_FORMAT = "x-date-format" as const;

/** date-fns pattern for date-only display. */
export function getDatePattern(dateFormat: AppDateFormat): string {
  switch (dateFormat) {
    case "dmy":
      return "dd/MM/yyyy";
    case "mdy":
      return "MM/dd/yyyy";
    case "iso":
    default:
      return "yyyy-MM-dd";
  }
}

/** date-fns pattern for date + time (table cells). */
export function getDateTimePattern(timeFormat: AppTimeFormat, dateFormat: AppDateFormat): string {
  return `${getDatePattern(dateFormat)} ${getTimePattern(timeFormat)}`;
}

export function isAppDateFormat(value: string | null | undefined): value is AppDateFormat {
  return value === "iso" || value === "dmy" || value === "mdy";
}
