import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../data-entry/__tests__/compile-real-css";

/**
 * gh#1271 in Chromium, against the real stylesheet — three findings from a consumer's usability
 * inspection (@godxjp/ui 32.1.2):
 *
 *   (A) EmptyState was ALWAYS `role="status"`, so a static "no records yet" was announced as an
 *       update on every render. Default is now no live role; `live` restores `role="status"`.
 *   (B) Form layout="horizontal" — the action row under the fields must start at the CONTROL column.
 *       That is `<FormField label={false}>` (gh#709 pins a label-less field's control to the control
 *       track) around a wrapping Flex of buttons — an existing API, so no new component.
 *   (C) "The Upload trigger label wraps at 390px". The report's label is the DROPZONE's accessible
 *       name (`role="button"`, aria-label 「Tải file lên」) — its hint and meta are two paragraphs, so
 *       a line-counting probe reads ≥ 2 lines at every width. The real trigger button
 *       (`variant="button"`) stays one line at 390px in vi; this pins both facts.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { EmptyState } from "./src/components/data-display/empty-state";
import { Upload } from "./src/components/data-entry/upload";
import { Form } from "./src/components/data-entry/form";
import { FormField } from "./src/components/data-entry/form-field";
import { Input } from "./src/components/data-entry/input";
import { Button } from "./src/components/general/button";
import { Card, CardContent } from "./src/components/data-display/card";
import { Flex } from "./src/components/layout/flex";
const params = new URLSearchParams(location.search);
const kind = params.get("kind");
const view =
  kind === "empty-static" ? <EmptyState title="No records yet" />
  : kind === "empty-live" ? <EmptyState live title="No results match your filters" />
  : kind === "form-actions" ? (
    <Card><CardContent>
      <Form layout="horizontal" labelWidth={160}>
        <FormField label="Company name"><Input id="name" /></FormField>
        <FormField label="Email address"><Input id="email" /></FormField>
        <FormField label={false}>
          <Flex gap="sm" wrap>
            <Button type="submit">Save changes</Button>
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="button" variant="outline">Save and add another</Button>
          </Flex>
        </FormField>
      </Form>
    </CardContent></Card>
  )
  : kind === "upload-button" ? (
    <Card><CardContent>
      <Form layout="horizontal" labelWidth={160}>
        <FormField label="Tệp đính kèm"><Upload variant="button">Tải file lên</Upload></FormField>
      </Form>
    </CardContent></Card>
  )
  : kind === "upload-dropzone" ? <Upload variant="dropzone" />
  : <div />;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale={params.get("lang") ?? "en"} persist={false}><div id="ready">{view}</div></AppProvider>,
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

async function open(kind: string, width = 1280, lang = "en"): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}&lang=${lang}`);
  await page.setContent(
    `<!doctype html><html lang="${lang}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready > *").first().waitFor();
  return page;
}

describe("EmptyState is not a live region unless asked (gh#1271 A)", { timeout: 60_000 }, () => {
  it("a static empty state carries no role and no aria-live", async () => {
    const page = await open("empty-static");
    const attrs = await page.evaluate(() => {
      const root = document.querySelector('[data-slot="empty-state"]')!;
      return { role: root.getAttribute("role"), live: root.getAttribute("aria-live") };
    });
    expect(attrs).toEqual({ role: null, live: null });
    expect(await page.getByRole("status").count()).toBe(0);
    await page.close();
  });

  it("`live` restores role=status for the empty state that answers a filter", async () => {
    const page = await open("empty-live");
    const status = page.getByRole("status");
    expect(await status.count()).toBe(1);
    expect(await status.getAttribute("data-slot")).toBe("empty-state");
    expect(await status.textContent()).toContain("No results match your filters");
    await page.close();
  });
});

const actionGeometry = (page: Page) =>
  page.evaluate(() => {
    const inputs = [...document.querySelectorAll<HTMLElement>("#name, #email")];
    const buttons = [...document.querySelectorAll<HTMLElement>('[data-slot="form"] button')];
    return {
      inputLefts: inputs.map((i) => i.getBoundingClientRect().left),
      buttonLefts: buttons.map((b) => b.getBoundingClientRect().left),
      buttonTops: buttons.map((b) => Math.round(b.getBoundingClientRect().top)),
      buttonRights: buttons.map((b) => b.getBoundingClientRect().right),
      formRight: document.querySelector('[data-slot="form"]')!.getBoundingClientRect().right,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

describe(
  "Form horizontal action row starts at the control column (gh#1271 B)",
  { timeout: 60_000 },
  () => {
    it("at 1280px the first action's left edge equals the inputs' left edge", async () => {
      const page = await open("form-actions", 1280);
      const g = await actionGeometry(page);
      expect(g.inputLefts[0]).toBeCloseTo(g.inputLefts[1]!, 0);
      // The control column, not the label column: well right of the form's start.
      expect(Math.abs(g.buttonLefts[0]! - g.inputLefts[0]!)).toBeLessThanOrEqual(1);
      // One row at desktop width.
      expect(new Set(g.buttonTops).size).toBe(1);
      await page.close();
    });

    it("at 390px the row wraps inside the form with no page overflow", async () => {
      const page = await open("form-actions", 390);
      const g = await actionGeometry(page);
      // Collapsed (vertical) form: actions start where the inputs start.
      expect(Math.abs(g.buttonLefts[0]! - g.inputLefts[0]!)).toBeLessThanOrEqual(1);
      expect(new Set(g.buttonTops).size).toBeGreaterThan(1);
      for (const right of g.buttonRights) expect(right).toBeLessThanOrEqual(g.formRight + 0.5);
      expect(g.scrollWidth).toBe(g.clientWidth);
      await page.close();
    });
  },
);

describe("Upload at 390px in vi (gh#1271 C)", { timeout: 60_000 }, () => {
  it("the trigger button label stays on one line: button height = control height", async () => {
    const page = await open("upload-button", 390, "vi");
    const g = await page.evaluate(() => {
      const button = document.querySelector<HTMLElement>(".ui-upload-trigger")!;
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;height:var(--control-height)";
      button.append(probe);
      const controlHeight = probe.getBoundingClientRect().height;
      probe.remove();
      return {
        text: button.textContent,
        height: button.getBoundingClientRect().height,
        controlHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(g.text).toBe("Tải file lên");
    expect(g.height).toBe(g.controlHeight);
    expect(g.scrollWidth).toBe(g.clientWidth);
    await page.close();
  });

  // gh#1412: the name is now the visible hint (WCAG 2.5.3), no longer an off-screen 「Tải file lên」.
  it("the dropzone is named by its visible hint; its hint and meta each fit one line", async () => {
    const page = await open("upload-dropzone", 390, "vi");
    const g = await page.evaluate(() => {
      const zone = document.querySelector<HTMLElement>(".ui-upload-dropzone")!;
      const lines = (el: HTMLElement) =>
        Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
      return {
        name: zone.getAttribute("aria-label"),
        labelledBy: document.getElementById(zone.getAttribute("aria-labelledby")!)?.textContent,
        role: zone.getAttribute("role"),
        hint: lines(zone.querySelector<HTMLElement>(".ui-upload-dropzone-hint")!),
        meta: lines(zone.querySelector<HTMLElement>(".ui-upload-dropzone-meta")!),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(g.name).toBeNull();
    expect(g.labelledBy).toBe("Kéo thả file vào đây, hoặc bấm để chọn");
    expect(g.role).toBe("button");
    expect(g.hint).toBe(1);
    expect(g.meta).toBe(1);
    expect(g.scrollWidth).toBe(g.clientWidth);
    await page.close();
  });
});
