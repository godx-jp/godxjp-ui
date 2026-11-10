import type { Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * GDX-1481 in Chromium, against the real stylesheet: a CardHeader with CardTitle, CardDescription
 * and CardAction put the action on a line of its own under the description, because only the
 * toolbar header (no description) was laid out as a row. The action belongs beside the title
 * (top, inline end), with the description under the title — at a phone width and a desktop one,
 * banded or not.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./src/components/data-display/card";
import { Button } from "./src/components/general/button";
const card = (id, banded) => (
  <Card key={id} data-case={id}>
    <CardHeader banded={banded}>
      <CardTitle>Knowledge</CardTitle>
      <CardDescription>Notes, decisions and runbooks the team keeps for this project.</CardDescription>
      <CardAction><Button size="sm">New page</Button></CardAction>
    </CardHeader>
    <CardContent>Body</CardContent>
  </Card>
);
createRoot(document.getElementById("root")).render(
  <div style={{ display: "grid", gap: 16, padding: 16 }}>{[card("plain", false), card("banded", true)]}</div>,
);
`;

let fixture: ChromiumFixture;
let page: Page;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const geometry = (id: string) =>
  page.$eval(`[data-case="${id}"]`, (card) => {
    const box = (sel: string) => card.querySelector(sel)!.getBoundingClientRect();
    const header = box('[data-slot="card-header"]');
    const title = box('[data-slot="card-title"]');
    const desc = box('[data-slot="card-description"]');
    const action = box('[data-slot="card-action"]');
    return {
      headerRight: header.right,
      paddingRight: parseFloat(
        getComputedStyle(card.querySelector('[data-slot="card-header"]')!).paddingRight,
      ),
      title: { top: title.top, right: title.right, bottom: title.bottom },
      desc: { top: desc.top, right: desc.right },
      action: { top: action.top, left: action.left, right: action.right, bottom: action.bottom },
    };
  });

describe("CardHeader with a description keeps its action beside the title (GDX-1481)", () => {
  for (const width of [390, 1280]) {
    for (const id of ["plain", "banded"]) {
      it(`${id} at ${width}px`, async () => {
        page = await fixture.open("", { width, height: 800 });
        const g = await geometry(id);
        // Beside the title: the action starts above the title's bottom edge, not under the description.
        expect(g.action.top).toBeLessThan(g.title.bottom);
        expect(g.action.bottom).toBeLessThanOrEqual(g.desc.top + 40);
        // At the inline end of the header's content box.
        expect(Math.abs(g.headerRight - g.paddingRight - g.action.right)).toBeLessThanOrEqual(1);
        // Title and description stay left of the action, the description under the title.
        expect(g.title.right).toBeLessThanOrEqual(g.action.left);
        expect(g.desc.right).toBeLessThanOrEqual(g.action.left);
        expect(g.desc.top).toBeGreaterThanOrEqual(g.title.bottom - 1);
      });
    }
  }
});
