import { describe, expect, it } from "vitest";

import { selectLoadOptionsFor } from "../record-picker";

/**
 * THE SELECT BRANCH SENT A PAGE NUMBER WHERE THE CONTRACT PROMISES A CURSOR (gh#964).
 *
 * `loadOptions` is typed to receive the `nextCursor` the server returned last time — an offset, an
 * opaque token, whatever the server chose. The inline and dialog shapes honoured that. The Select
 * shape (under `threshold`) adapts Select's page-numbered loader, and it passed
 * `cursor: page > 1 ? String(page) : undefined` — so page 2 arrived as the string "2" and the
 * server's `nextCursor` was used only as a has-more flag.
 *
 * A consumer implementing the type as written reads "2" as offset 2 and returns rows 2..N again:
 * duplicated and missing records, silently. godx-task (#210) uses offset cursors and was only
 * spared because ≤10 rows always fit in its first 50-row page — any consumer whose `threshold` is
 * above its page size would hit it. One contract for all three shapes is the fix.
 */

type Row = { value: string; label: string };
const ALL: Row[] = Array.from({ length: 8 }, (_, i) => ({ value: `r${i}`, label: `Row ${i}` }));

/** A server that implements the contract literally: `cursor` is an offset it minted itself. */
function offsetServer(pageSize = 3) {
  const cursors: Array<string | undefined> = [];
  const load = async ({ query, cursor }: { query: string; filters: Record<string, string>; cursor?: string }) => {
    cursors.push(cursor);
    const pool = ALL.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()));
    const offset = cursor ? Number(cursor.replace("offset:", "")) : 0;
    const options = pool.slice(offset, offset + pageSize);
    const next = offset + pageSize < pool.length ? `offset:${offset + pageSize}` : undefined;
    return { options, nextCursor: next };
  };
  return { load, cursors };
}

describe("RecordPicker's Select branch honours the cursor contract (gh#964)", () => {
  it("passes the server's own nextCursor on each following page — not the page number", async () => {
    const { load, cursors } = offsetServer();
    const adapter = selectLoadOptionsFor(load)!;
    await adapter({ query: "", page: 1 });
    await adapter({ query: "", page: 2 });
    await adapter({ query: "", page: 3 });
    // Before the fix: [undefined, "2", "3"].
    expect(cursors).toEqual([undefined, "offset:3", "offset:6"]);
  });

  it("so the rows a user scrolls through are every record once, in order", async () => {
    // The user-visible consequence, stated as what a person would count on screen.
    const { load } = offsetServer();
    const adapter = selectLoadOptionsFor(load)!;
    const seen: string[] = [];
    for (let page = 1; ; page++) {
      const r = await adapter({ query: "", page });
      seen.push(...r.options.map((o) => o.value));
      if (!r.hasMore) break;
    }
    expect(seen).toEqual(ALL.map((r) => r.value));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("hasMore follows the server: no nextCursor means the list is finished", async () => {
    const { load } = offsetServer(3);
    const adapter = selectLoadOptionsFor(load)!;
    expect((await adapter({ query: "", page: 1 })).hasMore).toBe(true);
    expect((await adapter({ query: "", page: 2 })).hasMore).toBe(true);
    expect((await adapter({ query: "", page: 3 })).hasMore).toBe(false); // rows 6,7
  });

  it("a new query starts from the beginning — one query's cursor never leaks into another", async () => {
    const { load, cursors } = offsetServer();
    const adapter = selectLoadOptionsFor(load)!;
    await adapter({ query: "", page: 1 });
    await adapter({ query: "", page: 2 });
    await adapter({ query: "row", page: 1 });
    expect(cursors.at(-1)).toBeUndefined();
  });

  it("interleaved queries keep independent cursors", async () => {
    // A user types, backspaces, types again: Select can ask for page 2 of an EARLIER query after
    // a later one has started. Each query owns its own chain.
    const { load, cursors } = offsetServer();
    const adapter = selectLoadOptionsFor(load)!;
    await adapter({ query: "", page: 1 });
    await adapter({ query: "row", page: 1 });
    await adapter({ query: "", page: 2 });
    expect(cursors).toEqual([undefined, undefined, "offset:3"]);
  });

  it("never invents a cursor for a page it has no nextCursor for", async () => {
    // Asked for page 2 before page 1 answered (or after the server said "no more"): the honest
    // answer is an empty, finished page — not a call with a guessed cursor.
    const { load, cursors } = offsetServer();
    const adapter = selectLoadOptionsFor(load)!;
    const r = await adapter({ query: "", page: 2 });
    expect(r).toEqual({ options: [], hasMore: false });
    expect(cursors).toEqual([]);
  });

  it("with no loadOptions there is no adapter — static options stay static", () => {
    expect(selectLoadOptionsFor(undefined)).toBeUndefined();
  });
});
