import { readFileSync } from "node:fs";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { contrast } from "../../../tokens/__tests__/wcag-contrast";

let browser: Browser;
let css: string;
const markup = `<div data-ui-reading-links><a id="scope-outside-main" href="#">Outside main</a><header><a id="header" href="#">Header</a></header>
<main><a id="plain" href="#">Reading</a>
<h2 class="ui-catalog-card-title"><a id="catalog" href="#">Catalog</a></h2>
<a id="card" href="#"><h2 data-slot="heading" data-tone="default">Heading</h2><p data-slot="text" data-tone="muted">Summary</p></a>
<a id="button" data-slot="button" class="ui-button" href="#">Button</a>
<a id="row" class="ui-list-row" href="#">Row</a><a id="tab" role="tab" href="#">Tab</a>
<div role="menu"><a id="menu" role="menuitem" href="#">Menu</a></div>
<div data-ui-link-style="control"><a id="control" href="#">Control</a></div>
<a id="self-control" data-ui-link-style="control" href="#">Control</a>
<div class="app-root"><a id="task" href="#">Task shell</a></div><div class="ui-auth-shell"><a id="auth" href="#">Auth shell</a></div>
</main><footer><a id="footer" href="#">Footer</a></footer></div><a id="outside" href="#">Outside</a>`;
beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

it("ships the reading layer through the CenteredShell pruning dependency", () => {
  const manifest = JSON.parse(readFileSync("src/styles/layers.json", "utf8"));
  expect(manifest.components.CenteredShell.layers).toContain("text-layout.css");
});

it("colours ordinary and catalog links, inherits heading ink, preserves summaries and control roles", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${css}</style>${markup}`);
    const snapshot = () =>
      page.evaluate(() =>
        Object.fromEntries(
          [...document.querySelectorAll("a, #card h2, #card p")].map((el) => {
            const s = getComputedStyle(el);
            return [el.id || el.tagName, [s.color, s.textDecorationLine]];
          }),
        ),
      );
    const before = await snapshot();
    await page
      .locator("[data-ui-reading-links]")
      .evaluate((el) => el.removeAttribute("data-ui-reading-links"));
    const off = await snapshot();
    for (const id of [
      "scope-outside-main",
      "task",
      "auth",
      "header",
      "footer",
      "outside",
      "button",
      "row",
      "tab",
      "menu",
      "control",
      "self-control",
    ])
      expect(before[id], id).toEqual(off[id]);
    for (const id of ["plain", "catalog", "card"]) {
      expect(before[id]?.[1], id).toBe("underline");
      expect(before[id]?.[0], id).not.toBe(off[id]?.[0]);
    }
    expect(before.H2?.[0]).toBe(before.card?.[0]);
    expect(before.P?.[0]).toBe(off.P?.[0]);
  } finally {
    await page.close();
  }
});

it("resolves scoped ink and hover knobs, shows keyboard focus and supports RTL", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${css}</style>${markup}`);
    await page.locator("main").evaluate((el) => {
      el.setAttribute("dir", "rtl");
      el.setAttribute(
        "style",
        "--text-link: 210 90% 25%; --text-link-hover: 330 80% 25%; --text-link-underline-offset: .3em; --text-link-underline-width: .12em",
      );
    });
    const link = page.locator("#plain");
    const ink = await link.evaluate((el) => getComputedStyle(el).color);
    await link.hover();
    expect(await link.evaluate((el) => getComputedStyle(el).color)).not.toBe(ink);
    await page.mouse.move(0, 0);
    await page.locator("#header").focus();
    await page.keyboard.press("Tab");
    expect(await link.evaluate((el) => el === document.activeElement)).toBe(true);
    const style = await link.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        width: parseFloat(s.outlineWidth),
        style: s.outlineStyle,
        dir: s.direction,
        offset: s.textUnderlineOffset,
      };
    });
    expect(style.width).toBeGreaterThan(0);
    expect(style.style).toBe("solid");
    expect(style.dir).toBe("rtl");
    expect(parseFloat(style.offset)).toBeGreaterThan(0);
  } finally {
    await page.close();
  }
});

it.each(["light", "dark"])(
  "default resting and hover ink clear WCAG AA on page and card in %s",
  async (theme) => {
    const page = await browser.newPage();
    try {
      await page.setContent(
        `<style>${css}</style><div class="${theme === "dark" ? "dark" : ""}"><div data-ui-reading-links><main style="background: hsl(var(--background))"><a id="plain" href="#">Reading</a><div style="background:hsl(var(--card))"><a id="card" href="#">Card</a></div></main></div></div>`,
      );
      for (const id of ["plain", "card"]) {
        const el = page.locator(`#${id}`);
        for (const hover of [false, true]) {
          if (hover) await el.hover();
          const values = await el.evaluate((el) => [
            getComputedStyle(el).color,
            getComputedStyle(el.parentElement!).backgroundColor,
          ]);
          const rgb = (s: string) =>
            s
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map((v) => Number(v) * (s.startsWith("color(srgb") ? 255 : 1)) as [
              number,
              number,
              number,
            ];
          expect(
            contrast(rgb(values[0]!), rgb(values[1]!)),
            JSON.stringify(values),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    } finally {
      await page.close();
    }
  },
);
