import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Button } from "../../general/button";
import { Input } from "../../data-entry/input";
import { NumberInput } from "../../data-entry/number-input";
import { Select } from "../../data-entry/select";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { SpaceCompact } from "../space-compact";

/**
 * gh#1062 — `SpaceCompact fullWidth` is antd `Space.Compact block`: the FIELD grows to fill the
 * row and a `Button` keeps its content width. It used to give every item `flex: 1 1 0%`, so an
 * Input + Button row split 50/50 (339.5/339.5px in a 678px card). Two fields (NumberInput +
 * Select, gh#917) still share the row between them. Geometry, so Chromium: jsdom lays nothing out.
 */
const ROW = 600;
const UNITS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
];

async function measure() {
  const row = (id: string, dir: "ltr" | "rtl", fullWidth: boolean, pair: "button" | "fields") => (
    <div id={id} dir={dir} style={{ inlineSize: ROW }}>
      <SpaceCompact fullWidth={fullWidth}>
        {pair === "button"
          ? [
              <Input key="input" aria-label="Item" />,
              <Button key="button" variant="outline">
                Add item
              </Button>,
            ]
          : [
              <NumberInput key="number" aria-label="Interval" defaultValue={2} />,
              <Select key="select" aria-label="Unit" defaultValue="week" options={UNITS} />,
            ]}
      </SpaceCompact>
    </div>
  );
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      {row("ltr", "ltr", true, "button")}
      {row("rtl", "rtl", true, "button")}
      {row("fields", "ltr", true, "fields")}
      {row("inline", "ltr", false, "button")}
    </AppProvider>,
  );
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() => {
      const rect = (el: Element) => el.getBoundingClientRect();
      const one = (id: string) => {
        const host = document.getElementById(id)!;
        const group = host.querySelector('[data-slot="space-compact"]')!;
        const [first, second] = [
          ...group.querySelectorAll(':scope > [data-slot="space-compact-item"]'),
        ];
        const button = second!.querySelector("button");
        let intrinsic = -1;
        if (button) {
          // The same button laid out on its own, outside any stretching parent.
          const clone = button.cloneNode(true) as HTMLElement;
          clone.style.position = "absolute";
          document.body.append(clone);
          intrinsic = rect(clone).width;
          clone.remove();
        }
        return {
          host: rect(host),
          group: rect(group),
          first: rect(first!),
          second: rect(second!),
          seam: parseFloat(getComputedStyle(second!).marginInlineStart),
          intrinsic,
        };
      };
      return { ltr: one("ltr"), rtl: one("rtl"), fields: one("fields"), inline: one("inline") };
    });
  } finally {
    await browser.close();
  }
}

describe("SpaceCompact fullWidth — the field grows, the Button keeps its width (gh#1062, Chromium)", () => {
  it("Input + Button: the Input fills what the Button leaves, LTR and RTL", async () => {
    const m = await measure();
    for (const dir of ["ltr", "rtl"] as const) {
      const r = m[dir];
      const info = JSON.stringify({ dir, ...r });
      expect(r.group.width, info).toBeCloseTo(ROW, 0);
      expect(r.seam, info).toBeLessThan(0);
      // Button at its content width, not half the row.
      expect(Math.abs(r.second.width - r.intrinsic), info).toBeLessThanOrEqual(1);
      // Input = row − button − the one collapsed hairline the seam overlaps.
      expect(Math.abs(r.first.width - (ROW - r.second.width - r.seam)), info).toBeLessThanOrEqual(
        1,
      );
      // Logical order: the Input sits at the inline START in both directions.
      if (dir === "ltr") {
        expect(Math.abs(r.first.left - r.host.left), info).toBeLessThanOrEqual(1);
        expect(Math.abs(r.second.right - r.host.right), info).toBeLessThanOrEqual(1);
      } else {
        expect(Math.abs(r.first.right - r.host.right), info).toBeLessThanOrEqual(1);
        expect(Math.abs(r.second.left - r.host.left), info).toBeLessThanOrEqual(1);
      }
    }
  });

  it("two fields (NumberInput + Select, gh#917) still share the whole row", async () => {
    const r = (await measure()).fields;
    const info = JSON.stringify(r);
    expect(r.group.width, info).toBeCloseTo(ROW, 0);
    expect(Math.abs(r.first.width - r.second.width), info).toBeLessThanOrEqual(1);
    expect(Math.abs(r.first.width + r.second.width + r.seam - ROW), info).toBeLessThanOrEqual(1);
  });

  it("without fullWidth nothing changes: the row hugs its content", async () => {
    const r = (await measure()).inline;
    const info = JSON.stringify(r);
    expect(r.group.width, info).toBeLessThan(ROW / 2);
    expect(Math.abs(r.second.width - r.intrinsic), info).toBeLessThanOrEqual(1);
  });
});
