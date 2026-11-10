import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * GDX-1454 in Chromium, against the real stylesheet: below 360px every ListRow gave `trailing` the
 * full width (`@media (max-width: 359px)`), so a compact row's one short action — a 参加 (Join)
 * Button — dropped under the title at 320 although it fits beside it. `density="compact"` is the
 * documented inline-actions row ("one or two small trailing Buttons on ONE line in a narrow
 * card"), so the narrow rule now leaves compact rows alone; a compact cluster that cannot fit still
 * wraps through the row's own flex-wrap (#224), and the default density keeps the stacked action.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { Button } from "./src/components/general/button";
const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>;
const row = (id, density, trailing) => (
  <ListRow id={id} density={density} leading={<Icon />} title="プロジェクト全体のお知らせ"
    description="全員が参加するチャンネル" trailing={trailing} />
);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready" style={{ padding: "16px" }}>
    <Card><CardContent flush>
      {row("compact", "compact", <Button variant="outline" size="sm">参加</Button>)}
      {row("default", undefined, <Button variant="outline" size="sm">参加</Button>)}
      {row("wide", "compact", <>
        <Button variant="outline" size="sm">参加をリクエスト</Button>
        <Button variant="ghost" size="sm">詳細を表示する</Button>
      </>)}
    </CardContent></Card>
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

describe(
  "ListRow compact action beside the title below 360px (GDX-1454)",
  { timeout: 60_000 },
  () => {
    it("at 320 a compact row keeps 参加 inline; default and an over-wide cluster still wrap", async () => {
      const page = await fixture.open("", { width: 320, height: 800 });
      const m = await page.evaluate(() => {
        const measure = (id: string) => {
          const row = document.getElementById(id)!;
          const body = row.querySelector('[data-slot="list-row-body"]')!.getBoundingClientRect();
          const trailing = row
            .querySelector('[data-slot="list-row-trailing"]')!
            .getBoundingClientRect();
          const button = row.querySelector("button")!.getBoundingClientRect();
          return {
            // the action starts above the body's bottom edge = it shares the body's line
            inline: trailing.top < body.bottom,
            rowHeight: row.getBoundingClientRect().height,
            buttonRight: button.right,
            bodyRight: body.right,
            buttonLeft: button.left,
          };
        };
        return {
          compact: measure("compact"),
          default: measure("default"),
          wide: measure("wide"),
          scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      await page.close();
      expect(m.compact.inline, JSON.stringify(m.compact)).toBe(true);
      expect(m.compact.buttonLeft).toBeGreaterThan(m.compact.bodyRight);
      expect(m.compact.rowHeight).toBeLessThan(m.default.rowHeight);
      expect(m.default.inline, JSON.stringify(m.default)).toBe(false);
      expect(m.wide.inline, JSON.stringify(m.wide)).toBe(false);
      expect(m.scroll).toBe(0);
    });
  },
);
