import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

const ENTRY = `
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {AppProvider} from './src/app/app-provider';
import {Persona} from './src/components/data-display/persona';
import {Avatar} from './src/components/data-display/avatar';
import {Card, CardContent} from './src/components/data-display/card';
import {DataTable} from './src/components/data-display/data-table';
const dir = new URLSearchParams(location.search).get('dir');
const name = dir === 'rtl' ? 'ليلى عبد الرحمن الحسن والبحث والتطوير' : 'Alex Morgan Research and Development Department';
const email = 'alex.morgan.research-and-development@example.com';
const data = [{id:'1', name, email}];
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
 <div dir={dir}>
  <Avatar size="sm" data-reference="sm"/><Avatar size="md" data-reference="md"/>
  {['sm','md'].map(size => <Persona key={size} size={size} name={name} description={email} trailing={<span>(you)</span>} />)}
  <Card><CardContent flush><DataTable data={data} preset="stacked-record-collection" columns={[{key:'name',header:'Member',ellipsis:true,render:row=><Persona name={row.name} description={row.email} trailing={<span>(you)</span>}/>},{key:'email',header:'Email',ellipsis:true,render:row=><strong>{row.email}</strong>}]}/></CardContent></Card>
 </div>
</AppProvider>);
`;
let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 60_000);
afterAll(async () => {
  await fixture?.close();
});

describe("Persona layout (#1405)", () => {
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"]) {
      it(`${width} ${dir}: fixed avatar, clipped labels and recoverable custom cells`, async () => {
        const page = await fixture.open(`?dir=${dir}`, { width, height: 800 });
        try {
          await page.locator('[data-slot="persona"]').first().waitFor();
          const geometry = await page.locator('[data-slot="persona"]').evaluateAll((nodes) =>
            nodes.map((node) => {
              const avatar = node.querySelector<HTMLElement>('[data-slot="avatar"]')!;
              const body = node.querySelector<HTMLElement>('[data-slot="persona-body"]')!;
              const a = avatar.getBoundingClientRect(),
                b = body.getBoundingClientRect();
              return {
                avatarWidth: a.width,
                expected: document
                  .querySelector(`[data-reference="${node.getAttribute("data-size")}"]`)!
                  .getBoundingClientRect().width,
                aligned: a.top < b.bottom && b.top < a.bottom,
                wrap: getComputedStyle(node).flexWrap,
                labels: [
                  ...node.querySelectorAll<HTMLElement>(
                    '[data-slot="persona-name"], [data-slot="persona-description"]',
                  ),
                ].map((label) => ({
                  title: label.title,
                  text: label.textContent,
                  dir: label.dir,
                  overflow: getComputedStyle(label).textOverflow,
                  width: label.clientWidth,
                  cut: label.scrollWidth > label.clientWidth,
                  alignedToParent: (() => {
                    if (label.scrollWidth > label.clientWidth) return true;
                    const range = document.createRange();
                    range.selectNodeContents(label);
                    const ink = range.getBoundingClientRect(),
                      box = label.getBoundingClientRect();
                    return (
                      Math.abs(
                        getComputedStyle(node).direction === "rtl"
                          ? ink.right - box.right
                          : ink.left - box.left,
                      ) < 1
                    );
                  })(),
                })),
              };
            }),
          );
          for (const identity of geometry) {
            expect(identity.avatarWidth).toBeCloseTo(identity.expected, 1);
            expect(identity.aligned).toBe(true);
            expect(identity.wrap).toBe("nowrap");
            for (const label of identity.labels) {
              expect(label.title).toBe(label.text);
              expect(label.dir).toBe("auto");
              expect(label.overflow).toBe("ellipsis");
              expect(label.width).toBeGreaterThan(0);
              expect(label.alignedToParent, JSON.stringify(label)).toBe(true);
            }
          }
          if (width === 320) expect(geometry[0]!.labels.some((l) => l.cut)).toBe(true);
          const cell = page.locator('td[data-column-key="name"]');
          expect(await cell.getAttribute("title")).toBeNull();
          expect(await page.locator('td[data-column-key="email"]').getAttribute("title")).toContain(
            "alex.morgan.",
          );
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          const { collectProbes, evaluateProbes } = await import(
            process.cwd() + "/scripts/visual-audit.mjs"
          );
          const raw = await page.evaluate(collectProbes, {
            width,
            compactBelow: 600,
            desktopFrom: 1024,
          });
          expect(
            evaluateProbes(raw, { url: "fixture", viewport: { width, height: 800 } }).cell.rules[
              "c01-content-reachable"
            ],
          ).toBe("pass");
        } finally {
          await page.close();
        }
      });
    }
});

describe("stacked DataTable record boundaries", () => {
  it("uses one separator and full-width fields at every collapse step in both directions", async () => {
    const records = await bootChromium(
      ENTRY.replace(
        "const data = [{id:'1', name, email}];",
        "const data = [{id:'1', name, email}, {id:'2', name, email}];",
      )
        .replace(
          'preset="stacked-record-collection" columns=',
          'preset="stacked-record-collection" collapseBelow={new URLSearchParams(location.search).get("step")} columns=',
        )
        .replace("key:'name',header:'Member',", "key:'name',header:'Member',width:'46%',"),
    );
    try {
      for (const step of ["sm", "md", "lg", "xl"])
        for (const dir of ["ltr", "rtl"]) {
          const page = await records.open(`?dir=${dir}&step=${step}`, { width: 390, height: 1000 });
          try {
            const rows = await page.locator("tbody tr").evaluateAll((nodes) =>
              nodes.map((node) => {
                const css = getComputedStyle(node);
                const cell = node.querySelector("td")!;
                return {
                  top: css.borderTopWidth,
                  bottom: css.borderBottomWidth,
                  cellWidth: cell.getBoundingClientRect().width,
                  rowWidth: node.clientWidth,
                  padding: parseFloat(css.paddingInlineStart) + parseFloat(css.paddingInlineEnd),
                };
              }),
            );
            expect(rows.map((row) => [row.top, row.bottom])).toEqual([
              ["0px", "1px"],
              ["0px", "0px"],
            ]);
            for (const row of rows)
              expect(row.cellWidth).toBeCloseTo(row.rowWidth - row.padding, 0);
          } finally {
            await page.close();
          }
        }
    } finally {
      await records.close();
    }
  }, 60_000);
});
