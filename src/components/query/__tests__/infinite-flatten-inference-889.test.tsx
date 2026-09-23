import { describe, expect, expectTypeOf, it } from "vitest";

import { InfiniteQueryState, flattenItemPages } from "../infinite-query-state";
import type { InfiniteQueryStateProp } from "../../../props/components/query.prop";

/**
 * `flatten={flattenItemPages}` HANDED BACK `unknown` (gh#889).
 *
 * Found by the catalog compile gate, which the InfiniteQueryState example only passed because it was
 * written `flatten={flattenItemPages as any}` with `isEmpty={(it: any)}` and `{(items: any) =>`.
 * Three independent inference failures stacked up behind that cast:
 *
 *   1. `InfiniteQueryLike<TPage>` was `Pick<UseInfiniteQueryResult<InfiniteData<TPage>, …>, …>`.
 *      TPage sits under a mapped type over a generic instantiation, and inference does not run
 *      backwards through a mapped type — so `query={q}` gave `TPage = unknown` for a fully typed q.
 *   2. `flattenItemPages<TItem, TPage extends { items: TItem[] }>` put TItem in nothing but ANOTHER
 *      parameter's CONSTRAINT. A constraint is not an inference site, so TItem never resolved.
 *   3. `TFlat` appears only in `flatten`'s RETURN. Handed a generic function by reference, the
 *      source signature is uninstantiated and yields no candidate at all, so TFlat fell to
 *      `unknown` even once 1 and 2 were fixed.
 *
 * TYPE-LEVEL ASSERTIONS ARE THE POINT HERE, not a runtime behaviour: every one of the three was
 * invisible at runtime — `flatMap` returned the right array the whole time — and visible only to a
 * consumer's compiler, as `unknown` on `it`, `items` and every field of them. `expectTypeOf` fails
 * the `vitest --typecheck` run and `pnpm typecheck` alike, which is where a defect of this shape
 * has to be caught. The runtime cases below only hold the flatten contract itself.
 */
type Activity = { id: string; label: string };
type ActivityPage = { items: Activity[]; cursor?: string };

describe("flattenItemPages / InfiniteQueryState — inference (gh#889)", () => {
  it("infers the item type from the page shape, passed BY REFERENCE", () => {
    // Defect 2: this was `unknown[]`, because TItem lived only in TPage's constraint.
    expectTypeOf(flattenItemPages<Activity>).returns.toEqualTypeOf<Activity[]>();
    const flat = flattenItemPages({ pages: [] as ActivityPage[] });
    expectTypeOf(flat).toEqualTypeOf<Activity[]>();
  });

  it("recovers TPage from `query`, which a bare `Pick` made impossible", () => {
    // Defect 1: `query` is the ONLY place the page type enters, so if it cannot be read back out
    // of `data` nothing downstream can be typed.
    type Props = InfiniteQueryStateProp<ActivityPage>;
    expectTypeOf<Props["query"]["data"]>().not.toBeUnknown();
    expectTypeOf<NonNullable<Props["query"]["data"]>["pages"]>().toEqualTypeOf<ActivityPage[]>();
  });

  it("defaults TFlat to the flattened page, so `children` and `isEmpty` are not `unknown`", () => {
    // Defect 3: both of these were `(x: unknown)`.
    type Props = InfiniteQueryStateProp<ActivityPage>;
    expectTypeOf<Props["children"]>().parameter(0).toEqualTypeOf<Activity[]>();
    expectTypeOf<NonNullable<Props["isEmpty"]>>().parameter(0).toEqualTypeOf<Activity[]>();
  });

  it("still lets an explicit TFlat win, so a custom flatten is unaffected", () => {
    type RowPage = { rows: { n: number }[] };
    type Props = InfiniteQueryStateProp<RowPage, { n: number }[]>;
    expectTypeOf<Props["children"]>().parameter(0).toEqualTypeOf<{ n: number }[]>();
    // A page with no `items` and no explicit TFlat has nothing to flatten TO — the default's
    // false branch is `unknown`, which is honest rather than a wrong guess.
    expectTypeOf<InfiniteQueryStateProp<RowPage>["children"]>().parameter(0).toBeUnknown();
  });

  it("is still generic over the component itself, not just the prop type", () => {
    expectTypeOf(InfiniteQueryState<ActivityPage>)
      .parameter(0)
      .toHaveProperty("children")
      .parameter(0)
      .toEqualTypeOf<Activity[]>();
  });

  it("flattens pages in order and treats undefined as empty", () => {
    expect(flattenItemPages(undefined)).toEqual([]);
    expect(
      flattenItemPages({
        pages: [
          { items: [{ id: "a", label: "A" }], cursor: "1" },
          { items: [{ id: "b", label: "B" }] },
        ] as ActivityPage[],
      }),
    ).toEqual([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ]);
  });
});
