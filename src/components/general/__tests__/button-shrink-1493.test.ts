import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * GDX-1493 — Button `shrink`: give way to the siblings without growing.
 *
 * Button ships `flex-shrink: 0`; `fill` shrinks AND grows (`flex: 1 1 auto`). A phone toolbar's
 * menu trigger needs the third case: as wide as its label while that fits, narrower — with the
 * label cut by an ellipsis — when the tools beside it need the room. Measured on GDX at 320 before
 * the axis existed: the trigger kept its label's whole width and pushed the last tool 6px past the
 * row (GDX-1487 patched it with a consumer stylesheet rule). Under a finger the trigger stays a
 * 44px target.
 */
const ROOT = process.cwd();
const LABEL = "プロジェクト設定の詳細なページ";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button, Text } from "./src/components/general";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./src/components/navigation";

function Glyph() {
  return <svg aria-hidden="true" viewBox="0 0 16 16"><rect width="16" height="16" /></svg>;
}

function Row({ id, width }: { id: string; width: number }) {
  return (
    <div data-row={id} style={{ display: "flex", alignItems: "center", gap: 4, width }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" shrink data-probe="trigger">
            <Glyph />
            <Text truncate title="${LABEL}" data-probe="label">${LABEL}</Text>
            <Glyph />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div style={{ flex: "1 1 auto" }} />
      <Button size="icon" aria-label="Star" data-probe="tool"><Glyph /></Button>
      <Button size="icon" aria-label="More" data-probe="tool"><Glyph /></Button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <Row id="narrow" width={288} />
    <Row id="wide" width={1200} />
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

async function measure(touch: boolean) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 640 },
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:16px"><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-row="wide"] [data-probe="trigger"]').waitFor();
  const out = await page.evaluate(() => {
    const row = (id: string) => {
      const el = document.querySelector<HTMLElement>(`[data-row="${id}"]`)!;
      const trigger = el.querySelector<HTMLElement>('[data-probe="trigger"]')!;
      const label = el.querySelector<HTMLElement>('[data-probe="label"]')!;
      const rowBox = el.getBoundingClientRect();
      const box = trigger.getBoundingClientRect();
      const tools = [...el.querySelectorAll<HTMLElement>('[data-probe="tool"]')].map((t) =>
        t.getBoundingClientRect(),
      );
      return {
        slot: trigger.getAttribute("data-slot"),
        rowRight: rowBox.right,
        width: box.width,
        height: box.height,
        triggerRight: box.right,
        lastToolRight: Math.max(...tools.map((t) => t.right)),
        firstToolLeft: Math.min(...tools.map((t) => t.left)),
        labelClient: label.clientWidth,
        labelScroll: label.scrollWidth,
        labelEllipsis: getComputedStyle(label).textOverflow,
        contentOverflow: trigger.scrollWidth - trigger.clientWidth,
      };
    };
    return {
      coarse: matchMedia("(pointer: coarse)").matches,
      narrow: row("narrow"),
      wide: row("wide"),
    };
  });
  await context.close();
  return out;
}

describe("Button shrink (Chromium, GDX-1493)", { timeout: 60_000 }, () => {
  it("gives way in a narrow row: the label ellipses and no tool leaves the row", async () => {
    const m = await measure(false);
    // DropdownMenuTrigger asChild keeps its slot on the kit Button (#1564).
    expect(m.narrow.slot).toBe("dropdown-menu-trigger");
    expect(m.narrow.lastToolRight).toBeLessThanOrEqual(m.narrow.rowRight + 0.5);
    expect(m.narrow.triggerRight).toBeLessThanOrEqual(m.narrow.firstToolLeft + 0.5);
    expect(m.narrow.width).toBeLessThan(m.wide.width);
    expect(m.narrow.labelScroll).toBeGreaterThan(m.narrow.labelClient);
    expect(m.narrow.labelEllipsis).toBe("ellipsis");
    expect(m.narrow.contentOverflow).toBeLessThanOrEqual(0);
  });

  it("does not grow in a wide row: it stays as wide as its label", async () => {
    const m = await measure(false);
    expect(m.wide.labelScroll).toBeLessThanOrEqual(m.wide.labelClient);
    // The spacer, not the trigger, takes the room: well short of the 1200px row.
    expect(m.wide.width).toBeLessThan(600);
  });

  it("keeps the 44px target under a finger", async () => {
    const m = await measure(true);
    expect(m.coarse).toBe(true);
    expect(m.narrow.height).toBeGreaterThanOrEqual(44);
    expect(m.narrow.width).toBeGreaterThanOrEqual(44);
    expect(m.narrow.lastToolRight).toBeLessThanOrEqual(m.narrow.rowRight + 0.5);
    expect(m.narrow.labelScroll).toBeGreaterThan(m.narrow.labelClient);
  });
});
