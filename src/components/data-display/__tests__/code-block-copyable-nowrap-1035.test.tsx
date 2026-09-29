import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";

import { CodeBlock } from "../code-block";

/**
 * gh#1035 — `copyable` + `wrap={false}`: a line wider than the block scrolled UNDER the corner copy
 * button, because the column the `pre` reserved was padding, and padding is part of the scrollport
 * (it only exists at the far end of the content). Measured in Chromium, LTR and RTL, at BOTH scroll
 * ends: no visible part of a line may sit under the button. jsdom does not lay out.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/data-display.css",
  "src/styles/base.css",
  "src/styles/control.css",
  "src/styles/data-display-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

describe("CodeBlock copyable + wrap={false} geometry (Chromium, gh#1035)", () => {
  it("never puts a scrolled line under the copy button (LTR + RTL, both scroll ends)", async () => {
    const long = `const url = "${"x".repeat(300)}";`;
    const markup = renderToStaticMarkup(
      <>
        <div id="ltr">
          <CodeBlock copyable wrap={false}>
            {long}
          </CodeBlock>
        </div>
        <div id="rtl" dir="rtl">
          <CodeBlock copyable wrap={false}>
            {long}
          </CodeBlock>
        </div>
        <div id="wrapped">
          <CodeBlock copyable>{long}</CodeBlock>
        </div>
      </>,
    );
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`,
      );
      const result = await page.evaluate(() => {
        const measure = (id: string, edge: "start" | "end") => {
          const root = document.getElementById(id)!;
          const pre = root.querySelector("pre")!;
          const max = pre.scrollWidth - pre.clientWidth;
          // Chromium's RTL scrollLeft runs 0 → -max toward the inline end.
          const sign = getComputedStyle(pre).direction === "rtl" ? -1 : 1;
          pre.scrollLeft = edge === "start" ? 0 : sign * max;
          const box = pre.getBoundingClientRect();
          // The scrollport is the padding box: what is visible of a line is clipped to it.
          const portLeft = box.left + pre.clientLeft;
          const portRight = portLeft + pre.clientWidth;
          const btn = root.querySelector("button")!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(root.querySelector("code")!);
          const overlap = [...range.getClientRects()].reduce((worst, line) => {
            const left = Math.max(line.left, portLeft, btn.left);
            const right = Math.min(line.right, portRight, btn.right);
            const vertical = line.top < btn.bottom && line.bottom > btn.top;
            return vertical ? Math.max(worst, right - left) : worst;
          }, 0);
          return { id, edge, scrolls: max > 0, scrolled: Math.abs(pre.scrollLeft), max, overlap };
        };
        return ["ltr", "rtl"].flatMap((id) => [measure(id, "start"), measure(id, "end")]);
      });
      for (const r of result) {
        expect(r.scrolls, `${r.id} ${r.edge}`).toBe(true);
        // ±1px: Chromium on Linux can stop an RTL scroll a subpixel short of -max (1774 vs 1775).
        expect(
          Math.abs(r.scrolled - (r.edge === "start" ? 0 : r.max)),
          `${r.id} ${r.edge}`,
        ).toBeLessThanOrEqual(1);
        expect(r.overlap, `${r.id} ${r.edge}`).toBeLessThanOrEqual(0);
      }

      // The fix is scoped to unwrapped blocks: a wrapped copyable block keeps its padding column.
      const wrapped = await page.evaluate(() => {
        const s = getComputedStyle(document.querySelector("#wrapped pre")!);
        return { border: s.borderInlineEndWidth, padding: s.paddingInlineEnd };
      });
      expect(wrapped.border).toBe("0px");
      expect(parseFloat(wrapped.padding)).toBeGreaterThan(24);
    } finally {
      await browser.close();
    }
  });
});
