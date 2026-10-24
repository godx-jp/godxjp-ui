import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalize } from "../../../markdown/src/codec";
import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";

/**
 * Directive blocks in a real browser: a `:::poll[…]{…}` is ONE block — the host's preview, moved
 * and deleted whole from the handle, its source edited behind "Edit source", inserted from a host
 * `/` row — and every edit reads back as the codec's canonical Markdown.
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

const SKELETON = ":::poll[質問]{id=p1}\n- A\n- B\n:::";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { BlockEditor } from "./packages/block-editor/src";

window.__value = null;
const directives = {
  poll: (block) =>
    block.attributes.id
      ? React.createElement("p", { "data-testid": "poll-preview" },
          block.label + " / " + block.body.split("\\n").length + " options")
      : undefined,
};
const actions = [{
  key: "poll",
  label: "投票",
  icon: null,
  keywords: ["poll"],
  run: (api) => api.insertMarkdown(${JSON.stringify(SKELETON)}),
}];

function App() {
  return (
    <AppProvider defaultLocale="ja" persist={false}>
      <div style={{ padding: 16, paddingInlineStart: 64, maxWidth: 720 }}>
        <BlockEditor
          aria-label="本文"
          defaultValue={window.__initial || ""}
          onValueChange={(v) => { window.__value = v; }}
          directives={directives}
          actions={actions}
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(initial = "") {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript((value) => {
    (window as unknown as { __initial: string }).__initial = value;
  }, initial);
  await page.goto("about:blank");
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-block-editor-content");
  return { page, errors };
}

const value = (page: Page) =>
  page.evaluate(() => (window as unknown as { __value: string | null }).__value);
const expectValue = (page: Page, expected: string) =>
  expect.poll(() => value(page), { timeout: 3000 }).toBe(expected);
const block = (page: Page) => page.locator('[data-directive="poll"]');

const POLL = ":::poll[日程は？]{id=date type=single}\n- 11月15日\n- 11月22日 {#d22}\n:::";
const BODY = `intro\n\n${POLL}\n\nafter`;

describe("BlockEditor directive blocks (Chromium)", { timeout: 40_000 }, () => {
  it("shows the host's preview for a registered directive, its source otherwise", async () => {
    const { page, errors } = await open(
      `${BODY}\n\n:::poll{type=ack}\nOK\n:::\n\n:::aside\nx\n:::\n\n:::constructor\nx\n:::`,
    );
    expect(await page.getByTestId("poll-preview").textContent()).toBe("日程は？ / 2 options");
    // No id: the host declines it, so the block shows its source; an unregistered name too.
    expect(await block(page).nth(1).locator("pre").textContent()).toBe(
      ":::poll{type=ack}\nOK\n:::",
    );
    expect(await page.locator('[data-directive="aside"] pre').textContent()).toBe(
      ":::aside\nx\n:::",
    );
    // A name that is an Object.prototype key is not a registered preview.
    expect(await page.locator('[data-directive="constructor"] pre').textContent()).toBe(
      ":::constructor\nx\n:::",
    );
    expect(await block(page).first().getByText("ブロック: poll").count()).toBe(1);
    // Loading changes nothing.
    expect(await value(page)).toBeNull();
    expect(errors).toEqual([]);
    await page.close();
  });

  it("moves and deletes the directive whole from the block handle", async () => {
    const { page } = await open(BODY);
    await block(page).hover();
    await page.getByRole("button", { name: "ドラッグで移動、クリックでブロックの操作" }).click();
    await page.getByRole("menuitem", { name: "上へ移動" }).click();
    await expectValue(page, `${POLL}\n\nintro\n\nafter\n`);
    await block(page).hover();
    await page.getByRole("button", { name: "ドラッグで移動、クリックでブロックの操作" }).click();
    await page.getByRole("menuitem", { name: "削除" }).click();
    await expectValue(page, "intro\n\nafter\n");
    expect(await block(page).count()).toBe(0);
    await page.close();
  });

  it("edits the directive's source and stays one block", async () => {
    const { page, errors } = await open(BODY);
    await block(page).getByRole("button", { name: "Markdown を編集" }).click();
    const source = page.getByRole("textbox", { name: "ブロック: poll" });
    expect(await source.inputValue()).toBe(POLL);
    await source.fill(":::poll[日程は？]{id=date}\n- 15日\n- 22日\n- 29日\n:::");
    await block(page).getByRole("button", { name: "完了" }).click();
    await expectValue(
      page,
      normalize(`intro\n\n:::poll[日程は？]{id=date}\n- 15日\n- 22日\n- 29日\n:::\n\nafter`),
    );
    expect(await page.getByTestId("poll-preview").textContent()).toBe("日程は？ / 3 options");
    // Source that is no longer a directive becomes what it now is.
    await block(page).getByRole("button", { name: "Markdown を編集" }).click();
    await page.getByRole("textbox", { name: "ブロック: poll" }).fill("- plain\n- list");
    await block(page).getByRole("button", { name: "完了" }).click();
    await expectValue(page, "intro\n\n- plain\n- list\n\nafter\n");
    expect(errors).toEqual([]);
    await page.close();
  });

  it("inserts a directive skeleton from a host / row as a directive block", async () => {
    const { page } = await open("");
    await page.locator(".ui-block-editor-content").click();
    await page.keyboard.type("/poll");
    const list = page.getByRole("listbox");
    await list.waitFor();
    expect(await list.getByRole("option").first().textContent()).toContain("投票");
    await page.keyboard.press("Enter");
    await expectValue(page, normalize(SKELETON));
    expect(await page.getByTestId("poll-preview").textContent()).toBe("質問 / 2 options");
    await page.close();
  });
});
