import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { TopbarSearch } from "../topbar-search";
import { renderWithUi } from "@/test/render";

const css = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");

describe('TopbarSearch measure="wide"', () => {
  it("marks the wide field and re-points the one width knob; default emits nothing", () => {
    const { container, rerender } = renderWithUi(<TopbarSearch ariaLabel="検索" />);
    expect(container.querySelector('[data-slot="topbar-search"]')).not.toHaveAttribute(
      "data-measure",
    );
    rerender(<TopbarSearch ariaLabel="検索" measure="wide" />);
    expect(container.querySelector('[data-slot="topbar-search"]')).toHaveAttribute(
      "data-measure",
      "wide",
    );
    expect(css).toMatch(
      /\.ui-topbar-search\[data-measure="wide"\]\s*\{\s*--topbar-search-inline-size:\s*var\(--topbar-search-wide-inline-size\);/,
    );
    expect(tokens).toContain("--topbar-search-wide-inline-size: 26.25rem;");
  });
});
