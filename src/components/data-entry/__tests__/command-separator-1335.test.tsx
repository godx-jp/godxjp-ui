import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";

import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../command";

/**
 * CommandSeparator (gh#1335) — cmdk's Command.Separator from the SAME cmdk instance as the rest
 * of the family, kept while the user types so it can divide the matches from `+ Create "<q>"`.
 */

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const controlStyles = read("src/styles/control.css");

/** Declarations of every rule whose selector list contains `selector` exactly. */
function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const blocks: string[] = [];
  for (const match of stripped.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    if (
      match[1]
        .split(/,(?![^(]*\))/)
        .map(normalize)
        .includes(normalize(selector))
    ) {
      blocks.push(match[2]);
    }
  }
  return blocks.join("\n");
}

const OPTIONS = ["Red", "Green", "Blue"];

function OptionBuilder({ separatorRef }: { separatorRef?: React.Ref<HTMLDivElement> }) {
  const [q, setQ] = React.useState("");
  const showCreate = q.trim() !== "" && !OPTIONS.some((o) => o.toLowerCase() === q.toLowerCase());
  return (
    <Command label="Option values">
      <CommandInput aria-label="Option value" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandGroup heading="Values">
          {OPTIONS.map((o) => (
            <CommandItem key={o} value={o}>
              {o}
            </CommandItem>
          ))}
        </CommandGroup>
        {showCreate && (
          <>
            <CommandSeparator ref={separatorRef} />
            <CommandGroup forceMount>
              <CommandItem forceMount value={`__create__${q}`}>
                + Create &quot;{q}&quot;
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

describe("CommandSeparator (gh#1335)", () => {
  it("renders cmdk's separator with data-slot inside a Command, passing className through", () => {
    const { container } = renderWithUi(
      <Command label="Menu">
        <CommandList>
          <CommandGroup heading="A">
            <CommandItem value="a">A</CommandItem>
          </CommandGroup>
          <CommandSeparator className="extra" data-testid="sep" />
          <CommandGroup heading="B">
            <CommandItem value="b">B</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const sep = container.querySelector('[data-slot="command-separator"]');
    expect(sep).not.toBeNull();
    expect(sep).toHaveAttribute("cmdk-separator");
    expect(sep).toHaveClass("ui-command-separator", "extra");
    expect(sep).toHaveAttribute("data-testid", "sep");
    // Decorative inside a listbox (separator is not an allowed listbox child).
    expect(sep).toHaveAttribute("aria-hidden", "true");
  });

  it("stays visible while a query is typed, above the Create group", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<OptionBuilder />);
    await user.type(screen.getByRole("combobox"), "re");
    expect(container.querySelector('[data-slot="command-separator"]')).not.toBeNull();
    expect(screen.getByText('+ Create "re"')).toBeInTheDocument();
    // A visible match still precedes it, so the rule divides two real groups.
    expect(screen.getByRole("option", { name: "Green" })).toBeInTheDocument();
  });

  it("alwaysRender={false} restores cmdk's hide-while-searching behaviour", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Command label="Menu">
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandGroup heading="A">
            <CommandItem value="apple">Apple</CommandItem>
          </CommandGroup>
          <CommandSeparator alwaysRender={false} />
          <CommandGroup heading="B">
            <CommandItem value="apricot">Apricot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(container.querySelector('[data-slot="command-separator"]')).not.toBeNull();
    await user.type(screen.getByRole("combobox"), "ap");
    expect(container.querySelector('[data-slot="command-separator"]')).toBeNull();
  });

  it("forwards the ref to the separator element", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<HTMLDivElement>();
    renderWithUi(<OptionBuilder separatorRef={ref} />);
    await user.type(screen.getByRole("combobox"), "x");
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "command-separator");
  });

  it("draws the hairline from tokens and spaces it by the group rhythm", () => {
    const rule = declarationsFor(controlStyles, ".ui-command-separator");
    expect(rule).toMatch(
      /height:\s*var\(\s*--command-item-divider-width\s*,\s*var\(\s*--stroke-hairline\s*\)\s*\);/,
    );
    expect(rule).toMatch(
      /background:\s*hsl\(\s*var\(\s*--command-item-divider-color\s*,\s*var\(\s*--border\s*\)\s*\)\s*\);/,
    );
    expect(rule).toMatch(/margin-block:\s*var\(\s*--command-group-padding\s*\);/);
    expect(rule).not.toMatch(/\d+px/);
  });

  it("hides beside a group cmdk has hidden, and under split (which already rules groups)", () => {
    expect(
      declarationsFor(controlStyles, ".ui-command-group[hidden] + .ui-command-separator"),
    ).toMatch(/display:\s*none;/);
    expect(
      declarationsFor(controlStyles, ".ui-command-separator:has(+ .ui-command-group[hidden])"),
    ).toMatch(/display:\s*none;/);
    expect(declarationsFor(controlStyles, ".ui-command[data-split] .ui-command-separator")).toMatch(
      /display:\s*none;/,
    );
  });
});
