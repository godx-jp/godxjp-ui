import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1298 in Chromium, against the real stylesheet — a ListRow title that is actually cut keeps its
 * text reachable: a `title` with the cut text (not a badge's), a tab stop when nothing in the row
 * takes focus, and the line unfolds while the row holds keyboard focus. A title that fits gets none.
 */
const ROOT = process.cwd();
const LONG = "EXSELI-54 Rework the onboarding checklist so every trainee sees the same steps";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { ListRow } from "./src/components/data-display/list-row";
import { Badge } from "./src/components/data-display/badge";
import { Button } from "./src/components/general/button";
import { Text } from "./src/components/general/typography";
const LONG = ${JSON.stringify(LONG)};
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ width: 300 }}>
      <ListRow id="plain" title={LONG} />
      <ListRow id="short" title="Short title" />
      <ListRow id="action" title={LONG} trailing={<Button size="xs" variant="outline">Open</Button>} />
      <ListRow id="badged" title={
        <span style={{ display: "flex", gap: 4, alignItems: "center", minWidth: 0 }}>
          <Text truncate>{LONG}</Text><Badge>AI翻訳</Badge>
        </span>
      } />
      <ListRow id="link" as="div" asChild title={LONG}><a href="#x" /></ListRow>
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('#plain [data-slot="list-row-body"] > [data-truncated]').waitFor();
  return page;
}

const titleLine = (page: Page, id: string) =>
  page.locator(`[id="${id}"] [data-slot="list-row-body"] > :first-child`).evaluate((el) => ({
    truncated: el.hasAttribute("data-truncated"),
    title: el.getAttribute("title"),
    tabindex: el.getAttribute("tabindex"),
    whiteSpace: getComputedStyle(el.querySelector("[data-truncate]") ?? el).whiteSpace,
  }));

async function tabTo(page: Page, selector: string) {
  const target = page.locator(selector);
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`never reached ${selector}`);
}

describe("ListRow keeps a cut title readable (gh#1298)", { timeout: 60_000 }, () => {
  it("a cut title gets the text as title and a tab stop; a fitting one gets neither", async () => {
    const page = await open();
    expect(await titleLine(page, "plain")).toMatchObject({
      truncated: true,
      title: LONG,
      tabindex: "0",
    });
    expect(await titleLine(page, "short")).toMatchObject({
      truncated: false,
      title: null,
      tabindex: null,
    });
    await page.close();
  });

  it("keyboard focus on the line unfolds it", async () => {
    const page = await open();
    await tabTo(page, '#plain [data-slot="list-row-body"] > :first-child');
    expect((await titleLine(page, "plain")).whiteSpace).toBe("normal");
    await page.close();
  });

  it("a row with its own control gets no extra stop, and focusing the control unfolds the title", async () => {
    const page = await open();
    expect((await titleLine(page, "action")).tabindex).toBeNull();
    await tabTo(page, "#action button");
    expect(await titleLine(page, "action")).toMatchObject({
      truncated: true,
      whiteSpace: "normal",
    });
    await page.close();
  });

  it("a Text truncating beside a badge is titled with its own text, not the badge", async () => {
    const page = await open();
    expect(await titleLine(page, "badged")).toMatchObject({ truncated: true, title: LONG });
    await page.close();
  });

  it("a link row gets no extra stop and unfolds while the link has focus", async () => {
    const page = await open();
    expect((await titleLine(page, "link")).tabindex).toBeNull();
    await tabTo(page, "a#link");
    expect((await titleLine(page, "link")).whiteSpace).toBe("normal");
    await page.close();
  });
});
