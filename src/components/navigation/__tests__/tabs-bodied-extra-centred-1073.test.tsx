import { chromium, type Browser, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Button } from "../../general/button";
import { Tabs } from "../tabs";

/**
 * gh#1073 — `<Tabs variant="editable-card" bodied hideAdd extra={{ end: <3 Buttons/> }}>` (a consumer
 * issue list): the three default-size Buttons are taller than a tab face, and the bodied bar was
 * `align-items: flex-end` while the panel is pulled up one border width, so the buttons' bottom
 * edge landed ON, and 1px into, the panel's top border.
 *
 * antd `tabBarExtraContent`: `.ant-tabs-nav { display: flex; align-items: center }`, and the nav
 * wrap / nav list STRETCH (`align-self: stretch`, a default-`stretch` flex list), so the tabs grow
 * to the nav's height — the extra is centred on the tab faces AND the tabs still reach the rail.
 * Measured with this harness, 1440 and 390 alike (panel top / extra bottom / extra-vs-tab centre):
 *
 *   case                          31.10.1              fixed
 *   consumer (3 default Buttons)  49 / 50 / 1px        49 / 49 / 0   (tab face 34px both)
 *   tall (lg Buttons + add)       extra on the border  tab faces grow 34 → 38px, extra centred
 *
 * The active face's bottom is the panel top + 1 (the body's one-border pull) before and after.
 *
 * jsdom does not lay out: Chromium, the package's real compiled stylesheet.
 */
const ITEMS = [
  { value: "all", label: "すべて", content: <p>all</p> },
  { value: "mine", label: "自分の課題", content: <p>mine</p> },
  { value: "done", label: "完了", content: <p>done</p> },
];

const ACTIONS = (
  <>
    <Button variant="outline">短縮URL</Button>
    <Button variant="outline">一括登録</Button>
    <Button variant="outline">フィルタを保存</Button>
  </>
);

const CASES = {
  /** The consumer's exact shape. */
  consumer: { hideAdd: true, extra: ACTIONS, placement: "top" },
  /** An extra TALLER than a tab face (the production density): centred, the tabs grow to it. */
  tall: {
    hideAdd: false,
    extra: (
      <>
        <Button variant="outline" size="lg">
          短縮URL
        </Button>
        <Button variant="outline" size="lg">
          一括登録
        </Button>
      </>
    ),
    placement: "top",
  },
  /** The add button stays a tab-shaped control on the rail. */
  withAdd: { hideAdd: false, extra: ACTIONS, placement: "top" },
  /** An extra SHORTER than a tab face is centred too, not dropped onto the rail. */
  short: {
    hideAdd: true,
    extra: (
      <Button variant="ghost" size="sm">
        絞込
      </Button>
    ),
    placement: "top",
  },
  /** Mirror placement: the strip sits under the panel. */
  bottom: { hideAdd: false, extra: ACTIONS, placement: "bottom" },
} as const;

const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
    {Object.entries(CASES).map(([id, c]) => (
      <div key={id} id={id} className="gutter">
        <Tabs
          variant="editable-card"
          bodied
          hideAdd={c.hideAdd}
          onEdit={() => {}}
          tabPlacement={c.placement}
          defaultValue="all"
          extra={{ end: c.extra }}
          items={ITEMS}
        />
      </div>
    ))}
  </AppProvider>,
);

let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

function measure(page: Page, id: string) {
  return page.evaluate((id) => {
    const root = document.getElementById(id)!;
    const rect = (sel: string) => root.querySelector(sel)!.getBoundingClientRect();
    const panel = rect('[data-slot="tabs-panel"]:not([hidden]), [role="tabpanel"]');
    const active = rect('[data-slot="tabs-trigger"][data-state="active"]');
    const resting = rect('[data-slot="tabs-trigger"]:not([data-state="active"])');
    const extra = rect('[data-slot="tabs-extra"][data-side="end"]');
    const buttons = [...root.querySelectorAll('[data-slot="tabs-extra"] button')].map((b) =>
      b.getBoundingClientRect(),
    );
    const addEl = root.querySelector('[data-slot="tabs-add"]');
    const add = addEl ? addEl.getBoundingClientRect() : null;
    const centre = (r: DOMRect) => r.top + r.height / 2;
    return {
      panelTop: panel.top,
      panelBottom: panel.bottom,
      activeTop: active.top,
      activeBottom: active.bottom,
      restingTop: resting.top,
      restingBottom: resting.bottom,
      extraTop: Math.min(...buttons.map((b) => b.top)),
      extraBottom: Math.max(...buttons.map((b) => b.bottom)),
      extraCentreOffset: Math.max(...buttons.map((b) => Math.abs(centre(b) - centre(active)))),
      slotCentreOffset: Math.abs(centre(extra) - centre(active)),
      addTop: add?.top ?? null,
      addBottom: add?.bottom ?? null,
    };
  }, id);
}

describe("Tabs bodied: extra is centred on the tab faces, off the panel border (gh#1073)", () => {
  it.each([1440, 390])("at %ipx", async (width) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}
          body { margin: 0; }
          .gutter { padding: 16px; }
        </style></head><body>${markup}</body></html>`,
      );

      for (const id of ["consumer", "tall", "withAdd", "short"] as const) {
        const m = await measure(page, id);
        const at = `${id} @${width}`;
        // Off the panel: nothing in the extra reaches into the panel's top border.
        expect(m.extraBottom, `${at}: extra bottom vs panel top`).toBeLessThanOrEqual(
          m.panelTop + 1,
        );
        expect(m.extraBottom, `${at}: extra bottom strictly above the border`).toBeLessThanOrEqual(
          m.panelTop + 0.5,
        );
        // Centred on the tab face.
        expect(m.extraCentreOffset, `${at}: extra centre vs tab face centre`).toBeLessThanOrEqual(
          1,
        );
        // Tabs still joined: the active face's bottom is the panel's top edge (the 1px pull).
        expect(
          Math.abs(m.activeBottom - (m.panelTop + 1)),
          `${at}: active joined`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(m.restingBottom - m.activeBottom),
          `${at}: resting on the rail`,
        ).toBeLessThanOrEqual(1);
        if (m.addBottom !== null) {
          expect(
            Math.abs(m.addBottom - m.activeBottom),
            `${at}: add on the rail`,
          ).toBeLessThanOrEqual(1);
        }
      }

      // Bottom placement: the same shape mirrored — the extra is off the panel's bottom border.
      const b = await measure(page, "bottom");
      expect(b.extraTop, `bottom @${width}: extra top vs panel bottom`).toBeGreaterThanOrEqual(
        b.panelBottom - 0.5,
      );
      expect(b.extraCentreOffset, `bottom @${width}: centred`).toBeLessThanOrEqual(1);
      expect(
        Math.abs(b.activeTop - (b.panelBottom - 1)),
        `bottom @${width}: joined`,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(b.addTop! - b.activeTop),
        `bottom @${width}: add on the rail`,
      ).toBeLessThanOrEqual(1);
    } finally {
      await page.close();
    }
  });
});
