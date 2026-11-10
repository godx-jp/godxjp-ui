import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, avatarColorStep } from "../avatar";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const css = read("src/styles/data-display-layout.css");
const tokens = read("src/tokens/components/data-display.css");

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

describe("Avatar colorKey — a stable categorical tile colour", () => {
  it("hashes a key to the same step every time, and spreads distinct keys", () => {
    expect(avatarColorStep("tasks")).toBe(avatarColorStep("tasks"));
    const steps = new Set(
      ["tasks", "restaurant", "pages", "attendance", "dataview", "fleet"].map(avatarColorStep),
    );
    expect(steps.size).toBeGreaterThanOrEqual(4);
    // A number picks the hue directly, wrapping past the last one.
    expect([1, 2, 10, 11].map(avatarColorStep)).toEqual([1, 2, 10, 1]);
    for (const step of steps) expect(step).toBeGreaterThanOrEqual(1);
    for (const step of steps) expect(step).toBeLessThanOrEqual(10);
  });

  it("emits data-color-key only when a key is given", () => {
    const { container, rerender } = render(
      <Avatar>
        <AvatarFallback>T</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstElementChild).not.toHaveAttribute("data-color-key");
    rerender(
      <Avatar shape="square" colorKey="tasks">
        <AvatarFallback>T</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-color-key",
      String(avatarColorStep("tasks")),
    );
  });

  it("every tile hue keeps white initials at >= 4.5:1, and the palette is the tile set, not the chart series", () => {
    expect(tokens).toContain("--avatar-color-key-foreground: 0 0% 100%;");
    expect(tokens).toContain("--avatar-color-key-ring-color: hsl(var(--avatar-color-key-foreground) / 0.45);");
    for (let n = 1; n <= 10; n += 1) {
      expect(css).toContain(`.ui-avatar[data-color-key="${n}"] {`);
      expect(css).toContain(`--avatar-background: var(--avatar-color-key-${n});`);
      const value = tokens.match(
        new RegExp(`--avatar-color-key-${n}:\\s*(#[0-9a-f]{6});`, "i"),
      )?.[1];
      expect(value, `--avatar-color-key-${n}`).toBeDefined();
      const ratio = 1.05 / (luminance(hex(value!)) + 0.05);
      expect(ratio, `--avatar-color-key-${n} ${value}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(css).not.toMatch(/data-color-key[^{]*\{[^}]*--chart-/);
  });
});
