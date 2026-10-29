import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Flex } from "./src/components/layout/flex";
import { Button } from "./src/components/general/button";
import { RadarChart } from "./src/components/charts/radar-chart";
function App() {
 const [rotate, setRotate] = React.useState(0);
 const labels = ["事業継続管理の成熟度評価", "Customer satisfaction", "運用品質と監査対応", "Operational resilience", "情報セキュリティ管理", "Financial sustainability"];
 return <AppProvider defaultLocale="ja" persist={false}>
 <header style={{height:96}}>Workspace</header>
 <Flex viewport id="workspace" direction="col" surface="felt" gap="sm">
   {[0,1].map(half => <Flex key={half} basis="equal" overflow="hidden" direction="col" data-half={half}>
     <Flex basis="equal" overflow="scroll-x" data-rail={half}>
       {Array.from({length:16},(_,i) => <Flex key={i} measure={half ? "card-compact" : "card"} rotate={rotate} animated data-piece={half + "-" + i}>
         <img alt={"Portrait " + i} width="50" height="70" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='70'%3E%3Crect width='50' height='70' fill='%23777777'/%3E%3C/svg%3E" />
       </Flex>)}
     </Flex>
   </Flex>)}
   <Flex surface="etched"><Button id="rotate" onClick={() => setRotate(r => (r + 90) % 360)}>Rotate</Button><Button id="inspect" variant="outline">Inspect</Button></Flex>
 </Flex>
 <div id="radars">{["sm","md","lg"].map(size => <RadarChart key={size} id={"radar-"+size} size={size} data={labels.map((axis,i) => ({axis,value:i+1}))} categoryKey="axis" valueKey="value" valueMax={6} label={size} />)}</div>
 </AppProvider>;
}
createRoot(document.getElementById("root")).render(<App />);
`;
let browser: Browser;
let css: string;
let js: string;
beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const output = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: process.cwd() },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    js = output.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  css = await compileRealCss(
    `<div class="${[...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ").replaceAll('"', "")}"></div>`,
  );
  browser = await chromium.launch({ headless: true });
}, 180_000);
afterAll(async () => {
  await browser?.close();
});

describe("bounded material workspace in Chromium", () => {
  it.each([
    { width: 390, height: 844 },
    { width: 1366, height: 768 },
  ])("keeps equal regions, scrolling and controls within $width × $height", async (viewport) => {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (["error", "warning"].includes(m.type())) errors.push(m.text());
    });
    await page.setContent(
      `<style>${css} body{margin:0}</style><div id="root"></div><script>${js}</script>`,
    );
    await page.waitForSelector("#workspace[data-viewport]");
    const geometry = await page.evaluate(() => {
      const stage = document.querySelector("#workspace")!;
      const rect = stage.getBoundingClientRect();
      const halves = Array.from(stage.querySelectorAll("[data-half]")).map(
        (n) => n.getBoundingClientRect().height,
      );
      const rail = stage.querySelector("[data-rail]")!;
      rail.scrollLeft = 10000;
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        halves,
        scroll: rail.scrollLeft,
        controls: document.querySelector("#inspect")!.getBoundingClientRect().bottom,
        overflow: getComputedStyle(rail).overflowY,
        doc: document.documentElement.scrollWidth,
      };
    });
    expect(geometry.top).toBe(96);
    expect(geometry.bottom).toBeCloseTo(viewport.height, 0);
    expect(geometry.halves[0]).toBeCloseTo(geometry.halves[1], 0);
    expect(geometry.scroll).toBeGreaterThan(0);
    expect(geometry.overflow).toBe("hidden");
    expect(geometry.controls).toBeLessThanOrEqual(viewport.height);
    expect(geometry.doc).toBeLessThanOrEqual(viewport.width);
    for (const rotation of [90, 180, 270, 0]) {
      await page.locator("#rotate").click();
      await page.waitForFunction(
        (value) =>
          document.querySelector("[data-piece]")?.getAttribute("data-rotate") === String(value),
        rotation,
      );
      const motion = await page
        .locator("[data-piece]")
        .first()
        .evaluate((n) => ({
          duration: getComputedStyle(n).transitionDuration,
          transform: getComputedStyle(n).transform,
        }));
      expect(motion.duration).toBe("0s");
      const expected =
        rotation === 0
          ? [1, 0, 0, 1]
          : rotation === 90
            ? [0, 1, -1, 0]
            : rotation === 180
              ? [-1, 0, 0, -1]
              : [0, -1, 1, 0];
      const matrix = motion.transform
        .match(/matrix\(([^)]+)\)/)![1]
        .split(",")
        .map(Number);
      expected.forEach((value, i) => expect(matrix[i]).toBeCloseTo(value, 5));
    }
    await page.locator("#inspect").focus();
    expect(await page.locator("#inspect").evaluate((n) => n === document.activeElement)).toBe(true);
    const material = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>("#workspace")!;
      stage.parentElement!.style.setProperty("--primary", "210 50% 20%");
      stage.parentElement!.style.setProperty("--primary-foreground", "0 0% 100%");
      const scoped = getComputedStyle(stage).backgroundColor;
      stage.style.setProperty("--flex-felt-background", "0 0% 10%");
      const custom = getComputedStyle(stage).backgroundColor;
      return {
        scoped,
        custom,
        text: getComputedStyle(stage).color,
        ring: getComputedStyle(stage).getPropertyValue("--ring").trim(),
        etched: getComputedStyle(stage.querySelector('[data-surface="etched"]')!).borderTopColor,
      };
    });
    expect(material.scoped).toBe("rgb(26, 51, 77)");
    expect(material.custom).toBe("rgb(26, 26, 26)");
    expect(material.text).toBe("rgb(255, 255, 255)");
    expect(material.ring).toBe("0 0% 100%");
    expect(material.etched).toBe("rgba(255, 255, 255, 0.5)");
    // Both translated and English axis text stays within the SVG viewport in every size.
    const labels = await page.locator('[data-slot="radar-plot"]').evaluateAll((plots) =>
      plots.flatMap((plot) => {
        const bounds = plot.getBoundingClientRect();
        return Array.from(plot.querySelectorAll("text:has(title)")).map((label) => {
          const r = label.getBoundingClientRect();
          return {
            inside:
              r.left >= bounds.left - 1 &&
              r.right <= bounds.right + 1 &&
              r.top >= bounds.top - 1 &&
              r.bottom <= bounds.bottom + 1,
            lines: label.querySelectorAll("tspan").length,
            full: label.querySelector("title")!.textContent,
          };
        });
      }),
    );
    expect(labels).toHaveLength(18);
    labels.forEach((label) => {
      expect(label.inside, label.full ?? "label").toBe(true);
      expect(label.lines).toBeLessThanOrEqual(2);
    });
    // A service can enlarge labels and change geometry through the published knobs.
    await page.locator("#radars").evaluate((node) => {
      (node as HTMLElement).style.setProperty("--radar-chart-label-font-size", "24px");
      (node as HTMLElement).style.setProperty("--radar-chart-plot-radius", "80");
    });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-slot="radar-label"]')!).fontSize === "24px",
    );
    const themed = await page
      .locator('[data-slot="radar-plot"]')
      .first()
      .evaluate((node) => ({
        radius: getComputedStyle(node.querySelector('[data-slot="radar-area"]')!).transform,
        labels: Array.from(node.querySelectorAll('[data-slot="radar-label"]')).map((label) => {
          const r = label.getBoundingClientRect();
          const b = node.getBoundingClientRect();
          return r.left >= b.left - 1 && r.right <= b.right + 1;
        }),
      }));
    expect(themed.radius).toBe("matrix(80, 0, 0, 80, 0, 0)");
    expect(themed.labels).toEqual(Array(6).fill(true));
    expect(errors).toEqual([]);
    await page.close();
  });
});
