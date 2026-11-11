import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * Auth CenteredShell `measure="column"` (25rem) and `"split"` (54rem) against the real
 * stylesheet, both variants: the content slot takes the measure on a desktop, stays inside a
 * 390px phone without page overflow, and a preset still owns its own measure.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { CenteredShell } from "./src/components/layout/centered-shell";
const q = new URLSearchParams(location.search);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <CenteredShell variant={q.get("v")} measure={q.get("m")} preset={q.get("p") ?? undefined}>
      <div style={{ height: 200 }}>content</div>
    </CenteredShell>
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

const read = () => ({
  w: document.querySelector(".ui-auth-shell-card")!.getBoundingClientRect().width,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
});

describe("auth CenteredShell measure column / split", { timeout: 60_000 }, () => {
  for (const v of ["auth", "auth-canonical"]) {
    it(`${v}: column = 400px, split = 864px at 1280; both fit 390`, async () => {
      const out: Record<string, { w: number; overflow: number }> = {};
      for (const [m, width] of [
        ["column", 1280],
        ["split", 1280],
        ["column", 390],
        ["split", 390],
      ] as const) {
        const page = await fixture.open(`?v=${v}&m=${m}`, { width, height: 900 });
        await page.waitForTimeout(150);
        out[`${m}@${width}`] = await page.evaluate(read);
        await page.close();
      }
      expect(out["column@1280"]!.w).toBe(400);
      expect(out["split@1280"]!.w).toBe(864);
      expect(out["column@390"]!.w).toBeLessThanOrEqual(390);
      expect(out["split@390"]!.overflow).toBe(0);
      expect(out["column@390"]!.overflow).toBe(0);
    });
  }

  it("leaves a preset's own measure alone", async () => {
    const page = await fixture.open("?v=auth-canonical&m=column&p=device-authorization", {
      width: 1280,
      height: 900,
    });
    await page.waitForTimeout(150);
    const m = await page.evaluate(read);
    await page.close();
    expect(m.w).toBe(380);
  });
});
