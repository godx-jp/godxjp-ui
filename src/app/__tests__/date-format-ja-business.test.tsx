import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import * as React from "react";

import { AppProvider, useDateTime } from "../index";
import { getDatePattern, APP_DATE_FORMATS } from "../date-formats";

/**
 * A JAPANESE APP RENDERS A JAPANESE BUSINESS DATE.
 *
 * The axis shipped `iso` / `dmy` / `mdy` and none of them wrote `2026/05/01`: `iso` uses hyphens
 * and the two slash forms put the day or the month first. `ja` defaulted to `iso`, so a
 * Japanese-first consumer (gino-cloud) shipped its own date formatter as an explicit stopgap —
 * which is docs/DATETIME.md rule 1 ("never use date-fns/format, toLocaleString, or raw ISO slices
 * for UI") broken by this package's own default, and the tell that a named axis was missing a
 * value rather than a consumer wanting something exotic.
 *
 * This test is end to end on purpose: the pattern table, the locale default and `formatDate` all
 * had to agree before the consumer could delete its stopgap, and each of the three was green on
 * its own while the app still printed hyphens.
 */
function wrapper(locale: "ja" | "en" | "vi") {
  function LocaleWrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppProvider storageKey="godxjp.test.ymd" persist={false} defaultLocale={locale}>
        {children}
      </AppProvider>
    );
  }
  return LocaleWrapper;
}

describe("ja → yyyy/MM/dd, end to end", () => {
  it("formats a date with slashes, year first, under the ja default", () => {
    const { result } = renderHook(() => useDateTime(), { wrapper: wrapper("ja") });
    expect(result.current.format("2026-05-01", { kind: "date" })).toBe("2026/05/01");
  });

  it("leaves the other two locales exactly as they were", () => {
    const en = renderHook(() => useDateTime(), { wrapper: wrapper("en") });
    const vi = renderHook(() => useDateTime(), { wrapper: wrapper("vi") });
    expect(en.result.current.format("2026-05-01", { kind: "date" })).toBe("05/01/2026");
    expect(vi.result.current.format("2026-05-01", { kind: "date" })).toBe("01/05/2026");
  });

  it("keeps `iso` reachable and distinct — the two year-first forms differ by separator alone", () => {
    expect(getDatePattern("iso")).toBe("yyyy-MM-dd");
    expect(getDatePattern("ymd")).toBe("yyyy/MM/dd");
    expect(APP_DATE_FORMATS).toContain("iso");
  });

  it("every preset has a pattern — a value added to the list and not to the table is silent", () => {
    // `getDatePattern` has a `default:` arm that returns the ISO pattern, so a forgotten case does
    // not throw: it quietly formats as ISO. That is the failure mode this asserts against.
    const patterns = APP_DATE_FORMATS.map(getDatePattern);
    expect(new Set(patterns).size, `duplicate patterns: ${patterns.join(", ")}`).toBe(
      APP_DATE_FORMATS.length,
    );
  });
});
