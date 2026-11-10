import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "../app-shell";
import { renderWithUi, screen, userEvent } from "@/test/render";

const css = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

describe("AppShell aside — a panel that pushes the page", () => {
  it("renders a named complementary landmark after main and marks the root open", () => {
    const { container } = renderWithUi(
      <AppShell sidebar={<nav>ナビ</nav>} aside={<p>ウィジェット</p>} asideLabel="追加する">
        <p>本文</p>
      </AppShell>,
    );
    const panel = screen.getByRole("complementary", { name: "追加する" });
    expect(panel).toHaveTextContent("ウィジェット");
    const main = screen.getByRole("main");
    expect(main.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector(".app-root")).toHaveAttribute("data-aside", "open");
  });

  it("asideOpen={false} renders nothing and leaves the root untouched", () => {
    const { container } = renderWithUi(
      <AppShell aside={<p>x</p>} asideOpen={false} asideLabel="追加する">
        <p>本文</p>
      </AppShell>,
    );
    expect(screen.queryByRole("complementary", { name: "追加する" })).toBeNull();
    expect(container.querySelector(".app-root")).not.toHaveAttribute("data-aside");
  });

  it("Esc inside the panel reports false", async () => {
    const user = userEvent.setup();
    const onAsideOpenChange = vi.fn();
    renderWithUi(
      <AppShell
        aside={<button type="button">閉じる</button>}
        asideLabel="追加する"
        onAsideOpenChange={onAsideOpenChange}
      >
        <p>本文</p>
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    await user.keyboard("{Escape}");
    expect(onAsideOpenChange).toHaveBeenCalledWith(false);
  });

  it("pushes by reserving its width as the root's inline-end padding; full screen below 48rem", () => {
    expect(css).toMatch(
      /\.app-root\[data-aside="open"\]\s*\{[^}]*padding-inline-end:\s*var\(--app-shell-aside-width\)/,
    );
    expect(css).toMatch(
      /\.app-aside\s*\{[^}]*inset-inline-end:\s*0;[^}]*inline-size:\s*var\(--app-shell-aside-width\)/,
    );
    const narrow =
      css.match(
        /@media \(width < 48rem\)\s*\{\s*\.app-root\[data-aside="open"\][\s\S]*?\n {2}\}/,
      )?.[0] ?? "";
    expect(narrow).toContain("padding-inline-end: 0");
    expect(narrow).toMatch(/\.app-aside\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;/);
  });
});
