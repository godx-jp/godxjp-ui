import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * A disabled FILLED Button reads as disabled, not as a lighter enabled button.
 *
 * It used to be the enabled fill at `--disabled-opacity` (0.5): a disabled primary was a pale tint
 * of the brand — on a light theme indistinguishable from an enabled light/secondary button. A
 * disabled `default` / `destructive` now drops the brand fill for a neutral disabled surface
 * (`--button-disabled-*`, defaulting to the muted roles), opaque, so the label keeps readable ink
 * on it and no brand colour suggests the action is live.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <main id="ready" style={{ display: "flex", gap: 16, padding: 16 }}>
      <Button data-probe="primary">Save</Button>
      <Button disabled data-probe="primary-disabled">Save</Button>
      <Button variant="destructive" disabled data-probe="destructive-disabled">Delete</Button>
      <Button variant="secondary" data-probe="secondary">Cancel</Button>
      <Button variant="outline" data-probe="outline">Cancel</Button>
    </main>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

type Paint = { bg: string; ink: string; opacity: string; edge: string };

/** WCAG relative luminance contrast of two `rgb(...)`/`color(srgb ...)` strings. */
function contrast(a: string, b: string): number {
  const channels = (c: string) => {
    const n = c.match(/[\d.]+/g)!.map(Number);
    const rgb = c.startsWith("color(") ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3);
    return rgb.map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  };
  const lum = (c: string) => {
    const [r, g, b] = channels(c);
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe("Button disabled surface", { timeout: 60_000 }, () => {
  it("a disabled primary is opaque, off-brand, and distinct from enabled light buttons", async () => {
    const page = await fixture.open("");
    const paint: Record<string, Paint> = await page.$$eval("[data-probe]", (els) =>
      Object.fromEntries(
        els.map((el) => {
          const s = getComputedStyle(el);
          return [
            (el as HTMLElement).dataset.probe,
            {
              bg: s.backgroundColor,
              ink: s.color,
              opacity: s.opacity,
              edge: s.boxShadow,
            },
          ];
        }),
      ),
    );
    const disabled = paint["primary-disabled"]!;
    // Not a translucent copy of the enabled fill.
    expect(disabled.opacity).toBe("1");
    expect(disabled.bg).not.toBe(paint.primary!.bg);
    expect(disabled.ink).not.toBe(paint.primary!.ink);
    // Not mistakable for an enabled secondary / outline button: its label ink differs from both.
    expect(disabled.ink).not.toBe(paint.secondary!.ink);
    expect(disabled.ink).not.toBe(paint.outline!.ink);
    // An inset hairline edge (no box growth), so it does not dissolve into the page like a ghost.
    expect(disabled.edge).toMatch(/inset/);
    // The label stays readable on its own surface (SC 1.4.3 exempts disabled controls; we hold AA anyway).
    expect(contrast(disabled.ink, disabled.bg)).toBeGreaterThanOrEqual(4.5);
    // Destructive gets the same treatment — no red that says "this will delete".
    expect(paint["destructive-disabled"]).toEqual(disabled);
  });
});
