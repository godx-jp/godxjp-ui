import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * Display optics (`--letter-spacing-display`, `--line-height-display`) in Chromium against the
 * real stylesheet. Unset, a display-step Heading/Text paints exactly the tight pair it always did.
 * A theme that sets them (here: a 34px 3xl at -0.022em / 1.12, the large page title) moves the
 * display steps — Heading AND Text — and leaves an ordinary Heading level 2 untouched.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Heading, Text } from "./src/components/general/typography";
const themed = { "--font-size-3xl": "2.125rem", "--letter-spacing-display": "-0.022em", "--line-height-display": "1.12" };
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <div id="plain"><Heading level={1} size="3xl">Title</Heading></div>
    <div id="themed" style={themed}>
      <Heading level={1} size="3xl" weight="bold">Title</Heading>
      <Text size="3xl">Display text</Text>
      <Heading level={2}>Section</Heading>
    </div>
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

describe("display optics tokens", { timeout: 60_000 }, () => {
  it("default: the display step keeps the tight pair (no tracking)", async () => {
    const page = await fixture.open("", { width: 1280, height: 800 });
    const m = await page.evaluate(() => {
      const h = getComputedStyle(document.querySelector('#plain [data-slot="heading"]')!);
      return { ls: h.letterSpacing, lh: parseFloat(h.lineHeight) / parseFloat(h.fontSize) };
    });
    await page.close();
    expect(["normal", "0px"]).toContain(m.ls);
    expect(m.lh).toBeCloseTo(1.25, 2);
  });

  it("themed: 34px at -0.022em / 1.12 on Heading and Text display steps only", async () => {
    const page = await fixture.open("", { width: 1280, height: 800 });
    const m = await page.evaluate(() => {
      const read = (el: Element) => {
        const c = getComputedStyle(el);
        return { size: c.fontSize, ls: c.letterSpacing, lh: c.lineHeight, weight: c.fontWeight };
      };
      const root = document.getElementById("themed")!;
      const [h1, h2] = root.querySelectorAll('[data-slot="heading"]');
      return {
        h1: read(h1!),
        text: read(root.querySelector('[data-slot="text"]')!),
        h2: read(h2!),
      };
    });
    await page.close();
    expect(m.h1.size).toBe("34px");
    expect(parseFloat(m.h1.ls)).toBeCloseTo(-0.748, 2);
    expect(parseFloat(m.h1.lh)).toBeCloseTo(38.08, 1);
    expect(m.h1.weight).toBe("700");
    expect(parseFloat(m.text.ls)).toBeCloseTo(-0.748, 2);
    expect(["normal", "0px"]).toContain(m.h2.ls);
  });
});
