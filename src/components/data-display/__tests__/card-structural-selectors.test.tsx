import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import {
  Card,
  CardAction,
  CardBar,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * Every structural selector (`:not()` / `:first-child` / `:last-child` /
 * `:has()`) in card-layout.css, run with `.matches()` against really rendered
 * Card DOM — see src/test/css-selector.ts for why string assertions are not
 * enough (the headerAlign lesson, 505f0e6). Each case asserts the selector
 * CHOOSES the element it was written for, and where the negation is the
 * point, that it refuses the counter-example.
 */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/card-layout.css"),
  "utf8",
);

const q = (container: HTMLElement, testId: string): HTMLElement => {
  const el = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  expect(el, `fixture renders [data-testid="${testId}"]`).not.toBeNull();
  return el!;
};

describe("card-layout.css structural selectors select the rendered DOM", () => {
  it("accent rail: inset compensation reaches header/content/footer but not a flush body", () => {
    const selector = ruleSelector(
      css,
      '[data-slot="card"][data-accent] > [data-slot="card-content"]:not([data-flush])',
      '"card-content"',
    );
    const { container } = renderWithUi(
      <>
        <Card accent="destructive">
          <CardContent data-testid="accent-content">a</CardContent>
        </Card>
        <Card accent="destructive">
          <CardContent flush data-testid="accent-flush">
            a
          </CardContent>
        </Card>
        <Card>
          <CardContent data-testid="plain-content">a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "accent-content").matches(selector)).toBe(true);
    expect(q(container, "accent-flush").matches(selector)).toBe(false);
    expect(q(container, "plain-content").matches(selector)).toBe(false);
  });

  it("accent placement=perimeter: the compensation-undo reaches the same slots", () => {
    const selector = ruleSelector(
      css,
      /\[data-accent-placement="perimeter"\]\s*>\s*\[data-slot="card-content"\]/,
      '"card-content"',
    );
    const { container } = renderWithUi(
      <>
        <Card accent="destructive" accentPlacement="perimeter">
          <CardContent data-testid="peri-content">a</CardContent>
        </Card>
        <Card accent="destructive">
          <CardContent data-testid="edge-content">a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "peri-content").matches(selector)).toBe(true);
    expect(q(container, "edge-content").matches(selector)).toBe(false);
  });

  it("non-banded header shell padding refuses a banded header", () => {
    const selector = ruleSelector(
      css,
      /^ {2}\[data-slot="card-header"\]:not\(\[data-banded\]\) \{/m,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader data-testid="plain-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent>a</CardContent>
        </Card>
        <Card>
          <CardHeader banded data-testid="banded-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent>a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "plain-header").matches(selector)).toBe(true);
    expect(q(container, "banded-header").matches(selector)).toBe(false);
  });

  it("CardBar separators come from position: first/last/middle bars each match their rule only", () => {
    const first = ruleSelector(css, '[data-slot="card-bar"]:first-child');
    const last = ruleSelector(css, '[data-slot="card-bar"]:last-child');
    const { container } = renderWithUi(
      <Card>
        <CardBar data-testid="bar-top">a</CardBar>
        <CardBar data-testid="bar-middle">b</CardBar>
        <CardBar data-testid="bar-bottom">c</CardBar>
      </Card>,
    );

    expect(q(container, "bar-top").matches(first)).toBe(true);
    expect(q(container, "bar-top").matches(last)).toBe(false);
    expect(q(container, "bar-middle").matches(first)).toBe(false);
    expect(q(container, "bar-middle").matches(last)).toBe(false);
    expect(q(container, "bar-bottom").matches(first)).toBe(false);
    expect(q(container, "bar-bottom").matches(last)).toBe(true);
  });

  it("banded header stacks when it has a description and no action", () => {
    const selector = ruleSelector(
      css,
      /\[data-banded\]:has\(\[data-slot="card-description"\]\):not\(/,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader banded data-testid="desc-only">
            <CardTitle>t</CardTitle>
            <CardDescription>d</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader banded data-testid="desc-and-action">
            <CardTitle>t</CardTitle>
            <CardDescription>d</CardDescription>
            <CardAction>x</CardAction>
          </CardHeader>
        </Card>
      </>,
    );

    expect(q(container, "desc-only").matches(selector)).toBe(true);
    expect(q(container, "desc-and-action").matches(selector)).toBe(false);
  });

  it("a banded header opens a top gap on a normal body but not on a flush one", () => {
    const selector = ruleSelector(
      css,
      /:has\(\[data-slot="card-header"\]\[data-banded\]\)\s*\[data-slot="card-content"\]:not\(\[data-tight\]\):not\(\[data-flush\]\)/,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader banded>
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent data-testid="banded-body">a</CardContent>
        </Card>
        <Card>
          <CardHeader banded>
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent flush data-testid="banded-flush-body">
            a
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent data-testid="plain-body">a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "banded-body").matches(selector)).toBe(true);
    expect(q(container, "banded-flush-body").matches(selector)).toBe(false);
    expect(q(container, "plain-body").matches(selector)).toBe(false);
  });

  it("a tight body makes the plain header symmetric; a tabs-hosting one restores the shell top", () => {
    /* The historical selector nested `:has()` inside `:has()`, which the spec forbids —
     * Chrome dropped the whole rule and the symmetric band never applied. The valid pair:
     * symmetric for every tight body, then the tabs case takes the top back. */
    const symmetric = ruleSelector(
      css,
      /:has\(\[data-slot="card-content"\]\[data-tight\]\)\s*\[data-slot="card-header"\]/,
    );
    const tabsRestore = ruleSelector(
      css,
      /:has\(\[data-slot="card-content"\]\[data-tight\] \[data-slot="tabs-list"\]\)\s*\[data-slot="card-header"\]:not\(\[data-banded\]\)/,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader data-testid="tight-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent tight>a</CardContent>
        </Card>
        <Card>
          <CardHeader data-testid="tabs-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent tight>
            {/* the attribute tabs.tsx:68 emits — the selector's own hook */}
            <div data-slot="tabs-list" role="tablist" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader data-testid="loose-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent>a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "tight-header").matches(symmetric)).toBe(true);
    expect(q(container, "tight-header").matches(tabsRestore)).toBe(false);
    // The tabs header matches BOTH: symmetric applies, the later restore rule wins the top.
    expect(q(container, "tabs-header").matches(symmetric)).toBe(true);
    expect(q(container, "tabs-header").matches(tabsRestore)).toBe(true);
    expect(q(container, "loose-header").matches(symmetric)).toBe(false);
  });

  it("toolbar header (action, no description) rows itself; with a description it stays stacked", () => {
    const selector = ruleSelector(
      css,
      /^ {2}\[data-slot="card-header"\]:has\(\[data-slot="card-action"\]\):not\(/m,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader data-testid="toolbar-header">
            <CardTitle>t</CardTitle>
            <CardAction>x</CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader data-testid="described-header">
            <CardTitle>t</CardTitle>
            <CardDescription>d</CardDescription>
            <CardAction>x</CardAction>
          </CardHeader>
        </Card>
      </>,
    );

    expect(q(container, "toolbar-header").matches(selector)).toBe(true);
    expect(q(container, "described-header").matches(selector)).toBe(false);
  });

  it("a toolbar header zeroes the following body's top padding; a described header restores it", () => {
    /* Also rewritten from a spec-invalid nested `:has()` (whole rule was dropped by Chrome):
     * the zero applies for any header-hosted action, and the description case — a real
     * header, not a toolbar — takes the gap back in the rule after it. */
    const zero = ruleSelector(
      css,
      /:has\(\[data-slot="card-header"\] \[data-slot="card-action"\]\)\s*\[data-slot="card-content"\]/,
    );
    const restore = ruleSelector(
      css,
      /:has\(\[data-slot="card-header"\] \[data-slot="card-description"\]\)\s*\[data-slot="card-content"\]/,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
            <CardAction>x</CardAction>
          </CardHeader>
          <CardContent data-testid="after-toolbar">a</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
            <CardDescription>d</CardDescription>
            <CardAction>x</CardAction>
          </CardHeader>
          <CardContent data-testid="after-described">a</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
            <CardAction>x</CardAction>
          </CardHeader>
          <CardContent tight data-testid="after-toolbar-tight">
            a
          </CardContent>
        </Card>
      </>,
    );

    expect(q(container, "after-toolbar").matches(zero)).toBe(true);
    expect(q(container, "after-toolbar").matches(restore)).toBe(false);
    // Described header matches BOTH; the restore rule is later in the file and wins.
    expect(q(container, "after-described").matches(zero)).toBe(true);
    expect(q(container, "after-described").matches(restore)).toBe(true);
    expect(q(container, "after-toolbar-tight").matches(zero)).toBe(false);
  });

  it("a header-only card hands the bottom shell to the header", () => {
    const selector = ruleSelector(
      css,
      ':not(:has([data-slot="card-content"], [data-slot="card-footer"]))',
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader data-testid="only-header">
            <CardTitle>t</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader data-testid="header-with-body">
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent>a</CardContent>
        </Card>
      </>,
    );

    expect(q(container, "only-header").matches(selector)).toBe(true);
    expect(q(container, "header-with-body").matches(selector)).toBe(false);
  });

  it("a header below a cover clears the media — a banded one keeps its own band padding", () => {
    const selector = ruleSelector(
      css,
      ':has([data-slot="card-cover"]) [data-slot="card-header"]:not([data-banded])',
    );
    const { container } = renderWithUi(
      <Card>
        <CardCover>
          <img alt="" src="x.png" />
        </CardCover>
        <CardHeader data-testid="covered-header">
          <CardTitle>t</CardTitle>
        </CardHeader>
        <CardContent>a</CardContent>
      </Card>,
    );

    expect(q(container, "covered-header").matches(selector)).toBe(true);
  });

  it("plain body top padding refuses tight and solo bodies", () => {
    const selector = ruleSelector(
      css,
      /^ {2}\[data-slot="card-content"\]:not\(\[data-tight\]\):not\(\[data-solo\]\) \{/m,
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent data-testid="normal-body">a</CardContent>
        </Card>
        <Card>
          <CardContent solo data-testid="solo-body">
            a
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>t</CardTitle>
          </CardHeader>
          <CardContent tight data-testid="tight-body">
            a
          </CardContent>
        </Card>
      </>,
    );

    expect(q(container, "normal-body").matches(selector)).toBe(true);
    expect(q(container, "solo-body").matches(selector)).toBe(false);
    expect(q(container, "tight-body").matches(selector)).toBe(false);
  });

  it("a flush body zeroes its block padding only when it hosts a table", () => {
    const selector = ruleSelector(
      css,
      '[data-slot="card-content"][data-flush]:not([data-tight]):not([data-solo]):has(table)',
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardContent flush data-testid="flush-table-body">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>a</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardContent flush data-testid="flush-text-body">
            a
          </CardContent>
        </Card>
      </>,
    );

    expect(q(container, "flush-table-body").matches(selector)).toBe(true);
    expect(q(container, "flush-text-body").matches(selector)).toBe(false);
  });

  it("a plain header before a flush full-bleed table supplies its own bottom gap", () => {
    const selector = ruleSelector(
      css,
      ':has([data-slot="card-content"][data-flush] [data-slot="table"])',
    );
    const { container } = renderWithUi(
      <Card>
        <CardHeader data-testid="header-before-table">
          <CardTitle>t</CardTitle>
        </CardHeader>
        <CardContent flush>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>a</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>,
    );

    expect(q(container, "header-before-table").matches(selector)).toBe(true);
  });

  it("mobile separated-footer row rule refuses a flush footer", () => {
    const selector = ruleSelector(
      css,
      '[data-slot="card-footer"][data-separated]:not([data-flush])',
    );
    const { container } = renderWithUi(
      <>
        <Card>
          <CardContent>a</CardContent>
          <CardFooter separated data-testid="separated-footer">
            f
          </CardFooter>
        </Card>
        <Card>
          <CardContent>a</CardContent>
          <CardFooter separated flush data-testid="separated-flush-footer">
            f
          </CardFooter>
        </Card>
      </>,
    );

    expect(q(container, "separated-footer").matches(selector)).toBe(true);
    expect(q(container, "separated-flush-footer").matches(selector)).toBe(false);
  });

  it("an unseparated footer hugs the body; a separated one keeps its divider padding", () => {
    const selector = ruleSelector(css, '[data-slot="card-footer"]:not([data-separated])');
    const { container } = renderWithUi(
      <>
        <Card>
          <CardContent>a</CardContent>
          <CardFooter data-testid="plain-footer">f</CardFooter>
        </Card>
        <Card>
          <CardContent>a</CardContent>
          <CardFooter separated data-testid="divided-footer">
            f
          </CardFooter>
        </Card>
      </>,
    );

    expect(q(container, "plain-footer").matches(selector)).toBe(true);
    expect(q(container, "divided-footer").matches(selector)).toBe(false);
  });
});

describe("described header × flush content (gh#307)", () => {
  // The describedBody restore must NOT reach flush content: flush zeroes its own padding, and
  // before the :not([data-flush]) guard the description half overrode that zero and floated a
  // flush table 18px off its header (measured on a consumer 関連ファイル section).
  it("the describedBody selector skips flush content and still matches padded content", () => {
    const selector = ruleSelector(
      css,
      /\[data-slot="card"\]:has\(\[data-slot="card-header"\] \[data-slot="card-description"\]\)/,
    );
    expect(selector).toContain(":not([data-flush])");
    renderWithUi(
      <>
        <Card>
          <CardHeader>
            <CardTitle>a</CardTitle>
            <CardDescription>note</CardDescription>
          </CardHeader>
          <CardContent flush data-testid="flush-described" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>b</CardTitle>
            <CardDescription>note</CardDescription>
          </CardHeader>
          <CardContent data-testid="padded-described" />
        </Card>
      </>,
    );
    expect(screen.getByTestId("flush-described").matches(selector)).toBe(false);
    expect(screen.getByTestId("padded-described").matches(selector)).toBe(true);
  });
});
