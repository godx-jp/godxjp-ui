import { mkdirSync, writeFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './src/app/app-provider';
import { AppShell } from './src/components/layout/app-shell';
import { PageContainer } from './src/components/layout/page-container';
import { Card, CardContent } from './src/components/data-display/card';
import { DataTable } from './src/components/data-display/data-table';
import { LegalDocumentShell } from './src/lab/legal-document-shell';
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<AppShell logo="Workspace"><PageContainer title="Documents">
<Card><CardContent flush><DataTable data={[{id:'one',name:'Terms'},{id:'two',name:'Privacy'}]} columns={[{key:'name',header:'Name',sortable:true}]} /></CardContent></Card>
<LegalDocumentShell title="Terms" sections={[{id:'intro',title:'Introduction',content:<p>Service terms.</p>},{id:'privacy',title:'Privacy',content:<p>Privacy terms.</p>}]}/>
</PageContainer></AppShell></AppProvider>);
`;
let golden: ChromiumFixture, current: ChromiumFixture;
const evidence: unknown[] = [];
beforeAll(async () => {
  golden = await bootChromium(entry, "v33.11.2");
  current = await bootChromium(entry, process.env.GEOMETRY_CSS_REVISION);
}, 180000);
afterAll(async () => {
  mkdirSync("codex-shots", { recursive: true });
  writeFileSync(
    `codex-shots/geometry-1380-${process.env.GEOMETRY_CSS_REVISION || "after"}.json`,
    JSON.stringify(evidence, null, 2),
  );
  await current?.close();
  await golden?.close();
});
for (const width of [1280, 390])
  it(`matches v33.11.2 content geometry at ${width}`, async () => {
    const measurements = [];
    for (const fixture of [golden, current]) {
      const page = await fixture.open("", { width, height: 900 });
      try {
        await page.locator(".ui-legal-document-toc-link").last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `codex-shots/geometry-1380-${fixture === golden ? "golden" : process.env.GEOMETRY_CSS_REVISION || "after"}-${width}.png`,
        });
        measurements.push(
          await page.evaluate(() => {
            const selectors = [
              ".ui-page-header",
              ".ui-page-title",
              '[data-slot="card"]',
              "thead tr",
              ".ui-legal-document-toc-link",
            ];
            return Object.fromEntries(
              selectors.map((selector) => [
                selector,
                [...document.querySelectorAll(selector)].map((el) => {
                  const { x, y, width, height } = el.getBoundingClientRect();
                  return { x, y, width, height };
                }),
              ]),
            );
          }),
        );
      } finally {
        await page.close();
      }
    }
    evidence.push({ width, golden: measurements[0], actual: measurements[1] });
    for (const boxes of Object.values(measurements[0]!)) expect(boxes.length).toBeGreaterThan(0);
    expect(measurements[1]).toEqual(measurements[0]);
  });
