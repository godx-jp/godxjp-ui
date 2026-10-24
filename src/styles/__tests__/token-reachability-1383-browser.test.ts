import { afterAll, beforeAll, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";
let browser: Browser;
let css: string;
beforeAll(async () => {
  css = await compileRealCss("");
  browser = await chromium.launch();
}, 60000);
afterAll(async () => {
  await browser?.close();
});
for (const size of ["sm", "md", "lg", "xl"])
  it(`${size}: collapsed table honors scoped row and font knobs`, async () => {
    const page = await browser.newPage({ viewport: { width: 320, height: 844 } });
    try {
      await page.setContent(
        `<style>${css}</style><div class="ui-table-scroll" data-preset="action-collection" data-collapse-below="${size}" style="container-type:inline-size;container-name:ui-table-collection;--table-row-border-width:3px;--table-font-size:19px"><table data-slot="table"><tbody><tr class="ui-table-row"><td>One</td></tr><tr class="ui-table-row"><td>Two</td></tr></tbody></table></div>`,
      );
      const values = await page
        .locator(".ui-table-row")
        .first()
        .evaluate((el) => ({
          border: getComputedStyle(el).borderBlockEndWidth,
          font: getComputedStyle(el.closest("table")!).fontSize,
        }));
      expect(values).toEqual({ border: "3px", font: "19px" });
    } finally {
      await page.close();
    }
  });
it("Persona default fonts resolve without the optional foundation aliases", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><div class="ui-persona" style="--font-size-sm:initial;--font-size-xs:initial;--font-size-base:16px;--font-size-ratio:1.25"><span data-slot="persona-name">Name</span><span data-slot="persona-description">Description</span></div>`,
    );
    const sizes = await page
      .locator('[data-slot^="persona-"]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize));
    expect(sizes).toEqual(["16px", "12.8px"]);
    await page.locator(".ui-persona").evaluate((el) => {
      (el as HTMLElement).style.setProperty("--persona-name-font-size", "21px");
      (el as HTMLElement).style.setProperty("--persona-description-font-size", "17px");
    });
    expect(
      await page
        .locator('[data-slot^="persona-"]')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize)),
    ).toEqual(["21px", "17px"]);
    await page.locator(".ui-persona").evaluate((el) => el.setAttribute("data-size", "sm"));
    expect(
      await page
        .locator('[data-slot="persona-name"]')
        .evaluate((el) => getComputedStyle(el).fontSize),
    ).toBe("12.8px");
    await page
      .locator(".ui-persona")
      .evaluate((el) =>
        (el as HTMLElement).style.setProperty("--persona-name-font-size-sm", "23px"),
      );
    expect(
      await page
        .locator('[data-slot="persona-name"]')
        .evaluate((el) => getComputedStyle(el).fontSize),
    ).toBe("23px");
  } finally {
    await page.close();
  }
});

for (const size of ["sm", "md", "lg", "xl"])
  it(`${size}: stacked records honor row separators`, async () => {
    const page = await browser.newPage({ viewport: { width: 320, height: 844 } });
    try {
      await page.setContent(
        `<style>${css}</style><div style="container-type:inline-size;container-name:ui-table-stacked-collection;--table-row-border-width:3px"><div data-collapse-below="${size}"><table data-slot="table"><tbody><tr class="ui-table-row"><td>One</td></tr><tr class="ui-table-row"><td>Two</td></tr></tbody></table></div></div>`,
      );
      expect(
        await page
          .locator(".ui-table-row")
          .first()
          .evaluate((el) => getComputedStyle(el).borderBlockEndWidth),
      ).toBe("3px");
      expect(
        await page
          .locator(".ui-table-row")
          .last()
          .evaluate((el) => getComputedStyle(el).borderBlockEndWidth),
      ).toBe("0px");
    } finally {
      await page.close();
    }
  });
