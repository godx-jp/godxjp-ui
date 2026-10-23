import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "./compile-real-css";

// Real React controls, including an Input trailing slot containing two independent actions.
const ENTRY = `
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './src/app/app-provider';
import { Input, PasswordInput, DatePicker, TimePicker, NumberInput, SearchInput, Select } from './src/components/data-entry';
const params = new URLSearchParams(location.search);
function Demo() {
  const [pair, setPair] = React.useState('2026-10-17');
  const [selected, setSelected] = React.useState('a');
  const [opened, setOpened] = React.useState(false);
  return <AppProvider defaultLocale={params.get('locale') || 'en'} persist={false}>
    <main id="ready" style={{width:200, margin:24, display:'grid', gap:16}}>
      <section id="date"><DatePicker aria-label="Date" /></section>
      <section id="date-clear"><DatePicker aria-label="Date with value" defaultValue={new Date(2026,9,17)} /></section>
      {!params.has("screenshot") && <section id="pair"><Input aria-label="Adjacent actions" value={pair} onValueChange={setPair} trailingIcon={<span className="ui-time-picker-affix">
        <button type="button" aria-label="Clear pair" className="ui-control-inline-affix-action" onClick={()=>setPair('')}>×</button>
        <button type="button" aria-label="Calendar pair" className="ui-control-inline-affix-action" onClick={()=>setOpened(!opened)}>▦</button>
      </span>} /><output>{opened ? 'open' : 'closed'}</output></section>}
      <section id="input"><Input aria-label="Text" defaultValue="Example" allowClear /></section>
      <section id="password"><PasswordInput aria-label="Password" defaultValue="secret" /></section>
      <section id="time"><TimePicker aria-label="Time" /></section>
      <section id="time-clear"><TimePicker aria-label="Time with value" defaultValue="12:30" /></section>
      <section id="number"><NumberInput aria-label="Number" defaultValue={2} controls={params.get("controls") !== "off"} suffix={params.has("suffix") ? "%" : undefined} /></section>
      <section id="search"><SearchInput label="Search" defaultValue="Example" /></section>
      <section id="select"><Select aria-label="Select" value={selected} onValueChange={setSelected} allowClear options={[{value:'a',label:'Alpha'}]} /></section>
      <section id="combobox"><Select aria-label="Combobox" showSearch defaultValue="a" allowClear options={[{value:'a',label:'Alpha'}]} /></section>
    </main>
  </AppProvider>;
}
createRoot(document.getElementById('root')).render(<Demo/>);
`;
let browser: Browser;
let css = "";
let js = "";
beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const result = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: process.cwd() },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    js = result.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  css = await compileRealCss(
    `<div class="${[...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ")}"></div>`,
  );
  browser = await chromium.launch({ headless: true });
}, 180_000);
afterAll(async () => {
  await browser?.close();
});
async function open(coarse = true, width = 390, locale = "en", dir = "ltr", extra = "") {
  const page = await browser.newPage({ viewport: { width, height: 1050 }, hasTouch: coarse });
  await page.goto(`about:blank?locale=${locale}&${extra}`);
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready input").first().waitFor();
  await page.evaluate((direction) => (document.documentElement.dir = direction), dir);
  await page.waitForTimeout(80);
  return page;
}
async function geometry(page: Page) {
  return page.locator("#ready button").evaluateAll((buttons) =>
    buttons.map((button) => {
      const r = button.getBoundingClientRect();
      const field = button.closest("section")!;
      const input = field.querySelector("input:not([type=hidden]), [role=combobox]")!;
      const ir = input.getBoundingClientRect();
      const s = getComputedStyle(input);
      const rtl = s.direction === "rtl";
      const textEdge = rtl
        ? ir.left + parseFloat(s.paddingInlineEnd)
        : ir.right - parseFloat(s.paddingInlineEnd);
      const pseudo = getComputedStyle(button, "::after");
      return {
        id: field.id,
        label: button.getAttribute("aria-label"),
        width: r.width,
        height: r.height,
        x: r.x,
        y: r.y,
        textEdge,
        clearOfText: rtl ? r.right <= textEdge + 1 : r.left >= textEdge - 1,
        corners: [
          [1, 1],
          [r.width - 1, 1],
          [1, r.height - 1],
          [r.width - 1, r.height - 1],
        ].every(([x, y]) => button.contains(document.elementFromPoint(r.x + x!, r.y + y!))),
        pseudoWidth: pseudo.width,
        pseudoHeight: pseudo.height,
      };
    }),
  );
}
describe("input affixes: coarse targets and reserved text (gh#1371)", () => {
  for (const dir of ["ltr", "rtl"])
    it(`200px field: every action owns 44px without overlap (${dir})`, async () => {
      const page = await open(true, 390, "en", dir);
      const rows = await geometry(page);
      for (const row of rows.filter((r) => r.label && !["Select", "Combobox"].includes(r.label))) {
        expect(row.width, `${row.id}: width`).toBeGreaterThanOrEqual(44);
        expect(row.height, `${row.id}: height`).toBeGreaterThanOrEqual(44);
        expect(row.corners, `${row.id}: hit test`).toBe(true);
        expect(row.clearOfText, `${row.id}: text padding`).toBe(true);
      }
      const pair = rows.filter((r) => r.id === "pair");
      expect(Math.abs(pair[0]!.x - pair[1]!.x)).toBeGreaterThanOrEqual(44);
      expect(
        await page.locator("#pair input").evaluate((el) => el.getBoundingClientRect().width),
      ).toBe(200);
      await page.close();
    });
  it("coarse NumberInput ghost targets stay inside the field, including small sizes and overrides", async () => {
    for (const dir of ["ltr", "rtl"]) {
      const page = await open(true, 390, "en", dir);
      for (const target of [44, 56])
        for (const size of ["xs", "sm", "md", "lg"]) {
          await page.locator("#number").evaluate(
            (el, { target, size }) => {
              (el as HTMLElement).style.setProperty(
                "--control-affix-touch-target-size",
                target + "px",
              );
              el.querySelector(".ui-number-input")!.setAttribute("data-size", size);
            },
            { target, size },
          );
          const rows = await page.locator("#number button").evaluateAll((buttons) =>
            buttons.map((button) => {
              const b = button.getBoundingClientRect();
              const input = button.closest("section")!.querySelector("input")!;
              const f = input.getBoundingClientRect();
              const stroke = parseFloat(getComputedStyle(input).borderTopWidth);
              const s = getComputedStyle(button);
              return {
                width: b.width,
                height: b.height,
                border: s.borderWidth,
                shadow: s.boxShadow,
                background: s.backgroundColor,
                contained:
                  b.left >= f.left + stroke &&
                  b.right <= f.right - stroke &&
                  b.top >= f.top + stroke &&
                  b.bottom <= f.bottom - stroke,
              };
            }),
          );
          for (const row of rows) {
            expect(row.width).toBeGreaterThanOrEqual(target);
            expect(row.height).toBeGreaterThanOrEqual(target);
            expect(row.contained, JSON.stringify({ dir, target, size, row })).toBe(true);
            expect(row.border).toBe("0px");
            expect(row.shadow).toBe("none");
            expect(row.background).toBe("rgba(0, 0, 0, 0)");
          }
        }
      await page.close();
    }
  });

  it("screenshots exclude the adjacent-action probe; DatePicker owns one real action", async () => {
    const page = await open(true, 390, "ja", "ltr", "screenshot=1");
    expect(await page.locator("#pair").count()).toBe(0);
    expect(await page.locator("#date-clear button").count()).toBe(1);
    await page.locator("#date-clear button").tap();
    expect(await page.locator("#date-clear button").count()).toBe(1);
    expect(await page.locator("#date-clear button svg").count()).toBe(1);
    await page.locator("#date-clear button").tap();
    await page.getByRole("dialog").waitFor();
    await page.close();
  });

  it("a scoped target override resizes targets and the reserved text space", async () => {
    const page = await open();
    await page
      .locator("#ready")
      .evaluate((el) =>
        (el as HTMLElement).style.setProperty("--control-affix-touch-target-size", "56px"),
      );
    await page.waitForTimeout(80);
    const rows = await geometry(page);
    for (const row of rows.filter((r) => r.label && !["Select", "Combobox"].includes(r.label))) {
      expect(row.width, row.id).toBeGreaterThanOrEqual(56);
      expect(row.height, row.id).toBeGreaterThanOrEqual(56);
      expect(row.clearOfText, row.id).toBe(true);
      expect(row.corners, row.id).toBe(true);
    }
    await page.close();
  });

  it("NumberInput reserves its suffix as well as both steppers; controls=false keeps its gutter", async () => {
    const page = await open(true, 390, "en", "ltr", "suffix=1");
    const fits = await page.locator("#number").evaluate((el) => {
      const input = el.querySelector("input")!;
      const suffix = el.querySelector('[data-slot="number-input-suffix"]')!;
      return (
        input.getBoundingClientRect().right -
          parseFloat(getComputedStyle(input).paddingInlineEnd) <=
        suffix.getBoundingClientRect().left
      );
    });
    expect(fits).toBe(true);
    await page.close();
    const off = await open(true, 390, "en", "ltr", "controls=off&suffix=1");
    expect(await off.locator("#number button").count()).toBe(0);
    expect(
      await off.locator("#number input").evaluate((el) => getComputedStyle(el).paddingInlineEnd),
    ).toBe("12px");
    await off.close();
  });

  it("touch clear/open actions work for Input, TimePicker and both Select modes", async () => {
    const page = await open();
    await page.locator("#input button").tap();
    await expect.poll(() => page.locator("#input input").inputValue()).toBe("");
    await page.locator("#input input").fill("edited");
    expect(await page.locator("#input input").inputValue()).toBe("edited");
    await page.locator("#time button").tap();
    await page.getByRole("dialog").waitFor();
    await page.locator("#time input").press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.locator("#time-clear button").tap();
    await expect
      .poll(() => page.locator("#time-clear input:not([type=hidden])").inputValue())
      .toBe("");
    for (const id of ["select", "combobox"]) {
      await page.locator(`#${id} .ui-control-affix-action`).tap();
      expect(await page.locator(`#${id} [role=combobox]`).innerText()).not.toContain("Alpha");
      await page.locator(`#${id} [role=combobox]`).tap();
      await page.getByRole("option", { name: "Alpha", exact: true }).click();
      await expect
        .poll(() => page.locator(`#${id} [role=combobox]`).innerText())
        .toContain("Alpha");
    }
    await page.close();
  });

  it("fine pointer retains the 20px inline affix and 36px padding", async () => {
    const page = await open(false, 1280);
    const rows = await geometry(page);
    expect(rows.find((r) => r.id === "date")!.width).toBe(20);
    expect(rows.find((r) => r.id === "date")!.height).toBe(20);
    expect(
      await page.locator("#date input").evaluate((el) => getComputedStyle(el).paddingInlineEnd),
    ).toBe("36px");
    await page.close();
  });
  it("edge taps clear and open independently; password, number and search remain operable", async () => {
    const page = await open();
    const edgeTap = async (selector: string) => {
      const r = await page.locator(selector).boundingBox();
      await page.touchscreen.tap(r!.x + 2, r!.y + 2);
    };
    await edgeTap('#pair button[aria-label="Calendar pair"]');
    expect(await page.locator("#pair output").textContent()).toBe("open");
    expect(await page.locator("#pair input").inputValue()).toBe("2026-10-17");
    await edgeTap('#pair button[aria-label="Clear pair"]');
    expect(await page.locator("#pair input").inputValue()).toBe("");
    expect(await page.locator("#pair output").textContent()).toBe("open");
    await edgeTap("#date button");
    await page.getByRole("dialog").waitFor();
    await page.locator("#date input").press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await edgeTap("#date-clear button");
    await expect
      .poll(() => page.locator("#date-clear input:not([type=hidden])").inputValue())
      .toBe("");
    await edgeTap("#password button");
    expect(await page.locator("#password input").getAttribute("type")).toBe("text");
    await edgeTap("#number .ui-number-input-step-up");
    expect(await page.locator("#number input").inputValue()).toBe("3");
    await edgeTap("#number .ui-number-input-step-down");
    expect(await page.locator("#number input").inputValue()).toBe("2");
    await edgeTap("#search button");
    expect(await page.locator("#search input").inputValue()).toBe("");
    await page.close();
  });
});
