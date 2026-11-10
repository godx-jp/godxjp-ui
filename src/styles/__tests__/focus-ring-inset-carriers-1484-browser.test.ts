import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";
// @ts-expect-error — plain .mjs script module, no types
import { collectFocusRings, evaluateProbes } from "../../../scripts/visual-audit.mjs";

/**
 * GDX-1484 in Chromium, against the real stylesheet: visual-audit C13 reported focus rings cut in
 * three kit compositions a consumer cannot avoid, measured on GDX at 33.27.20 and 33.28.2:
 *   • a full-height TopbarItem in a `Topbar overflow="menu"` bar (`overflow: hidden`, which the
 *     bar needs to measure its clusters): 2px, the whole halo;
 *   • a link ListRow flush in a scrolling CardContent (`overflow: auto`): 2px, the whole halo;
 *   • an EditorialPillNav pill (the nav scrolls sideways, no room): 3–4.5px, the outline itself.
 * The first two already draw their OUTLINE inside the box; only the halo was outside. All three
 * now draw outline and halo inside, so nothing can be cut. Each case also checks that a visible
 * mark is still painted (an inset outline and an inset halo), so "no finding" cannot mean "no ring".
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Topbar } from "./src/components/layout/topbar";
import { TopbarItem } from "./src/components/layout/topbar-item";
import { Card, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { EditorialPillNav, EditorialPillNavItem } from "./src/components/layout/editorial";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ width: 720, padding: 24, display: "grid", gap: 24 }}>
      <div data-case="topbar">
        <Topbar overflow="menu" end={<TopbarItem aria-label="Account">Account</TopbarItem>} />
      </div>
      <div data-case="list-row">
        <Card>
          <CardContent style={{ overflow: "auto", maxHeight: 200, padding: 0 }}>
            <ListRow asChild title="Alpha" description="first">
              <a href="#alpha" />
            </ListRow>
          </CardContent>
        </Card>
      </div>
      <div data-case="pill">
        <EditorialPillNav label="Views">
          <EditorialPillNavItem asChild><a href="#one" aria-current="page">One</a></EditorialPillNavItem>
          <EditorialPillNavItem asChild><a href="#two">Two</a></EditorialPillNavItem>
        </EditorialPillNav>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-case="pill"] a').first().waitFor();
  return page;
}

const SELECTOR = {
  topbar: '[data-case="topbar"] .ui-topbar-item',
  "list-row": '[data-case="list-row"] a',
  pill: '[data-case="pill"] a',
} as const;

/** Focus the case's control by keyboard (Tab from the element before it). */
async function keyboardFocus(page: Page, selector: string) {
  await page.evaluate((s) => {
    const el = document.querySelector<HTMLElement>(s)!;
    const before = document.createElement("button");
    before.textContent = "before";
    before.id = "c13-before";
    el.parentElement!.insertBefore(before, el);
  }, selector);
  await page.locator("#c13-before").focus();
  await page.keyboard.press("Tab");
  await page.evaluate(() => document.getElementById("c13-before")?.remove());
}

const c13 = async (page: Page) => {
  const raw = { c13: await page.evaluate(collectFocusRings) };
  const res = evaluateProbes(raw, { url: "u", viewport: { width: 800, height: 700 } }) as {
    findings: { rule: string; element: string; measured: Record<string, unknown> }[];
  };
  return res.findings.filter((f) => f.rule === "c13-focus-ring-clipped");
};

describe("inset focus carriers keep their whole ring (GDX-1484)", { timeout: 90_000 }, () => {
  for (const id of Object.keys(SELECTOR) as (keyof typeof SELECTOR)[]) {
    it(`${id}: the focused control's ring is painted inside and C13 finds no cut`, async () => {
      const page = await open();
      await keyboardFocus(page, SELECTOR[id]);
      const style = await page.evaluate((s) => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        return {
          isTarget: el.matches(s),
          reach: parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset || "0"),
          outline: cs.outlineStyle,
          shadow: cs.boxShadow,
        };
      }, SELECTOR[id]);
      expect(style.isTarget).toBe(true);
      // A mark is painted, and none of it reaches outside the box.
      expect(style.outline).toBe("solid");
      expect(style.reach).toBeLessThanOrEqual(0);
      expect(style.shadow).toContain("inset");
      const outer = style.shadow
        .split(/,(?![^(]*\))/)
        .filter((s) => !s.includes("inset") && !/0px 0px 0px 0px/.test(s));
      expect(outer).toEqual([]);
      expect(await c13(page)).toEqual([]);
      await page.close();
    });
  }
});
