import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1304 — the glove step. godx-qc measured the largest Button / Segmented on a HACCP checklist
 * run screen at 152×32 (390×844, mouse pointer), and apps may not hand-size a control, so a 良/否
 * verdict had no compliant route to the 56×56 target wet or gloved hands need. `size="touch"` on
 * Button, Segmented, ToggleGroup and `RadioGroup optionType="button"` is that route: every target
 * at least 56×56 CSS px and, where a component owns its siblings, at least 8px between targets.
 *
 * Measured in real Chromium against the package's real stylesheet, under a MOUSE as well as a
 * finger — the step is unconditional (the consumer asked for it by name), which is exactly what the
 * desk-pointer run proves; before this change none of these probes reached 56.
 */
const ROOT = process.cwd();
const VERDICT = `[{ value: "ok", label: "良" }, { value: "ng", label: "否" }]`;
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
import { RadioGroup, Segmented, ToggleGroup, ToggleGroupItem } from "./src/components/data-entry";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, alignItems: "flex-start" }}>
      <Button size="touch" data-probe="button-glyph">良</Button>
      <Button size="touch" data-probe="button-label">点検を記録する</Button>
      <Button size="lg" data-probe="button-lg">Save</Button>
      <div data-probe="segmented">
        <Segmented aria-label="判定" size="touch" defaultValue="ok" options={${VERDICT}} />
      </div>
      <div data-probe="segmented-block" style={{ inlineSize: 358 }}>
        <Segmented aria-label="判定" size="touch" block defaultValue="ok" options={${VERDICT}} />
      </div>
      <div data-probe="toggle-group">
        <ToggleGroup type="single" size="touch" aria-label="判定">
          <ToggleGroupItem value="ok">良</ToggleGroupItem>
          <ToggleGroupItem value="ng">否</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div data-probe="radio-bar">
        <RadioGroup aria-label="判定" optionType="button" size="touch" orientation="horizontal" defaultValue="ok" options={${VERDICT}} />
      </div>
    </div>
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
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

type Box = { width: number; height: number; left: number; right: number };
type Measure = {
  coarse: boolean;
  single: Record<string, Box>;
  groups: Record<string, Box[]>;
};

/** Item selectors per group probe — the element a finger actually presses. */
const ITEMS: Record<string, string> = {
  segmented: '[data-slot="segmented-item"]',
  "segmented-block": '[data-slot="segmented-item"]',
  "toggle-group": '[data-slot="toggle-group-item"]',
  "radio-bar": '[data-slot="radio-button"]',
};

async function measure(touch: boolean): Promise<Measure> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-probe="radio-bar"] [data-slot="radio-button"]').first().waitFor();
  const out = await page.evaluate((items) => {
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, left: r.left, right: r.right };
    };
    return {
      coarse: matchMedia("(pointer: coarse)").matches,
      single: Object.fromEntries(
        [...document.querySelectorAll<HTMLElement>("button[data-probe]")].map((el) => [
          el.dataset.probe!,
          box(el),
        ]),
      ),
      groups: Object.fromEntries(
        Object.entries(items).map(([probe, selector]) => [
          probe,
          [...document.querySelectorAll(`[data-probe="${probe}"] ${selector}`)].map(box),
        ]),
      ),
    };
  }, ITEMS);
  await context.close();
  return out;
}

function expectGloveTargets(m: Measure) {
  for (const probe of ["button-glyph", "button-label"]) {
    expect(m.single[probe]!.height, probe).toBeGreaterThanOrEqual(56);
    expect(m.single[probe]!.width, probe).toBeGreaterThanOrEqual(56);
  }
  for (const [probe, items] of Object.entries(m.groups)) {
    expect(items, probe).toHaveLength(2);
    for (const item of items) {
      expect(item.height, `${probe} height`).toBeGreaterThanOrEqual(56);
      expect(item.width, `${probe} width`).toBeGreaterThanOrEqual(56);
    }
    // ≥8px between the two targets (LTR: the second starts after the first ends).
    expect(items[1]!.left - items[0]!.right, `${probe} spacing`).toBeGreaterThanOrEqual(8);
  }
}

describe('size="touch" glove targets (Chromium, gh#1304)', { timeout: 40_000 }, () => {
  it("reaches 56×56 with ≥8px spacing under a MOUSE — the step is not pointer-gated", async () => {
    const m = await measure(false);
    expect(m.coarse).toBe(false);
    expectGloveTargets(m);
    // The existing ladder is untouched: lg is still one step (0.25rem) above the default control
    // height. Since 33.10.0 the default is 36px, so lg is its 40px desk step, not the 56px glove step.
    expect(m.single["button-lg"]!.height).toBe(40);
  });

  it("holds the same floor under a finger", async () => {
    const m = await measure(true);
    expect(m.coarse).toBe(true);
    expectGloveTargets(m);
  });

  it("block Segmented shares the row in full-width bars without dropping under 56", async () => {
    const m = await measure(false);
    const [first, second] = m.groups["segmented-block"]!;
    expect(first!.width).toBeCloseTo(second!.width, 1);
    // Two halves of a 358px track, minus its inset and the 8px gap: far past the floor.
    expect(first!.width).toBeGreaterThan(150);
  });
});
