import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * `Card variant="grouped"` — the inset grouped list, measured in Chromium against the real
 * stylesheet. The row hairline starts at the row TEXT (past a leading avatar when there is one)
 * and runs to the card's end edge; the last row draws none; a Descriptions in the same group puts
 * its labels on the same text axis; a caption padded `pad={{ inline: 4 }}` starts there too. A
 * card that is NOT grouped keeps its card-wide `border-block-end` exactly as before.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { Descriptions } from "./src/components/data-display/descriptions";
import { Avatar, AvatarFallback } from "./src/components/data-display/avatar";
import { Flex } from "./src/components/layout/flex";
import { Text } from "./src/components/general/typography";
const Rows = ({ leading }) => (
  <Flex as="ul" marker="none" direction="col" gap="none">
    {["a", "b", "c"].map((k) => (
      <ListRow key={k} as="li" title={"Row " + k} description="detail"
        leading={leading ? <Avatar><AvatarFallback>{k}</AvatarFallback></Avatar> : undefined}
        trailing={<Text mono size="xs" tone="muted">scope.{k}</Text>} />
    ))}
  </Flex>
);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 400 }}>
    <Flex direction="col" gap="xs" id="plain-group">
      <Flex pad={{ inline: 4 }} id="caption"><Text size="sm" tone="muted">Requested · 3</Text></Flex>
      <Card variant="grouped" id="plain"><CardContent flush><Rows /></CardContent></Card>
    </Flex>
    <Card variant="grouped" id="leading"><CardContent flush><Rows leading /></CardContent></Card>
    <Card variant="grouped" id="kv"><CardContent flush>
      <Descriptions layout="horizontal" columns={1}>
        <Descriptions.Item label="Provider">Sample Soft</Descriptions.Item>
        <Descriptions.Item label="Organisation">Sample Inc.</Descriptions.Item>
      </Descriptions>
    </CardContent></Card>
    <Card id="ungrouped"><CardContent flush><Rows /></CardContent></Card>
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

describe('Card variant="grouped" (inset grouped list)', { timeout: 60_000 }, () => {
  it("draws each row hairline from the row text to the card end, none under the last row", async () => {
    const page = await fixture.open("", { width: 800, height: 900 });
    const m = await page.evaluate(() => {
      const measure = (id: string) => {
        const card = document.getElementById(id)!;
        const c = card.getBoundingClientRect();
        return [...card.querySelectorAll<HTMLElement>('[data-slot="list-row"]')].map((row) => {
          const r = row.getBoundingClientRect();
          const after = getComputedStyle(row, "::after");
          const body = row.querySelector('[data-slot="list-row-body"]')!.getBoundingClientRect();
          return {
            content: after.content,
            start: r.left + parseFloat(after.left) - body.left,
            end: c.right - (r.left + parseFloat(after.left) + parseFloat(after.width)),
            line: after.borderBottomWidth,
            ownBorder: getComputedStyle(row).borderBottomWidth,
          };
        });
      };
      const card = document.getElementById("plain")!;
      return {
        plain: measure("plain"),
        leading: measure("leading"),
        ungrouped: [...document.querySelectorAll('#ungrouped [data-slot="list-row"]')].map(
          (row) => ({
            content: getComputedStyle(row, "::after").content,
            ownBorder: getComputedStyle(row).borderBottomWidth,
          }),
        ),
        cardBorder: getComputedStyle(card).borderTopWidth,
      };
    });
    await page.close();
    for (const id of ["plain", "leading"] as const) {
      const rows = m[id];
      expect(rows).toHaveLength(3);
      for (const row of rows.slice(0, 2)) {
        expect(Math.abs(row.start), `${id} start ${row.start}`).toBeLessThanOrEqual(1);
        expect(Math.abs(row.end), `${id} end ${row.end}`).toBeLessThanOrEqual(1);
        expect(row.line).toBe("1px");
        expect(row.ownBorder).toBe("0px");
      }
      expect(rows[2]!.content).toBe("none");
    }
    expect(m.cardBorder).toBe("0px");
    // Outside a group: the card-wide border, no pseudo line.
    expect(m.ungrouped[0]!.ownBorder).toBe("1px");
    expect(m.ungrouped[0]!.content).toBe("none");
  });

  it("puts Descriptions labels and a pad-4 caption on the row text axis", async () => {
    const page = await fixture.open("", { width: 800, height: 900 });
    const m = await page.evaluate(() => {
      const rowText = document
        .querySelector('#plain [data-slot="list-row-body"]')!
        .getBoundingClientRect().left;
      const label = document
        .querySelector('#kv [data-slot="descriptions-label"]')!
        .getBoundingClientRect().left;
      const caption = document
        .querySelector('#caption [data-slot="text"]')!
        .getBoundingClientRect().left;
      const first = document.querySelector<HTMLElement>('#kv [data-slot="descriptions-item"]')!;
      const after = getComputedStyle(first, "::after");
      const items = [...document.querySelectorAll('#kv [data-slot="descriptions-item"]')];
      const gap = items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().bottom;
      return {
        label: label - rowText,
        caption: caption - rowText,
        line: after.borderBottomWidth,
        lineStart: first.getBoundingClientRect().left + parseFloat(after.left) - label,
        gap,
      };
    });
    await page.close();
    expect(Math.abs(m.label)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.caption)).toBeLessThanOrEqual(1);
    expect(m.line).toBe("1px");
    expect(Math.abs(m.lineStart)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.gap)).toBeLessThanOrEqual(0.5);
  });

  it("flips the inset under dir=rtl", async () => {
    const page = await fixture.open("", { width: 800, height: 900 });
    const m = await page.evaluate(() => {
      document.documentElement.dir = "rtl";
      const card = document.getElementById("plain")!;
      const row = card.querySelector<HTMLElement>('[data-slot="list-row"]')!;
      const r = row.getBoundingClientRect();
      const after = getComputedStyle(row, "::after");
      const body = row.querySelector('[data-slot="list-row-body"]')!.getBoundingClientRect();
      return {
        start: body.right - (r.left + parseFloat(after.left) + parseFloat(after.width)),
        end: r.left + parseFloat(after.left) - card.getBoundingClientRect().left,
      };
    });
    await page.close();
    expect(Math.abs(m.start)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.end)).toBeLessThanOrEqual(1);
  });
});
