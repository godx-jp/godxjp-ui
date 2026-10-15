import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1325 in Chromium, against the real stylesheet: a padded CardContent drops a ListRow's inline
 * inset so the row text lines up with the CardTitle (gh#1257), but only for a DIRECT child or a
 * `ul > row`. The common shape `CardContent > DataState wrapper > Flex as="ul" > ListRow as="li"
 * asChild > Link` kept its 16px inset. Rows inside a nested flush CardContent or a table cell keep
 * theirs on purpose: there the row's own inset is the alignment.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardHeader, CardTitle, CardContent } from "./src/components/data-display/card";
import { ListRow } from "./src/components/data-display/list-row";
import { Table, TableBody, TableRow, TableCell } from "./src/components/data-display/table";
import { DataState } from "./src/components/query/data-state";
import { Flex } from "./src/components/layout/flex";
const query = { isPending: false, isError: false, isFetching: false, fetchStatus: "idle", data: [1, 2] };
const Head = ({ children }) => <CardHeader><CardTitle>{children}</CardTitle></CardHeader>;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <Card id="issue"><Head>Recent</Head><CardContent>
      <DataState query={query}>{(rows) => (
        <div><Flex as="ul" marker="none" direction="col" gap="none">{rows.map((n) => (
          <ListRow key={n} as="li" asChild title={"Lot " + n}><a href="#">open</a></ListRow>
        ))}</Flex></div>
      )}</DataState>
    </CardContent></Card>
    <Card id="direct"><Head>Direct</Head><CardContent><ListRow title="Direct row" /></CardContent></Card>
    <Card id="ul"><Head>List</Head><CardContent>
      <Flex as="ul" marker="none" direction="col" gap="none"><ListRow as="li" title="List row" /></Flex>
    </CardContent></Card>
    <Card id="flush"><Head>Flush</Head><CardContent flush><ListRow title="Flush row" /></CardContent></Card>
    <Card id="nested"><Head>Nested</Head><CardContent>
      <Card><CardContent flush><ListRow title="Nested flush row" /></CardContent></Card>
    </CardContent></Card>
    <Card id="cell"><Head>Cell</Head><CardContent>
      <Table><TableBody><TableRow><TableCell><ListRow title="Cell row" /></TableCell></TableRow></TableBody></Table>
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

describe("ListRow inset under a padded CardContent (gh#1325)", { timeout: 60_000 }, () => {
  it("row text lines up with the CardTitle ±1px — wrapped, list-item and direct shapes", async () => {
    const page = await fixture.open("", { width: 1440, height: 900 });
    const offset = await page.evaluate(() =>
      Object.fromEntries(
        ["issue", "direct", "ul", "flush", "nested", "cell"].map((id) => {
          const card = document.getElementById(id)!;
          const title = card.querySelector('[data-slot="card-title"]')!.getBoundingClientRect();
          const rows = [...card.querySelectorAll('[data-slot="list-row-body"]')];
          return [id, rows.map((r) => r.getBoundingClientRect().left - title.left)];
        }),
      ),
    );
    await page.close();
    expect(offset.issue).toHaveLength(2);
    for (const id of ["issue", "direct", "ul", "flush"]) {
      for (const dx of offset[id]!) expect(Math.abs(dx), `${id}: ${dx}px`).toBeLessThanOrEqual(1);
    }
    // The row's own inset is intended here, and must survive the descendant match.
    expect(offset.nested![0]).toBeGreaterThan(1);
    expect(offset.cell![0]).toBeGreaterThan(1);
  });
});
