import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, afterAll, it, expect } from "vitest";
import { EditorialCard } from "../editorial";
import { Image } from "../../data-display/image";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});
it("spotlight gives kit Image a containing box (server markup, before any placeholder)", async () => {
  const page = await browser.newPage();
  try {
    for (const dir of ["ltr", "rtl"]) {
      const markup = renderToStaticMarkup(
        <EditorialCard
          variant="spotlight"
          link={<a href="/reference" />}
          title="Reference"
          media={
            <Image
              src="https://example.test/pending.svg"
              alt=""
              preview={false}
              placeholder
              fallback="https://example.test/fallback.svg"
            />
          }
        />,
      );
      const realm = globalThis.TextEncoder;
      globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
      let css: string;
      try {
        css = await compileRealCss(markup);
      } finally {
        globalThis.TextEncoder = realm;
      }
      await page.route("https://example.test/**", (route) => route.abort());
      await page.setContent(
        `<html dir="${dir}"><head><style>${css}</style></head><body>${markup}</body></html>`,
      );
      const box = await page.locator('[data-slot="image"]').boundingBox();
      const media = await page.locator(".ui-editorial-card-media").boundingBox();
      expect(media!.width).toBeGreaterThan(0);
      expect(box!.width).toBeCloseTo(media!.width, 0);
      expect(box!.height).toBeCloseTo(media!.height, 0);
      // Server markup carries no placeholder: it mounts after hydration, so it never covers an
      // already-painted SSR picture (gh#1472). The box above is what the slot must provide.
      expect(await page.locator('[data-slot="image-placeholder"]').count()).toBe(0);
    }
  } finally {
    await page.close();
  }
});
