import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../data-entry/__tests__/compile-real-css";

/**
 * gh#1280 in Chromium, read from the ACCESSIBILITY TREE (CDP), not from attributes — what a
 * consumer's human-tester (gino-cloud, @godxjp/ui 32.3.0) heard is the computed tree:
 *
 *   (A) The visually hidden react-aria dismiss button inside a Dialog / Sheet was named
 *       "Dismiss" under `vi`: react-aria ships no Vietnamese overlay strings, so it fell back to
 *       en-US. It now carries the library's own `common.dismiss` in every locale.
 *   (B) Upload printed a rejection twice — once in the `role="alert"` paragraph and again in the
 *       sr-only polite status — and 「ファイルが大きすぎます」 never said the limit.
 *   (C) The native file input exposed the BROWSER's 「選択されていません」 / "No file chosen" as its
 *       value on a `vi` page. The input now leaves the tree; the library states the selection
 *       (「未選択」 / "Chưa chọn tệp") in the active locale.
 *   (D) NumberInput without `max` must carry no `aria-valuemax`.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./src/components/feedback/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "./src/components/feedback/dialog";
import { Upload } from "./src/components/data-entry/upload";
import { NumberInput } from "./src/components/data-entry/number-input";
import { FormField } from "./src/components/data-entry/form-field";
import { Button } from "./src/components/general/button";
const params = new URLSearchParams(location.search);
const kind = params.get("kind");
const view =
  kind === "sheet" ? (
    <Sheet defaultOpen>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader>
      </SheetContent>
    </Sheet>
  )
  : kind === "dialog" ? (
    <Dialog defaultOpen>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
        <DialogBody>Body</DialogBody>
      </DialogContent>
    </Dialog>
  )
  : kind === "upload-dropzone" ? (
    <FormField id="doc" label="Document"><Upload id="doc" variant="dropzone" maxSizeBytes={1024 * 1024} /></FormField>
  )
  : kind === "upload-button" ? (
    <FormField id="doc" label="Document"><Upload id="doc" variant="button" maxSizeBytes={1024 * 1024} /></FormField>
  )
  : kind === "number" ? (
    <FormField id="hours" label="Hours"><NumberInput id="hours" min={1} step={1} /></FormField>
  )
  : kind === "number-max" ? (
    <FormField id="hours" label="Hours"><NumberInput id="hours" min={1} max={40} /></FormField>
  )
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
  // A Japanese browser on a page set to another language is exactly the reported arrangement.
  browser = await chromium.launch({ headless: true, args: ["--lang=ja-JP"] });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(kind: string, lang = "en"): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "ja-JP",
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}&lang=${lang}`);
  // about:blank is not a secure context, so `crypto.randomUUID` (an upload item's uid) is absent.
  await page.evaluate(() => {
    if (!crypto.randomUUID) {
      let n = 0;
      Object.assign(crypto, {
        randomUUID: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
      });
    }
  });
  await page.setContent(
    `<!doctype html><html lang="${lang}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready").waitFor({ state: "attached" });
  return page;
}

interface AxNode {
  role: string;
  name: string;
  value: string;
  properties: Record<string, unknown>;
}

/** The computed accessibility tree, flattened — ignored nodes dropped. */
async function axTree(page: Page): Promise<AxNode[]> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
    nodes: Array<{
      ignored: boolean;
      role?: { value: string };
      name?: { value: string };
      value?: { value: unknown };
      properties?: Array<{ name: string; value: { value: unknown } }>;
    }>;
  };
  return nodes
    .filter((node) => !node.ignored)
    .map((node) => ({
      role: String(node.role?.value ?? ""),
      name: String(node.name?.value ?? ""),
      value: String(node.value?.value ?? ""),
      properties: Object.fromEntries((node.properties ?? []).map((p) => [p.name, p.value.value])),
    }));
}

const DISMISS = { en: "Dismiss", ja: "閉じる", vi: "Bỏ qua" } as const;

describe(
  "the hidden overlay dismiss button speaks the app's locale (gh#1280 A)",
  { timeout: 60_000 },
  () => {
    // Every React Aria dismiss button in the library comes from RAC `Modal` (Dialog, Sheet, Image
    // preview): the DS Popover renders its own panel through RAC's `render`, which has none.
    for (const kind of ["dialog", "sheet"] as const) {
      for (const lang of ["vi", "ja", "en"] as const) {
        it(`${kind} · ${lang}: every dismiss button is named 「${DISMISS[lang]}」`, async () => {
          const page = await open(kind, lang);
          await page.waitForFunction(() => document.querySelector('button[tabindex="-1"]') != null);
          // Settle the relabel (it runs after RAC's own commit).
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
          const names = await page.evaluate(() =>
            [...document.querySelectorAll<HTMLButtonElement>('button[tabindex="-1"]')]
              .filter((button) => button.style.width === "1px" && button.style.height === "1px")
              .map((button) => button.getAttribute("aria-label")),
          );
          expect(names.length).toBeGreaterThan(0);
          expect(new Set(names)).toEqual(new Set([DISMISS[lang]]));
          const tree = await axTree(page);
          expect(tree.some((node) => node.role === "button" && node.name === "Dismiss")).toBe(
            lang === "en",
          );
          await page.context().close();
        });
      }
    }
  },
);

describe("Upload rejections are said once, with the limit (gh#1280 B)", { timeout: 60_000 }, () => {
  for (const [lang, limit] of [
    ["ja", "1.0 MB"],
    ["vi", "1,0 MB"],
    ["en", "1.0 MB"],
  ] as const) {
    it(`${lang}: a too-large file yields ONE message that names ${limit}`, async () => {
      const page = await open("upload-dropzone", lang);
      await page.locator('input[type="file"]').setInputFiles({
        name: "big.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(2 * 1024 * 1024),
      });
      await page.getByRole("alert").waitFor();
      const texts = await page.evaluate(() => {
        const all = [...document.querySelectorAll<HTMLElement>("#ready *")];
        return all
          .filter((el) =>
            [...el.childNodes].some(
              (n) => n.nodeType === 3 && /big\.pdf/.test(n.textContent ?? ""),
            ),
          )
          .map((el) => el.textContent ?? "");
      });
      expect(texts).toHaveLength(1);
      expect(texts[0]).toContain(limit);
      const tree = await axTree(page);
      const spoken = tree.filter(
        (node) => node.role === "StaticText" && /big\.pdf/.test(node.name),
      );
      expect(spoken).toHaveLength(1);
      await page.context().close();
    });
  }
});

const NO_FILE = { en: "No file selected", ja: "未選択", vi: "Chưa chọn tệp" } as const;

describe(
  "Upload states its own selection in the app locale (gh#1280 C)",
  { timeout: 60_000 },
  () => {
    for (const kind of ["upload-dropzone", "upload-button"] as const) {
      for (const lang of ["vi", "ja", "en"] as const) {
        it(`${kind} · ${lang}: no browser-language file value; 「${NO_FILE[lang]}」 is read`, async () => {
          const page = await open(kind, lang);
          const tree = await axTree(page);
          const values = tree.map((node) => `${node.name} ${node.value}`).join("\n");
          // Chromium's own strings for an empty <input type=file>, in the browser's language.
          expect(values).not.toMatch(
            /選択されていません|ファイルが選択されていません|No file chosen/,
          );
          // The label still names the control the user operates, and the selection is described.
          const trigger = tree.find(
            (node) => node.role === "button" && node.name.includes("Document"),
          );
          expect(trigger, JSON.stringify(tree.filter((n) => n.role === "button"))).toBeDefined();
          expect(await page.locator("#ready").innerText()).toContain(NO_FILE[lang]);
          const describedBy = await page.evaluate(() => {
            const el = document.querySelector<HTMLElement>(
              '[data-slot="upload-trigger"], .ui-upload-trigger, .ui-upload-dropzone',
            )!;
            return (el.getAttribute("aria-describedby") ?? "")
              .split(/\s+/)
              .filter(Boolean)
              .map((id) => document.getElementById(id)?.textContent ?? "")
              .join(" ");
          });
          expect(describedBy).toContain(NO_FILE[lang]);
          await page.context().close();
        });
      }
    }

    it("clicking the FormField label focuses the visible trigger, not the hidden input", async () => {
      for (const kind of ["upload-button", "upload-dropzone"]) {
        const page = await open(kind, "ja");
        await page.getByText("Document", { exact: true }).click();
        const focused = await page.evaluate(() => ({
          tag: document.activeElement?.tagName,
          type: (document.activeElement as HTMLInputElement | null)?.type,
          role: document.activeElement?.getAttribute("role"),
        }));
        expect(focused.type === "file").toBe(false);
        expect(focused.tag === "BUTTON" || focused.role === "button").toBe(true);
        await page.context().close();
      }
    });

    it("`#id` still reaches the native input, so e2e file attachment keeps working", async () => {
      const page = await open("upload-dropzone", "ja");
      expect(await page.locator("#doc").getAttribute("type")).toBe("file");
      await page.context().close();
    });

    it("after a pick the 「no file」 statement is gone — the file list says what was picked", async () => {
      const page = await open("upload-button", "vi");
      await page.locator('input[type="file"]').setInputFiles({
        name: "passport.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(10),
      });
      await page.getByText("passport.pdf").waitFor();
      const text = await page.locator("#ready").innerText();
      expect(text).not.toContain(NO_FILE.vi);
      expect(await page.locator(".ui-upload-trigger").getAttribute("aria-describedby")).toBeNull();
      await page.context().close();
    });
  },
);

describe("NumberInput bounds in the accessibility tree (gh#1280 D)", { timeout: 60_000 }, () => {
  /*
   * Measured, not fixed: Chromium's CDP tree reports `valuemax: 0` for EVERY spinbutton without a
   * maximum — a native `<input type="number" min="1">` included — so the reported 「valuemax 0」 is
   * the browser's serialisation of "no max", not an attribute the library writes. The contract the
   * library owns is the DOM: no `aria-valuemax` when there is no `max`.
   */
  it("without `max`: no aria-valuemax attribute (Chromium's tree then matches a native number input)", async () => {
    const page = await open("number");
    const attrs = await page.evaluate(() => {
      const input = document.getElementById("hours")!;
      return {
        min: input.getAttribute("aria-valuemin"),
        max: input.getAttribute("aria-valuemax"),
      };
    });
    expect(attrs).toEqual({ min: "1", max: null });
    await page.evaluate(() => {
      const native = document.createElement("input");
      native.type = "number";
      native.min = "1";
      native.setAttribute("aria-label", "native");
      document.body.append(native);
    });
    const tree = await axTree(page);
    const ours = tree.find((node) => node.role === "spinbutton" && node.name !== "native");
    const native = tree.find((node) => node.role === "spinbutton" && node.name === "native");
    expect(ours?.properties.valuemax).toBe(native?.properties.valuemax);
    await page.context().close();
  });

  it("with `max`: the bound is exposed", async () => {
    const page = await open("number-max");
    const tree = await axTree(page);
    const spin = tree.find((node) => node.role === "spinbutton");
    expect(spin?.properties.valuemax).toBe(40);
    await page.context().close();
  });
});
