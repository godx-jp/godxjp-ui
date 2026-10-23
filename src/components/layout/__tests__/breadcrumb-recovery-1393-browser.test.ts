import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";
// @ts-expect-error Shared browser audit engine is JavaScript.
import { collectProbes, evaluateProbes } from "../../../../scripts/visual-audit.mjs";

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(`
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AppProvider} from './src/app/app-provider';
import {Breadcrumb, PageContainer} from './src/components/layout';
const label = 'A complete ancestor collection name that cannot fit on a narrow screen';
const items = [{label:'Home',to:'#home'}, {label:<strong>{label}</strong>,to:'#records',ellipsis:true}];
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<PageContainer title="Record" breadcrumb={items} breadcrumbCurrentItem="none">
<Breadcrumb items={items} currentItem="none" ariaLabel="Ancestors"/>
{location.hash === '#bidi-cases' && ['Latin ancestor collection with a very long label', 'مجموعة السجلات الكاملة ذات الاسم الطويل جدا', '長い名前を持つ祖先コレクションの完全な名前'].map(label => <div key={label} data-bidi-case><Breadcrumb items={[{label:<strong>{label}</strong>,to:'#bidi',ellipsis:true},{label,ellipsis:true}]}/><PageContainer title="Bidi" breadcrumb={[{label, to:'#bidi',ellipsis:true}]} breadcrumbCurrentItem="none"/></div>)}
<div id="hand-rolled" style={{width:80,whiteSpace:'nowrap',overflow:'hidden'}}>A hand rolled clip loses the end of this label</div>
</PageContainer></AppProvider>);
`);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});

describe("Breadcrumb complete recovery (#1393)", () => {
  for (const dir of ["ltr", "rtl"]) {
    it(`${dir}: truncated Latin, Arabic and Japanese keep their first character visible`, async () => {
      const page = await fixture.open("#bidi-cases", { width: 320, height: 900 });
      try {
        await page.evaluate((dir) => {
          document.documentElement.dir = dir;
          document.documentElement.style.setProperty("--breadcrumb-item-max-inline-size", "120px");
        }, dir);
        const boxes = await page
          .locator("[data-bidi-case] .ui-breadcrumb-ellipsis")
          .evaluateAll((nodes) =>
            nodes.map((node) => {
              const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
              const text = walker.nextNode()!;
              const range = document.createRange();
              range.setStart(text, 0);
              range.setEnd(text, 1);
              const first = range.getBoundingClientRect();
              const box = node.getBoundingClientRect();
              return {
                label: node.textContent,
                clipped: node.scrollWidth > node.clientWidth,
                start: first.left - box.left,
                end: box.right - first.right,
              };
            }),
          );
        expect(boxes).toHaveLength(9);
        for (const box of boxes) {
          expect(box.clipped, box.label!).toBe(true);
          expect(box.start, box.label!).toBeGreaterThanOrEqual(-1);
          expect(box.end, box.label!).toBeGreaterThanOrEqual(-1);
        }
      } finally {
        await page.close();
      }
    });
  }
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"]) {
      it(`${width} ${dir}: links, keyboard tooltip, C01 clean kit and bad control`, async () => {
        const page = await fixture.open("", { width, height: 900 });
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (["error", "warning"].includes(message.type())) errors.push(message.text());
        });
        try {
          await page.evaluate((direction) => {
            document.documentElement.dir = direction;
            // Existing public theme knob: force actual clipping even on the desktop.
            document.documentElement.style.setProperty(
              "--breadcrumb-item-max-inline-size",
              "120px",
            );
          }, dir);
          const label = "A complete ancestor collection name that cannot fit on a narrow screen";
          const links = page.getByRole("link", { name: label, exact: true });
          expect(await links.count()).toBe(2);
          expect(await page.locator("[aria-current]").count()).toBe(0);
          for (const link of await links.all()) {
            expect(await link.getAttribute("title")).toBe(label);
            expect(await link.getAttribute("aria-label")).toBe(label);
            expect(await link.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
            expect(await link.getAttribute("aria-describedby")).toBeNull();
          }
          // Real keyboard traversal reaches the last ancestor in each trail.
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          expect(await links.first().evaluate((node) => node === document.activeElement)).toBe(
            true,
          );
          await page.locator("[data-ellipsis-tooltip]").waitFor();
          expect(await page.locator("[data-ellipsis-tooltip]").textContent()).toBe(label);
          expect(await links.first().getAttribute("aria-describedby")).toBeNull();
          const cdp = await page.context().newCDPSession(page);
          const tree = await cdp.send("Accessibility.getFullAXTree");
          const axLinks = tree.nodes.filter(
            (node) => node.role?.value === "link" && node.name?.value === label,
          );
          expect(axLinks).toHaveLength(2);
          expect(axLinks.map((node) => node.description?.value || "")).toEqual(["", ""]);
          await page.keyboard.press("Escape");
          await page.locator("[data-ellipsis-tooltip]").waitFor({ state: "hidden" });
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          expect(await links.last().evaluate((node) => node === document.activeElement)).toBe(true);
          await page.locator("[data-ellipsis-tooltip]").waitFor();
          await page.keyboard.press("Escape");
          await page.locator("[data-ellipsis-tooltip]").waitFor({ state: "hidden" });
          await page.keyboard.press("Enter");
          expect(page.url()).toContain("#records");
          const raw = await page.evaluate(collectProbes, { width });
          const findings = evaluateProbes(raw, {
            url: "about:blank",
            viewport: { width, height: 900 },
          });
          const c01 = findings.findings.filter(
            (finding: { rule: string }) => finding.rule === "c01-content-reachable",
          );
          expect(c01.length).toBeGreaterThan(0);
          expect(
            c01.every((finding: { element: string }) => finding.element.includes("hand-rolled")),
            JSON.stringify(c01),
          ).toBe(true);
          // A kit class alone, or only the first twenty characters, must never waive clipping.
          await links.first().evaluate((node) => {
            node.setAttribute("title", node.textContent!.slice(0, 20));
            node.setAttribute("aria-label", node.textContent!.slice(0, 20));
          });
          const broken = evaluateProbes(await page.evaluate(collectProbes, { width }), {
            url: "about:blank",
            viewport: { width, height: 900 },
          });
          expect(
            broken.findings.filter(
              (finding: { rule: string }) => finding.rule === "c01-content-reachable",
            ).length,
          ).toBeGreaterThan(c01.length);
          expect(errors).toEqual([]);
        } finally {
          await page.close();
        }
      }, 60_000);
    }
});
