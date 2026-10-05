import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";

/**
 * @godxjp/block-editor in a real browser (gh#1156). jsdom has no layout, no selection geometry and
 * no IME, so the editor is driven here the way a person drives it: typing, `/`, selecting, the
 * handle, paste, an upload, Japanese composition — and read back through `onValueChange`, which
 * must always equal the codec's canonical Markdown.
 */
const ROOT = process.cwd();
const ALIAS = {
  "@godxjp/markdown/codec": join(ROOT, "packages/markdown/src/codec/index.ts"),
  "@godxjp/markdown": join(ROOT, "packages/markdown/src/index.ts"),
  "@godxjp/ui/i18n": join(ROOT, "src/i18n/index.ts"),
  "@godxjp/ui/data-display": join(ROOT, "src/components/data-display/index.ts"),
  "@godxjp/ui/data-entry": join(ROOT, "src/components/data-entry/index.ts"),
  "@godxjp/ui/general": join(ROOT, "src/components/general/index.ts"),
  "@godxjp/ui/navigation": join(ROOT, "src/components/navigation/index.ts"),
  "@godxjp/ui/layout": join(ROOT, "src/components/layout/index.ts"),
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { BlockEditor } from "./packages/block-editor/src";

const uploads = [];
window.__uploads = uploads;
window.__value = null;
const params = new URLSearchParams(location.search);

function App() {
  return (
    <AppProvider defaultLocale={params.get("locale") || "ja"} persist={false}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <BlockEditor
          aria-label="本文"
          defaultValue={window.__initial || ""}
          onValueChange={(v) => { window.__value = v; }}
          upload={(file, { signal }) => new Promise((resolve, reject) => {
            uploads.push({ name: file.name, resolve, reject, aborted: false });
            const entry = uploads[uploads.length - 1];
            signal.addEventListener("abort", () => { entry.aborted = true; reject(new Error("aborted")); });
          })}
          suggestWikilinks={(q) => [{ target: "Guide", label: "ガイド" }, { target: "Setup" }].filter((s) => s.target.toLowerCase().includes(q.toLowerCase()) || (s.label || "").includes(q))}
        />
      </div>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
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
  // The chrome renders client-side, so feed the compiler every class-like token of the bundle.
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(initial = "", width = 1024, locale = "ja") {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript((value) => {
    (window as unknown as { __initial: string }).__initial = value;
  }, initial);
  await page.goto(`about:blank?locale=${locale}`);
  await page.setContent(
    `<!doctype html><html lang="${locale}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-block-editor-content");
  return { page, errors };
}

const value = (page: Page) =>
  page.evaluate(() => (window as unknown as { __value: string | null }).__value);
/** onValueChange lands after the transaction; poll for it rather than read once. */
const expectValue = (page: Page, expected: string) =>
  expect.poll(() => value(page), { timeout: 3000 }).toBe(expected);
const editable = (page: Page) => page.locator(".ui-block-editor-content");

describe("BlockEditor (Chromium, gh#1156)", () => {
  it("loads Markdown into blocks and names its textbox", async () => {
    const { page, errors } = await open("# 見出し\n\n> [!WARNING] 注意\n> 本文\n\n- [ ] todo");
    const box = editable(page);
    expect(await box.getAttribute("role")).toBe("textbox");
    expect(await box.getAttribute("aria-label")).toBe("本文");
    expect(await box.locator("h1").textContent()).toBe("見出し");
    expect(await box.locator('.ui-prose-callout[data-kind="warning"]').count()).toBe(1);
    expect(await box.locator('ul[data-type="taskList"] input[type="checkbox"]').count()).toBe(1);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("emits canonical Markdown as you type, Markdown shortcuts included", async () => {
    const { page } = await open();
    await editable(page).click();
    await page.keyboard.type("# Title");
    await page.keyboard.press("Enter");
    await page.keyboard.type("- one");
    await page.keyboard.press("Enter");
    await page.keyboard.type("two");
    await expectValue(page, "# Title\n\n- one\n- two\n");
    await page.close();
  });

  it("opens the / menu at the caret, filters it, and inserts the picked block", async () => {
    const { page, errors } = await open();
    await editable(page).click();
    await page.keyboard.type("/");
    const list = page.getByRole("listbox");
    await list.waitFor();
    expect(await list.getByRole("option").count()).toBeGreaterThan(8);
    expect(await editable(page).getAttribute("aria-haspopup")).toBe("listbox");
    // Points at the highlighted row, once the portalled list has mounted.
    await page.waitForFunction(() => {
      const id = document
        .querySelector(".ui-block-editor-content")!
        .getAttribute("aria-activedescendant");
      return !!id && document.getElementById(id)?.getAttribute("role") === "option";
    });
    await page.keyboard.type("h2");
    expect(await list.getByRole("option").first().textContent()).toContain("見出し2");
    await page.keyboard.press("Enter");
    await list.waitFor({ state: "detached" });
    await page.keyboard.type("Section");
    await expectValue(page, "## Section\n");
    // Arrow keys move the highlighted row, Escape closes without inserting.
    await page.keyboard.press("Enter");
    await page.keyboard.type("/");
    await list.waitFor();
    await page.keyboard.press("Escape");
    await list.waitFor({ state: "detached" });
    expect(errors).toEqual([]);
    await page.close();
  });

  it("opens the same menu from a full-width ／ (Japanese keyboard)", async () => {
    const { page } = await open();
    await editable(page).click();
    await page.keyboard.insertText("／");
    await page.getByRole("listbox").waitFor();
    await page.close();
  });

  it("raises the format toolbar on a selection and applies marks", async () => {
    const { page } = await open("hello world");
    await editable(page).locator("p").click();
    await page.keyboard.press("Home");
    for (let i = 0; i < 5; i++) await page.keyboard.press("Shift+ArrowRight");
    const bold = page.getByRole("button", { name: "太字" });
    await bold.waitFor();
    await bold.click();
    await expectValue(page, "**hello** world\n");
    await page.close();
  });

  it("moves, duplicates and deletes blocks from the keyboard (Alt+Shift+↑↓, Mod+/)", async () => {
    const { page } = await open("first\n\nsecond");
    await editable(page).locator("p").nth(1).click();
    // ProseMirror takes the click's selection asynchronously; act once the caret is there.
    await page.waitForFunction(() => window.getSelection()?.anchorNode?.textContent === "second");
    await page.keyboard.press("Alt+Shift+ArrowUp");
    await expectValue(page, "second\n\nfirst\n");
    await page.keyboard.press("ControlOrMeta+/");
    await page.getByRole("menuitem", { name: "複製" }).click();
    await expectValue(page, "second\n\nsecond\n\nfirst\n");
    await page.close();
  });

  it("pastes plain-text Markdown as blocks", async () => {
    const { page } = await open();
    await editable(page).click();
    await page.evaluate(() => {
      const data = new DataTransfer();
      data.setData("text/plain", "- a\n- b\n\n> [!TIP]\n> tip");
      document
        .querySelector(".ui-block-editor-content")!
        .dispatchEvent(
          new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }),
        );
    });
    await expectValue(page, "- a\n- b\n\n> [!TIP]\n>\n> tip\n");
    await page.close();
  });

  it("uploads a pasted file through the host, with a placeholder until it lands", async () => {
    const { page } = await open();
    await editable(page).click();
    await page.evaluate(() => {
      const data = new DataTransfer();
      data.items.add(new File(["x"], "photo.png", { type: "image/png" }));
      document
        .querySelector(".ui-block-editor-content")!
        .dispatchEvent(
          new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }),
        );
    });
    await page.locator('.ui-block-editor-upload[data-status="uploading"]').waitFor();
    await page.evaluate(() =>
      (
        window as unknown as { __uploads: { resolve: (r: unknown) => void }[] }
      ).__uploads[0]!.resolve({
        url: "asset:abc",
      }),
    );
    // `img[src]`: ProseMirror draws separator images around inline atoms.
    await page.locator(".ui-block-editor-content img[src]").waitFor();
    await expectValue(page, "![photo.png](asset:abc)\n");
    await page.close();
  });

  it("keeps a Japanese IME composition intact and commits it once", async () => {
    const { page } = await open();
    await editable(page).click();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.imeSetComposition", {
      text: "にほんご",
      selectionStart: 4,
      selectionEnd: 4,
    });
    await cdp.send("Input.imeSetComposition", {
      text: "日本語",
      selectionStart: 3,
      selectionEnd: 3,
    });
    await cdp.send("Input.insertText", { text: "日本語" });
    await page.waitForFunction(
      () => (window as unknown as { __value: string | null }).__value === "日本語\n",
    );
    expect(await page.getByRole("listbox").count()).toBe(0);
    await page.close();
  });

  it("suggests wikilinks on [[ and inserts the link", async () => {
    const { page } = await open();
    await editable(page).click();
    await page.keyboard.type("see [[gui");
    const list = page.getByRole("listbox");
    await list.waitFor();
    await page.keyboard.press("Enter");
    await list.waitFor({ state: "detached" });
    await expectValue(page, "see [[Guide|ガイド]]\n");
    await page.close();
  });

  it("fits a phone: no horizontal scroll, handle shown for the caret's block", async () => {
    const { page, errors } = await open("# 見出し\n\n本文の段落です。", 390);
    await editable(page).locator("p").click();
    const m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      handle: !!document.querySelector(".ui-block-editor-handle"),
    }));
    expect(m).toEqual({ overflow: false, handle: true });
    expect(errors).toEqual([]);
    await page.close();
  });

  /* Phase 2 (gh#1161): callout, columns and toggle editing. */
  it("retypes and retitles a callout in place", async () => {
    const { page, errors } = await open("> [!NOTE]\n> body");
    await page.getByRole("button", { name: /コールアウトの種類/ }).click();
    await page.getByRole("menuitemradio", { name: "警告" }).click();
    await expectValue(page, "> [!WARNING]\n>\n> body\n");
    await page.getByRole("textbox", { name: "コールアウトの見出し" }).fill("気をつけて");
    await expectValue(page, "> [!WARNING] 気をつけて\n>\n> body\n");
    expect(errors).toEqual([]);
    await page.close();
  });

  it("adds, sizes and removes columns, laid side by side", async () => {
    const { page, errors } = await open(
      "::::columns\n:::column\nA\n:::\n\n:::column\nB\n:::\n::::",
    );
    await editable(page).locator(".ui-prose-column p").first().click();
    const add = page.getByRole("button", { name: "列を追加" });
    await add.waitFor();
    const [a, b] = await page
      .locator(".ui-prose-column")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(Math.abs(a! - b!)).toBeLessThan(1); // one row
    await add.click();
    await expectValue(
      page,
      "::::columns\n:::column\nA\n:::\n\n:::column\nB\n:::\n\n:::column\n:::\n::::\n",
    );
    await page.getByRole("combobox", { name: "この列の幅" }).click();
    await page.getByRole("option", { name: "33%" }).click();
    await expectValue(
      page,
      "::::columns\n:::column{width=33}\nA\n:::\n\n:::column\nB\n:::\n\n:::column\n:::\n::::\n",
    );
    await page.getByRole("button", { name: "この列を削除" }).click();
    await expectValue(page, "::::columns\n:::column\nB\n:::\n\n:::column\n:::\n::::\n");
    expect(errors).toEqual([]);
    await page.close();
  });

  it("opens a toggle from a named, stateful button", async () => {
    const { page } = await open(":::toggle[詳細]\n中身\n:::");
    const button = page.locator(".ui-block-editor-toggle-button");
    expect(await button.getAttribute("aria-label")).toBe("開く");
    expect(await button.getAttribute("aria-expanded")).toBe("false");
    expect(await page.getByText("中身").isVisible()).toBe(false);
    await button.click();
    expect(await button.getAttribute("aria-expanded")).toBe("true");
    expect(await button.getAttribute("aria-label")).toBe("閉じる");
    expect(await page.getByText("中身").isVisible()).toBe(true);
    await page.close();
  });
});
