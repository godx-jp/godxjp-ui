import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * The auth bar's `actions` with NON-button content — plain text (「管理者 · 日本語」) and a Badge —
 * on a phone. CJK may break between any two characters, so a squeezed flex item used to collapse
 * to one character per line. Each action keeps its one-line width; when the row runs out of room
 * the bar wraps the cluster under the brand; at 320px, where text + Badge + picker cannot share one
 * row, only the plain text truncates (still one line), and the page never scrolls sideways.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { CenteredShell } from "./src/components/layout/centered-shell";
import { Badge } from "./src/components/data-display/badge";
import { Text } from "./src/components/general/typography";
import { Flex } from "./src/components/layout/flex";
import { AppSettingPicker } from "./src/components/navigation/app-setting-picker";
const variant = new URLSearchParams(location.search).get("v") || "auth";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready">
    <CenteredShell variant={variant} barAppearance="frosted"
      brand={<Flex align="center" gap="sm"><Text weight="bold">GoDX</Text><Text tone="muted">ID 管理コンソール</Text></Flex>}
      actions={<>
        <Text size="sm" tone="muted" id="plain">管理者 · 日本語</Text>
        <Badge id="badge">ステージング</Badge>
        <AppSettingPicker kind="locale" appearance="labeled" compact />
      </>}>
      <div>content</div>
    </CenteredShell>
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

describe("auth bar actions with text", { timeout: 60_000 }, () => {
  for (const [v, width] of [
    ["auth", 320],
    ["auth", 390],
    ["auth", 1280],
    ["auth-canonical", 320],
    ["auth-canonical", 390],
  ] as const) {
    it(`keeps each action on one line — ${v} at ${width}px`, async () => {
      const page = await fixture.open(`?v=${v}`, { width, height: 800 });
      await page.waitForTimeout(200);
      const m = await page.evaluate(() => {
        const line = (el: Element) => {
          const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
          return el.getBoundingClientRect().height / lh;
        };
        return {
          plain: line(document.getElementById("plain")!),
          badgeH: document.getElementById("badge")!.getBoundingClientRect().height,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      await page.close();
      expect(m.plain, JSON.stringify(m)).toBeLessThan(1.5);
      expect(m.badgeH).toBeLessThan(32);
      expect(m.overflow).toBe(0);
    });
  }
});
