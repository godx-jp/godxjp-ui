import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { OrgSwitcher } from "../../layout/org-switcher";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "../command";
import { Select } from "../select";

/**
 * `Command split` (gh#699) — a list drawn as ONE ruled box: group padding 0, rows full-bleed with a
 * square highlight, a hairline between rows and none after the last visible one.
 *
 * jsdom does not lay out, so geometry is asserted as a CSS contract here and was MEASURED in
 * Chromium (docs filter facet: 5 rows → 4 dividers, filtered to 1 → 0; first row start == list
 * start; row mark start == CommandInput magnifier start).
 */

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const controlStyles = read("src/styles/control.css");
const controlTokens = read("src/tokens/components/control.css");

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

function Members({ split }: { split?: boolean }) {
  return (
    <Command label="Members" split={split}>
      <CommandInput aria-label="Filter members" />
      <CommandList>
        <CommandGroup>
          <CommandItem value="yamada">Yamada</CommandItem>
          <CommandItem value="sato">Sato</CommandItem>
          <CommandItem value="suzuki">Suzuki</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command split — CSS contract", () => {
  it("zeroes the group padding, squares the row and bleeds it to the panel edge", () => {
    expect(declarationsFor(controlStyles, ".ui-command[data-split] .ui-command-group")).toMatch(
      /padding:\s*var\(--command-list-split-padding\);/,
    );
    const row = declarationsFor(controlStyles, ".ui-command[data-split] .ui-command-item");
    expect(row).toMatch(/border-radius:\s*0;/);
    expect(row).toMatch(/margin-inline:\s*calc\(-1 \* var\(--command-list-split-inset\)\);/);
    // Content starts where CommandInput starts its leading glyph.
    expect(row).toMatch(
      /padding-inline:\s*calc\(var\(--command-list-split-inset\) \+ var\(--command-input-padding-x\)\);/,
    );
    // SearchSelect's listbox is its own element, so split reaches it by name.
    expect(
      declarationsFor(controlStyles, ".ui-command[data-split] .ui-search-select-list"),
    ).toMatch(/padding:\s*var\(--command-list-split-padding\);/);
  });

  it("rules a row only when a row follows it — never after the last visible one", () => {
    const divider = declarationsFor(
      controlStyles,
      ".ui-command[data-split] .ui-command-item:has(+ .ui-command-item)",
    );
    // Logical property (RTL-safe) and the role default resolved at the CALL SITE.
    expect(divider).toMatch(
      /border-block-end:\s*var\(--command-item-divider-width\) solid\s+hsl\(var\(--command-item-divider-color, var\(--border\)\)\);/,
    );
    // No physical property sneaks into any split rule.
    const splitRules = [...controlStyles.matchAll(/\.ui-command\[data-split\][^{]*\{([^}]*)\}/g)]
      .map((m) => m[1])
      .join("\n");
    expect(splitRules).not.toMatch(/\b(?:left|right|top|bottom)\b|border-bottom|padding-left/);
  });

  it("declares the knobs, with the colour as an `initial` role mirror (no :root freeze)", () => {
    expect(controlTokens).toMatch(/--command-list-split-padding:\s*0;/);
    expect(controlTokens).toMatch(/--command-list-split-inset:\s*0px;/);
    expect(controlTokens).toMatch(/--command-item-divider-width:\s*var\(--stroke-hairline\);/);
    expect(controlTokens).toMatch(/--command-item-divider-color:\s*initial;/);
  });

  it("leaves the resting palette row alone", () => {
    const row = declarationsFor(controlStyles, ".ui-command-item");
    expect(row).toMatch(/border-radius:\s*calc\(/);
    expect(row).not.toMatch(/border-block-end/);
    expect(declarationsFor(controlStyles, ".ui-command-group")).toMatch(
      /padding:\s*var\(--command-group-padding\);/,
    );
  });
});

describe("Command split — behaviour", () => {
  it("marks the root with data-split only when asked", () => {
    const { container, unmount } = renderWithUi(<Members split />);
    expect(container.querySelector(".ui-command")).toHaveAttribute("data-split", "");
    unmount();

    const plain = renderWithUi(<Members />);
    expect(plain.container.querySelector(".ui-command")).not.toHaveAttribute("data-split");
  });

  it("unmounts filtered rows, so the last VISIBLE row is the last sibling the divider rule sees", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<Members split />);
    await user.type(screen.getByLabelText("Filter members"), "su");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    // Not hidden-but-present: gone, so `:has(+ .ui-command-item)` matches nothing.
    expect(container.querySelectorAll(".ui-command-item")).toHaveLength(1);
  });

  it("OrgSwitcher renders its list through split instead of private CSS", async () => {
    renderWithUi(
      <OrgSwitcher
        organizations={[
          { id: "a", name: "Alpha" },
          { id: "b", name: "Beta" },
        ]}
        value="a"
        labels={{
          trigger: (name: string) => `Current organization: ${name}`,
          title: "Choose organization",
          search: "Search organizations",
          empty: "No organizations",
          loading: "Loading organizations",
          retry: "Retry",
        }}
        responsive="popover"
        open
      />,
    );
    const option = await screen.findByRole("option", { name: /Alpha/ });
    expect(option.closest(".ui-command")).toHaveAttribute("data-split", "");
  });

  it("Select mode=multiple opens a split list by default; a single-value Select does not", async () => {
    const user = userEvent.setup();
    const options = [
      { value: "tanaka", label: "Tanaka" },
      { value: "sato", label: "Sato" },
    ];
    const multi = renderWithUi(
      <Select mode="multiple" aria-label="Reviewers" defaultValue={[]} options={options} />,
    );
    await user.click(screen.getByRole("combobox", { name: "Reviewers" }));
    const row = await screen.findByRole("option", { name: "Tanaka" });
    expect(row.closest(".ui-command")).toHaveAttribute("data-split", "");
    multi.unmount();

    renderWithUi(<Select showSearch aria-label="Owner" options={options} />);
    await user.click(screen.getByRole("combobox", { name: "Owner" }));
    const single = await screen.findByRole("option", { name: "Tanaka" });
    expect(single.closest(".ui-command")).not.toHaveAttribute("data-split");
  });
});
