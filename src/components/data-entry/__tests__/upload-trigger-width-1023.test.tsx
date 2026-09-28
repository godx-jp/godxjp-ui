import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Form } from "../form";
import { FormField } from "../form-field";
import { Upload } from "../upload";
import type { UploadFileItem } from "../upload-types";
import { compileRealCss } from "./compile-real-css";

/**
 * The trigger of `Upload variant="button"` keeps its own width (gh#1023).
 *
 * The variant's root is a `ui-stack-sm` flex column, and a flex column stretches its items: in a
 * `Form layout="horizontal" controlWidth="36rem"` the "Attachments" button was 576px wide — the
 * whole control column. The file list under it must still span the column. Geometry, so Chromium:
 * jsdom lays nothing out and passes either way.
 */

const file = (name: string): UploadFileItem => ({ uid: name, name, size: 2048, status: "done" });

async function widths(variant: "button" | "picture") {
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="vi" persist={false}>
      <Form layout="horizontal" controlWidth="36rem">
        <FormField label="Attachments">
          <Upload
            variant={variant}
            maxCount={variant === "picture" ? 3 : undefined}
            value={[file("invoice.pdf")]}
            onValueChange={() => {}}
          />
        </FormField>
      </Form>
    </AppProvider>,
  );
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1142, height: 805 } });
    await page.setContent(
      `<!doctype html><html lang="vi"><head><style>${css}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() => {
      const w = (el: Element | null) => (el ? Math.round(el.getBoundingClientRect().width) : -1);
      const trigger = document.querySelector(".ui-form-field-control button");
      const label = trigger?.cloneNode(true) as HTMLElement;
      // Intrinsic width: the same button laid out on its own, outside any stretching parent.
      label.style.position = "absolute";
      document.body.append(label);
      return {
        column: w(document.querySelector(".ui-form-field-control")),
        trigger: w(trigger),
        intrinsic: w(label),
        list: w(document.querySelector(".ui-form-field-control ul")),
      };
    });
  } finally {
    await browser.close();
  }
}

describe("Upload trigger width in a horizontal Form (gh#1023, Chromium)", () => {
  it.each(["button", "picture"] as const)(
    'variant="%s": the trigger hugs its content, the file list spans the column',
    async (variant) => {
      const m = await widths(variant);
      expect(m.column).toBe(576);
      expect(m.trigger, JSON.stringify(m)).toBe(m.intrinsic);
      expect(m.trigger).toBeLessThan(m.column / 2);
      expect(m.list, JSON.stringify(m)).toBe(m.column);
    },
  );
});
