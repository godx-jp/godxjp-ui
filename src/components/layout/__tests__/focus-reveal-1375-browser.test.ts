import { afterAll, beforeAll, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(`
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './src/app/app-provider';
import { AppShell } from './src/components/layout/app-shell';
import { Topbar } from './src/components/layout/topbar';
import { Card, CardContent } from './src/components/data-display/card';
import { DataTable } from './src/components/data-display/data-table';
import { Button } from './src/components/general/button';
const kind = new URLSearchParams(location.search).get('kind');
const action = <Button data-testid="target">Last action</Button>;
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
{kind === 'shell' ? <AppShell><Card style={{width:"calc(100% + 20px)"}}><CardContent flush><div style={{display:'flex',justifyContent:'flex-end'}}>{action}</div></CardContent></Card></AppShell> :
kind === 'topbar' ? <Topbar className="w-64" start={<Button>Start</Button>} center={action} end={<Button>End</Button>}/> :
<DataTable data={[{id:'one',label:'Row'}]} scroll={{x:1400}} columns={[{key:'label',header:'Name'},{key:'actions',header:'Actions',width:'w-32',render:()=>action}]}/>}
</AppProvider>);
`);
});
afterAll(async () => fixture?.close());
for (const width of [1280, 390])
  for (const dir of ["ltr", "rtl"])
    for (const kind of ["shell", "table", "topbar"]) {
      // The optional center is intentionally absent at the compact breakpoint.
      if (kind === "topbar" && width === 390) continue;
      it(`reveals the complete ${kind} keyboard target at ${width} ${dir}`, async () => {
        const page = await fixture.open(`?kind=${kind}`, { width, height: 900 });
        try {
          await page.evaluate((dir) => (document.documentElement.dir = dir), dir);
          let reached = false;
          for (let n = 0; n < 30; n++) {
            await page.keyboard.press("Tab");
            reached = await page.evaluate(
              () => document.activeElement?.getAttribute("data-testid") === "target",
            );
            if (reached) break;
          }
          expect(reached).toBe(true);
          await page.waitForTimeout(200);
          const geometry = await page.locator('[data-testid="target"]').evaluate((el) => {
            const port = el.closest(".app-main,.ui-data-table-scroll,.ui-topbar")!;
            const a = el.getBoundingClientRect(),
              b = port.getBoundingClientRect();
            return {
              left: a.left,
              right: a.right,
              start: b.left + port.clientLeft,
              end: b.left + port.clientLeft + port.clientWidth,
            };
          });
          expect(geometry.left).toBeGreaterThanOrEqual(geometry.start - 1);
          expect(geometry.right).toBeLessThanOrEqual(geometry.end + 1);
          await page.screenshot({ path: `codex-shots/reveal-${kind}-${width}-${dir}.png` });
        } finally {
          await page.close();
        }
      });
    }
