import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
// @ts-expect-error — plain .mjs script module, no types
import { collectFocusRings, evaluateProbes } from "../../../../scripts/visual-audit.mjs";

/**
 * gh#1543 in Chromium, against the real stylesheet — a control flush with the inline start of
 * `AccordionContent` keeps its whole focus ring.
 *
 * Measured before the fix (the issue's repro): `.ui-accordion-content` was `overflow: hidden`
 * with no inline padding, the focused radio sat 1px inside it, and its ring (outline 1px at
 * offset 2px) reached 3px past the radio — 2px of the ring cut at the inline start. `hidden`
 * cannot leave room for a ring (`overflow-clip-margin` applies to `clip` only), so the content
 * clips with `clip` + `--focus-ring-clip-margin`, the shared pattern (focus-ring-clip-margin test).
 *
 * The geometry of the open panel must not move: `clip` does not establish a BFC as `hidden` did,
 * so the inner wrapper's box is asserted against the content box too.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./src/components/data-display/accordion";
import { FormField } from "./src/components/data-entry/form-field";
import { RadioGroup } from "./src/components/data-entry/radio";
const dir = new URLSearchParams(location.search).get("dir") || "ltr";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div dir={dir} style={{ width: 360, padding: 24 }}>
      <Accordion type="single" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>
            <FormField id="choice" label="Your decision">
              <RadioGroup id="choice" defaultValue="x" options={[{ value: "x", label: "Option X" }, { value: "y", label: "Option Y" }]} />
            </FormField>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Body B</AccordionContent>
        </AccordionItem>
      </Accordion>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(dir: "ltr" | "rtl" = "ltr"): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  if (dir === "rtl")
    await page.evaluate(() => document.querySelector("#root > *")?.setAttribute("dir", "rtl"));
  await page.locator(".ui-radio").first().waitFor();
  return page;
}

/** How far the painted ring of the focused radio extends past the content's clip, per side. */
const ringCut = (page: Page) =>
  page.evaluate(() => {
    const ring = document.querySelector<HTMLElement>(".ui-radio[data-focus-visible]");
    const content = document.querySelector<HTMLElement>(".ui-accordion-content");
    if (!ring || !content) return null;
    const rs = getComputedStyle(ring);
    const reach =
      rs.outlineStyle === "none"
        ? 0
        : parseFloat(rs.outlineWidth) + parseFloat(rs.outlineOffset || "0");
    const r = ring.getBoundingClientRect();
    const cs = getComputedStyle(content);
    const c = content.getBoundingClientRect();
    const both = cs.overflowX === "clip" && cs.overflowY === "clip";
    const margin = both ? parseFloat(cs.overflowClipMargin || "0") || 0 : 0;
    const clips = cs.overflowX !== "visible";
    const left = c.left + content.clientLeft - margin;
    const right = c.left + content.clientLeft + content.clientWidth + margin;
    return {
      reach,
      overflow: cs.overflowX,
      start: clips ? Math.max(0, left - (r.left - reach)) : 0,
      end: clips ? Math.max(0, r.right + reach - right) : 0,
    };
  });

describe(
  "AccordionContent keeps a flush control's focus ring (gh#1543)",
  { timeout: 60_000 },
  () => {
    for (const dir of ["ltr", "rtl"] as const) {
      it(`the keyboard-focused radio's ring is not clipped by the content (${dir})`, async () => {
        const page = await open(dir);
        await page.getByRole("button", { name: "Question" }).focus();
        await page.keyboard.press("Tab");
        await page.locator(".ui-radio[data-focus-visible]").waitFor();
        const cut = await ringCut(page);
        expect(cut).not.toBeNull();
        // The ring is really there and reaches past the radio's box — otherwise 0 proves nothing.
        expect(cut!.reach).toBeGreaterThan(0);
        expect({ start: cut!.start, end: cut!.end }).toEqual({ start: 0, end: 0 });
        expect(cut!.overflow).toBe("clip");
        await page.close();
      });
    }

    /*
     * The second half of gh#1543: the shipped visual-audit has a probe for this (C13). Run its own
     * collector on the real kit — a react-aria radio rings its LABEL, not the focused input — with
     * the pre-fix `overflow: hidden` restored, then on the shipped stylesheet.
     */
    const c13 = async (page: Page) => {
      const raw = { c13: await page.evaluate(collectFocusRings) };
      return evaluateProbes(raw, { url: "u", viewport: { width: 800, height: 600 } }) as {
        findings: { rule: string; element: string; measured: Record<string, unknown> }[];
        cell: { rules: Record<string, string> };
      };
    };

    it("visual-audit C13 reports the pre-fix clip and passes the shipped stylesheet", async () => {
      const page = await open();
      await page.addStyleTag({ content: ".ui-accordion-content { overflow: hidden !important; }" });
      const before = await c13(page);
      const cut = before.findings.filter((f) => f.rule === "c13-focus-ring-clipped");
      expect(cut.length).toBeGreaterThan(0);
      expect(cut[0]!.element).toMatch(/ label[.[]/);
      expect(cut[0]!.measured).toMatchObject({ side: "left", overflow: "hidden" });
      expect(String(cut[0]!.measured.clipper)).toContain("accordion-content");
      expect(cut[0]!.measured.clippedPx).toBeGreaterThan(1);
      await page.close();

      const fixed = await open();
      const after = await c13(fixed);
      expect(after.findings.filter((f) => f.rule === "c13-focus-ring-clipped")).toEqual([]);
      expect(after.cell.rules["c13-focus-ring-clipped"]).toBe("pass");
      await fixed.close();
    });

    it("the open panel keeps its geometry and a closed panel still hides its body", async () => {
      const page = await open();
      const geo = await page.evaluate(() => {
        const content = document.querySelector<HTMLElement>(".ui-accordion-content")!;
        const inner = content.querySelector<HTMLElement>(".ui-accordion-content-inner")!;
        const c = content.getBoundingClientRect();
        const i = inner.getBoundingClientRect();
        return { top: i.top - c.top, height: c.height - i.height, width: c.width - i.width };
      });
      expect(geo).toEqual({ top: 0, height: 0, width: 0 });
      // Item B is closed: its body is not rendered and its region paints nothing.
      expect(await page.getByText("Body B").count()).toBe(0);
      await page.getByRole("button", { name: "Second" }).click();
      await expect.poll(() => page.getByText("Body B").isVisible()).toBe(true);
      await page.close();
    });
  },
);
