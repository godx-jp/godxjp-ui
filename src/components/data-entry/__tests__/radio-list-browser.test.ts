import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * RadioGroup `optionType="list"` in Chromium against the real stylesheet: rows have no border of
 * their own, the hairline between rows starts at the row text, the mark sits at the row END
 * (after the Badge), and the surface is rounded.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { RadioGroup } from "./src/components/data-entry/radio";
import { Badge } from "./src/components/data-display/badge";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 420 }}>
    <RadioGroup aria-label="Context" optionType="list" defaultValue="acme" options={[
      { label: "Organizations", options: [
        { value: "acme", label: "Acme", description: "Owner", extra: <Badge>Last used</Badge> },
        { value: "globex", label: "Globex", description: "Member" },
      ] },
    ]} />
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

describe('RadioGroup optionType="list"', { timeout: 60_000 }, () => {
  it("draws an inset hairline, no row borders, the mark at the end", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const rows = [...document.querySelectorAll<HTMLElement>(".ui-radio-card")];
      const surface = document.querySelector(".ui-radio-list-surface")!;
      const r2 = rows[1]!.getBoundingClientRect();
      const before = getComputedStyle(rows[1]!, "::before");
      const title = rows[1]!.querySelector(".ui-radio-card-title")!.getBoundingClientRect();
      const mark = rows[0]!.querySelector(".ui-radio-card-mark")!.getBoundingClientRect();
      const badge = rows[0]!.querySelector(".ui-radio-card-extra")!.getBoundingClientRect();
      const mark2 = rows[1]!.querySelector(".ui-radio-card-mark")!.getBoundingClientRect();
      return {
        rowBorder: getComputedStyle(rows[0]!).borderTopWidth,
        firstBefore: getComputedStyle(rows[0]!, "::before").content,
        lineStart: r2.left + parseFloat(before.left) - title.left,
        line: before.borderTopWidth,
        markAfterBadge: mark.left - badge.right,
        markEnd: r2.right - mark2.right,
        radius: parseFloat(getComputedStyle(surface).borderTopLeftRadius),
      };
    });
    await page.close();
    expect(m.rowBorder).toBe("0px");
    expect(m.firstBefore).toBe("none");
    expect(Math.abs(m.lineStart)).toBeLessThanOrEqual(1);
    expect(m.line).toBe("1px");
    expect(m.markAfterBadge).toBeGreaterThan(0);
    expect(m.markEnd).toBeCloseTo(16, 0);
    expect(m.radius).toBeGreaterThan(0);
  });
});
