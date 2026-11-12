import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * EmptyState `variant="hero"` — the result page — against the real stylesheet: a bold display
 * title (the 3xl step, and the display optics when a theme sets them), a 56px medallion, a
 * lead-size description, while `page` keeps its section-size title.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "./src/components/data-display/empty-state";
const themed = { "--font-size-3xl": "2.125rem", "--letter-spacing-display": "-0.022em" };
createRoot(document.getElementById("root")).render(
  <div id="ready">
    <div id="hero" style={themed}><EmptyState variant="hero" tone="success" icon={CheckCircle2}
      titleLevel={1} title="Connected" description="You can close this window." /></div>
    <div id="page"><EmptyState icon={CheckCircle2} title="No records" description="Nothing yet." /></div>
  </div>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

describe('EmptyState variant="hero"', { timeout: 60_000 }, () => {
  it("paints a bold display title, a 56px medallion and a lead description", async () => {
    const page = await fixture.open("", { width: 1280, height: 800 });
    const m = await page.evaluate(() => {
      const read = (id: string) => {
        const root = document.getElementById(id)!;
        const t = getComputedStyle(root.querySelector(".ui-empty-state-title")!);
        const d = getComputedStyle(root.querySelector(".ui-empty-state-description")!);
        const icon = root.querySelector(".ui-empty-state-icon")!.getBoundingClientRect();
        return {
          tag: root.querySelector(".ui-empty-state-title")!.tagName,
          size: parseFloat(t.fontSize),
          weight: t.fontWeight,
          ls: parseFloat(t.letterSpacing) || 0,
          desc: parseFloat(d.fontSize),
          icon: icon.width,
        };
      };
      return { hero: read("hero"), page: read("page") };
    });
    await page.close();
    expect(m.hero.tag).toBe("H1");
    expect(m.hero.size).toBe(34);
    expect(m.hero.weight).toBe("700");
    expect(m.hero.ls).toBeCloseTo(-0.748, 2);
    expect(m.hero.icon).toBe(56);
    expect(m.hero.desc).toBeGreaterThan(m.page.desc);
    expect(m.page.size).toBe(14);
  });
});
