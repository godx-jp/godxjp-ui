import { chromium } from "playwright";

const base = process.env.PREVIEW_URL ?? "http://localhost:6008";
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const browser = await chromium.launch({ headless: true });
const results = [];

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

  const groups = await page.locator(".ui-data-table-page-size").evaluateAll((nodes) =>
    nodes.map((group) => {
      const label = group.querySelector(".ui-data-table-page-size-label");
      const trigger = group.querySelector(".ui-data-table-page-size-trigger");
      if (!(label instanceof HTMLElement) || !(trigger instanceof HTMLElement))
        throw new Error("missing footer parts");
      const groupRect = group.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      return {
        label: label.textContent,
        groupWidth: groupRect.width,
        groupScrollWidth: group.scrollWidth,
        labelWidth: labelRect.width,
        triggerWidth: triggerRect.width,
        fullLabelVisible: label.scrollWidth <= label.clientWidth + 1,
        noWrap: getComputedStyle(label).whiteSpace === "nowrap",
        sameLine:
          Math.abs(
            labelRect.top + labelRect.height / 2 - (triggerRect.top + triggerRect.height / 2),
          ) <= 1,
        groupFits: group.scrollWidth <= group.clientWidth + 1,
        triggerFits: triggerRect.right <= groupRect.right + 1,
      };
    }),
  );
  const documentOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (
    documentOverflow ||
    groups.some(
      ({ fullLabelVisible, noWrap, sameLine, groupFits, triggerFits }) =>
        !fullLabelVisible || !noWrap || !sameLine || !groupFits || !triggerFits,
    )
  ) {
    throw new Error(`width ${width}: ${JSON.stringify({ documentOverflow, groups })}`);
  }
  results.push({ width, documentOverflow, groups, verdict: "pass" });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
