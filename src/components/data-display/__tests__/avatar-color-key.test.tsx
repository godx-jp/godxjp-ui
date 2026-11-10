import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, avatarColorStep } from "../avatar";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const css = read("src/styles/data-display-layout.css");
const foundation = read("src/tokens/foundation.css");
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
    for (const step of steps) expect(step).toBeGreaterThanOrEqual(1);
    for (const step of steps) expect(step).toBeLessThanOrEqual(6);
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

  it("every step, light and dark, keeps white initials at AA after the 75% deepening", () => {
    expect(tokens).toContain("--avatar-color-key-depth: 75%;");
    expect(tokens).toContain("--avatar-color-key-foreground: 0 0% 100%;");
    for (let n = 1; n <= 6; n += 1) {
      expect(css).toContain(`.ui-avatar[data-color-key="${n}"] {`);
      const values = [...foundation.matchAll(new RegExp(`--chart-${n}:\\s*(#[0-9a-f]{6});`, "gi"))];
      expect(values.length).toBeGreaterThan(0);
      for (const [, value] of values) {
        // color-mix(in srgb, X 75%, black) scales the encoded channels.
        const mixed = hex(value).map((c) => Math.round(c * 0.75));
        const ratio = 1.05 / (luminance(mixed) + 0.05);
        expect(ratio, `--chart-${n} ${value}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
