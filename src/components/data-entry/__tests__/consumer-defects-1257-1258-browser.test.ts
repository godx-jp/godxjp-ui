import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1257 in Chromium, against the real stylesheet — four defects a consumer measured on one page:
 *
 *   (a) Select mode="multiple" clipped its chips behind `overflow: hidden`; they must wrap and the
 *       trigger must grow, while ONE row keeps the control height. `suffixIcon={null}` with nothing
 *       else in the affix seat must stop reserving the chevron's end padding.
 *   (b) ListRow directly in a padded CardContent sat 16px inside the CardTitle's axis.
 *   (c) Button variant="secondary" painted its count pill near-black.
 *   +   the pressed Toggle's label colour is reachable through `--toggle-on-color`.
 *
 * and gh#1258: a `width="full"` Calendar put each day numeral on its cell edge (0px inline).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry/select";
import { Toggle } from "./src/components/data-entry/toggle";
import { Calendar } from "./src/components/data-entry/calendar";
import { Button } from "./src/components/general/button";
import { Card, CardHeader, CardTitle, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { Flex } from "./src/components/layout/flex";
const kind = new URLSearchParams(location.search).get("kind");
const options = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "infrastructure", label: "Infrastructure" },
];
const view =
  kind === "chips-3" || kind === "chips-1" ? (
    <div style={{ width: 200 }}>
      <Select mode="multiple" width="full" aria-label="Labels" options={options}
        defaultValue={kind === "chips-3" ? options.map((o) => o.value) : ["frontend"]} />
    </div>
  ) : kind === "suffix-null" || kind === "suffix-default" ? (
    <Select mode="multiple" width="auto" aria-label="Labels" options={options} defaultValue={["frontend"]}
      {...(kind === "suffix-null" ? { suffixIcon: null } : {})} />
  ) : kind === "list" ? (
    <>
      <Card id="padded"><CardHeader><CardTitle>Linked</CardTitle></CardHeader>
        <CardContent><ListRow title="Direct row" /></CardContent></Card>
      <Card id="padded-ul"><CardHeader><CardTitle>Linked</CardTitle></CardHeader>
        <CardContent><Flex as="ul" marker="none" direction="col" gap="none"><ListRow as="li" title="List row" /></Flex></CardContent></Card>
      <Card id="flush"><CardHeader><CardTitle>Linked</CardTitle></CardHeader>
        <CardContent flush><ListRow title="Flush row" /></CardContent></Card>
    </>
  ) : kind === "button" ? (
    <Flex gap="sm"><Button variant="secondary" count={3}>Comments</Button><Button variant="outline" count={3}>Comments</Button></Flex>
  ) : kind === "calendar-full" || kind === "calendar-default" ? (
    <div style={{ width: 720 }}>
      <Calendar mode="single" bordered defaultMonth={new Date(2026, 9, 1)}
        {...(kind === "calendar-full" ? { width: "full" } : {})} />
    </div>
  ) : (
    <div style={{ "--toggle-on-color": "rgb(1, 2, 3)" }}><Toggle defaultPressed aria-label="Star">Star</Toggle></div>
  );
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">{view}</div></AppProvider>,
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

async function open(kind: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready > *").first().waitFor();
  return page;
}

const triggerGeometry = (page: Page) =>
  page.evaluate(() => {
    const trigger = document.querySelector<HTMLElement>('[role="combobox"]')!;
    const box = trigger.querySelector<HTMLElement>('[data-slot="search-select-values"]');
    const style = getComputedStyle(trigger);
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;height:var(--control-height)";
    trigger.append(probe);
    const controlHeight = probe.getBoundingClientRect().height;
    probe.remove();
    const boxRect = box?.getBoundingClientRect();
    const chips = [...trigger.querySelectorAll<HTMLElement>('[data-slot="search-select-value"]')];
    return {
      height: trigger.getBoundingClientRect().height,
      controlHeight,
      clipped: box
        ? box.scrollWidth > box.clientWidth || box.scrollHeight > box.clientHeight
        : false,
      chipsOutside: chips.filter((c) => c.getBoundingClientRect().right > boxRect!.right + 0.5)
        .length,
      paddingStart: parseFloat(style.paddingInlineStart),
      paddingEnd: parseFloat(style.paddingInlineEnd),
    };
  });

describe("Select mode=multiple chips (gh#1257 a)", { timeout: 60_000 }, () => {
  it("three chips in a 200px trigger wrap inside it and the trigger grows", async () => {
    const page = await open("chips-3");
    const g = await triggerGeometry(page);
    expect(g.chipsOutside).toBe(0);
    expect(g.clipped).toBe(false);
    expect(g.height).toBeGreaterThan(g.controlHeight);
    await page.close();
  });

  it("one chip keeps the control height", async () => {
    const page = await open("chips-1");
    const g = await triggerGeometry(page);
    expect(g.height).toBe(g.controlHeight);
    await page.close();
  });

  it("suffixIcon={null} with no clear stops reserving the chevron's end padding", async () => {
    const bare = await open("suffix-null");
    const g = await triggerGeometry(bare);
    expect(g.paddingEnd).toBe(g.paddingStart);
    await bare.close();
    const chevron = await open("suffix-default");
    const d = await triggerGeometry(chevron);
    expect(d.paddingEnd).toBeGreaterThan(d.paddingStart);
    await chevron.close();
  });
});

describe("ListRow inline inset (gh#1257 b)", { timeout: 60_000 }, () => {
  it("in a padded CardContent the row text lines up with the CardTitle, as it does in a flush one", async () => {
    const page = await open("list");
    const offsets = await page.evaluate(() =>
      Object.fromEntries(
        ["padded", "padded-ul", "flush"].map((id) => {
          const card = document.getElementById(id)!;
          const title = card.querySelector('[data-slot="card-title"]')!.getBoundingClientRect();
          const row = card.querySelector('[data-slot="list-row-body"]')!.getBoundingClientRect();
          return [id, Math.round(row.left - title.left)];
        }),
      ),
    );
    // Flush already lined up (no card padding + the row's own inset); padded now matches it.
    expect(offsets).toEqual({ padded: 0, "padded-ul": 0, flush: 0 });
    await page.close();
  });
});

describe("Button count pill (gh#1257 c)", { timeout: 60_000 }, () => {
  it("secondary paints a light pill, not a near-black one", async () => {
    const page = await open("button");
    const [secondary] = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-slot="button-count"]')].map((pill) => {
        const [r, g, b] = getComputedStyle(pill).backgroundColor.match(/\d+/g)!.map(Number);
        return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255;
      }),
    );
    expect(secondary).toBeGreaterThan(0.8);
    await page.close();
  });
});

describe("pressed Toggle label colour knob (gh#1257)", { timeout: 60_000 }, () => {
  it("--toggle-on-color reaches the pressed label", async () => {
    const page = await open("toggle");
    const color = await page
      .locator('[aria-pressed="true"]')
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(1, 2, 3)");
    await page.close();
  });
});

describe("Calendar width=full day inset (gh#1258)", { timeout: 60_000 }, () => {
  const cells = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".ui-calendar-day-button")].map((button) => {
        const cell = button.closest("td")!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(button);
        const text = range.getBoundingClientRect();
        return {
          inline: Math.min(text.left - cell.left, cell.right - text.right),
          block: Math.min(text.top - cell.top, cell.bottom - text.bottom),
          height: cell.height,
        };
      }),
    );

  it("every day numeral keeps >= 8px inline and >= 4px block from its cell edge", async () => {
    const page = await open("calendar-full");
    const measured = await cells(page);
    expect(measured.length).toBeGreaterThan(27);
    expect(Math.min(...measured.map((c) => c.inline))).toBeGreaterThanOrEqual(8);
    expect(Math.min(...measured.map((c) => c.block))).toBeGreaterThanOrEqual(4);
    await page.close();
  });

  it("a content-less full month keeps the default cell height", async () => {
    const full = await open("calendar-full");
    const fullHeight = (await cells(full))[0]!.height;
    await full.close();
    const base = await open("calendar-default");
    expect(fullHeight).toBe((await cells(base))[0]!.height);
    await base.close();
  });
});
