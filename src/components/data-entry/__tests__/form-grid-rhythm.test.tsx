import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardContent } from "../../data-display/card";
import { ResponsiveGrid } from "../../layout/responsive-grid";
import { Form } from "../form";
import { FormField } from "../form-field";
import { Input } from "../input";

/**
 * REGRESSION GUARD — gh#304. `<Form columns={n}>` lays its fields out as ResponsiveGrid ITEMS, and
 * the gh#295 field rhythm (`.ui-form-field + .ui-form-field { margin-block-start: … }`) reached
 * them too. Inside a grid a per-item margin is a spacing mechanism fighting a layout mechanism:
 *
 *   · the FIRST item of row 1 has no preceding sibling, so it takes no margin while its row-mates
 *     take the full one — row 1's columns start at different y positions (measured 0 vs +12px);
 *   · every track then carries the margin ON TOP of the grid's own gap — the row pitch inflated
 *     from a 73px stack to 89px.
 *
 * Zeroing the margin on grid items is only half the fix: it hands the rhythm to the grid, and
 * ResponsiveGrid's gap is a GENERIC 16px stack gap, not the form's 12px field rhythm. So a
 * `columns={1}` form — and any `columns={n}` form on a container narrow enough to collapse to one
 * column, i.e. every phone — spaced its rows 16px apart where the identical fields WITHOUT
 * `columns` sat 12px apart. Both halves are asserted below.
 *
 * WHY THIS TEST IS SHAPED LIKE THIS. jsdom applies NO author cascade to `getComputedStyle` (it
 * returns `0` / `normal` for every rule here — verified) and does no layout at all, so neither a
 * computed-style read nor a bounding-box read can see this bug. What it CAN do is match selectors
 * against the real DOM the components emit. So: render the real `<Form>`/`<FormField>`, parse the
 * shipped stylesheets, and resolve the winning declaration per element by real `Element.matches()`
 * plus specificity/source order. That catches a DOM change (a wrapper element between Form and its
 * grid) as well as a CSS change, which a `toContain` over the stylesheet text never would.
 *
 * The pixel numbers quoted above come from measuring this exact markup in headless Chromium; the
 * assertions here are the mechanism that produces them.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

/** Stylesheets in the order src/styles/index.css imports them (source order breaks specificity ties). */
const SHEETS = ["src/styles/layout.css", "src/styles/form-layout.css"] as const;

interface Rule {
  selector: string;
  body: string;
  order: number;
}

/**
 * Top-level rules inside `@layer components { … }`.
 *
 * Nested conditional groups (`@media` / `@container`) are deliberately skipped: they are not
 * unconditionally in effect, and none of them declares `margin-block-start` or `row-gap` for the
 * elements under test (the container queries only set `grid-template-columns`, the media blocks
 * only style horizontal-layout fields). Including them would fake matches that a browser would
 * only apply at some widths.
 */
function parseRules(css: string): Omit<Rule, "order">[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Omit<Rule, "order">[] = [];
  const walk = (text: string) => {
    let i = 0;
    for (;;) {
      const open = text.indexOf("{", i);
      if (open === -1) return;
      const prelude = text.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") depth -= 1;
        j += 1;
      }
      const body = text.slice(open + 1, j - 1);
      if (prelude.startsWith("@layer")) walk(body);
      else if (!prelude.startsWith("@")) out.push({ selector: prelude, body });
      i = j;
    }
  };
  walk(src);
  return out;
}

const RULES: Rule[] = SHEETS.flatMap((sheet) => parseRules(read(sheet))).map((rule, order) => ({
  ...rule,
  order,
}));

/**
 * Selector specificity as a single comparable number. The selectors under test are built from
 * classes, attributes, combinators and the matches-any pseudo-classes — no ids, no element names —
 * so counting the class-tier simple selectors is exact for them.
 *
 * `:is()` / `:has()` / `:not()` contribute the specificity of their ARGUMENTS, not of themselves,
 * so the function name is dropped and the inside is counted normally (an approximation only in
 * that a list takes its most specific argument rather than all of them — none of the selectors
 * here uses an uneven list). `:where()` contributes nothing and is removed whole.
 */
function specificity(selector: string): number {
  const normalised = selector.replace(/:where\([^)]*\)/g, "").replace(/:(?:is|has|not)\(/g, "(");
  const attrs = (normalised.match(/\[[^\]]*\]/g) ?? []).length;
  const classes = (normalised.match(/\.[\w-]+/g) ?? []).length;
  const pseudoClasses = (normalised.match(/(?<!:):[a-z-]+/g) ?? []).length;
  return attrs + classes + pseudoClasses;
}

/** Split a selector LIST on its top-level commas — never on one inside `:is(…)` or `[…]`. */
function splitSelectorList(selector: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of selector) {
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((one) => one.trim().replace(/\s+/g, " ")).filter(Boolean);
}

/** The declaration that actually WINS for `property` on `el`: highest specificity, then latest. */
function winning(el: Element, property: string): string | undefined {
  let best: { value: string; spec: number; order: number } | undefined;
  for (const rule of RULES) {
    // Every selector in the list must be tried separately — `matches()` on a comma list would
    // report a hit for a sibling selector the element does not actually match.
    if (!splitSelectorList(rule.selector).some((one) => el.matches(one))) continue;
    const decl = rule.body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`));
    if (!decl) continue;
    const spec = specificity(rule.selector);
    if (!best || spec > best.spec || (spec === best.spec && rule.order > best.order)) {
      best = { value: decl[1].trim(), spec, order: rule.order };
    }
  }
  return best?.value;
}

/** `:root` custom properties declared across the token tiers this fix touches. */
const TOKENS = new Map<string, string>();
for (const file of ["src/tokens/components/form.css", "src/tokens/semantic/layout.css"]) {
  for (const m of read(file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
    TOKENS.set(m[1], m[2].trim());
  }
}

/** Follow a `var(--a)` chain down to the primitive it bottoms out at, e.g. `--space-3`. */
function terminus(value: string): string {
  let current = value;
  for (let hops = 0; hops < 10; hops += 1) {
    const name = current.match(/^var\((--[\w-]+)\)$/)?.[1];
    if (!name) return current;
    const next = TOKENS.get(name);
    if (next === undefined) return name;
    current = next;
  }
  throw new Error(`--var chain did not terminate: ${value}`);
}

const fields = (n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => (
    <FormField key={i} id={`f${offset + i}`} label={`Label ${offset + i}`}>
      <Input />
    </FormField>
  ));

const COLUMN_COUNTS = [1, 2, 3, 4] as const;

describe("Form columns={n} — the row rhythm must not leak into the grid (gh#304)", () => {
  it.each(COLUMN_COUNTS)(
    "columns=%i: NO grid item carries a row-rhythm margin, so row 1's columns start level",
    (columns) => {
      const { container } = render(<Form columns={columns}>{fields(columns * 2)}</Form>);
      const grid = container.querySelector(".ui-responsive-grid");
      expect(grid).not.toBeNull();

      const items = [...grid!.children];
      expect(items).toHaveLength(columns * 2);
      for (const item of items) {
        expect(item).toHaveClass("ui-form-field");
        // `undefined` (no rule matches) and `0` are both "no margin"; anything else re-opens gh#304
        // for the item that has no preceding sibling but shares row 1 with items that do.
        expect(winning(item, "margin-block-start") ?? "0").toBe("0");
      }
    },
  );

  it.each(COLUMN_COUNTS)(
    "columns=%i: the rhythm rides the grid's own row-gap, and it is the FORM's rhythm not ResponsiveGrid's generic stack gap",
    (columns) => {
      const { container } = render(<Form columns={columns}>{fields(columns * 2)}</Form>);
      const grid = container.querySelector(".ui-responsive-grid")!;

      expect(winning(grid, "row-gap")).toBe("var(--form-grid-row-gap)");
      // The generic `.ui-responsive-grid { gap: var(--space-stack-md) }` is still there and still
      // out-ranked — that is what made every collapsed-to-one-column form 16px instead of 12px.
      expect(winning(grid, "gap")).toBe("var(--space-stack-md)");
      expect(terminus("var(--form-grid-row-gap)")).not.toBe(terminus("var(--space-stack-md)"));
    },
  );

  it("resolves to the SAME primitive as the stacked path, so columns={1} is identical to no columns", () => {
    const stacked = render(<Form>{fields(3)}</Form>);
    const second = [...stacked.container.querySelectorAll(".ui-form-field")][1];
    const marginRhythm = winning(second, "margin-block-start");
    expect(marginRhythm).toBe("var(--form-field-row-gap)");

    const gridded = render(<Form columns={1}>{fields(3, 10)}</Form>);
    const gridRhythm = winning(gridded.container.querySelector(".ui-responsive-grid")!, "row-gap");

    // Not "both are 12px" — both bottom out at the SAME token, so a service retuning
    // --form-field-row-gap moves the stacked and the grid path together and they cannot drift.
    expect(terminus(gridRhythm!)).toBe(terminus(marginRhythm!));
    expect(terminus(gridRhythm!)).toBe("--space-3");
  });

  it("keeps the gh#295 rhythm on fields that are NOT grid items — plain list and Card-nested alike", () => {
    const plain = render(<Form>{fields(3)}</Form>);
    for (const field of [...plain.container.querySelectorAll(".ui-form-field")].slice(1)) {
      expect(winning(field, "margin-block-start")).toBe("var(--form-field-row-gap)");
    }

    const carded = render(
      <Form>
        <Card>
          <CardContent>{fields(3, 20)}</CardContent>
        </Card>
      </Form>,
    );
    for (const field of [...carded.container.querySelectorAll(".ui-form-field")].slice(1)) {
      expect(winning(field, "margin-block-start")).toBe("var(--form-field-row-gap)");
    }
  });

  it("keeps the rhythm on fields merely NESTED inside a grid cell — they are not the grid's children", () => {
    const { container } = render(
      <Form columns={2}>
        <div>{fields(2)}</div>
        <FormField id="solo" label="Solo">
          <Input />
        </FormField>
      </Form>,
    );
    const stackedPair = [...container.querySelectorAll(".ui-form-field")];
    expect(winning(stackedPair[0], "margin-block-start") ?? "0").toBe("0");
    expect(winning(stackedPair[1], "margin-block-start")).toBe("var(--form-field-row-gap)");
  });

  it("is direction-agnostic — RTL resolves the identical block-axis rules", () => {
    const { container } = render(
      <div dir="rtl">
        <Form columns={2}>{fields(4)}</Form>
      </div>,
    );
    const grid = container.querySelector(".ui-responsive-grid")!;
    expect(winning(grid, "row-gap")).toBe("var(--form-grid-row-gap)");
    for (const item of grid.children) {
      expect(winning(item, "margin-block-start") ?? "0").toBe("0");
    }
  });

  it("uses logical properties only — no physical margin/padding side in the form rhythm rules", () => {
    const css = read("src/styles/form-layout.css");
    expect(css).not.toMatch(/\bmargin-(top|bottom|left|right)\s*:/);
    expect(css).not.toMatch(/\bpadding-(top|bottom|left|right)\s*:/);
  });
});

describe("Form grid spacing knobs (cardinal rule #45)", () => {
  const tokens = read("src/tokens/components/form.css");

  it("--form-grid-row-gap is a documented token defaulting to the canonical field rhythm", () => {
    expect(tokens).toMatch(/--form-grid-row-gap:\s*var\(--form-field-row-gap\)/);
  });

  it("--form-grid-column-gap is a documented token keeping the historical 16px gutter", () => {
    expect(tokens).toMatch(/--form-grid-column-gap:\s*var\(--space-4\)/);
    expect(terminus("var(--form-grid-column-gap)")).toBe(terminus("var(--space-stack-md)"));
  });

  it("targets a FIELD grid at ANY depth — the Card-framed hand-written one gets the same rhythm as columns={n}", () => {
    // `Form > Card > CardContent > ResponsiveGrid > FormField*` is what a form with several titled
    // sections has to write by hand (docs' invoice-form does exactly this), and it is the same
    // layout `columns={2}` produces. Keying the rule on ancestry would give the two different row
    // rhythms — the depth-dependence gh#295 removed from this file.
    const { container } = render(
      <Form>
        <Card>
          <CardContent>
            <ResponsiveGrid columns={2}>{fields(4)}</ResponsiveGrid>
          </CardContent>
        </Card>
      </Form>,
    );
    const grid = container.querySelector(".ui-responsive-grid")!;
    expect(winning(grid, "row-gap")).toBe("var(--form-grid-row-gap)");
    for (const item of grid.children) {
      expect(winning(item, "margin-block-start") ?? "0").toBe("0");
    }
  });

  it("never touches a card/tile grid — no FormField items means ResponsiveGrid keeps its stack gap", () => {
    const { container } = render(
      <Form>
        <Card>
          <CardContent>
            <div className="ui-responsive-grid-scope">
              <div className="ui-responsive-grid" data-testid="card-grid">
                <Card />
                <Card />
              </div>
            </div>
          </CardContent>
        </Card>
      </Form>,
    );
    // A grid of tiles inside a form is not a field grid → the form rhythm must NOT reach it;
    // ResponsiveGrid keeps its generic stack gap.
    const nested = container.querySelector<HTMLElement>('[data-testid="card-grid"]')!;
    expect(winning(nested, "row-gap")).toBeUndefined();
    expect(winning(nested, "gap")).toBe("var(--space-stack-md)");
  });
});
