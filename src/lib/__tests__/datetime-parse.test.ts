import { describe, expect, it } from "vitest";
import {
  detectFormatDateKind,
  isDateOnlyString,
  isValidHhmm,
  normalizeHhmm,
  parseDateInput,
  toIsoDate,
} from "../datetime";

describe("detectFormatDateKind", () => {
  it("classifies Date / HH:mm / ISO-date / instant", () => {
    expect(detectFormatDateKind(new Date())).toBe("datetime");
    expect(detectFormatDateKind("14:30")).toBe("time");
    expect(detectFormatDateKind("2026-05-01")).toBe("date");
    expect(detectFormatDateKind("2026-05-01T14:30:00Z")).toBe("datetime");
    expect(detectFormatDateKind("garbage")).toBe("datetime");
  });
});

describe("isDateOnlyString", () => {
  it("matches yyyy-MM-dd only", () => {
    expect(isDateOnlyString("2026-05-01")).toBe(true);
    expect(isDateOnlyString(" 2026-05-01 ")).toBe(true);
    expect(isDateOnlyString("2026-05-01T00:00")).toBe(false);
    expect(isDateOnlyString("14:30")).toBe(false);
  });
});

describe("toIsoDate", () => {
  it("formats a valid Date, empty for null/invalid", () => {
    expect(toIsoDate(new Date(2026, 4, 1))).toBe("2026-05-01");
    expect(toIsoDate(null)).toBe("");
    expect(toIsoDate(undefined)).toBe("");
    expect(toIsoDate(new Date("nope"))).toBe("");
  });
});

describe("parseDateInput", () => {
  it("handles null / Date / invalid Date / date-only / instant / garbage", () => {
    expect(parseDateInput(null)).toBeNull();
    const d = new Date(2026, 0, 1);
    expect(parseDateInput(d)).toBe(d);
    expect(parseDateInput(new Date("nope"))).toBeNull();
    expect(parseDateInput("2026-05-01")?.getDate()).toBe(1);
    expect(parseDateInput("2026-05-01T00:00:00Z")).toBeInstanceOf(Date);
    expect(parseDateInput("not a date")).toBeNull();
  });
});

describe("isValidHhmm", () => {
  it("accepts 00:00–23:59, rejects out-of-range / junk", () => {
    expect(isValidHhmm("00:00")).toBe(true);
    expect(isValidHhmm("23:59")).toBe(true);
    expect(isValidHhmm("9:05")).toBe(true);
    expect(isValidHhmm("24:00")).toBe(false);
    expect(isValidHhmm("12:60")).toBe(false);
    expect(isValidHhmm("abc")).toBe(false);
  });
});

describe("normalizeHhmm", () => {
  it("zero-pads valid, repairs loose, rejects out-of-range", () => {
    expect(normalizeHhmm("9:05")).toBe("09:05");
    expect(normalizeHhmm("23:59")).toBe("23:59");
    expect(normalizeHhmm("25:00")).toBeNull();
    expect(normalizeHhmm("10:75")).toBeNull();
    expect(normalizeHhmm("nope")).toBeNull();
  });
});
