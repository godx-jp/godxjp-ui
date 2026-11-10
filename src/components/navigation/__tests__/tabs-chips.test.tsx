import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";

const css = readFileSync(resolve(process.cwd(), "src/styles/navigation-layout.css"), "utf8");

const ITEMS = [
  { value: "home", label: "ホーム" },
  { value: "shop", label: "店舗の運営" },
  { value: "close", label: "月末の締め" },
];

describe('Tabs variant="chips"', () => {
  it("keeps the tablist contract (roles, arrows, selection) and puts onAdd after it as a chip", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onAdd = vi.fn();
    const { container } = render(
      <Tabs
        variant="chips"
        items={ITEMS}
        defaultValue="home"
        onValueChange={onValueChange}
        onAdd={onAdd}
        addLabel="デスクトップを追加"
        aria-label="デスクトップ"
      />,
    );
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-variant", "chips");
    const home = screen.getByRole("tab", { name: "ホーム" });
    expect(home).toHaveAttribute("aria-selected", "true");
    await user.click(home);
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "店舗の運営" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("shop");
    const add = screen.getByRole("button", { name: "デスクトップを追加" });
    expect(add.closest('[data-slot="tabs-bar"]')).toHaveAttribute("data-variant", "chips");
    await user.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
    // Separate chips: a gap on the strip, a radius and inverse ink on each chip.
    expect(screen.getByRole("tablist").className).toContain("gap-[var(--tabs-chips-gap)]");
    expect(home.className).toContain("rounded-[var(--tabs-chip-radius)]");
    expect(css).toMatch(
      /\[data-slot="tabs"\]\[data-variant="chips"\] \[data-slot="tabs-trigger"\]\[data-state="active"\]\s*\{\s*background-color:\s*var\(--tabs-chip-active-background, hsl\(var\(--foreground\)\)\);/,
    );
    expect(css).toMatch(
      /\.ui-tabs-bar\[data-variant="chips"\] > \.ui-tabs-add\s*\{[^}]*border-radius:\s*var\(--radius-pill\)/,
    );
  });
});
