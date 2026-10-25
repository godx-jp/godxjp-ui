import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Breadcrumb } from "../breadcrumb";
import { PageContainer } from "../page-container";
import { EditorialPageHeader, EditorialArticle } from "../editorial";

const label = "DOCUMENT".repeat(24);
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <PageContainer title={label} subtitle={label}>
      <p>Content</p>
    </PageContainer>
    <Breadcrumb items={[{ label: "Home", to: "/" }, { label }]} />
    <EditorialPageHeader title={label} />
    <EditorialArticle title={label}>
      <p>Content</p>
    </EditorialArticle>
  </AppProvider>,
);
let browser: Awaited<ReturnType<typeof chromium.launch>>;
let css: string;
beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
}, 60000);
afterAll(async () => {
  await browser?.close();
});
describe("long identity content remains readable at phone widths", () => {
  for (const width of [320, 390])
    for (const lang of ["en", "ja"]) {
      it(`${width}px ${lang}: title, subtitle and breadcrumb stay within their boxes`, async () => {
        const page = await browser.newPage({ viewport: { width, height: 844 } });
        try {
          await page.setContent(
            `<!doctype html><html lang="${lang}"><head><style>${css}body{margin:0}</style></head><body>${markup}</body></html>`,
          );
          const result = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            labels: [
              ...document.querySelectorAll(
                ".ui-page-title,.ui-page-subtitle,.ui-breadcrumb-current,.ui-editorial-page-header-title,.ui-editorial-article-title",
              ),
            ].map((e) => ({ text: e.textContent, width: e.clientWidth, scroll: e.scrollWidth })),
          }));
          expect(result.overflow).toBe(false);
          expect(result.labels).toHaveLength(5);
          for (const item of result.labels) {
            expect(item.text).toBe(label);
            expect(item.scroll).toBeLessThanOrEqual(item.width + 1);
          }
        } finally {
          await page.close();
        }
      });
    }
});
