import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

describe("DXS hi-fi visual contract", () => {
  it("keeps application chrome on the 48px flat-surface shell", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    expect(tokens).toMatch(/--app-shell-bar-height:\s*3rem/);
    expect(shell).toMatch(
      /grid-template-rows:\s*var\(--app-shell-bar-height\) minmax\(0, 1fr\) auto/,
    );
    expect(shell).toMatch(/\.app-topbar\s*\{[^}]*background:\s*hsl\(var\(--card\)\)/s);
    expect(shell).not.toMatch(/backdrop-filter:\s*blur/);
  });

  it("keeps the warm main surface and 1280px left-aligned page boundary", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    expect(tokens).toMatch(/--app-shell-page-max-width:\s*80rem/);
    expect(tokens).toMatch(/--topbar-search-max-width:\s*26\.25rem/);
    expect(tokens).toMatch(/--app-shell-main-background:\s*hsl\(var\(--muted\) \/ 0\.4\)/);
    expect(shell).toMatch(
      /\.app-main \.ui-page-container\s*\{[^}]*max-width:\s*var\(--app-shell-page-max-width\)/s,
    );
    expect(shell).not.toMatch(/\.app-main \.ui-page-container\s*\{[^}]*max-width:\s*none/s);
  });

  it("uses the compact DXS sidebar rhythm and 900px drawer breakpoint", () => {
    const tokens = read("../../tokens/components/shell.css");
    const shell = read("../shell-layout.css");

    expect(tokens).toMatch(/--sidebar-nav-item-height:\s*2rem/);
    expect(tokens).toMatch(/--sidebar-nav-item-font-size:\s*0\.8125rem/);
    expect(shell).toMatch(/@media \(width <= 56\.25rem\)/);
    expect(shell).toMatch(/\.sb-section \+ \.sb-section\s*\{[^}]*margin-top:/s);
  });

  it("uses the DXS 10px card radius and shadow-sm surface", () => {
    const card = read("../../tokens/components/card.css");

    expect(card).toMatch(/--card-radius:\s*var\(--radius-xl\)/);
    expect(card).toMatch(/--card-shadow:\s*var\(--shadow-sm\)/);
  });

  it("bundles M PLUS 2 as the default product face", () => {
    const fonts = read("../fonts.css");

    expect(fonts).toContain('@import "@fontsource/m-plus-2/400.css"');
    expect(fonts).toMatch(/--font-sans-base:\s*\n\s*"M PLUS 2"/);
    expect(fonts).not.toContain("@fontsource/montserrat");
  });
});
