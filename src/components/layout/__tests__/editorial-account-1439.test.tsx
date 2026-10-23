/**
 * gh#1439 — the editorial account family: the signed-in pages of an editorial site (a collection,
 * display settings, sign-in). Before: none of these shapes could be built without a className or
 * style. Every geometry value is an `--editorial-*` token so a theme re-declares it under its own
 * width queries.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditorialToggleGroup } from "../editorial-account";
import * as layout from "../index";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const css = read("../../../styles/editorial-account-layout.css");
const tokens = read("../../../tokens/components/editorial-account.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))]
    .map((m) => m[1])
    .join("\n");
};

describe("editorial account family wiring (gh#1439)", () => {
  it("is exported from the layout barrel, and its layer and tokens are imported by the stylesheets", () => {
    expect(layout.EditorialToggleGroup).toBe(EditorialToggleGroup);
    expect(read("../../../styles/index.css")).toContain(
      '@import "./editorial-account-layout.css";',
    );
    expect(read("../../../styles/core.css")).toContain('@import "./editorial-account-layout.css";');
    expect(read("../../../tokens/base.css")).toContain(
      '@import "./components/editorial-account.css";',
    );
  });

  it("names no breakpoint in its rules (a theme re-declares the tokens instead)", () => {
    expect(css).not.toMatch(/@media\s*\((min|max)?-?width/);
  });
});

describe("EditorialToggleGroup (gh#1439)", () => {
  const items = [
    { value: "all", label: "All items" },
    { value: "card", label: "Cards" },
    { value: "product", label: "Sealed" },
  ];

  it("is a named group of aria-pressed buttons; clicking one reports its value", () => {
    const onValueChange = vi.fn();
    render(
      <EditorialToggleGroup
        aria-label="Collection type"
        items={items}
        value="all"
        onValueChange={onValueChange}
      />,
    );
    const group = screen.getByRole("group", { name: "Collection type" });
    expect(group).toHaveAttribute("data-variant", "text");
    expect(screen.getByRole("button", { name: "All items" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Cards" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Sealed" }));
    expect(onValueChange).toHaveBeenCalledWith("product");
  });

  it("icon variant: icon-only buttons are named by their label and the glyph is hidden", () => {
    render(
      <EditorialToggleGroup
        aria-label="View"
        variant="icon"
        value="list"
        onValueChange={() => {}}
        items={[
          { value: "grid", label: "Grid view", icon: <svg data-testid="g" /> },
          { value: "list", label: "List view", icon: <svg data-testid="l" /> },
        ]}
      />,
    );
    const list = screen.getByRole("button", { name: "List view" });
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(list.textContent).toBe("");
    expect(screen.getByTestId("l").parentElement).toHaveAttribute("aria-hidden");
  });

  it("reads every length from tokens: 44px targets, bordered pressed text, framed icon group", () => {
    expect(tokens).toContain(
      "--editorial-toggle-group-option-min-height: var(--touch-target-min, 2.75rem);",
    );
    expect(tokens).toContain("--editorial-toggle-group-option-padding-inline: 1rem;");
    expect(tokens).toContain("--editorial-toggle-group-frame-padding: 2px;");
    expect(rule(".ui-editorial-toggle-group-option")).toContain(
      "min-height: var(--editorial-toggle-group-option-min-height)",
    );
    expect(rule('.ui-editorial-toggle-group-option[aria-pressed="true"]')).toContain(
      "var(--editorial-toggle-group-pressed-background, hsl(var(--muted)))",
    );
    expect(rule('.ui-editorial-toggle-group[data-variant="icon"]')).toContain(
      "padding: var(--editorial-toggle-group-frame-padding)",
    );
    expect(rule(".ui-editorial-toggle-group")).toContain(
      "justify-content: var(--editorial-toggle-group-align-inline)",
    );
  });
});
