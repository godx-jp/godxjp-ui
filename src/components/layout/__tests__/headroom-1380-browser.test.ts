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
// Font-independent content geometry of v33.11.2 (gh#1380), measured once from that release's
// stylesheet. Only x positions, widths and the card→header offset are pinned: they come from
// gutters and borders alone, so they hold on every OS font stack (heights/y would not). A
// headroom regression (padding on app-main, the table scroller or the rail) moves exactly these.
const GOLDEN = {
  1280: { title: 32, card: [32, 1216], thead: [33, 1214], toc: [32, 240] },
  390: { title: 16, card: [16, 358], thead: [17, 640], toc: [16] },
} as const;
let current: ChromiumFixture;
beforeAll(async () => {
  current = await bootChromium(entry);
}, 180000);
afterAll(async () => {
  await current?.close();
});
for (const width of [1280, 390] as const)
  it(`keeps v33.11.2 content geometry at ${width}`, async () => {
    const page = await current.open("", { width, height: 900 });
    try {
      await page.locator(".ui-legal-document-toc-link").last().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(() => {
        const box = (el: Element) => el.getBoundingClientRect();
        const title = box(document.querySelector(".ui-page-title")!);
        const card = box(document.querySelector('[data-slot="card"]')!);
        const thead = box(document.querySelector("thead tr")!);
        const toc = [...document.querySelectorAll(".ui-legal-document-toc-link")].map(box);
        return {
          title: title.x,
          card: [card.x, card.width],
          thead: [thead.x, thead.width],
          theadOffset: thead.y - card.y,
          toc: toc.map((r) => [r.x, r.width]),
        };
      });
      const g = GOLDEN[width];
      expect(m.title).toBeCloseTo(g.title, 1);
      expect(m.card[0]).toBeCloseTo(g.card[0], 1);
      expect(m.card[1]).toBeCloseTo(g.card[1], 1);
      expect(m.thead[0]).toBeCloseTo(g.thead[0], 1);
      expect(m.thead[1]).toBeCloseTo(g.thead[1], 1);
      // The table header row sits directly under the card's 1px border: no block headroom.
      expect(m.theadOffset).toBeCloseTo(1, 1);
      expect(m.toc.length).toBe(2);
      for (const [x, w] of m.toc) {
        expect(x).toBeCloseTo(g.toc[0], 1);
        if (g.toc.length > 1) expect(w).toBeCloseTo(g.toc[1]!, 1);
      }
    } finally {
      await page.close();
    }
  });
