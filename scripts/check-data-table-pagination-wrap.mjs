import { chromium } from "playwright";
import { createServer } from "vite";

const port = Number(process.env.PREVIEW_PORT ?? 6113);
const server = process.env.PREVIEW_URL
  ? null
  : await createServer({
      configFile: "preview/vite.config.ts",
      server: { port, strictPort: true },
    });
if (server) await server.listen();
const base = process.env.PREVIEW_URL ?? `http://localhost:${port}`;
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const browser = await chromium.launch({ headless: true });
const results = [];

async function geometry(page) {
  return page.locator(".ui-data-table-pagination--numbered").evaluateAll((footers) =>
    footers.map((footer) => {
      const pageSize = footer.querySelector(".ui-data-table-page-size");
      const nav = footer.querySelector(".ui-data-table-page-nav");
      const label = footer.querySelector(".ui-data-table-page-size-label");
      const trigger = footer.querySelector(".ui-data-table-page-size-trigger");
      if (
        !(pageSize instanceof HTMLElement) ||
        !(nav instanceof HTMLElement) ||
        !(label instanceof HTMLElement) ||
        !(trigger instanceof HTMLElement)
      )
        throw new Error("missing footer parts");
      const footerRect = footer.getBoundingClientRect();
      const pageSizeRect = pageSize.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const centered = (rect) => rect.top + rect.height / 2;
      return {
        label: label.textContent,
        narrowFrame: footer.closest(".max-w-sm") != null,
        fullLabelVisible: label.scrollWidth <= label.clientWidth + 1,
        labelNoWrap: getComputedStyle(label).whiteSpace === "nowrap",
        pageSizeOneLine: Math.abs(centered(labelRect) - centered(triggerRect)) <= 1,
        pageSizeFits: pageSize.scrollWidth <= pageSize.clientWidth + 1,
        navFits: nav.scrollWidth <= nav.clientWidth + 1,
        pageSizeContained:
          pageSizeRect.left >= footerRect.left - 1 && pageSizeRect.right <= footerRect.right + 1,
        navContained: navRect.left >= footerRect.left - 1 && navRect.right <= footerRect.right + 1,
        clustersOneRow: Math.abs(centered(pageSizeRect) - centered(navRect)) <= 1,
      };
    }),
  );
}

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`${base}/isolate/data-display-data-table-index`);
  await page.locator(".ui-data-table-page-size").first().waitFor();
  await page.waitForTimeout(250);
  const labels = await page.locator(".ui-data-table-page-size-label").allTextContents();
  if (
    !labels.some((label) => label.includes("Số dòng/trang")) ||
    !labels.some((label) => label.includes("表示件数")) ||
    !labels.some((label) => label.includes("Rows per page"))
  ) {
    throw new Error(`width ${width}: VI/JA/EN footer frames are not all rendered`);
  }

  const groups = await geometry(page);
  const documentOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (
    documentOverflow ||
    groups.some(
      ({
        fullLabelVisible,
        labelNoWrap,
        pageSizeOneLine,
        pageSizeFits,
        navFits,
        pageSizeContained,
        navContained,
      }) =>
        !fullLabelVisible ||
        !labelNoWrap ||
        !pageSizeOneLine ||
        !pageSizeFits ||
        !navFits ||
        !pageSizeContained ||
        !navContained,
    )
  ) {
    throw new Error(`width ${width}: ${JSON.stringify({ documentOverflow, groups })}`);
  }
  if (width >= 768 && groups.some(({ clustersOneRow }) => !clustersOneRow)) {
    throw new Error(`width ${width}: desktop footer must remain one row ${JSON.stringify(groups)}`);
  }
  if (
    width === 320 &&
    groups
      .filter(({ narrowFrame, label }) => narrowFrame && label === "Rows per page")
      .some(({ clustersOneRow }) => clustersOneRow)
  ) {
    throw new Error(`width ${width}: longest supported narrow label must reflow between clusters`);
  }
  results.push({ width, documentOverflow, groups, verdict: "pass" });
  await page.close();
}

for (const width of [390, 1024]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`${base}/isolate/data-display-data-table-index`);
  await page.locator(".ui-data-table-page-size").first().waitFor();
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const groups = await geometry(page);
  if (groups.some(({ pageSizeContained, navContained }) => !pageSizeContained || !navContained)) {
    throw new Error(`RTL width ${width}: cluster escaped footer ${JSON.stringify(groups)}`);
  }
  results.push({ width, dir: "rtl", groups, verdict: "pass" });
  await page.close();
}

await browser.close();
if (server) await server.close();
console.log(JSON.stringify(results, null, 2));
