import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Command, CommandItem, CommandList } from "../../data-entry/command";
import { Segmented } from "../../data-entry/segmented";
import { TagInput } from "../../data-entry/tag-input";
import { Button } from "../../general/button";
import { Tabs } from "../../navigation/tabs";

/**
 * gh#1146 — the pages app's consolidated coarse-pointer sweep. Under a finger every row and control
 * below reaches the 44px tap floor on the block axis; under a mouse nothing moves. Rows that sit
 * flush (menu, listbox, command) and tabs (their list clips block overflow) grow their BOX; isolated
 * controls borrow the target from `::after`. Chromium with touch emulation.
 *
 * DropdownMenu and Select rows render in a portal that static markup cannot open, so their row is
 * reproduced by its class — the geometry is the class's alone (`--menu-item-height`).
 */
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <div data-p="menu" role="menu">
      <div role="menuitem" className="ui-dropdown-menu-item">
        Rename
      </div>
      <div role="menuitem" className="ui-dropdown-menu-item">
        Delete
      </div>
    </div>
    <div data-p="select" role="listbox">
      <div role="option" aria-selected="false" className="ui-select-item">
        English
      </div>
      <div role="option" aria-selected="false" className="ui-select-item">
        日本語
      </div>
    </div>
    <div data-p="command">
      <Command>
        <CommandList>
          <CommandItem>Open</CommandItem>
          <CommandItem>Close</CommandItem>
        </CommandList>
      </Command>
    </div>
    <div data-p="xs">
      <Button size="xs">Open</Button>
    </div>
    <div data-p="sm">
      <Button size="sm">Open</Button>
    </div>
    <div data-p="segmented">
      <Segmented
        aria-label="View"
        options={[
          { value: "write", label: "Write" },
          { value: "preview", label: "Preview" },
        ]}
        defaultValue="write"
      />
    </div>
    <div data-p="tabs">
      <Tabs
        items={[
          { value: "graph", label: "Graph", content: "g" },
          { value: "list", label: "List", content: "l" },
        ]}
      />
    </div>
    <div data-p="tag">
      <TagInput aria-label="Aliases" />
    </div>
  </AppProvider>,
);

const TARGETS = {
  menu: "[role=menuitem]",
  select: "[role=option]",
  command: ".ui-command-item",
  xs: "button",
  sm: "button",
  segmented: ".ui-segmented-item",
  tabs: "[role=tab]",
} as const;

async function open(touch: boolean): Promise<{ page: Page; close: () => Promise<void> }> {
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({
      viewport: { width: 390, height: 1200 },
      hasTouch: touch,
      isMobile: touch,
    })
  ).newPage();
  await page.setContent(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>${css} body{margin:0;padding:16px} [data-p]{margin-block:32px}</style></head><body>${markup}</body></html>`,
  );
  return { page, close: () => browser.close() };
}

function measure(page: Page) {
  return page.evaluate((targets) => {
    const owner = (n: Element | null) =>
      n?.closest("label, button, [role=tab], [role=option], [role=menuitem], [cmdk-item]") ?? null;
    const out: Record<string, { box: number; hit: number }> = {};
    for (const [p, sel] of Object.entries(targets)) {
      const el = document.querySelector<HTMLElement>(`[data-p="${p}"] ${sel}`)!;
      const r = el.getBoundingClientRect();
      const x = r.left + Math.min(r.width / 2, 12);
      const cy = r.top + r.height / 2;
      const along = (dy: number) => {
        let d = 0;
        while (d < 40) {
          const hit = document.elementFromPoint(x, cy + dy * (d + 1));
          if (hit && (el.contains(hit) || owner(hit) === el)) d++;
          else break;
        }
        return d;
      };
      out[p] = { box: Math.round(r.height), hit: along(1) + along(-1) + 1 };
    }
    return out;
  }, TARGETS);
}

describe("coarse-pointer targets (Chromium, gh#1146)", () => {
  it("reaches the 44px floor on the block axis under a finger", async () => {
    const { page, close } = await open(true);
    try {
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
      const m = await measure(page);
      for (const [name, { hit }] of Object.entries(m)) expect(hit, name).toBeGreaterThanOrEqual(44);
      // Flush rows and tabs grow their box; isolated controls keep it.
      for (const name of ["menu", "select", "command", "tabs"]) expect(m[name]!.box, name).toBe(44);
      expect(m.xs!.box).toBeLessThan(44);
      expect(m.segmented!.box).toBeLessThan(44);

      // A tap just outside the painted option still checks it — the label owns its `::after`.
      const preview = page.locator('[data-p="segmented"] .ui-segmented-item').nth(1);
      const box = (await preview.boundingBox())!;
      await page.touchscreen.tap(box.x + box.width / 2, box.y - 1);
      expect(await page.locator('[data-p="segmented"] input[value="preview"]').isChecked()).toBe(
        true,
      );

      // TagInput: the 34px field is not the target — a tap anywhere on the 44px field focuses it.
      const tag = (await page.locator('[data-p="tag"] .ui-tag-input').boundingBox())!;
      expect(Math.round(tag.height)).toBe(44);
      await page.touchscreen.tap(tag.x + tag.width - 4, tag.y + 2);
      expect(await page.evaluate(() => document.activeElement?.className)).toContain(
        "ui-tag-input-field",
      );
    } finally {
      await close();
    }
  });

  it("changes nothing under a mouse: the target is the box", async () => {
    const { page, close } = await open(false);
    try {
      const m = await measure(page);
      for (const [name, { box, hit }] of Object.entries(m))
        expect(hit, name).toBeLessThanOrEqual(box + 1);
      expect(m.menu!.box).toBe(32);
      expect(m.select!.box).toBe(32);
    } finally {
      await close();
    }
  });
});
