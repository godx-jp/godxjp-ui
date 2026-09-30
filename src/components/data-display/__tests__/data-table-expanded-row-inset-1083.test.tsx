import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Page } from "playwright";

import { AppProvider } from "../../../app/app-provider";
import { Text } from "../../general/typography";
import { DataTable, type ColumnDef } from "../data-table";

/**
 * gh#1083 — the expanded row's cell was `flush` and kept the table cell's `nowrap`: the detail sat
 * against the table edges, and every line of it stayed on one line (an Alert pushed the table
 * 79px wide). antd pads `.ant-table-expanded-row > td` like any cell and lets it wrap. Now the
 * cell is inset by the cell padding (token `--table-row-expanded-padding`), wraps, and
 * `expandable.flush` restores the edge-to-edge detail. Separately, an explicit
 * `Text whitespace="normal"` releases an inherited `nowrap`. jsdom does not lay out: Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/components/flex.css",
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/table.css",
  "src/styles/control.css",
  "src/styles/layout.css",
  "src/styles/table-layout.css",
  "src/styles/text-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

type Row = { id: string; name: string };
const data: Row[] = [{ id: "a", name: "田中" }];
const columns: ColumnDef<Row>[] = [
  { key: "name", header: "名前" },
  { key: "id", header: "ID" },
];
const LONG =
  "この明細は長い説明文です。表のセルの nowrap を受け継ぐと一行のまま表の幅を押し広げてしまうので、展開行ではふつうの段落として折り返す必要があります。";

const table = (id: string, flush?: boolean) => (
  <div id={id}>
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      expandable={{
        defaultExpandAllRows: true,
        flush,
        expandedRowRender: () => <p data-detail="">{LONG}</p>,
      }}
    />
  </div>
);

const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
    {table("padded")}
    {table("flush", true)}
    <table id="plain">
      <tbody>
        <tr>
          <td data-slot="table-cell">
            <Text whitespace="normal">{LONG}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  </AppProvider>,
);

async function measure(page: Page) {
  return page.evaluate(() => {
    const read = (id: string) => {
      const root = document.getElementById(id)!;
      const detailCell = root.querySelector<HTMLElement>("[data-expanded-row] > td")!;
      const bodyCell = root.querySelector<HTMLElement>(
        "tbody tr:not([data-expanded-row]) td:last-child",
      )!;
      const detail = root.querySelector<HTMLElement>("[data-detail]")!;
      const cs = getComputedStyle(detailCell);
      const body = getComputedStyle(bodyCell);
      const cellBox = detailCell.getBoundingClientRect();
      const detailBox = detail.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(detail).lineHeight);
      const scroller = root.querySelector<HTMLElement>(".ui-data-table-scroll") ?? root;
      return {
        padInlineStart: parseFloat(cs.paddingInlineStart),
        padBlockStart: parseFloat(cs.paddingBlockStart),
        bodyPadInlineEnd: parseFloat(body.paddingInlineEnd),
        bodyPadBlockStart: parseFloat(body.paddingBlockStart),
        insetStart: detailBox.left - cellBox.left,
        whiteSpace: cs.whiteSpace,
        lines: Math.round(detailBox.height / lineHeight),
        overflow: scroller.scrollWidth - scroller.clientWidth,
      };
    };
    const plain = document.querySelector<HTMLElement>("#plain [data-slot='text']")!;
    return {
      padded: read("padded"),
      flush: read("flush"),
      plainText: {
        whiteSpace: getComputedStyle(plain).whiteSpace,
        attr: plain.getAttribute("data-whitespace"),
      },
    };
  });
}

describe("DataTable expanded row: inset and wrapping (Chromium, gh#1083)", () => {
  it("pads and wraps the detail by default, stays edge-to-edge with expandable.flush", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 640, height: 800 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}
          body { margin: 0; }
          [data-detail] { margin: 0; }
          #plain { inline-size: 320px; table-layout: fixed; }
        </style></head><body>${markup}</body></html>`,
      );
      const m = await measure(page);

      // Default: the cell's own padding, the same as a body cell (so it follows density).
      expect(m.padded.padInlineStart).toBeGreaterThan(0);
      expect(m.padded.padInlineStart).toBe(m.padded.bodyPadInlineEnd);
      expect(m.padded.padBlockStart).toBe(m.padded.bodyPadBlockStart);
      expect(m.padded.insetStart).toBe(m.padded.padInlineStart);
      // It wraps instead of widening the table.
      expect(m.padded.whiteSpace).toBe("normal");
      expect(m.padded.lines).toBeGreaterThan(1);
      expect(m.padded.overflow).toBeLessThanOrEqual(1);

      // `expandable.flush`: no inset, still wraps.
      expect(m.flush.padInlineStart).toBe(0);
      expect(m.flush.padBlockStart).toBe(0);
      expect(m.flush.insetStart).toBe(0);
      expect(m.flush.whiteSpace).toBe("normal");
      expect(m.flush.overflow).toBeLessThanOrEqual(1);

      // An explicit `whitespace="normal"` releases the cell's inherited nowrap.
      expect(m.plainText.attr).toBe("normal");
      expect(m.plainText.whiteSpace).toBe("normal");
    } finally {
      await browser.close();
    }
  });

  it("the token retunes the inset", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 640, height: 800 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}
          body { margin: 0; }
          :root { --table-row-expanded-padding: 5px 7px; }
        </style></head><body>${markup}</body></html>`,
      );
      const m = await measure(page);
      expect(m.padded.padInlineStart).toBe(7);
      expect(m.padded.padBlockStart).toBe(5);
      expect(m.flush.padInlineStart).toBe(0);
    } finally {
      await browser.close();
    }
  });
});
