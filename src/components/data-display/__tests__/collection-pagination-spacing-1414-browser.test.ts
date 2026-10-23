import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

const ENTRY = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AppProvider} from './src/app/app-provider';
import {Card,CardHeader,CardTitle,CardContent,CardFooter} from './src/components/data-display/card';
import {DataTable} from './src/components/data-display/data-table';
import {Pagination} from './src/components/navigation/pagination';
import {PageContainer} from './src/components/layout/page-container';
const q=new URLSearchParams(location.search);
const pager=<Pagination className="w-full" align="start" total={30} pageSize={10} responsive={false}/>;
const data=[{id:'1',name:'Alpha'},{id:'2',name:'Beta'},{id:'3',name:'Gamma'}];
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<div dir={q.get('dir')||'ltr'}>
<Card id="records"><CardHeader><CardTitle>Records</CardTitle></CardHeader><CardContent flush>
<DataTable rowKey="id" preset="stacked-record-collection" collapseBelow={q.get("collapse")||"xl"} columns={[{key:'name',header:'Name'}]} data={data} pagination={{pageSize:10,total:30,position:['bottomStart'],responsive:false}}/>
</CardContent></Card>
<Card id="content"><CardHeader><CardTitle>Content</CardTitle></CardHeader><CardContent>{pager}</CardContent></Card>
<Card id="footer"><CardHeader><CardTitle>Footer</CardTitle></CardHeader><CardContent>Content</CardContent><CardFooter>{pager}</CardFooter></Card>
<PageContainer title="Page" footer={pager}><span>Content</span></PageContainer>
<div id="plain">{pager}</div>
</div></AppProvider>);
`;
let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});
describe("continuous collection and container-owned pagination inset (#1414/#1415)", () => {
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"]) {
      it(`${width} ${dir}: zero record gap and pagination keylines`, async () => {
        const page = await fixture.open("?dir=" + dir, { width, height: 1000 });
        const measurements = await page.evaluate(() => {
          const rtl =
            document.querySelector("#plain")!.parentElement!.getAttribute("dir") === "rtl";
          const start = (el: Element) => {
            const r = el.getBoundingClientRect();
            return rtl ? r.right : r.left;
          };
          const keylines = ["records", "content", "footer"].map((id) => {
            const root = document.getElementById(id)!;
            return (
              start(root.querySelector(".ui-pagination button")!) -
              start(root.querySelector('[data-slot="card-title"]')!)
            );
          });
          const navs = [...document.querySelectorAll(".ui-pagination")];
          const inset = navs.map((nav) => start(nav.querySelector("button")!) - start(nav));
          const pageRoot = document.querySelector(".ui-page-container")!;
          const pageKeyline =
            start(pageRoot.querySelector(".ui-pagination button")!) -
            start(pageRoot.querySelector(".ui-page-body > span")!);
          const plainKeyline =
            start(document.querySelector("#plain .ui-pagination button")!) -
            start(document.querySelector("#plain")!);
          return { keylines: [...keylines, pageKeyline, plainKeyline], inset };
        });
        expect(measurements.keylines).toHaveLength(5);
        expect(measurements.inset).toHaveLength(5);
        expect(
          measurements.keylines.every((n) => Math.abs(n) <= 0.5),
          JSON.stringify(measurements),
        ).toBe(true);
        expect(
          measurements.inset.every((n) => Math.abs(n) <= 0.5),
          JSON.stringify(measurements),
        ).toBe(true);
        await page.close();
      });
      it(`${width} ${dir}: adjacent stacked records share exactly one boundary`, async () => {
        const page = await fixture.open("?dir=" + dir, { width, height: 1000 });
        const m = await page.locator("#records tbody").evaluate((body) => {
          const rows = [...body.children];
          return rows.map((row, i) => ({
            gap: i
              ? row.getBoundingClientRect().top - rows[i - 1]!.getBoundingClientRect().bottom
              : 0,
            start: parseFloat(getComputedStyle(row).borderBlockStartWidth),
            end: parseFloat(getComputedStyle(row).borderBlockEndWidth),
          }));
        });
        expect(m).toHaveLength(3);
        expect(m.map((r) => r.gap)).toEqual([0, 0, 0]);
        expect(m.map((r) => r.start)).toEqual([0, 0, 0]);
        expect(m.map((r) => r.end)).toEqual([1, 1, 0]);
        await page.close();
      });
    }
  it("keeps an explicit theme gap override live", async () => {
    const page = await fixture.open("?dir=rtl", { width: 390, height: 1000 });
    const gap = await page.locator("#records").evaluate((root) => {
      (root as HTMLElement).style.setProperty("--table-stacked-collection-card-gap", "13px");
      const rows = root.querySelectorAll("tbody tr");
      return rows[1]!.getBoundingClientRect().top - rows[0]!.getBoundingClientRect().bottom;
    });
    expect(gap).toBe(13);
    await page.close();
  });
  it("leaves the uncollapsed desktop table intact", async () => {
    const page = await fixture.open("?collapse=sm", { width: 1280, height: 1000 });
    expect(await page.locator("#records thead").isVisible()).toBe(true);
    expect(
      await page
        .locator("#records tbody tr")
        .first()
        .evaluate((el) => getComputedStyle(el).display),
    ).toBe("table-row");
    await page.close();
  });
});
