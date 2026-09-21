import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";

import { ListRow } from "../../data-display/list-row";
import { Flex } from "../flex";

/**
 * `marker` — a list that is SEMANTIC ONLY (gh#714).
 *
 * `as="ul"` emitted `data-list="disc"` unconditionally, and the layer answers it with a bullet, a
 * `--space-5` indent and `.ui-flex[data-list] > li { display: list-item }` — which outranks
 * `[data-slot="list-row"] { display: flex }` (0,2,1 vs 0,1,0). So the catalog's own idiom,
 * `<ListRow as="li">` inside a list, fell out of flex layout: measured in Chromium on
 * /isolate/layout-flex, each row was 94.58px tall (title, description and the trailing Button on
 * three stacked lines) where the row is 69.98px once the attribute is gone. The move left was a
 * RAW `<ul>`, which carries no gap token and which the consumer rules forbid in spirit.
 *
 * jsdom does no layout, so this pins the two halves the browser measurement rests on: the
 * attribute the component emits, and the stylesheet rules keyed on it.
 */
describe("Flex marker axis", () => {
  it("keeps the bulleted default, so existing lists are unchanged", () => {
    const { container: ul } = render(<Flex as="ul">items</Flex>);
    const { container: ol } = render(<Flex as="ol">items</Flex>);

    expect(ul.querySelector(".ui-flex")).toHaveAttribute("data-list", "disc");
    expect(ol.querySelector(".ui-flex")).toHaveAttribute("data-list", "decimal");
  });

  it('marker="none" drops the attribute entirely, and keeps the element and the gap', () => {
    const { container } = render(
      <Flex as="ul" marker="none" direction="col" gap="sm">
        items
      </Flex>,
    );
    const flex = container.querySelector(".ui-flex")!;

    // ABSENT, not `data-list="none"`: every marker rule is keyed on the attribute's PRESENCE,
    // including the indent, so a value would still indent the list.
    expect(flex).not.toHaveAttribute("data-list");
    expect(flex.tagName).toBe("UL");
    expect(flex).toHaveClass("ui-flex-gap-sm");
  });

  it("lets a list choose the other marker without a list-style-type in a className", () => {
    const { container: ul } = render(
      <Flex as="ul" marker="decimal">
        steps
      </Flex>,
    );
    const { container: ol } = render(
      <Flex as="ol" marker="disc">
        steps
      </Flex>,
    );

    expect(ul.querySelector(".ui-flex")).toHaveAttribute("data-list", "decimal");
    expect(ol.querySelector(".ui-flex")).toHaveAttribute("data-list", "disc");
  });

  it("ignores the marker on a tag that is not a list", () => {
    const { container } = render(
      <Flex as="div" marker="none">
        row
      </Flex>,
    );

    expect(container.querySelector(".ui-flex")).not.toHaveAttribute("data-list");
  });

  /**
   * The divider is `[data-slot="list-row"]:not(:last-child)`, so it needs the rows to be SIBLINGS.
   * An N-row list draws N-1 of them — the defect this fixes for the consumer was a list whose every
   * row sat in a wrapper of its own, where `:not(:last-child)` never matched and every divider
   * silently disappeared.
   */
  it("gives ListRow as=li a valid home: sibling rows, N-1 dividers", () => {
    const { container } = render(
      <Flex as="ul" marker="none" direction="col" gap="none">
        <ListRow as="li" title="二要素認証" />
        <ListRow as="li" title="パスキー" />
        <ListRow as="li" title="回復コード" />
      </Flex>,
    );
    const rows = [...container.querySelectorAll('li[data-slot="list-row"]')];

    expect(rows).toHaveLength(3);
    expect(
      rows.filter((row) => row.matches('[data-slot="list-row"]:not(:last-child)')),
    ).toHaveLength(2);
  });

  /** The same list, made of LINKS: `as` + `asChild` puts the row in an item that owns the divider. */
  it("gives the link form the same home, with the item carrying the divider", () => {
    const { container } = render(
      <Flex as="ul" marker="none" direction="col" gap="none">
        <ListRow as="li" asChild title="ロール">
          <a href="?section=roles" />
        </ListRow>
        <ListRow as="li" asChild title="メンバー">
          <a href="?section=members" />
        </ListRow>
      </Flex>,
    );
    const items = [...container.querySelectorAll('li[data-slot="list-row-item"]')];

    expect(items).toHaveLength(2);
    expect(items[0]!.querySelector('a[data-slot="list-row"]')).not.toBeNull();
    expect(
      items.filter((item) => item.matches('[data-slot="list-row-item"]:not(:last-child)')),
    ).toHaveLength(1);
  });

  /**
   * Read from the stylesheet: every marker declaration is scoped to `[data-list]`, which is what
   * makes an absent attribute equal to "no bullet, no indent, no display override" instead of
   * needing a second rule to undo them. The indent is the LOGICAL property, so an RTL list indents
   * on the right (measured: 20px padding-right under dir="rtl", 0 either side with marker="none").
   */
  it("the stylesheet keys the bullet, the indent AND the display override on data-list", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");
    const scoped = css.match(/\.ui-flex\[data-list[^{]*\{[^}]*\}/g) ?? [];

    expect(scoped.join("\n")).toMatch(/padding-inline-start:\s*var\(\s*--space-5\)/);
    expect(scoped.join("\n")).toMatch(/list-style-type:\s*disc/);
    expect(scoped.some((rule) => /> li\b/.test(rule) && /display:\s*list-item/.test(rule))).toBe(
      true,
    );
    // Nothing outside `[data-list]` may re-introduce a marker, or `marker="none"` would be a lie.
    expect(css).not.toMatch(/\.ui-flex(?!\[data-list)[^{]*\{[^}]*list-style-type/);
  });
});
