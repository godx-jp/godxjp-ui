import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * The auth bar `actions` stay on ONE ROW beside the brand while they fit — a page action
 * (「← GoDX ID へ戻る」) and the language picker side by side at 1280 in a 56px bar — and only wrap
 * when they truly do not fit (320px). Regression guard for d960beb9, which stacked them at every
 * width.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { CenteredShell } from "./src/components/layout/centered-shell";
import { Button } from "./src/components/general/button";
import { Text } from "./src/components/general/typography";
import { AppSettingPicker } from "./src/components/navigation/app-setting-picker";
import { Flex } from "./src/components/layout/flex";
import { Logo } from "./src/components/general/logo";
const q = new URLSearchParams(location.search);
const kind = q.get("k");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready">
    <CenteredShell variant={q.get("v")} barAppearance="frosted" preset={q.get("p") || undefined}
      brand={q.get("b") === "flex"
        ? <Flex align="center" gap="sm" grow><Logo /><Text tone="muted">ID</Text></Flex>
        : q.get("b") === "logo" ? <Logo /> : <Text weight="bold">GoDX ID</Text>}
      actions={<>
        {kind === "text"
          ? <Text size="sm" tone="muted" id="a1">管理者 · 山田</Text>
          : <Button variant="link" id="a1">← GoDX ID へ戻る</Button>}
        <AppSettingPicker kind="locale" appearance={q.get("pa") || "labeled"} compact />
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

const read = () => {
  const a1 = document.getElementById("a1")!.getBoundingClientRect();
  // The picker's visible box is its trigger button (its root is display: contents).
  const buttons = [...document.querySelectorAll<HTMLElement>(".ui-auth-shell-bar-actions button")];
  const a2 = buttons[buttons.length - 1]!.getBoundingClientRect();
  const bar = document.querySelector(".ui-auth-shell-bar")!.getBoundingClientRect();
  const kids = [...document.querySelectorAll(".ui-auth-shell-bar-actions button")].map((c) => {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    return `${c.tagName}.${c.className.toString().slice(0, 60)} disp=${cs.display} w=${cs.width} basis=${cs.flexBasis} grow=${cs.flexGrow} minw=${cs.minWidth} @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}`;
  });
  return {
    kids,
    sameRow: Math.abs(a1.top + a1.height / 2 - (a2.top + a2.height / 2)) < 2,
    a1BeforeA2: a1.right <= a2.left,
    barH: bar.height,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

describe("auth bar actions row", { timeout: 60_000 }, () => {
  for (const v of ["auth", "auth-canonical"]) {
    for (const k of ["link", "text"])
      for (const b of ["text", "logo"])
        for (const p of ["", "device-authorization", "context-selection"]) {
          it(`${v} / ${k} / brand ${b} / preset ${p || "none"}: one row at 1280 and 390`, async () => {
            for (const width of [1280, 390, 320]) {
              const page = await fixture.open(`?v=${v}&k=${k}&b=${b}&p=${p}&pa=inline`, {
                width,
                height: 800,
              });
              await page.waitForTimeout(200);
              const m = await page.evaluate(read);
              await page.close();
              expect(m.sameRow, `${width}: ${JSON.stringify(m)}`).toBe(true);
              expect(m.a1BeforeA2).toBe(true);
              expect(m.overflow).toBe(0);
              // One row: the bar is as tall as one control row plus its block padding, not two.
              if (width === 1280) expect(m.barH, JSON.stringify(m)).toBeLessThan(90);
            }
          });
        }
  }
});
