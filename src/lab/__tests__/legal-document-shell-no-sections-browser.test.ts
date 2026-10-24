import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../test/chromium-fixture";

/**
 * LegalDocumentShell with `sections={[]}` and no `documentNavigation` reserved the contents rail
 * anyway: at 1280 a 240px track + 40px gap pushed the title to x=312 (not x=32), and at 390 an
 * empty "On this page" caption printed above the text. With nothing to list there is no contents
 * nav and no rail track; one or more sections keep the rail exactly as before. The article's
 * measure, metadata and h1 scale do not change with the section count.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { LegalDocumentShell } from "./src/lab/legal-document-shell";
const count = Number(new URLSearchParams(location.search).get("count") ?? "0");
const sections = Array.from({ length: count }, (_, i) => ({
  id: "s" + i,
  title: "Section " + (i + 1),
  content: <p>Body text for section {i + 1}.</p>,
}));
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <LegalDocumentShell title="Terms of service" version="3" effectiveDate="2026-04-01" sections={sections} />
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

async function read(count: number, width: number) {
  const page = await fixture.open(`?count=${count}`, { width, height: 900 });
  const m = await page.evaluate(() => {
    const scope = document.querySelector(".ui-legal-document-scope")!;
    const header = document.querySelector(".ui-legal-document-header")!;
    const h1 = header.querySelector("h1")!;
    const meta = document.querySelector(".ui-legal-document-meta")!;
    const cs = getComputedStyle(scope);
    return {
      contentStart: scope.getBoundingClientRect().x + parseFloat(cs.paddingInlineStart),
      titleX: h1.getBoundingClientRect().x,
      headerMaxWidth: getComputedStyle(header).maxWidth,
      h1Size: getComputedStyle(h1).fontSize,
      metaSize: getComputedStyle(meta).fontSize,
      rail: document.querySelectorAll(".ui-legal-document-rail").length,
      toc: document.querySelectorAll(".ui-legal-document-toc").length,
      caption: document.querySelectorAll(".ui-legal-document-toc-title").length,
      links: document.querySelectorAll(".ui-legal-document-toc-link").length,
    };
  });
  await page.close();
  return m;
}

describe("LegalDocumentShell rail vs section count (Chromium)", { timeout: 60_000 }, () => {
  it.each([1280, 390])(
    "0 sections at %ipx: no rail, no caption, title at the content start",
    async (width) => {
      const m = await read(0, width);
      expect(m.rail).toBe(0);
      expect(m.toc).toBe(0);
      expect(m.caption).toBe(0);
      expect(Math.abs(m.titleX - m.contentStart)).toBeLessThanOrEqual(0.5);
    },
  );

  it.each([1, 3])("%i section(s): the contents rail is kept", async (count) => {
    for (const width of [1280, 390]) {
      const m = await read(count, width);
      expect(m.rail).toBe(1);
      expect(m.caption).toBe(1);
      expect(m.links).toBe(count);
    }
    // Pinned beside the document at 1280 — the title sits past the rail track + gap.
    const desk = await read(count, 1280);
    expect(desk.titleX - desk.contentStart).toBeGreaterThan(200);
    // Stacked at 390 — the title is at the content start.
    const phone = await read(count, 390);
    expect(Math.abs(phone.titleX - phone.contentStart)).toBeLessThanOrEqual(0.5);
  });

  it.each([1280, 390])(
    "measure, metadata and h1 scale are identical for 0, 1 and 3 sections at %ipx",
    async (width) => {
      const rows = await Promise.all([0, 1, 3].map((count) => read(count, width)));
      const pick = (m: (typeof rows)[number]) => [m.headerMaxWidth, m.h1Size, m.metaSize];
      expect(pick(rows[0]!)).toEqual(pick(rows[1]!));
      expect(pick(rows[0]!)).toEqual(pick(rows[2]!));
    },
  );
});
