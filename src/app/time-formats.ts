/** Clock display — sent as `x-time-format` to backend. */
export type AppTimeFormat = "24h" | "12h";

export const APP_TIME_FORMATS = ["24h", "12h"] as const satisfies readonly AppTimeFormat[];

export const APP_REQUEST_HEADER_TIME_FORMAT = "x-time-format" as const;

/** date-fns pattern for time-only display. */
export function getTimePattern(timeFormat: AppTimeFormat): string {
  return timeFormat === "24h" ? "HH:mm" : "h:mm a";
}

export function isAppTimeFormat(value: string | null | undefined): value is AppTimeFormat {
  return value === "24h" || value === "12h";
}
