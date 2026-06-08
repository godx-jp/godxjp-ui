import { describe, expect, it } from "vitest";

import { formatBytes, formatCurrency, humanError, shortId } from "../format";

describe("formatBytes — every unit tier", () => {
  it("returns a dash for null / undefined", () => {
    expect(formatBytes(null)).toBe("—");
    expect(formatBytes(undefined)).toBe("—");
  });
  it("scales B → KB → MB → GB", () => {
    expect(formatBytes(512, "en-US")).toBe("512 B");
    expect(formatBytes(2048, "en-US")).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024, "en-US")).toBe("5.0 MB");
    expect(formatBytes(3 * 1024 * 1024 * 1024, "en-US")).toBe("3.00 GB");
  });
});

describe("formatCurrency — minor units from CLDR", () => {
  it("returns a dash when amount is null or currency is empty", () => {
    expect(formatCurrency(null, "USD")).toBe("—");
    expect(formatCurrency(1995, "")).toBe("—");
  });
  it("formats a 2-decimal currency (USD) from minor units", () => {
    expect(formatCurrency(1995, "USD", "en-US")).toBe("$19.95");
  });
  it("formats a zero-decimal currency (JPY) without dividing", () => {
    // JPY has 0 minor-unit digits → 5000 minor == 5000 major
    expect(formatCurrency(5000, "JPY", "en-US")).toBe("¥5,000");
  });
});

describe("shortId", () => {
  it("returns a dash for empty input", () => {
    expect(shortId(null)).toBe("—");
    expect(shortId(undefined)).toBe("—");
    expect(shortId("")).toBe("—");
  });
  it("returns short ids unchanged (≤12 chars)", () => {
    expect(shortId("abc123")).toBe("abc123");
    expect(shortId("123456789012")).toBe("123456789012");
  });
  it("truncates long ids to 8 chars + ellipsis", () => {
    expect(shortId("0190a1b2-c3d4-7e5f")).toBe("0190a1b2…");
  });
});

describe("humanError", () => {
  it("strips a leading HTTP status prefix from an Error message", () => {
    expect(humanError(new Error("404 Not Found: 取引先が見つかりません"))).toBe(
      "取引先が見つかりません",
    );
  });
  it("falls back to a generic message when the cleaned message is empty/(empty)", () => {
    expect(humanError(new Error("(empty)"))).toBeTruthy();
    expect(humanError(new Error(""))).toBeTruthy();
  });
  it("falls back to a generic message for non-Error values", () => {
    expect(humanError("just a string")).toBeTruthy();
    expect(humanError({ code: 500 })).toBeTruthy();
    expect(humanError(undefined)).toBeTruthy();
  });
});
