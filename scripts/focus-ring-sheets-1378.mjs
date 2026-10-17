/** Render paired focus crops recorded by focus-ring-1375-browser.test.ts. No server. */
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
const cases = [
  ["breadcrumb", "Breadcrumb link"],
  ["table-link", "Table link"],
  ["wordmark", "Logo asChild wordmark"],
  ["primary", "Primary filled button"],
  ["outline", "Outline button"],
  ["anchor", "Anchor / TOC link"],
  ["tabs", "Tab"],
  ["pagination", "Pagination item"],
  ["locale", "Topbar picker cell"],
];
const browser = await chromium.launch();
try {
  for (const width of [1280, 390])
    for (const theme of ["light", "dark"]) {
      const rows = [];
      for (const [name, label] of cases) {
        const cells = [];
        for (const phase of ["before", "after"]) {
          const bytes = await readFile(
            `codex-shots/crop-${phase}-1378-${name}-${width}-ltr-${theme}.png`,
          );
          cells.push(
            `<div class="crop"><img alt="${phase}: ${label}" src="data:image/png;base64,${bytes.toString("base64")}"></div>`,
          );
        }
        rows.push(`<section><h2>${label}</h2><div class="pair">${cells.join("")}</div></section>`);
      }
      const html = `<!doctype html><html><meta charset="utf-8"><style>
      *{box-sizing:border-box} body{margin:0;padding:24px;font:15px system-ui;background:#eee;color:#222}
      h1{font-size:22px;margin:0 0 8px} p{margin:0 0 20px} h2{font-size:14px;margin:12px 0 6px}
      .pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.crop{min-height:66px;display:flex;align-items:center;padding:8px;background:${theme === "dark" ? "#1b1a17" : "#fdfdfc"};overflow:hidden}
      img{max-width:none;height:auto} header{font-weight:600}
      </style><h1>Focus regression #1378 · ${width}px · LTR · ${theme}</h1>
      <p>Real keyboard focus, real library CSS. Crops stay at 1:1 scale; long rows show their leading edge.</p>
      <header class="pair"><div>Before — 33.12.1</div><div>After — working tree</div></header>${rows.join("")}</html>`;
      const base = `codex-shots/focus-sheet-1378-${width}-ltr-${theme}`;
      await writeFile(`${base}.html`, html);
      const page = await browser.newPage({
        viewport: { width: 960, height: 1200 },
        deviceScaleFactor: 1,
      });
      await page.setContent(html);
      await page.screenshot({ path: `${base}.png`, fullPage: true });
      await page.close();
    }
} finally {
  await browser.close();
}
