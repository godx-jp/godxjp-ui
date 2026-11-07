import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { contrast } from "../../../tokens/__tests__/wcag-contrast";

/**
 * gh#1538 — inside the AppShell's <main>, a content link is visibly a link at rest (link ink +
 * medium weight), underlines on hover/focus, and controls keep their own look. Opt-out, not opt-in.
 */
let browser: Browser;
let css: string;
const markup = `<div class="app-root"><header><a id="header" href="#">Header</a></header>
<nav><a id="nav" href="#">Nav</a></nav>
<main><p id="body">Body text</p>
<table><tbody><tr><td><a id="cell" href="#">Yamada Taro</a></td></tr></tbody></table>
<div data-slot="card"><a id="in-card" href="#">Reference</a></div>
<a id="whole-card" data-slot="card" href="#">Whole card</a>
<a id="button" data-slot="button" class="ui-button" href="#">Button</a>
<a id="row" class="ui-list-row" href="#">Row</a><a id="tab" role="tab" href="#">Tab</a>
<div role="menu"><a id="menu" role="menuitem" href="#">Menu</a></div>
<div data-ui-link-style="control"><a id="control" href="#">Control</a></div>
<a id="self-control" data-ui-link-style="control" href="#">Control</a>
<a id="kit-link" data-slot="text" data-link data-tone="destructive" href="#">Delete</a>
<a id="disabled" aria-disabled="true" href="#">Disabled</a>
<a id="tile" href="#"><div>Waiting for me</div><div>12</div></a>
<a id="tile-heading" href="#"><h3>Approvals</h3><p>3 waiting</p></a>
<p>Read the <a id="inline" href="#">policy <span>now</span></a>.</p>
</main><footer><a id="footer" href="#">Footer</a></footer></div><a id="outside" href="#">Outside</a>`;

beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

const snapshot = () =>
  Object.fromEntries(
    [...document.querySelectorAll("a, #body")].map((el) => {
      const s = getComputedStyle(el);
      return [el.id, [s.color, s.textDecorationLine, s.fontWeight]];
    }),
  );

it("paints content links with link ink and weight at rest, leaves controls alone", async () => {
  const page = await browser.newPage();
  try {
    // A brand seed, so link ink and body ink are different hues (the neutral seed's link is ink).
    await page.setContent(
      `<style>${css}</style><div style="--primary: 268 70% 45%">${markup}</div>`,
    );
    const on = await page.evaluate(snapshot);
    await page.locator(".app-root").evaluate((el) => el.classList.remove("app-root"));
    const off = await page.evaluate(snapshot);

    for (const id of [
      "header",
      "nav",
      "footer",
      "outside",
      "whole-card",
      "button",
      "row",
      "tab",
      "menu",
      "control",
      "self-control",
      "kit-link",
      "disabled",
      "tile",
      "tile-heading",
    ])
      expect(on[id], id).toEqual(off[id]);

    for (const id of ["cell", "in-card", "inline"]) {
      expect(on[id]?.[0], id).not.toBe(on.body?.[0]);
      expect(on[id]?.[0], id).not.toBe(off[id]?.[0]);
      expect(Number(on[id]?.[2]), id).toBeGreaterThan(Number(on.body?.[2]));
      expect(on[id]?.[1], id).toBe("none");
    }
  } finally {
    await page.close();
  }
});

it("underlines on hover and keyboard focus", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${css}</style>${markup}`);
    const cell = page.locator("#cell");
    await cell.hover();
    expect(await cell.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe("underline");
    await page.mouse.move(0, 0);
    await page.locator("#body").evaluate((el) => el.setAttribute("tabindex", "-1"));
    await page.locator("#body").focus();
    await page.keyboard.press("Tab");
    expect(await cell.evaluate((el) => el === document.activeElement)).toBe(true);
    expect(await cell.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe("underline");
  } finally {
    await page.close();
  }
});

// `getComputedStyle` reports a visited link as unvisited (history privacy), so the visited ink is
// pinned on the stylesheet and the token, not on a rendered visited link.
it("ships a :visited rule for app, reading and kit links, and a light + dark visited token", async () => {
  for (const sel of [
    /\.app-root main a\[href\]:not\([^{]*\):visited\s*\{\s*color:\s*hsl\(var\(--text-link-visited\)\)/,
    /\[data-ui-reading-links\] main a\[href\]:not\([^{]*\):visited\s*\{\s*color:\s*hsl\(var\(--text-link-visited\)\)/,
    /\[data-slot="text"\]\[data-link\]\[data-tone="primary"\]:not\(\[data-disabled\]\):visited\s*\{\s*color:\s*hsl\(var\(--text-link-visited\)\)/,
  ])
    expect(css.replace(/\s+/g, " ")).toMatch(sel);

  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><p id="l" style="color:hsl(var(--text-link-visited))">x</p><div class="dark"><p id="d" style="color:hsl(var(--text-link-visited))">x</p></div>`,
    );
    const color = (id: string) => page.locator(id).evaluate((el) => getComputedStyle(el).color);
    expect(await color("#l")).toBe("rgb(115, 80, 155)");
    expect(await color("#d")).toBe("rgb(187, 159, 219)");
  } finally {
    await page.close();
  }
});

// gh#1538 follow-up: an inverse band is a dark scope; there the link and visited inks are light.
it("a dark-scoped band gets link and visited inks that clear 4.5:1 on its background", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><div class="dark" style="background:hsl(var(--background))"><p id="bg" style="background:hsl(var(--background))">x</p><p id="link" style="color:hsl(var(--text-link, from hsl(var(--primary)) var(--text-link-channels)))">x</p><p id="visited" style="color:hsl(var(--text-link-visited))">x</p></div>`,
    );
    const rgb = (s: string) =>
      s
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map((v) => Number(v) * (s.startsWith("color(srgb") ? 255 : 1)) as [number, number, number];
    const bg = rgb(
      await page.locator("#bg").evaluate((el) => getComputedStyle(el).backgroundColor),
    );
    for (const id of ["link", "visited"]) {
      const ink = rgb(await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).color));
      expect(contrast(ink, bg), id).toBeGreaterThanOrEqual(4.5);
    }
  } finally {
    await page.close();
  }
});
