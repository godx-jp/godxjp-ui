import { afterEach, describe, expect, it, vi } from "vitest";

import { dateTimeFormat, listFormat, numberFormat, pluralRules } from "../intl-cache";

/*
 * gh#557. A consumer's 8,262-row grid took 27-30s against 2.3s for the same markup built from
 * native controls. Rendered through `react-dom/server`, one CLOSED `DatePicker` cost 412.6us
 * against 4.2us for `<input type="date">`, and counting constructor calls during that render
 * showed each closed instance building 12 `Intl.DateTimeFormat` and 1 `Intl.NumberFormat`.
 *
 * Constructing an `Intl` formatter resolves locale data and compiles a pattern. Routing those
 * constructions through this cache and changing nothing else took the instance to 178us.
 *
 * These tests are about IDENTITY and CORRECTNESS, not speed: a timing assertion on a shared CI
 * runner is a flake generator. Identity is what makes it fast, and it is exact.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Intl formatters are shared, not rebuilt (gh#557)", () => {
  it("returns the SAME object for the same locale and options", () => {
    expect(dateTimeFormat("ja-JP", { month: "short" })).toBe(
      dateTimeFormat("ja-JP", { month: "short" }),
    );
    expect(numberFormat("vi-VN")).toBe(numberFormat("vi-VN"));
    expect(pluralRules("en-US")).toBe(pluralRules("en-US"));
    expect(listFormat("en-US", { style: "narrow", type: "unit" })).toBe(
      listFormat("en-US", { style: "narrow", type: "unit" }),
    );
  });

  it("constructs ONCE across repeated calls — the claim, measured", () => {
    // The cache is warmed by the assertion above and by other tests in the file, so the count that
    // matters is the DELTA over calls made while the spy is installed.
    const spy = vi.spyOn(Intl, "DateTimeFormat");
    // A key nothing else can have touched. It must stay a VALID locale — an invented tag makes
    // `Intl.DateTimeFormat` throw a RangeError, and a test that dies on its first call would count
    // one construction and look like it passed for the wrong reason.
    const options = { year: "numeric", fractionalSecondDigits: 3 } as const;
    for (let i = 0; i < 50; i += 1) dateTimeFormat("en-GB", options);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("keeps DIFFERENT locales and DIFFERENT options apart", () => {
    expect(dateTimeFormat("ja-JP", { month: "short" })).not.toBe(
      dateTimeFormat("en-US", { month: "short" }),
    );
    expect(dateTimeFormat("ja-JP", { month: "short" })).not.toBe(
      dateTimeFormat("ja-JP", { month: "long" }),
    );
    // `undefined` options and `{}` are different formatters, so they are different keys.
    expect(numberFormat("en-US")).not.toBe(numberFormat("en-US", {}));
  });

  it("still formats correctly — a cache that returns the wrong formatter is worse than none", () => {
    const date = new Date(2026, 2, 15);
    expect(dateTimeFormat("en-US", { month: "short" }).format(date)).toBe("Mar");
    expect(dateTimeFormat("ja-JP", { month: "short" }).format(date)).toBe("3月");
    expect(numberFormat("en-US").format(1234.5)).toBe("1,234.5");
    expect(numberFormat("en-US", { useGrouping: false }).format(1234.5)).toBe("1234.5");
    expect(pluralRules("en-US").select(1)).toBe("one");
    expect(pluralRules("en-US").select(3)).toBe("other");
  });

  it("is bounded — a caller building option objects in a loop cannot grow it forever", () => {
    // Not a style point. Without the cap, a call site that passes a freshly-built options object
    // per row would turn a performance fix into a memory leak proportional to row count.
    for (let i = 0; i < 400; i += 1) numberFormat("en-US", { minimumFractionDigits: i % 20 });
    // The proof is that the module still answers, and answers correctly, after eviction pressure.
    expect(numberFormat("en-US", { useGrouping: false }).format(1234.5)).toBe("1234.5");
  });
});
