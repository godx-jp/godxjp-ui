import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Tree } from "../tree";

/**
 * Tree drag-and-drop in a real browser (gh#1093). What jsdom cannot tell: that a real pointer drag
 * starts a native HTML5 drag on the row, that the drop quarter is measured off the row's real box,
 * and that the drop indicator actually paints (a 2px line in the gap, a frame for inside).
 */

const ROOT = process.cwd();

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Tree } from "./src/components/data-display/tree";

const DATA = [
  { value: "guide", label: "Guide", children: [{ value: "intro", label: "Intro" }] },
  { value: "faq", label: "FAQ" },
  { value: "notes", label: "Notes" },
];

function App() {
  const [drops, setDrops] = React.useState([]);
  return (
    <div style={{ width: 320 }}>
      <Tree aria-label="Docs" treeData={DATA} defaultExpandAll draggable
        onDrop={(info) => setDrops((list) => [...list, [info.dragNode.value, info.node.value, info.dropPosition, info.dropToGap]])} />
      <output id="drops">{JSON.stringify(drops)}</output>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><App /></AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <Tree aria-label="Docs" treeData={[{ value: "a", label: "A" }]} draggable />
    </AppProvider>,
  );
  css = await compileRealCss(markup);
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector('[role="treeitem"]');
  return page;
}

/** Press on `from`, move onto `to` at `fraction` of its height, and report the indicator there. */
async function dragOnto(page: Page, from: string, to: string, fraction: number) {
  const source = (await page.getByRole("treeitem", { name: from }).boundingBox())!;
  const target = page.getByRole("treeitem", { name: to });
  const box = (await target.boundingBox())!;
  await page.mouse.move(source.x + 40, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + box.height * fraction, { steps: 8 });
  // A native drag reports dragover on a timer; give it two ticks to land.
  await page.mouse.move(box.x + 62, box.y + box.height * fraction);
  await page.waitForTimeout(100);
  const indicator = await target.evaluate((row) => ({
    position: row.getAttribute("data-drop-position"),
    line: getComputedStyle(row, "::after").blockSize,
    frame: getComputedStyle(row).boxShadow,
  }));
  await page.mouse.up();
  return indicator;
}

describe("Tree drag-and-drop in Chromium (gh#1093)", () => {
  it("a real pointer drag lands before, inside and after, and paints the indicator", async () => {
    const page = await mount();
    const after = await dragOnto(page, "Notes", "FAQ", 0.9);
    expect(after.position).toBe("after");
    expect(after.line).toBe("2px");
    const inside = await dragOnto(page, "Notes", "FAQ", 0.5);
    expect(inside.position).toBe("inside");
    expect(inside.frame).not.toBe("none");
    const before = await dragOnto(page, "Notes", "FAQ", 0.1);
    expect(before.position).toBe("before");
    expect(JSON.parse((await page.locator("#drops").textContent())!)).toEqual([
      ["notes", "faq", 1, true],
      ["notes", "faq", 0, false],
      ["notes", "faq", -1, true],
    ]);
    await page.close();
  });

  it("refuses to drop a parent into its own child", async () => {
    const page = await mount();
    const into = await dragOnto(page, "Guide", "Intro", 0.5);
    expect(into.position).toBeNull();
    expect(await page.locator("#drops").textContent()).toBe("[]");
    await page.close();
  });
});
