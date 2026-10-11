import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1239 in Chromium, against the real stylesheet.
 *
 * The common form shape puts a `<form>` between `SheetContent` and its `SheetBody`/`SheetFooter`:
 *
 *   <SheetContent><SheetHeader/><Form asChild><form onSubmit>
 *     <SheetBody>…</SheetBody><SheetFooter><Button type="submit"/></SheetFooter>
 *   </form></Form></SheetContent>
 *
 * `SheetBody` scrolls only as a flex item of `sheet-content`. A `<form>` in between was a box of
 * its own, so the body grew to its content and the footer — the submit button — sat below the
 * viewport. The body must scroll and the footer must stay on screen, with the form wrapper and
 * without it, and the footer button must still submit the form.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter } from "./src/components/feedback/sheet";
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter } from "./src/components/feedback/dialog";
import { Form } from "./src/components/data-entry/form";
import { FormField } from "./src/components/data-entry/form-field";
import { Input } from "./src/components/data-entry/input";
import { Button } from "./src/components/general/button";
const params = new URLSearchParams(location.search);
const kind = params.get("kind");
const wrap = params.get("wrap");
const rows = Array.from({ length: 30 }, (_, i) => (
  <FormField key={i} id={"f" + i} label={"Field " + i}><Input id={"f" + i} /></FormField>
));
window.__submitted = 0;
const submit = (e) => { e.preventDefault(); window.__submitted += 1; };
const Body = kind === "dialog" ? DialogBody : SheetBody;
const Footer = kind === "dialog" ? DialogFooter : SheetFooter;
const inner = [
  <Body key="b">{rows}</Body>,
  <Footer key="f"><Button type="submit">Save</Button></Footer>,
];
const content =
  wrap === "fields-only" ? <Form asChild><form onSubmit={submit} noValidate>{rows.slice(0, 2)}<Footer><Button type="submit">Save</Button></Footer></form></Form>
  : wrap === "form-aschild" ? <Form asChild><form onSubmit={submit} noValidate>{inner}</form></Form>
  : wrap === "form" ? <form onSubmit={submit} noValidate>{inner}</form>
  : inner;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    {kind === "dialog" ? (
      <DialogRoot defaultOpen><DialogContent><DialogHeader title="Edit" />{content}</DialogContent></DialogRoot>
    ) : (
      <Sheet defaultOpen><SheetContent><SheetHeader title="Edit" />{content}</SheetContent></Sheet>
    )}
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

async function open(query: string, height = 480): Promise<Page> {
  // Short viewport: thirty fields are far taller than the panel.
  const page = await browser.newPage({ viewport: { width: 1280, height } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?${query}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-slot$="-footer"] button').waitFor();
  return page;
}

const geometry = (page: Page, prefix: "sheet" | "dialog") =>
  page.evaluate((p) => {
    const body = document.querySelector<HTMLElement>(`[data-slot="${p}-body"]`)!;
    const footer = document.querySelector<HTMLElement>(`[data-slot="${p}-footer"]`)!;
    const b = body.getBoundingClientRect();
    const f = footer.getBoundingClientRect();
    return {
      bodyScrolls: body.scrollHeight > body.clientHeight,
      bodyOverflowY: getComputedStyle(body).overflowY,
      footerBottom: f.bottom,
      viewport: window.innerHeight,
      bodyToFooter: Math.round(f.top - b.bottom),
    };
  }, prefix);

describe(
  "Sheet with a <form> between SheetContent and SheetBody/SheetFooter (gh#1239)",
  {
    timeout: 60_000,
  },
  () => {
    it.each(["none", "form", "form-aschild"])(
      "wrap=%s: the body scrolls and the footer stays inside the viewport",
      async (wrap) => {
        const page = await open(`kind=sheet&wrap=${wrap}`);
        const g = await geometry(page, "sheet");
        expect(g.bodyOverflowY).toBe("auto");
        expect(g.bodyScrolls).toBe(true);
        expect(g.footerBottom).toBeLessThanOrEqual(g.viewport);
        await page.close();
      },
    );

    it("the form wrapper does not change the layout: same body→footer spacing as without it", async () => {
      const bare = await open("kind=sheet&wrap=none");
      const expected = (await geometry(bare, "sheet")).bodyToFooter;
      await bare.close();
      for (const wrap of ["form", "form-aschild"]) {
        const page = await open(`kind=sheet&wrap=${wrap}`);
        expect((await geometry(page, "sheet")).bodyToFooter, wrap).toBe(expected);
        await page.close();
      }
    });

    it("the footer submit button still submits the wrapping form", async () => {
      for (const wrap of ["form", "form-aschild"]) {
        const page = await open(`kind=sheet&wrap=${wrap}`);
        await page
          .locator('[data-slot="sheet-footer"] button[type="submit"]')
          .click({ timeout: 2_000 });
        expect(
          await page.evaluate(() => (window as unknown as { __submitted: number }).__submitted),
          wrap,
        ).toBe(1);
        await page.close();
      }
    });
  },
);

describe("Dialog with the same form wrapper (gh#1239)", { timeout: 60_000 }, () => {
  it.each(["none", "form", "form-aschild"])(
    "wrap=%s: the body scrolls and the footer stays inside the viewport",
    async (wrap) => {
      const page = await open(`kind=dialog&wrap=${wrap}`);
      const g = await geometry(page, "dialog");
      expect(g.bodyScrolls).toBe(true);
      expect(g.footerBottom).toBeLessThanOrEqual(g.viewport);
      await page.close();
    },
  );

  it("the form wrapper does not change the layout: same body→footer spacing as without it", async () => {
    const bare = await open("kind=dialog&wrap=none");
    const expected = (await geometry(bare, "dialog")).bodyToFooter;
    await bare.close();
    for (const wrap of ["form", "form-aschild"]) {
      const page = await open(`kind=dialog&wrap=${wrap}`);
      expect((await geometry(page, "dialog")).bodyToFooter, wrap).toBe(expected);
      await page.close();
    }
  });
});

describe(
  "a short form that holds its fields directly keeps its own box (gh#1239 scope)",
  {
    timeout: 60_000,
  },
  () => {
    it.each(["sheet", "dialog"])("%s: no body ⇒ the form stays a flex column", async (kind) => {
      const page = await open(`kind=${kind}&wrap=fields-only`);
      const display = await page
        .locator(`[data-slot="${kind}-content"] > form`)
        .evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe("flex");
      await page.close();
    });
  },
);

/**
 * gh#1242: the Dialog itself is capped to the viewport. `dialog-body` caps at `min(60vh, 32rem)`,
 * but header + footer + padding add ~154px, so below ~385px of viewport height (a phone in
 * landscape, 200% zoom on a 768px window) the footer — the confirm button — left the screen while
 * only the body scrolled. Measured before the fix at 1280x200: footer bottom 236px.
 */
describe("Dialog is capped to the viewport (gh#1242)", { timeout: 60_000 }, () => {
  it.each(["none", "form", "form-aschild"])(
    "wrap=%s at 1280x200: header and footer on screen, the body scrolls",
    async (wrap) => {
      const page = await open(`kind=dialog&wrap=${wrap}`, 200);
      const g = await geometry(page, "dialog");
      const box = await page
        .locator('[data-slot="dialog-content"]')
        .evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
      expect(g.bodyScrolls).toBe(true);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(g.footerBottom).toBeLessThanOrEqual(g.viewport);
      await page.close();
    },
  );

  it("Sheet at 1280x200 is unaffected: body scrolls, footer on screen", async () => {
    const page = await open("kind=sheet&wrap=none", 200);
    const g = await geometry(page, "sheet");
    expect(g.bodyScrolls).toBe(true);
    expect(g.footerBottom).toBeLessThanOrEqual(g.viewport);
    await page.close();
  });
});
