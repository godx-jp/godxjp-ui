import { isValidHhmm } from "./parse";

export type FormatDateKind =
  | "auto"
  | "date"
  | "datetime"
  | "time"
  | "long"
  | "relative"
  | "calendar";

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Infer display kind from raw value — ISO date, HH:mm, or instant. */
export function detectFormatDateKind(value: string | Date): Exclude<FormatDateKind, "auto"> {
  if (value instanceof Date) return "datetime";
  const trimmed = value.trim();
  if (isValidHhmm(trimmed)) return "time";
  if (DATE_ONLY_RE.test(trimmed)) return "date";
  return "datetime";
}

export function isDateOnlyString(value: string): boolean {
  return DATE_ONLY_RE.test(value.trim());
}
