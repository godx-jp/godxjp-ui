import { readFileSync, readdirSync } from "node:fs";
import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

// Real public primitives. Bundled in memory: no generated fixtures, git history or file writes.
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { AppShell, Topbar, TopbarItem, TopbarSearch, PageContainer } from "./src/components/layout";
import { Card, CardContent, Table, TableCaption, TableHeader, TableHead, TableBody, TableRow, TableCell, Badge } from "./src/components/data-display";
import { Heading, Text, Button } from "./src/components/general";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./src/components/feedback";
function App() {
 return <AppProvider defaultLocale="en" persist={false}>
 <AppShell responsiveNavigation="docked" logo={<Text>Library</Text>}
 sidebar={<Text>Navigation</Text>} navRail={<Text>Rail</Text>} footer={<Text>Footer</Text>}
 topbar={<Topbar start={<><TopbarItem>Brand</TopbarItem><TopbarSearch ariaLabel="Search collection" placeholder="Search collection" /></>}
 end={<><TopbarItem>Cards</TopbarItem><TopbarItem>Account</TopbarItem></>} />}>
 <PageContainer title="Collection">
 <Heading family="editorial" id="editorial">Collection notes</Heading>
 <Heading id="display">UI heading</Heading>
 <Text tabular id="figures">1,234.56</Text><Text mono tabular id="mono">1,234.56</Text><Badge tabular>42</Badge>
 <Card><CardContent flush><Table preset="stacked-record-collection">
 <TableCaption>Listed prices · shipping is not included</TableCaption>
 <TableHeader><TableRow><TableHead>Market</TableHead><TableHead numeric>Price</TableHead></TableRow></TableHeader>
 <TableBody><TableRow><TableCell>North</TableCell><TableCell numeric>1,234.56</TableCell></TableRow></TableBody>
 </Table></CardContent></Card>
 <Dialog><DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
 <DialogContent><DialogTitle>Collection notes</DialogTitle><DialogDescription>Prices are listed by source.</DialogDescription></DialogContent></Dialog>
 </PageContainer></AppShell></AppProvider>;
}
createRoot(document.getElementById("root")).render(<App />);
`;
let browser: Browser;
let css = "";
let js = "";
let standaloneJs = "";
beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: process.cwd() },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    js = out.outputFiles![0]!.text;
    const standalone = ENTRY.replace(
      /<AppShell[\s\S]*?(?=<PageContainer)/,
      '<><Topbar start={<><TopbarItem>Collection reference library</TopbarItem><TopbarSearch ariaLabel="Search collection" /></>} end={<><TopbarItem>Cards</TopbarItem><TopbarItem>Account</TopbarItem></>} />',
    ).replace("</AppShell>", "</>");
    standaloneJs = (
      await build({
        stdin: { contents: standalone, loader: "tsx", resolveDir: process.cwd() },
        bundle: true,
        write: false,
        format: "iife",
        jsx: "automatic",
        define: { "process.env.NODE_ENV": '"production"' },
        logLevel: "silent",
      })
    ).outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  css = await compileRealCss(
    `<div class="${[...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ").replaceAll('"', "")}"></div>`,
  );
  browser = await chromium.launch();
}, 120_000);
afterAll(async () => {
  await browser?.close();
});
async function open(width = 1280, dir = "ltr", standalone = false) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.setContent(
    `<!doctype html><html lang="en" dir="${dir}"><head><style>${css}</style></head><body><div id="root"></div><script>${standalone ? standaloneJs : js}</script></body></html>`,
  );
  await page.waitForSelector("caption");
  // AppProvider applies locale direction on mount; set the test direction afterwards.
  await page.evaluate((direction) => {
    document.documentElement.dir = direction;
  }, dir);
  return page;
}
async function appearance(page: Page) {
  return page.evaluate(() => {
    const style = (q: string) => getComputedStyle(document.querySelector(q)!);
    const rect = (q: string) => document.querySelector(q)!.getBoundingClientRect();
    return {
      background: style(".app-root").backgroundColor,
      foreground: style("body").color,
      card: style('[data-slot="card"]').backgroundColor,
      sidebar: style(".app-sidebar").display,
      topbar: style(".app-topbar").display,
      rail: style(".app-nav-rail").display,
      footer: style(".app-footer").display,
      mainWidth: rect(".app-main").width,
      rootWidth: rect(".app-root").width,
      overflow: style(".app-main").overflow,
      containment: style(".app-main").contain,
      cardBreak: style('[data-slot="card"]').breakInside,
    };
  });
}
describe("paper is a light flowing document (gh#1416)", () => {
  for (const dir of ["ltr", "rtl"])
    for (const width of [320, 390, 1280]) {
      it(`prints light, full width, without shell chrome at ${width} ${dir}`, async () => {
        const page = await open(width, dir);
        try {
          await page.emulateMedia({ media: "print" });
          const light = await appearance(page);
          await page.evaluate(() => {
            document.documentElement.dataset.theme = "dark";
          });
          const dark = await appearance(page);
          expect(dark).toEqual(light);
          expect(dark.sidebar).toBe("none");
          expect(dark.topbar).toBe("none");
          expect(dark.rail).toBe("none");
          expect(dark.footer).toBe("none");
          expect(dark.mainWidth).toBe(dark.rootWidth);
          expect(dark.overflow).toBe("visible");
          expect(dark.containment).toBe("none");
          expect(dark.cardBreak).toBe("avoid");
          await page.evaluate(() => {
            delete document.documentElement.dataset.theme;
            document.documentElement.classList.add("dark");
          });
          expect(await appearance(page)).toEqual(light);
          await page.emulateMedia({ media: "screen" });
          expect((await appearance(page)).background).not.toBe(light.background);
        } finally {
          await page.close();
        }
      });
    }
});
describe("consumer design knobs resolve in Chromium", () => {
  it("defaults inherit and opt-ins are scoped, with mono retaining priority", async () => {
    const page = await open();
    try {
      const families = () =>
        page.evaluate(() =>
          Object.fromEntries(
            ["editorial", "display", "figures", "mono"].map((id) => [
              id,
              getComputedStyle(document.getElementById(id)!).fontFamily,
            ]),
          ),
        );
      const initial = await families();
      expect(initial.editorial).toBe(initial.display);
      await page.addStyleTag({
        content:
          ":root{--font-family-editorial:serif;--font-family-tabular:monospace;--dialog-radius:16px}",
      });
      const custom = await families();
      expect(custom.editorial).toBe("serif");
      expect(custom.display).toBe(initial.display);
      expect(custom.figures).toBe("monospace");
      expect(custom.mono).toBe(initial.mono);
      await page.getByRole("button", { name: "Open dialog" }).click();
      expect(
        await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
      ).toBe("16px");
      await page.keyboard.press("Escape");
      expect(await page.getByRole("dialog").count()).toBe(0);
    } finally {
      await page.close();
    }
  });
});

describe("caption follows the record keyline", () => {
  for (const dir of ["ltr", "rtl"])
    it(`uses the stacked row inset in ${dir}`, async () => {
      const page = await open(390, dir);
      try {
        await page.addStyleTag({
          content: ":root{--table-stacked-collection-card-padding-x:24px}",
        });
        const geometry = await page.locator("caption").evaluate((el) => {
          const caption = el.getBoundingClientRect();
          const row = document.querySelector("tbody tr")!.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const rs = getComputedStyle(document.querySelector("tbody tr")!);
          return {
            display: cs.display,
            inset: cs.paddingInlineStart,
            rowInset: rs.paddingInlineStart,
            captionWidth: caption.width,
            rowWidth: row.width,
            align: cs.textAlign,
          };
        });
        expect(geometry.display).toBe("block");
        expect(geometry.inset).toBe("24px");
        expect(geometry.inset).toBe(geometry.rowInset);
        expect(geometry.captionWidth).toBe(geometry.rowWidth);
        expect(geometry.align).toBe("start");
      } finally {
        await page.close();
      }
    });
});

describe("Topbar brand, last search and end cluster", () => {
  for (const dir of ["ltr", "rtl"])
    for (const width of [320, 390, 1280]) {
      it(`preserves search and cluster boundaries at ${width} ${dir}`, async () => {
        const page = await open(width, dir, true);
        try {
          const geometry = await page.evaluate(() => {
            const search = document.querySelector(".ui-topbar-search")!.getBoundingClientRect();
            const end = document.querySelector(".ui-topbar-end")!.getBoundingClientRect();
            const trigger = document
              .querySelector(".ui-topbar-search button")!
              .getBoundingClientRect();
            return {
              width: search.width,
              triggerWidth: trigger.width,
              overlap: Math.max(
                0,
                Math.min(search.right, end.right) - Math.max(search.left, end.left),
              ),
              pageWidth: document.documentElement.scrollWidth,
              viewport: innerWidth,
            };
          });
          expect(geometry.width).toBeGreaterThanOrEqual(geometry.triggerWidth);
          expect(geometry.overlap).toBe(0);
          expect(geometry.pageWidth).toBe(geometry.viewport);
          if (width < 640) {
            await page.getByText("Account", { exact: true }).scrollIntoViewIfNeeded();
            const account = await page.getByText("Account", { exact: true }).boundingBox();
            // Chromium rounds scroll offsets to device pixels; allow one CSS pixel.
            expect(account!.x).toBeGreaterThanOrEqual(-1);
            expect(account!.x + account!.width).toBeLessThanOrEqual(width + 1);
            await page.getByRole("button", { name: "Search collection", exact: true }).click();
            await page.getByRole("searchbox").fill("collection");
            expect(await page.getByRole("searchbox").inputValue()).toBe("collection");
            await page.keyboard.press("Escape");
            await expect
              .poll(() =>
                page
                  .getByRole("button", { name: "Search collection", exact: true })
                  .evaluate((el) => el === document.activeElement),
              )
              .toBe(true);
          }
        } finally {
          await page.close();
        }
      });
    }
});

describe("dialog radius stays inert until configured", () => {
  for (const dir of ["ltr", "rtl"])
    for (const width of [320, 390, 1280])
      it(`honours the corner knob at ${width} ${dir}`, async () => {
        const page = await open(width, dir);
        try {
          await page.getByRole("button", { name: "Open dialog" }).click();
          await page.getByRole("dialog").evaluate(async (el) => {
            await Promise.all(el.getAnimations().map((a) => a.finished));
          });
          const bounds = await page.getByRole("dialog").boundingBox();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
          expect(bounds!.x + bounds!.width / 2).toBe(width / 2);
          if (width < 640)
            expect(
              await page
                .getByRole("dialog")
                .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
            ).toBe("0px");
          await page.addStyleTag({ content: ":root{--dialog-radius:16px}" });
          expect(
            await page
              .getByRole("dialog")
              .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
          ).toBe("16px");
        } finally {
          await page.close();
        }
      });
});

describe("built package print coverage", () => {
  it("excludes every shipped dark rule and paints uniform light paper with the godx preset", async () => {
    const page = await open(390);
    try {
      await page.locator("style").evaluateAll((nodes) => nodes.forEach((n) => n.remove()));
      await page.addStyleTag({ content: readFileSync("dist/styles.css", "utf8") });
      await page.addStyleTag({ content: readFileSync("dist/themes/godx-tokens.css", "utf8") });
      await page.emulateMedia({ media: "print" });
      const snapshot = () =>
        page.evaluate(() => {
          const cs = getComputedStyle(document.documentElement);
          return Object.fromEntries(
            ["--primary", "--background", "--card", "--chart-1"].map((k) => [
              k,
              cs.getPropertyValue(k).trim(),
            ]),
          );
        });
      const light = await snapshot();
      expect(light["--primary"]).not.toBe("");
      expect(light["--chart-1"]).not.toBe("");
      for (const alias of ["attribute", "class"]) {
        await page.evaluate((alias) => {
          document.documentElement.classList.toggle("dark", alias === "class");
          document.documentElement.dataset.theme = alias === "attribute" ? "dark" : "light";
        }, alias);
        expect(await snapshot()).toEqual(light);
      }
      const paper = await page.evaluate(() =>
        ["html", "body", ".app-root", ".app-main"].map(
          (q) => getComputedStyle(document.querySelector(q)!).backgroundColor,
        ),
      );
      expect(new Set(paper).size).toBe(1);
      await page.emulateMedia({ media: "screen" });
      expect((await snapshot())["--primary"]).not.toBe(light["--primary"]);
      await page.emulateMedia({ media: "print" });
      // Inspect every shipped CSS tree, including themes not imported by styles.css.
      for (const dir of ["styles", "tokens", "theme", "themes"]) {
        for (const file of readdirSync(`dist/${dir}`, { recursive: true })) {
          if (String(file).endsWith(".css"))
            await page.addStyleTag({ content: readFileSync(`dist/${dir}/${file}`, "utf8") });
        }
      }
      const activeDark = await page.evaluate(() => {
        const found: string[] = [];
        // Check the guard structurally, even in @supports branches Chromium cannot activate.
        function walk(rules: CSSRuleList, active = true) {
          for (const rule of Array.from(rules)) {
            const r = rule as CSSStyleRule & CSSMediaRule;
            const enabled =
              active && !(r.type === CSSRule.MEDIA_RULE && r.conditionText === "not print");
            if (
              enabled &&
              r.selectorText &&
              /\.dark(?![\w\\-])|\[data-theme=["']?dark/.test(r.selectorText)
            )
              found.push(r.selectorText);
            if (r.cssRules) walk(r.cssRules, enabled);
          }
        }
        for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
        return found;
      });
      expect(activeDark).toEqual([]);
    } finally {
      await page.close();
    }
  });
});
