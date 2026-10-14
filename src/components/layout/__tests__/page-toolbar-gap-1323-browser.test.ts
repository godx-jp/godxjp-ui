import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1323 in Chromium, against the real stylesheet: the toolbar band cancels the container's
 * `--page-band-gap` with a negative margin (so a painted, ruled band attaches to the header and the
 * body — 669c99da), but its inset defaulted to 0, so a plain `Segmented` filter strip touched the
 * header and the body: 0px on both sides. The strip's CONTENT must sit one band gap from each; a
 * painted band's BOX must stay attached.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { PageContainer } from "./src/components/layout/page-container";
import { Segmented } from "./src/components/data-entry/segmented";
import { Card, CardContent } from "./src/components/data-display/card";
const kind = new URLSearchParams(location.search).get("kind");
const PAINTED = {
  "--page-toolbar-background": "hsl(var(--card))",
  "--page-toolbar-pad-block": "var(--space-2)",
  "--page-toolbar-divider": "1px solid hsl(var(--border))",
};
const page = (
  <PageContainer variant={kind === "ghost" ? "ghost" : "default"} title="Lots"
    toolbar={<Segmented aria-label="Status" defaultValue="all"
      options={[{ value: "all", label: "All" }, { value: "open", label: "Open" }]} />}>
    <Card><CardContent>Body</CardContent></Card>
  </PageContainer>
);
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="ready" style={kind === "painted" ? PAINTED : undefined}>{page}</div>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

async function gaps(kind: string) {
  const page = await fixture.open(`?kind=${kind}`, { width: 1440, height: 900 });
  const g = await page.evaluate(() => {
    const rect = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    const header = rect(".ui-page-header");
    const band = rect(".ui-page-toolbar");
    const strip = rect(".ui-page-toolbar > *");
    const body = rect(".ui-page-body");
    return {
      bandGap: parseFloat(getComputedStyle(document.querySelector(".ui-page-container")!).rowGap),
      headerToStrip: Math.round(strip.top - header.bottom),
      stripToBody: Math.round(body.top - strip.bottom),
      headerToBand: Math.round(band.top - header.bottom),
      bandToBody: Math.round(body.top - band.bottom),
    };
  });
  await page.close();
  return g;
}

describe("PageContainer toolbar spacing (gh#1323)", { timeout: 60_000 }, () => {
  it("a plain filter strip sits one band gap from the header and from the body", async () => {
    const g = await gaps("default");
    expect(g.bandGap).toBeGreaterThan(0);
    expect(g.headerToStrip).toBe(g.bandGap);
    expect(g.stripToBody).toBe(g.bandGap);
  });

  it("follows the ghost variant's band gap", async () => {
    const g = await gaps("ghost");
    expect(g.headerToStrip).toBe(g.bandGap);
    expect(g.stripToBody).toBe(g.bandGap);
  });

  it("a painted, ruled band stays attached — its box touches both, its inset comes from the theme", async () => {
    const g = await gaps("painted");
    expect(g.headerToBand).toBe(0);
    expect(g.bandToBody).toBe(0);
    expect(g.headerToStrip).toBeGreaterThan(0);
    expect(g.headerToStrip).toBeLessThan(g.bandGap);
  });
});
