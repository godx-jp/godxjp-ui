import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../../src/app/app-provider";
import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { MarkdownEditor } from "../editor";

/**
 * @godxjp/editor in a real browser (gh#1109). jsdom has no `execCommand` and no layout, so two
 * promises are checked here: a toolbar edit is ONE native undo step (the reason edits go through
 * `execCommand("insertText")` instead of rewriting the value), and the editor fits a phone — the
 * toolbar wraps, side-by-side stacks — with no horizontal page scroll.
 */
const ROOT = process.cwd();
const ALIAS = {
  "@godxjp/markdown": join(ROOT, "packages/markdown/src/index.ts"),
  "@godxjp/ui/i18n": join(ROOT, "src/i18n/index.ts"),
  "@godxjp/ui/data-display": join(ROOT, "src/components/data-display/index.ts"),
  "@godxjp/ui/data-entry": join(ROOT, "src/components/data-entry/index.ts"),
  "@godxjp/ui/general": join(ROOT, "src/components/general/index.ts"),
  "@godxjp/ui/layout": join(ROOT, "src/components/layout/index.ts"),
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { MarkdownEditor } from "./packages/editor/src/editor";

function App() {
  const [value, setValue] = React.useState("");
  return (
    <AppProvider defaultLocale="ja" persist={false}>
      <div style={{ padding: 16 }}>
        <MarkdownEditor aria-label="本文" value={value} onValueChange={setValue} defaultMode="split" />
      </div>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  css = await compileRealCss(
    renderToStaticMarkup(
      <AppProvider defaultLocale="ja" persist={false}>
        <MarkdownEditor
          aria-label="x"
          defaultValue="**a**"
          defaultMode="split"
          upload={async () => ({ url: "" })}
        />
      </AppProvider>,
    ),
  );
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
      alias: ALIAS,
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  browser = await chromium.launch({ headless: true });
}, 120_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(width: number): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector("textarea");
  return page;
}

const geometry = (page: Page) =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const area = document.querySelector("textarea")!.getBoundingClientRect();
    const preview = document.querySelector('[role="region"]')!.getBoundingClientRect();
    const toolbarEl = document.querySelector('[role="toolbar"]')!;
    const toolbar = toolbarEl.getBoundingClientRect();
    // Every action, not just the strip: the strip box can fit while its buttons spill out (gh#1121).
    const buttonsOutside = [...toolbarEl.querySelectorAll("button")].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.right > toolbar.right + 0.5 || r.left < toolbar.left - 0.5;
    }).length;
    return {
      pageOverflow: doc.scrollWidth - doc.clientWidth,
      sideBySide: Math.abs(area.top - preview.top) < 2 && preview.left >= area.right - 1,
      stacked: preview.top >= area.bottom - 1,
      toolbarInside: toolbar.right <= doc.clientWidth + 0.5,
      buttonsOutside,
    };
  });

describe("MarkdownEditor in Chromium (gh#1109)", () => {
  it("side by side at 1280, stacked at 390 and 320, never a horizontal page scroll", async () => {
    const wide = await mount(1280);
    try {
      const g = await geometry(wide);
      expect(g.pageOverflow).toBeLessThanOrEqual(0);
      expect(g.sideBySide).toBe(true);
    } finally {
      await wide.close();
    }
    // 320 as well: at 390 this page's editor is wide enough to hold all twelve actions on one
    // line, so the toolbar overflow the docs card showed (gh#1121) only appears narrower.
    for (const width of [390, 320]) {
      const phone = await mount(width);
      try {
        const g = await geometry(phone);
        expect(g.pageOverflow, `page overflow at ${width}`).toBeLessThanOrEqual(0);
        expect(g.toolbarInside, `toolbar inside at ${width}`).toBe(true);
        expect(g.buttonsOutside, `actions outside the toolbar at ${width}`).toBe(0);
        expect(g.stacked, `stacked at ${width}`).toBe(true);
      } finally {
        await phone.close();
      }
    }
  });

  it("a toolbar edit is one native undo step, and the preview follows it", async () => {
    const page = await mount(1280);
    try {
      await page.click("textarea");
      await page.keyboard.type("hi");
      await page.keyboard.press("ControlOrMeta+a");
      await page.getByRole("button", { name: "太字" }).click();
      expect(await page.inputValue("textarea")).toBe("**hi**");
      await page.waitForSelector('[role="region"] strong');
      expect(await page.textContent('[role="region"] strong')).toBe("hi");

      await page.click("textarea");
      await page.keyboard.press("ControlOrMeta+z");
      expect(await page.inputValue("textarea")).toBe("hi");
      // …and the host's controlled value followed the undo too.
      await page.waitForFunction(() => !document.querySelector('[role="region"] strong'));
    } finally {
      await page.close();
    }
  });
});
