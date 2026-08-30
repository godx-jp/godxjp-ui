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
    // Product override (gh#296, direct instruction): the search trigger now fills its Topbar
    // center slot by default instead of floating as a fixed ~420px box with dead space on either
    // side. The token stays available for a consumer that wants the old capped, centered look.
    expect(tokens).toMatch(/--topbar-search-max-width:\s*none/);
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
    // The rail's label step is a STEP, not the hi-fi source's 13px (gh#329). 13 sits between
    // --font-size-xs (≈12.47) and the 14px base, so the whole rail read off the system's type
    // rhythm and stayed behind whenever a service retuned --font-size-base. The row's own rhythm —
    // the 2rem height this test is really about — is unchanged, and 1.5 × 12.47 = 18.7px keeps the
    // same headroom inside it.
    expect(tokens).toMatch(/--sidebar-nav-item-font-size:\s*var\(--font-size-xs\)/);
    expect(tokens).not.toMatch(/--sidebar-nav-item-font-size:\s*[\d.]/);
    expect(shell).toMatch(/@media \(width <= 56\.25rem\)/);
    expect(shell).toMatch(/\.sb-section \+ \.sb-section\s*\{[^}]*margin-top:/s);
  });

  it("uses the DXS 10px card radius and shadow-sm surface", () => {
    const card = read("../../tokens/components/card.css");

    expect(card).toMatch(/--card-radius:\s*var\(--radius-xl\)/);
    expect(card).toMatch(/--card-shadow:\s*var\(--shadow-sm\)/);
  });

  it("bundles Noto Sans JP as the default product face (product override, direct instruction)", () => {
    const fonts = read("../fonts.css");

    expect(fonts).toContain('@import "@fontsource/noto-sans-jp/400.css"');
    expect(fonts).toMatch(/--font-sans-base:\s*\n\s*"Noto Sans JP"/);
    expect(fonts).not.toContain("@fontsource/montserrat");
  });
});
