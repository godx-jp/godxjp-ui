/**
 * gh#1434 — `Text size="inherit"`: an emphasised run inside a Heading keeps the heading's size.
 *
 * Before: `Text` always emitted a step (default `sm`), so `<Heading level={1}>…<Text tone="primary">…`
 * shrank the emphasised half of a hero from ~44px to 14px, and no fixed step matched the heading at
 * every breakpoint.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Heading, Text } from "../typography";

const css = readFileSync(resolve(process.cwd(), "src/styles/text-layout.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

describe('Text size="inherit" (gh#1434)', () => {
  it("emits data-size=inherit on the run inside a heading", () => {
    render(
      <Heading level={1}>
        探す。比べる。
        <Text tone="primary" size="inherit">
          トレカをもっと楽しむ。
        </Text>
      </Heading>,
    );
    const run = screen.getByText("トレカをもっと楽しむ。");
    expect(run).toHaveAttribute("data-size", "inherit");
    expect(run).toHaveAttribute("data-tone", "primary");
  });

  it("takes font-size, line-height and letter-spacing from the parent", () => {
    const rule = css.match(/\[data-slot="text"\]\[data-size="inherit"\]\s*\{([^}]*)\}/);
    expect(rule, "a rule for size=inherit").not.toBeNull();
    expect(rule![1]).toMatch(/font-size:\s*inherit/);
    expect(rule![1]).toMatch(/line-height:\s*inherit/);
    expect(rule![1]).toMatch(/letter-spacing:\s*inherit/);
  });

  it("keeps the default step when size is not given", () => {
    render(<Text>plain</Text>);
    expect(screen.getByText("plain")).toHaveAttribute("data-size", "sm");
  });
});
