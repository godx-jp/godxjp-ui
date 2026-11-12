import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * NumberInput geometry in real Chromium against the real stylesheet.
 *
 * 1. `controls={false}` + `suffix` — the suffix kept the inset reserved for the stepper column
 *    (`calc(var(--control-height) + var(--space-2))`) while the field's end padding collapsed to
 *    `--control-padding-x`, so in a 96px (`w-24`) field the value ran under / past the suffix and
 *    read 「kg   2」. The suffix must sit at the inline end and the value must end before it.
 * 2. `size="touch"` — Button's glove tier is 56px (`--control-height-touch`); a −/value/+ row of
 *    touch Buttons beside a NumberInput topped out at the 40px band and read broken. Under a
 *    coarse pointer too: the coarse 48px band must not override the size the call site asked for.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
import { NumberInput } from "./src/components/data-entry";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <main id="ready" style={{ display: "grid", gap: 16, padding: 16, justifyItems: "start" }}>
      <div id="off-suffix" style={{ width: 96 }}>
        <NumberInput aria-label="重量" controls={false} suffix="kg" defaultValue={2} />
      </div>
      <div id="off-suffix-wide" style={{ width: 240 }}>
        <NumberInput aria-label="重量2" controls={false} suffix="kg" defaultValue={123456} />
      </div>
      <div id="on-suffix" style={{ width: 160 }}>
        <NumberInput aria-label="時間" suffix="時間" defaultValue={123456} />
      </div>
      <div id="touch" style={{ width: 200 }}>
        <NumberInput aria-label="数量" size="touch" defaultValue={3} />
      </div>
      <Button size="touch" data-probe="button-touch">+</Button>
    </main>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: process.cwd(), sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: process.cwd(),
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(touch: boolean, dir: "ltr" | "rtl" = "ltr"): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  await page.setContent(
    `<!doctype html><html lang="ja" dir="${dir}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready input").first().waitFor();
  return page;
}

/** Where the suffix sits and where the value's text box ends, in the field's inline direction. */
const suffixGeometry = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((root) => {
    const field = root.querySelector("input")!;
    const suffix = root.querySelector('[data-slot="number-input-suffix"]')!;
    const f = field.getBoundingClientRect();
    const s = suffix.getBoundingClientRect();
    const style = getComputedStyle(field);
    const rtl = style.direction === "rtl";
    const padEnd = parseFloat(style.paddingInlineEnd);
    return {
      // Gap between the suffix and the field's inline-end border edge.
      suffixToEnd: rtl ? s.left - f.left : f.right - s.right,
      // Text box end ≤ suffix start: the value never runs under the suffix.
      valueClearsSuffix: rtl ? f.left + padEnd >= s.right - 0.5 : f.right - padEnd <= s.left + 0.5,
      // The suffix is at the END half of the field, not the start.
      suffixAtEnd: rtl
        ? s.left + s.width / 2 < f.left + f.width / 2
        : s.left + s.width / 2 > f.left + f.width / 2,
    };
  });

describe("NumberInput controls={false} + suffix", { timeout: 60_000 }, () => {
  for (const touch of [false, true])
    for (const dir of ["ltr", "rtl"] as const)
      it(`suffix at the inline end, value before it (${touch ? "coarse" : "fine"}, ${dir})`, async () => {
        const page = await open(touch, dir);
        for (const id of ["off-suffix", "off-suffix-wide"]) {
          const g = await suffixGeometry(page, id);
          expect(g.suffixAtEnd, id).toBe(true);
          expect(g.valueClearsSuffix, id).toBe(true);
          // Sits at the field's own padding from the edge, not a stepper column away.
          expect(g.suffixToEnd, id).toBeLessThanOrEqual(16);
        }
        await page.context().close();
      });

  for (const touch of [false, true])
    it(`with steppers, a wide suffix is still reserved (${touch ? "coarse" : "fine"})`, async () => {
      const page = await open(touch);
      const g = await suffixGeometry(page, "on-suffix");
      expect(g.valueClearsSuffix).toBe(true);
      await page.context().close();
    });
});

describe('NumberInput size="touch"', { timeout: 60_000 }, () => {
  for (const touch of [false, true])
    it(`matches Button size="touch" height (${touch ? "coarse" : "fine"})`, async () => {
      const page = await open(touch);
      const field = await page
        .locator("#touch input")
        .evaluate((el) => el.getBoundingClientRect().height);
      const button = await page
        .locator('[data-probe="button-touch"]')
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(button).toBeGreaterThanOrEqual(56);
      expect(field).toBe(button);
      // Each stacked stepper is at least 24px tall (WCAG 2.2 SC 2.5.8).
      const steps = await page
        .locator("#touch .ui-number-input-step")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
      expect(steps).toHaveLength(2);
      for (const h of steps) expect(h).toBeGreaterThanOrEqual(24);
      await page.context().close();
    });
});
