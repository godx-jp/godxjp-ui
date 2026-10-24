import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import { Descriptions } from "../../components/data-display/descriptions";
import { Tabs, TabsList, TabsTrigger } from "../../components/navigation/tabs";
import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser?.close();
});

for (const dir of ["ltr", "rtl"] as const) {
  for (const locale of ["ja", "en"] as const) {
    it(`content labels share the longest track without stealing value space: ${locale} ${dir}`, async () => {
      const labels = locale === "ja" ? ["状態", "担当者"] : ["Status", "Assigned to"];
      const markup = renderToStaticMarkup(
        <Descriptions
          columns={1}
          layout="horizontal"
          labelWidth="content"
          items={labels.map((label) => ({ label, value: "未対応 → 処理中" }))}
        />,
      );
      const css = await compileRealCss(markup);
      const page = await browser.newPage();
      try {
        for (const width of [320, 390, 560, 1280]) {
          await page.setViewportSize({ width, height: 600 });
          await page.setContent(
            `<html dir="${dir}" lang="${locale}"><style>${css}</style><main style="max-width:560px">${markup}</main></html>`,
          );
          const geometry = await page.locator("dl").evaluate((dl) => {
            const labels = [...dl.querySelectorAll("dt")];
            const widths = labels.map((label) => {
              const range = document.createRange();
              range.selectNodeContents(label);
              return range.getBoundingClientRect().width;
            });
            return {
              labelWidths: labels.map((label) => label.getBoundingClientRect().width),
              longest: Math.max(...widths),
              overflow: dl.scrollWidth - dl.clientWidth,
            };
          });
          expect(geometry.labelWidths[0]).toBeCloseTo(geometry.labelWidths[1], 1);
          expect(geometry.labelWidths[0]).toBeLessThanOrEqual(geometry.longest + 1);
          expect(geometry.overflow).toBeLessThanOrEqual(1);
        }
      } finally {
        await page.close();
      }
    });
  }
}

it("neutral counts remain muted in selected tabs, compound triggers and routes in both themes", async () => {
  const cases = [
    <Tabs
      key="items"
      defaultValue="n"
      items={[
        { value: "n", label: "Invited", count: 2, countTone: "neutral", content: "Invitations" },
        { value: "a", label: "Action", count: 3, content: "Actions" },
      ]}
    />,
    <Tabs key="compound" defaultValue="n">
      <TabsList>
        <TabsTrigger value="n" count={2} countTone="neutral">
          Invited
        </TabsTrigger>
      </TabsList>
    </Tabs>,
    <Tabs
      key="routes"
      items={[{ value: "n", label: "Invited", href: "#n", count: 2, countTone: "neutral" }]}
      value="n"
    />,
  ];
  const markup = renderToStaticMarkup(<>{cases}</>);
  const css = await compileRealCss(markup);
  const page = await browser.newPage();
  try {
    for (const theme of ["light", "dark"])
      for (const dir of ["ltr", "rtl"]) {
        await page.setContent(
          `<html class="${theme}" data-theme="${theme}" dir="${dir}"><style>${css}</style>${markup}</html>`,
        );
        const colors = await page.locator('[data-slot="tabs-count"]').evaluateAll((pills) =>
          pills.map((pill) => {
            const style = getComputedStyle(pill);
            const probe = document.createElement("span");
            pill.append(probe);
            probe.style.background = "hsl(var(--muted))";
            probe.style.color = "hsl(var(--muted-foreground))";
            const expected = getComputedStyle(probe);
            const result = {
              bg: style.backgroundColor,
              fg: style.color,
              expectedBg: expected.backgroundColor,
              expectedFg: expected.color,
            };
            probe.remove();
            return result;
          }),
        );
        for (const i of [0, 2, 3]) {
          expect(colors[i].bg).toBe(colors[i].expectedBg);
          expect(colors[i].fg).toBe(colors[i].expectedFg);
          const luminance = (color: string) => {
            const channels = color
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number)
              .map((n) => {
                const s = n / 255;
                return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
              });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const bg = luminance(colors[i].bg),
            fg = luminance(colors[i].fg);
          expect((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05)).toBeGreaterThanOrEqual(4.5);
        }
      }
  } finally {
    await page.close();
  }
});

it("keeps default/auto widths, accepts px/rem/expressions and ignores labelWidth in vertical layout", async () => {
  const page = await browser.newPage();
  try {
    for (const [labelWidth, expected] of [
      [undefined, 128],
      ["auto", 128],
      [64, 64],
      ["5rem", 80],
      ["calc(2rem + 8px)", 40],
    ] as const) {
      const markup = renderToStaticMarkup(
        <Descriptions
          columns={1}
          layout="horizontal"
          labelWidth={labelWidth}
          items={[{ label: "Status", value: "Open" }]}
        />,
      );
      await page.setContent(`<style>${await compileRealCss(markup)}</style>${markup}`);
      expect(await page.locator("dt").evaluate((e) => e.getBoundingClientRect().width)).toBe(
        expected,
      );
    }
    const markup = renderToStaticMarkup(
      <Descriptions
        columns={1}
        labelWidth="content"
        items={[{ label: "Status", value: "Open" }]}
      />,
    );
    expect(markup).not.toContain("data-label-width");
    await page.setContent(`<style>${await compileRealCss(markup)}</style>${markup}`);
    expect(
      await page.locator("dt").evaluate((e) => e.getBoundingClientRect().bottom),
    ).toBeLessThanOrEqual(await page.locator("dd").evaluate((e) => e.getBoundingClientRect().top));
  } finally {
    await page.close();
  }
});

it("wraps long labels without clipping at 320px and isolates the longest track to each list", async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 600 } });
  try {
    const markup = renderToStaticMarkup(
      <>
        <Descriptions
          columns={1}
          layout="horizontal"
          labelWidth="content"
          items={[
            {
              label: "Averylongunbrokenlocalizedpropertyname".repeat(3),
              value: "Avaluewithoutspaces".repeat(3),
            },
            { label: "ID", value: "42" },
          ]}
        />
        <Descriptions
          columns={1}
          layout="horizontal"
          labelWidth="content"
          items={[{ label: "ID", value: "43" }]}
        />
      </>,
    );
    await page.setContent(`<style>${await compileRealCss(markup)}</style>${markup}`);
    const result = await page.locator("dl").evaluateAll((lists) =>
      lists.map((dl) => ({
        width: dl.getBoundingClientRect().width,
        label: dl.querySelector("dt")!.getBoundingClientRect().width,
        overflow: dl.scrollWidth - dl.clientWidth,
        clipped: [...dl.querySelectorAll("dt,dd")].some(
          (e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1,
        ),
      })),
    );
    expect(result[0].label).toBeLessThanOrEqual(result[0].width * 0.4 + 1);
    expect(result[1].label).toBeLessThan(result[0].label);
    for (const list of result) {
      expect(list.overflow).toBeLessThanOrEqual(1);
      expect(list.clipped).toBe(false);
    }
  } finally {
    await page.close();
  }
});

it("preserves responsive columns and item spans with shared intrinsic tracks", async () => {
  const page = await browser.newPage();
  try {
    for (const bordered of [false, true]) {
      const markup = renderToStaticMarkup(
        <Descriptions columns={3} layout="horizontal" labelWidth="content" bordered={bordered}>
          <Descriptions.Item label="ID">42</Descriptions.Item>
          <Descriptions.Item label="Status">Open</Descriptions.Item>
          <Descriptions.Item label="Owner">Mika</Descriptions.Item>
          <Descriptions.Item label="Memo" span={2}>
            Memo
          </Descriptions.Item>
          <Descriptions.Item label="Time">Today</Descriptions.Item>
          <Descriptions.Item label="Full" span="filled">
            Full row
          </Descriptions.Item>
        </Descriptions>,
      );
      const css = await compileRealCss(markup);
      for (const [width, tracks] of [
        [320, 2],
        [768, 4],
        [1280, 6],
      ]) {
        await page.setViewportSize({ width, height: 600 });
        await page.setContent(`<style>${css}</style>${markup}`);
        expect(
          await page
            .locator("dl")
            .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length),
        ).toBe(tracks);
        const full = await page.locator('[data-span="filled"]').boundingBox();
        const dl = await page.locator("dl").boundingBox();
        expect(full!.width).toBeCloseTo(dl!.width - (bordered ? 1 : 0), 0);
        expect(
          await page.locator("dl").evaluate((e) => e.scrollWidth - e.clientWidth),
        ).toBeLessThanOrEqual(1);
      }
    }
  } finally {
    await page.close();
  }
});
