import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * GDX-1465 in Chromium, against the real stylesheet: GDX's chat home stacks two lists — the
 * channels you are in (default density, `unread` so the dot can show) and the channels to join
 * (`density="compact"`, a 参加 Button, no read state). Their titles started 24px apart: 20px for
 * the indicator slot only the first list has, 4px because compact narrowed the inline gap. A row
 * with no read state can now keep the slot with `indicator="reserve"` (empty, hidden from
 * assistive tech: it announces no 既読), and compact keeps the default inline gap, so the title
 * line is one axis at both densities.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { Button } from "./src/components/general/button";
const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready" style={{ padding: "16px" }}>
    <Card><CardContent flush>
      <ListRow id="unread" unread leading={<Icon />} title="general" description="全員" />
      <ListRow id="read" unread={false} leading={<Icon />} title="random" />
    </CardContent></Card>
    <Card><CardContent flush>
      <ListRow id="reserve-compact" density="compact" indicator="reserve" leading={<Icon />}
        title="release" description="リリース調整"
        trailing={<Button variant="outline" size="sm">参加</Button>} />
      <ListRow id="reserve-default" indicator="reserve" leading={<Icon />} title="ops" />
      <ListRow id="plain-compact" density="compact" leading={<Icon />} title="design" />
      <ListRow id="plain-default" leading={<Icon />} title="docs" />
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

describe("ListRow title axis across read state and density (GDX-1465)", { timeout: 60_000 }, () => {
  for (const width of [320, 390, 1280]) {
    it(`at ${width} a reserved slot and compact density keep the title on one axis`, async () => {
      const page = await fixture.open("", { width, height: 800 });
      const m = await page.evaluate(() => {
        const row = (id: string) => document.getElementById(id)!;
        const titleX = (id: string) =>
          row(id).querySelector('[data-slot="list-row-body"] > *')!.getBoundingClientRect().left;
        const slot = row("reserve-compact").querySelector('[data-slot="list-row-indicator"]');
        return {
          unread: titleX("unread"),
          read: titleX("read"),
          reserveCompact: titleX("reserve-compact"),
          reserveDefault: titleX("reserve-default"),
          plainCompact: titleX("plain-compact"),
          plainDefault: titleX("plain-default"),
          slotHidden: slot?.getAttribute("aria-hidden") ?? null,
          slotText: slot?.textContent ?? null,
          reserveUnreadAttr: row("reserve-compact").hasAttribute("data-unread"),
          scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      await page.close();
      const at = JSON.stringify(m);
      expect(m.read, at).toBe(m.unread);
      expect(m.reserveCompact, at).toBe(m.unread);
      expect(m.reserveDefault, at).toBe(m.unread);
      // without a slot, the two densities still share one title axis
      expect(m.plainCompact, at).toBe(m.plainDefault);
      expect(m.slotHidden, at).toBe("true");
      expect(m.slotText, at).toBe("");
      expect(m.reserveUnreadAttr, at).toBe(false);
      expect(m.scroll, at).toBe(0);
    });
  }
});
