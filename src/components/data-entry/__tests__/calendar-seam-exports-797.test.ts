import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import * as dataEntry from "../index";

/**
 * THE react-day-picker SEAM IS HANDED OUT BY THIS PACKAGE (gh#797).
 *
 * `CalendarProp` extends `DayPickerProps` and `DatePickerProp` carries `DateRange`, so the calendar
 * seam gh#390 documents — `components={{ DayButton }}` to mark a day — is typed by a package the
 * consumer had to depend on itself. pnpm then resolves the consumer's OWN copy, and a consumer on
 * 9.14.0 against this package's 10.0.1 gets:
 *
 *   TS2322: Property `Date` is missing in type DateLib (10.0.1) but required in DateLib (9.14.0)
 *
 * Two copies, two nominally-identical `DateLib`s, on a seam the docs call supported. Re-exporting
 * costs a consumer nothing and removes the version question: imported from here, the types ARE
 * this package's copy.
 *
 * (Moving `react-day-picker` to `peerDependencies` is the other half and a MAJOR — it makes a
 * consumer install something they do not install today — so it is proposed on the issue, not
 * taken here. This file therefore asserts the half that shipped.)
 */
const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

describe("calendar seam exports (gh#797)", () => {
  it("re-exports the RUNTIME pieces the documented seam needs", () => {
    // A custom DayButton that is not react-day-picker's own IS a raw button, which rule 5 forbids
    // — so the primitive has to be reachable without naming react-day-picker.
    expect(dataEntry).toHaveProperty("DayButton");
    expect(dataEntry).toHaveProperty("dateMatchModifiers");
  });

  it.each([
    "DateRange",
    "Modifiers",
    "DayPickerProps",
    "DayButtonProps",
    "Matcher",
    "CalendarDay",
    "DateLib",
  ])("re-exports the type %s that the props already expose", (name) => {
    // Types are erased at runtime, so this reads the barrel's source rather than the module.
    const barrel = readFileSync(join(ROOT, "src/components/data-entry/index.ts"), "utf8");
    expect(barrel, `${name} must be exported from @godxjp/ui/data-entry`).toMatch(
      new RegExp(`\\b${name}\\b`),
    );
  });

  it("still declares react-day-picker, so the re-export resolves to ONE copy", () => {
    // Whichever section it sits in, it must be declared: the whole point is that the type a
    // consumer imports from here and the type `Calendar` accepts are the same identity.
    const declared =
      pkg.dependencies?.["react-day-picker"] ?? pkg.peerDependencies?.["react-day-picker"];
    expect(declared, "react-day-picker must be declared").toBeDefined();
    expect(declared).toMatch(/\^?10\./);
  });
});
