import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { Button } from "../../components/general/button";
import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";
let browser: Browser;
let css: string;
const markup = renderToStaticMarkup(
  createElement(Button, { size: "icon-xs" }, createElement("svg")),
);
const normalMarkup = renderToStaticMarkup(createElement(Button, {}, createElement("svg")));
beforeAll(async () => {
  css = await compileRealCss((markup + normalMarkup).replaceAll("&amp;", "&"));
  browser = await chromium.launch();
}, 60000);
afterAll(async () => {
  await browser?.close();
});
it("xs button glyph respects a scoped button icon override above its size utility", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><div style="--button-icon-size:29px">${markup}</div>`,
    );
    expect(
      await page
        .locator("svg")
        .evaluate((el) => [getComputedStyle(el).width, getComputedStyle(el).height]),
    ).toEqual(["29px", "29px"]);
  } finally {
    await page.close();
  }
});
it("all six editorial shadows resolve their color inside the scoped theme", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><div style="--shadow-color:255 0 0"><div class="ui-editorial-search"></div></div>`,
    );
    // Probe the actual declaration formulas in the shipped source CSS, including hover rules.
    const shadows = await page.evaluate(
      (declarations) => {
        const tokens = [
          "editorial-catalog-card-hover-shadow",
          "editorial-journal-hover-shadow",
          "editorial-search-popup-shadow",
          "editorial-search-shadow",
          "editorial-showcase-caption-shadow",
          "editorial-spotlight-hover-shadow",
        ];
        return tokens.map((token) => {
          const declaration = declarations.find((value) => value.includes(`--${token}`));
          if (!declaration) throw new Error(`Missing reader: ${token}`);
          const probe = document.createElement("div");
          probe.style.boxShadow = declaration;
          document.querySelector('[style*="--shadow-color"]')!.append(probe);
          return getComputedStyle(probe).boxShadow;
        });
      },
      [...readFileSync("src/styles/editorial-layout.css", "utf8").matchAll(/box-shadow:\s*([^;]+);/g)].map(
        (match) => match[1]!,
      ),
    );
    expect(shadows).toHaveLength(6);
    for (const shadow of shadows) expect(shadow).toContain("255, 0, 0");
  } finally {
    await page.close();
  }
});

it("optional module aliases preserve each button size and accept scoped overrides", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><section class="ui-catalog-detail-section" data-variant="module">${markup}${normalMarkup}</section>`,
    );
    const widths = () =>
      page.locator("svg").evaluateAll((els) => els.map((el) => getComputedStyle(el).width));
    expect(await widths()).toEqual(["12px", "16px"]);
    await page.locator("section").evaluate((el) => {
      (el as HTMLElement).style.setProperty(
        "--editorial-catalog-detail-module-button-icon-size",
        "29px",
      );
      (el as HTMLElement).style.setProperty("--editorial-catalog-detail-module-button-gap", "13px");
    });
    expect(await widths()).toEqual(["29px", "29px"]);
    expect(
      await page.locator("button").evaluateAll((els) => els.map((el) => getComputedStyle(el).gap)),
    ).toEqual(["13px", "13px"]);
  } finally {
    await page.close();
  }
});
