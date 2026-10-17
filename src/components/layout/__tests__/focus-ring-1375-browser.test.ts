import { afterAll, beforeAll, expect, it } from "vitest";
import type { Page } from "playwright";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";
// @ts-expect-error JavaScript browser probe shared with the static-preview audit.
import { measureFocus } from "../../../../scripts/focus-ring-audit-1375.mjs";

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(`
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './src/app/app-provider';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './src/components/layout/resizable';
import { Breadcrumb } from './src/components/layout/breadcrumb';
import { Card, CardContent } from './src/components/data-display/card';
import { Table, TableBody, TableRow, TableCell } from './src/components/data-display/table';
import { DataTable } from './src/components/data-display/data-table';
import { Button } from './src/components/general/button';
import { PasswordInput } from './src/components/data-entry/password-input';
import { Pagination } from './src/components/navigation/pagination';
import { Tabs } from './src/components/navigation/tabs';
import { Topbar } from './src/components/layout';
import { AppSettingPicker } from './src/components/navigation';
import { Logo } from './src/components/general/logo';
import { Anchor } from './src/lab/anchor';
import { LegalDocumentShell } from './src/lab/legal-document-shell';
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<Topbar height="bar" start={<Logo asChild><a href="#home" aria-label="Home" /></Logo>} end={<><AppSettingPicker kind="locale" appearance="bar"/><AppSettingPicker kind="theme" appearance="bar"/></>}/>
<Anchor affix={false} items={[{key:'intro',href:'#intro',title:'On this page'}]}/>
<LegalDocumentShell title="Terms" sections={[{id:'intro',title:'Introduction',content:<p>Terms of service.</p>},{id:'details',title:'Details',content:<p>Details.</p>}]}/>
<Pagination responsive={false} total={100} value={2} pageSize={10}/>
<Tabs items={[{value:'one',label:'First tab'},{value:'two',label:'Second tab'}]}/>
<Card><CardContent flush><Button data-testid="card-button">Card action</Button></CardContent></Card>
<Card><CardContent flush><div style={{'--background':'240 6% 10%','--primary':'240 6% 10%','--primary-foreground':'0 0% 98%','--ring':'0 0% 98%'}}><Button data-testid="nested-theme">Nested theme action</Button></div></CardContent></Card>
<Breadcrumb items={[{label:'Home',to:'#home'},{label:'Current'}]}/>
<PasswordInput aria-label="Password"/>
<Table><TableBody><TableRow tabIndex={0} className="ui-focus-ring"><TableCell>Focusable row</TableCell></TableRow></TableBody></Table>
<DataTable data={[{id:'1',name:'Wide table'}]} scroll={{x:1800}} columns={[{key:'name',header:'Name',width:'w-[1800px]'}]} />
<ResizablePanelGroup orientation="horizontal" style={{height:160}}><ResizablePanel defaultSize="50%" minSize="10%">Start</ResizablePanel><ResizableHandle aria-label="Resize columns"/><ResizablePanel defaultSize="50%" minSize="10%">End</ResizablePanel></ResizablePanelGroup>
<ResizablePanelGroup orientation="vertical" style={{height:160}}><ResizablePanel defaultSize="50%" minSize="10%">Top</ResizablePanel><ResizableHandle aria-label="Resize rows"/><ResizablePanel defaultSize="50%" minSize="10%">Bottom</ResizablePanel></ResizablePanelGroup>
</AppProvider>);
`);
}, 180000);
afterAll(async () => {
  await fixture?.close();
});

async function tabTo(page: Page, selector: string) {
  for (let i = 0; i < 100; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate((s) => document.activeElement?.matches(s), selector)) return;
  }
  throw new Error(`Tab never reached ${selector}`);
}
for (const width of [1280, 390])
  for (const dir of ["ltr", "rtl"])
    for (const theme of ["light", "dark"])
      it(`brand ring remains inside every ancestor at ${width} ${dir} ${theme}`, async () => {
        const page = await fixture.open("", { width, height: 900 });
        try {
          await page.evaluate(
            ({ dir, theme }) => {
              document.documentElement.dir = dir;
              document.documentElement.dataset.theme = theme;
            },
            { dir, theme },
          );
          const geometry = () =>
            page
              .locator(
                '.ui-pagination,[data-slot="tabs-list"],[data-slot="card"],.ui-data-table-scroll',
              )
              .evaluateAll((els) =>
                els.map((el) => ({
                  width: el.getBoundingClientRect().width,
                  height: el.getBoundingClientRect().height,
                  scrollWidth: el.scrollWidth,
                  scrollHeight: el.scrollHeight,
                })),
              );
          const beforeGeometry = await geometry();
          for (const [name, selector] of [
            ["logo", 'a[data-slot="logo"]'],
            ["locale", '.ui-app-setting-picker-icon[data-appearance="bar"]'],
            ["theme", '.ui-app-setting-picker-icon[data-appearance="bar"]'],
            ["anchor", '[data-slot="anchor-link"]'],
            ["legal", ".ui-legal-document-toc-link"],
            ["pagination", ".ui-pagination-link:not(:disabled)"],
            ["tabs", '[role="tab"]'],
            ["card", '[data-testid="card-button"]'],
            ["nested-theme", '[data-testid="nested-theme"]'],
            ["breadcrumb", ".ui-breadcrumb-link"],
            ["password", ".ui-password-input-toggle"],
            ["row", "tr.ui-focus-ring"],
            ["table-scroll", ".ui-data-table-scroll"],
            ["resize-columns", '[aria-label="Resize columns"]'],
            ["resize-rows", '[aria-label="Resize rows"]'],
          ]) {
            await tabTo(page, selector!);
            await page.waitForTimeout(200);
            const result = (await page.evaluate(measureFocus)) as {
              brand: boolean;
              clipped: unknown[];
              contrast: number;
            };
            await page.screenshot({
              path: `codex-shots/${process.env.FOCUS_PHASE || "after"}-${name}-${width}-${dir}-${theme}.png`,
            });
            if (name.startsWith("resize-")) {
              const handle = page.locator(selector!);
              const box = await handle.boundingBox();
              expect(Math.min(box!.width, box!.height)).toBeGreaterThanOrEqual(8);
              const before = await handle.getAttribute("aria-valuenow");
              await page.keyboard.press(name === "resize-rows" ? "ArrowDown" : "ArrowRight");
              await expect
                .poll(() => handle.getAttribute("aria-valuenow"), { message: name })
                .not.toBe(before);
            }
            expect.soft(result.brand, JSON.stringify(result)).toBe(true);
            expect.soft(result.clipped, JSON.stringify(result)).toEqual([]);
            expect.soft(result.contrast, JSON.stringify(result)).toBeGreaterThanOrEqual(3);
          }
          expect(await geometry()).toEqual(beforeGeometry);
        } finally {
          await page.close();
        }
      });
