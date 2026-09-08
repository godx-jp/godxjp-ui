/**
 * gh#396 — the menu surface gains the width axis the rest of the family already had, so a menu
 * wider than its trigger stops being a `className="min-w-56"` decision no theme can retune.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

async function openMenu(width?: "trigger" | "auto" | "sm" | "md" | "lg") {
  const user = userEvent.setup();
  renderWithUi(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent width={width}>
        <DropdownMenuItem>Xuất CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await user.click(screen.getByRole("button", { name: "Actions" }));
  const surface = document.querySelector('[data-slot="dropdown-menu-content"]');
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe("DropdownMenuContent width (gh#396)", () => {
  it("emits no width attribute when the prop is unset, so nothing moves", async () => {
    expect(await openMenu()).not.toHaveAttribute("data-width");
  });

  it.each(["trigger", "auto", "sm", "md", "lg"] as const)("reflects width=%s", async (width) => {
    expect(await openMenu(width)).toHaveAttribute("data-width", width);
  });

  it("re-points the surface's own min-width knob rather than fixing an inline size", () => {
    const css = read("../../../styles/navigation-layout.css");
    // A floor, not a width: a long label still grows the panel instead of clipping.
    expect(css).toMatch(
      /\.ui-dropdown-menu-content\[data-width="auto"\] \{\s*--menu-content-min-width: 0;/,
    );
    expect(css).toMatch(
      /\.ui-dropdown-menu-content\[data-width="trigger"\] \{\s*--menu-content-min-width: var\(--trigger-width, var\(--dropdown-content-min-width\)\);/,
    );
    for (const step of ["sm", "md", "lg"]) {
      expect(css).toMatch(
        new RegExp(
          `\\.ui-dropdown-menu-content\\[data-width="${step}"\\] \\{\\s*--menu-content-min-width: var\\(--menu-content-width-${step}\\);`,
        ),
      );
    }
  });

  it("backs the ladder with themeable tokens", () => {
    const tokens = read("../../../tokens/components/navigation.css");
    for (const step of ["sm", "md", "lg"]) {
      expect(tokens).toMatch(new RegExp(`--menu-content-width-${step}:\\s*[\\d.]+rem;`));
    }
    // The untouched default is still the one it always was.
    expect(tokens).toMatch(/--dropdown-content-min-width:\s*8rem;/);
  });
});
