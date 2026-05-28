import { describe, expect, it } from "vitest";
import {
  APP_TIMEZONE_PRESET,
  formatTimezoneDisplayLabel,
  getAllIanaTimezones,
  getTimezoneLabel,
  getTimezoneOffsetLabel,
  isValidIanaTimezone,
  resolveTimezonePickerOptions,
} from "../timezones";

describe("timezones", () => {
  it("exposes full IANA list by default", () => {
    const all = getAllIanaTimezones();
    expect(all.length).toBeGreaterThan(100);
    expect(all).toContain("Asia/Ho_Chi_Minh");
    expect(all).toContain("Asia/Tokyo");
    expect(all).toContain("Europe/Paris");
  });

  it("preset covers cross-border hubs", () => {
    expect(APP_TIMEZONE_PRESET).toContain("Asia/Ho_Chi_Minh");
    expect(APP_TIMEZONE_PRESET).toContain("Australia/Sydney");
    expect(APP_TIMEZONE_PRESET.length).toBeGreaterThanOrEqual(40);
  });

  it("resolveTimezonePickerOptions uses full list when unconfigured", () => {
    const options = resolveTimezonePickerOptions(undefined, "Asia/Tokyo");
    expect(options.length).toBeGreaterThan(100);
    expect(options).toContain("Asia/Tokyo");
  });

  it("resolveTimezonePickerOptions respects AppProvider config", () => {
    const configured = ["Asia/Tokyo", "Asia/Ho_Chi_Minh"] as const;
    const options = resolveTimezonePickerOptions(configured, "Asia/Tokyo");
    expect(options).toEqual(["Asia/Tokyo", "Asia/Ho_Chi_Minh"]);
  });

  it("prepends current timezone when missing from configured list", () => {
    const options = resolveTimezonePickerOptions(["Asia/Tokyo"], "Europe/Paris");
    expect(options[0]).toBe("Europe/Paris");
    expect(options).toContain("Asia/Tokyo");
  });

  it("uses i18n label for curated zones", () => {
    expect(getTimezoneLabel("Asia/Ho_Chi_Minh", "vi", "en")).toBe("Việt Nam (HCM)");
    expect(getTimezoneLabel("Asia/Tokyo", "ja", "en")).toMatch(/日本|Tokyo/);
  });

  it("falls back to city + UTC offset for zones without i18n", () => {
    const label = getTimezoneLabel("Europe/Paris", "en", "en");
    expect(label).toMatch(/Paris/);
    expect(label).toMatch(/GMT|UTC|[+-]\d/);
  });

  it("formats offset via Intl", () => {
    expect(getTimezoneOffsetLabel("Asia/Ho_Chi_Minh", "en")).toMatch(/GMT|UTC|[+-]\d/);
    expect(formatTimezoneDisplayLabel("Asia/Ho_Chi_Minh", "en")).toMatch(/Ho Chi Minh/);
  });

  it("validates IANA ids against full list", () => {
    expect(isValidIanaTimezone("Asia/Jakarta")).toBe(true);
    expect(isValidIanaTimezone("Not/A/Zone")).toBe(false);
  });
});
