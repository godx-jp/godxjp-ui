import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * ErrorSurface `align="start"` (the hosted 403 page) in Chromium against the real stylesheet: the
 * top bar renders as the banner, the title is a large bold start-aligned h1, the details card sits
 * ABOVE the action, a `Button fullWidth size="lg"` spans the column, and the secondary link is
 * centred under it. The default (center) surface keeps its medallion.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { ErrorSurface } from "./src/components/layout/error-surface";
import { Button } from "./src/components/general/button";
const q = new URLSearchParams(location.search);
const start = q.get("a") !== "center";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <ErrorSurface mode="system" status={403} align={start ? "start" : "center"}
      width={q.get("w") || undefined}
      legal={<span id="legal">GoDX ID · Terms · Privacy</span>}
      topbar={<span id="bar">brand</span>}
      title="You do not have access" description="This page needs an extra permission."
      organization="Sample Inc." permission="members.manage"
      action={<Button fullWidth size="lg" id="primary">Request access</Button>}
      secondaryAction={<Button variant="link" id="secondary">Go to the dashboard</Button>} />
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

describe('ErrorSurface align="start"', { timeout: 60_000 }, () => {
  it("lays out the hosted 403: banner, large start title, details above a full-width action", async () => {
    const page = await fixture.open("", { width: 1280, height: 900 });
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const surface = document
        .querySelector('[data-slot="error-surface"]')!
        .getBoundingClientRect();
      const title = document.querySelector(".ui-error-surface-title")!;
      const details = document.querySelector(".ui-error-surface-details")!.getBoundingClientRect();
      const primary = document.getElementById("primary")!.getBoundingClientRect();
      const secondary = document.getElementById("secondary")!.getBoundingClientRect();
      const t = getComputedStyle(title);
      return {
        banner: !!document.querySelector("header #bar"),
        tag: title.tagName,
        size: parseFloat(t.fontSize),
        weight: t.fontWeight,
        titleStart: title.getBoundingClientRect().left - surface.left,
        detailsAbove: primary.top - details.bottom,
        primaryWidth: primary.width - surface.width,
        secondaryCentre: secondary.left + secondary.width / 2 - (surface.left + surface.width / 2),
        medallion: document.querySelectorAll(".ui-empty-state-icon").length,
        labels: [...document.querySelectorAll('[data-slot="descriptions-label"]')].map(
          (e) => e.textContent,
        ),
      };
    });
    await page.close();
    expect(m.banner).toBe(true);
    expect(m.tag).toBe("H1");
    expect(m.size).toBeGreaterThan(28);
    expect(m.weight).toBe("700");
    expect(Math.abs(m.titleStart)).toBeLessThanOrEqual(1);
    expect(m.detailsAbove).toBeGreaterThan(0);
    expect(Math.abs(m.primaryWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.secondaryCentre)).toBeLessThanOrEqual(1);
    expect(m.medallion).toBe(0);
    expect(m.labels).toHaveLength(2);
  });

  it("keeps the centred default with its medallion", async () => {
    const page = await fixture.open("?a=center", { width: 1280, height: 900 });
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => ({
      align: document.querySelector('[data-slot="error-surface"]')!.getAttribute("data-align"),
      medallion: document.querySelectorAll(".ui-empty-state-icon").length,
      secondary: !!document.getElementById("secondary"),
    }));
    await page.close();
    expect(m.align).toBeNull();
    expect(m.medallion).toBe(1);
    expect(m.secondary).toBe(true);
  });

  it('width="column" is the 25rem flow column; legal sits directly under the secondary link', async () => {
    const page = await fixture.open("?w=column", { width: 1280, height: 900 });
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const surface = document
        .querySelector('[data-slot="error-surface"]')!
        .getBoundingClientRect();
      const secondary = document.getElementById("secondary")!.getBoundingClientRect();
      const legal = document.getElementById("legal")!.getBoundingClientRect();
      return {
        width: surface.width,
        below: legal.top - secondary.bottom,
        inFooter: !!document.querySelector("footer #legal"),
      };
    });
    await page.close();
    expect(m.width).toBe(400);
    expect(m.below).toBeGreaterThanOrEqual(0);
    expect(m.below).toBeLessThan(32);
    expect(m.inFooter).toBe(false);
  });
});
