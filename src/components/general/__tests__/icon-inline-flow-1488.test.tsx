import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { ExternalLink } from "lucide-react";
import { expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Button } from "../button";
import { Icon } from "../icon";
import { Text } from "../typography";

it("keeps inline source glyphs beside text in LTR/RTL without changing control glyph sizes", async () => {
  const markup = renderToStaticMarkup(
    <AppProvider persist={false} defaultLocale="en">
      <Text asChild link>
        <a href="#target">
          Official source <Icon as={ExternalLink} size="xs" />
        </a>
      </Text>
      <Text as="p">
        公式情報 <Icon as={ExternalLink} size="xs" />
      </Text>
      <Button>
        <Icon as={ExternalLink} size="xs" />
        Open
      </Button>
    </AppProvider>,
  );
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const dir of ["ltr", "rtl"]) {
        await page.setContent(
          `<!doctype html><html dir="${dir}"><head><style>${css}</style></head><body>${markup}</body></html>`,
        );
        const positions = await page.locator("a, p, button").evaluateAll((elements) =>
          elements.map((element) => {
            const icon = element.querySelector("svg")!;
            const text = [...element.childNodes].find(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            )!;
            const range = document.createRange();
            range.selectNodeContents(text);
            const label = range.getBoundingClientRect();
            const glyph = icon.getBoundingClientRect();
            return {
              overlap: Math.min(label.bottom, glyph.bottom) - Math.max(label.top, glyph.top),
              width: glyph.width,
              height: glyph.height,
              hidden: icon.getAttribute("aria-hidden"),
            };
          }),
        );
        expect(positions).toHaveLength(3);
        for (const position of positions) {
          expect(
            position.overlap,
            `${width}/${dir}: glyph must share the text line`,
          ).toBeGreaterThan(0);
          expect(position.width).toBe(12);
          expect(position.height).toBe(12);
          expect(position.hidden).toBe("true");
        }
        await page.getByRole("link", { name: "Official source" }).focus();
        expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("A");
      }
    }
  } finally {
    await browser.close();
  }
});
