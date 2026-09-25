import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { chromium } from "playwright";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Text } from "../typography";

/**
 * `Text break="anywhere"` — a machine identifier may be split to fit (gh#927).
 *
 * The consumer that reported it spelled `className="[overflow-wrap:anywhere] break-words
 * whitespace-normal"` on a `Text` at 25 call sites, every one an email / coupon code / login id in
 * a narrow table cell. The prop they had been told to use, `whitespace="pre-wrap"`, emits
 * `overflow-wrap: break-word`, which does NOT lower min-content — and a table column is sized from
 * min-content. So the geometry half of this file runs in a real engine: jsdom lays nothing out and
 * would pass on either keyword.
 */

const TOKEN = "coupon-code-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxy";

describe("Text — break (attribute contract)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("omits data-break by default and for an explicit `normal`", () => {
    render(
      <>
        <Text>default-id</Text>
        <Text break="normal">normal-id</Text>
      </>,
    );
    expect(screen.getByText("default-id")).not.toHaveAttribute("data-break");
    expect(screen.getByText("normal-id")).not.toHaveAttribute("data-break");
  });

  it('emits data-break="anywhere" and does not touch the whitespace axis', () => {
    render(<Text break="anywhere">{TOKEN}</Text>);
    const text = screen.getByText(TOKEN);
    expect(text).toHaveAttribute("data-break", "anywhere");
    expect(text).not.toHaveAttribute("data-whitespace");
    expect(text).not.toHaveAttribute("break");
  });

  it("composes with whitespace=pre-wrap — two axes, both emitted", () => {
    render(
      <Text whitespace="pre-wrap" break="anywhere">
        {TOKEN}
      </Text>,
    );
    const text = screen.getByText(TOKEN);
    expect(text).toHaveAttribute("data-break", "anywhere");
    expect(text).toHaveAttribute("data-whitespace", "pre-wrap");
  });

  it("truncate wins — one line has nowhere to break to — and warns in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text truncate break="anywhere">
        {TOKEN}
      </Text>,
    );
    const text = screen.getByText(TOKEN);
    expect(text).toHaveAttribute("data-truncate", "");
    expect(text).not.toHaveAttribute("data-break");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('break="anywhere"'));
  });

  it("clamp composes with it, without a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text clamp={2} break="anywhere">
        {TOKEN}
      </Text>,
    );
    const text = screen.getByText(TOKEN);
    expect(text).toHaveAttribute("data-break", "anywhere");
    expect(text).toHaveAttribute("data-clamp", "");
    expect(warn).not.toHaveBeenCalled();
  });
});

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const css = ["src/styles/text-layout.css", "src/styles/table-layout.css"]
  .map(read)
  .join("\n")
  .replace(/@import[^;]+;/g, "");

/** The reporter's fixture: one cell in a `width: 100%` auto-layout table, and a Flex-like row. */
async function measure(markup: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
    await page.setContent(
      `<!doctype html><html><head><style>body{margin:0}${css}</style></head><body>
         <table data-slot="table" style="inline-size:100%;table-layout:auto;border-collapse:collapse">
           <tbody><tr><td data-slot="table-cell">${markup}</td></tr></tbody>
         </table>
       </body></html>`,
    );
    return await page.evaluate(() => ({
      table: document.querySelector("table")!.getBoundingClientRect().width,
      scrollWidth: document.documentElement.scrollWidth,
    }));
  } finally {
    await browser.close();
  }
}

async function measureRow(markup: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
    await page.setContent(
      `<!doctype html><html><head><style>body{margin:0}${css}</style></head><body>
         <div style="display:flex">${markup}</div>
       </body></html>`,
    );
    return await page.evaluate(() => document.documentElement.scrollWidth);
  } finally {
    await browser.close();
  }
}

const html = (node: ReactElement) => renderToStaticMarkup(node);

describe("Text break=anywhere in a table cell at 320px (gh#927)", { timeout: 60_000 }, () => {
  it("the fixture reproduces the defect: an unbroken token holds the table open", async () => {
    const { table, scrollWidth } = await measure(html(<Text size="sm">{TOKEN}</Text>));
    // Without this the rest of the file could pass against a fixture too narrow to overflow.
    expect(table).toBeGreaterThan(320);
    expect(scrollWidth).toBeGreaterThan(320);
  });

  it('whitespace="pre-wrap" does NOT fix it — `break-word` leaves min-content alone', async () => {
    const { table } = await measure(
      html(
        <Text size="sm" whitespace="pre-wrap">
          {TOKEN}
        </Text>,
      ),
    );
    // Pinned so the documentation that sends an id to `break` instead stays true.
    expect(table).toBeGreaterThan(320);
  });

  it('break="anywhere" keeps the document at the viewport — no sideways scroll', async () => {
    const { table, scrollWidth } = await measure(
      html(
        <Text size="sm" break="anywhere">
          {TOKEN}
        </Text>,
      ),
    );
    expect(table).toBeLessThanOrEqual(320);
    expect(scrollWidth).toBe(320);
  });

  it("still breaks when combined with pre-wrap", async () => {
    const { scrollWidth } = await measure(
      html(
        <Text size="sm" whitespace="pre-wrap" break="anywhere">
          {TOKEN}
        </Text>,
      ),
    );
    expect(scrollWidth).toBe(320);
  });

  it("breaks as a flex item too (the gh#838 shape)", async () => {
    const scrollWidth = await measureRow(
      html(
        <Text as="div" size="sm" break="anywhere">
          {TOKEN}
        </Text>,
      ),
    );
    expect(scrollWidth).toBe(320);
  });
});
