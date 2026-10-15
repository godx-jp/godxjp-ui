import type { Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../test/chromium-fixture";

/**
 * gh#1344 in Chromium, against the real stylesheet: `.ui-button.ui-button--bare { border: 0 }` is a
 * shorthand, so it also reset `border-color` to `currentColor` — in the components layer, beating
 * base.css's `* { border-color: hsl(var(--border)) }`. A consumer `border` utility (width + style
 * only) then drew a text-coloured frame. The fix resets the WIDTH only; the same applies to every
 * other component root that forwards a consumer `className` and zeroed its border.
 *
 * Each case renders the component twice: with `className="border"` (1px in the theme border colour)
 * and without (width stays 0).
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "./src/components/general/button";
import { Image } from "./src/components/data-display/image";
import { TopbarItem } from "./src/components/layout/topbar-item";
import { Command, CommandInput } from "./src/components/data-entry/command";
import { CardBar } from "./src/components/data-display/card";
const SRC = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const both = (name, render) =>
  [["border", "with"], [undefined, "without"]].map(([cls, id]) => (
    <div key={id} data-case={name + "-" + id}>{render(cls)}</div>
  ));
createRoot(document.getElementById("root")).render(
  <div>
    <div id="probe" style={{ border: "1px solid hsl(var(--border))" }} />
    {both("button", (cls) => <Button variant="bare" className={cls}>Row</Button>)}
    {both("image", (cls) => <Image src={SRC} alt="" width={16} height={16} className={cls} />)}
    {both("topbar", (cls) => <TopbarItem className={cls}>Item</TopbarItem>)}
    {both("command", (cls) => <Command><CommandInput className={cls} /></Command>)}
    {both("cardbar-none", (cls) => <CardBar border="none" className={cls}>Bar</CardBar>)}
    {both("cardbar-start", (cls) => <CardBar border="block-start" className={cls}>Bar</CardBar>)}
    {both("cardbar-end", (cls) => <CardBar border="block-end" className={cls}>Bar</CardBar>)}
  </div>,
);
`;

/** The element that carries the consumer `className`, and the side its rule zeroes, per case. */
const ROOT: Record<string, [selector: string, side: "Top" | "Bottom"]> = {
  button: ["button", "Top"],
  image: ['[data-slot="image"]', "Top"],
  topbar: ['[data-slot="topbar-item"]', "Top"],
  command: ["input", "Top"],
  "cardbar-none": ['[data-slot="card-bar"]', "Top"],
  "cardbar-start": ['[data-slot="card-bar"]', "Bottom"],
  "cardbar-end": ['[data-slot="card-bar"]', "Top"],
};

let fixture: ChromiumFixture;
let page: Page;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
  page = await fixture.open("");
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const border = (selector: string, side: "Top" | "Bottom" = "Top") =>
  page.$eval(
    selector,
    (el, side) => {
      const s = getComputedStyle(el);
      return {
        width: s.getPropertyValue(`border-${side.toLowerCase()}-width`),
        colour: s.getPropertyValue(`border-${side.toLowerCase()}-color`),
        text: s.color,
      };
    },
    side,
  );

describe("a zeroed border keeps the theme border colour (gh#1344)", { timeout: 60_000 }, () => {
  for (const [name, [root, side]] of Object.entries(ROOT)) {
    it(`${name}: a consumer \`border\` class draws 1px in hsl(var(--border)), not currentColor`, async () => {
      const expected = (await border("#probe")).colour;
      const got = await border(`[data-case="${name}-with"] ${root}`, side);
      expect(got.colour).not.toBe(got.text);
      expect(got).toMatchObject({ width: "1px", colour: expected });
    });

    it(`${name}: without the class the width stays 0`, async () => {
      expect((await border(`[data-case="${name}-without"] ${root}`, side)).width).toBe("0px");
    });
  }
});
