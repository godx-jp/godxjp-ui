import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback } from "../avatar";

const css = readFileSync(resolve(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
);

describe('Avatar size="xl" — the 64px feature tile', () => {
  it("marks the step and moves box, square box, type and glyph together", () => {
    const { container } = render(
      <Avatar size="xl" shape="square">
        <AvatarFallback>M</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-size", "xl");
    const rule = css.match(/\.ui-avatar\[data-size="xl"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    for (const knob of [
      "--avatar-size:",
      "--avatar-square-size:",
      "--avatar-font-size:",
      "--avatar-glyph-size:",
    ]) {
      expect(rule).toContain(knob);
    }
    expect(tokens).toContain("--avatar-size-xl: calc(4rem * var(--scaling));");
  });
});
