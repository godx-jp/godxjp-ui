import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

const ENTRY = `
import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardHeader, CardTitle, CardContent } from "./src/components/data-display/card";
import { DataTable } from "./src/components/data-display/data-table";
import { Calendar } from "./src/components/data-entry/calendar";
import { NumberInput } from "./src/components/data-entry/number-input";
const q=new URLSearchParams(location.search);
createRoot(document.getElementById('root')).render(
<AppProvider defaultLocale="en" persist={false}>
<div dir={q.get('dir') || 'ltr'} style={{width: Number(q.get('width') || 244)}}>
<Card density={q.get('density') === 'normal' ? undefined : q.get('density')} style={q.has('inset') ? {'--card-space-inset':'23px'} : undefined}>
<CardHeader><CardTitle>Records</CardTitle></CardHeader><CardContent flush>
<DataTable preset="stacked-record-collection" collapseBelow="sm" rowKey="id" columns={[{key:'title',header:'Title'}]} data={[{id:'1',title:'Record'}]}/>
</CardContent></Card>
<NumberInput aria-label="Quantity" defaultValue={2} />
<Calendar showWeekNumber={q.has("weeks")} mode="single" defaultMonth={new Date(2026,8,1)} bordered={q.get('bordered') !== 'false'} />
</div></AppProvider>);
`;
let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});
describe("card keyline and constrained calendar regressions", () => {
  for (const dir of ["ltr", "rtl"])
    for (const density of ["tight", "normal", "cozy"])
      for (const globalDensity of ["compact", "default", "comfortable"]) {
        it(`${dir} ${density} ${globalDensity}: stacked value shares the heading keyline`, async () => {
          const page = await fixture.open(`?dir=${dir}&density=${density}`);
          await page.evaluate((density) => {
            document.documentElement.dataset.density = density;
          }, globalDensity);
          const delta = await page.evaluate(() => {
            const title = document
              .querySelector('[data-slot="card-title"]')!
              .getBoundingClientRect();
            const cell = document
              .querySelector('[data-slot="table-cell"]')!
              .getBoundingClientRect();
            return Math.abs(
              document.querySelector('[data-slot="card"]')!.parentElement!.getAttribute("dir") ===
                "rtl"
                ? title.right - cell.right
                : title.left - cell.left,
            );
          });
          expect(delta).toBeLessThanOrEqual(0.5);
          await page.close();
        });
      }
  for (const dir of ["ltr", "rtl"]) {
    it(`${dir}: fine stepper owns its full outward 24px hit area`, async () => {
      const page = await fixture.open(`?dir=${dir}`);
      const owned = await page.locator(".ui-number-input-step-up").evaluate((button) => {
        const r = button.getBoundingClientRect();
        const x = (r.left + r.right) / 2;
        return [r.bottom - 23, r.bottom - 1].every((y) => {
          const hit = document.elementFromPoint(x, y);
          return hit === button || button.contains(hit);
        });
      });
      expect(owned).toBe(true);
      await page.close();
    });
  }
  it("week-number column retains its intrinsic desktop measure", async () => {
    const page = await fixture.open("?width=1000&weeks=1");
    const delta = await page.locator(".ui-calendar").evaluate((el) => {
      const css = getComputedStyle(el);
      const day = el.querySelector(".ui-calendar-day")!.getBoundingClientRect();
      const week = Math.max(
        ...[
          ...el.querySelectorAll(".ui-calendar-week-number, .ui-calendar-week-number-header"),
        ].map((x) => x.getBoundingClientRect().width),
      );
      return (
        el.getBoundingClientRect().width -
        (7 * day.width + week + 2 * parseFloat(css.paddingInlineStart) + 1)
      );
    });
    expect(Math.abs(delta)).toBeLessThanOrEqual(0.5);
    await page.close();
  });
  it("desktop calendar retains seven control-width columns", async () => {
    const page = await fixture.open("?width=1000");
    const m = await page.locator(".ui-calendar").evaluate((el) => {
      const css = getComputedStyle(el);
      return {
        actual: el.getBoundingClientRect().width,
        expected:
          7 * el.querySelector(".ui-calendar-day-button")!.getBoundingClientRect().height +
          2 * parseFloat(css.paddingInlineStart) +
          1,
      };
    });
    expect(Math.abs(m.actual - m.expected)).toBeLessThanOrEqual(0.5);
    await page.close();
  });
  for (const dir of ["ltr", "rtl"])
    for (const bordered of [true, false]) {
      it(`${dir} bordered=${bordered}: calendar fits its narrow container with 24px targets`, async () => {
        const page = await fixture.open(`?dir=${dir}&bordered=${bordered}`);
        const m = await page.locator(".ui-calendar").evaluate((el) => {
          const r = el.getBoundingClientRect(),
            p = el.parentElement!.getBoundingClientRect();
          return {
            overflow: Math.max(r.right - p.right, p.left - r.left, el.scrollWidth - el.clientWidth),
            min: Math.min(
              ...[...el.querySelectorAll(".ui-calendar-day-button")].map(
                (x) => x.getBoundingClientRect().width,
              ),
            ),
          };
        });
        expect(m.overflow).toBeLessThanOrEqual(0.5);
        expect(m.min).toBeGreaterThanOrEqual(24);
        await page.close();
      });
    }
  it("explicit stacked inset remains independent of the Card inset", async () => {
    const page = await fixture.open("?inset=1");
    const padding = await page.locator('[data-slot="card"]').evaluate((el) => {
      (el as HTMLElement).style.setProperty("--table-stacked-collection-card-padding-x", "19px");
      return getComputedStyle(el.querySelector(".ui-table-row")!).paddingInlineStart;
    });
    expect(padding).toBe("19px");
    await page.close();
  });
  it("scoped Card inset reaches the stacked row", async () => {
    const page = await fixture.open("?inset=1");
    const delta = await page.evaluate(
      () =>
        document.querySelector('[data-slot="table-cell"]')!.getBoundingClientRect().left -
        document.querySelector('[data-slot="card-title"]')!.getBoundingClientRect().left,
    );
    expect(Math.abs(delta)).toBeLessThanOrEqual(0.5);
    await page.close();
  });
});
