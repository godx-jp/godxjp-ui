import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { Segmented } from "../segmented";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
const segmentedTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/segmented.css"),
  "utf8",
);

function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(stripped)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

describe("Segmented", () => {
  it("is a radio GROUP, not a row of pressed toggles", () => {
    render(<Segmented aria-label="Theme" defaultValue="light" options={THEME_OPTIONS} />);

    // The whole reason this is not a ToggleGroup: one-of-N announces as a radio group, and every
    // member announces as selected / not selected rather than pressed / not pressed.
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toHaveAttribute("aria-pressed");
    }
  });

  it("reports the chosen value and marks exactly one member selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented
        aria-label="Theme"
        defaultValue="light"
        onValueChange={onValueChange}
        options={THEME_OPTIONS}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "System" }));

    expect(onValueChange).toHaveBeenCalledWith("system");
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" })).not.toBeChecked();
  });

  it("stays where a controlled value puts it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented
        aria-label="Theme"
        value="dark"
        onValueChange={onValueChange}
        options={THEME_OPTIONS}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Light" }));

    expect(onValueChange).toHaveBeenCalledWith("light");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });

  it("moves between members with the arrow keys, one tab stop for the group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented
        aria-label="Theme"
        defaultValue="light"
        onValueChange={onValueChange}
        options={THEME_OPTIONS}
      />,
    );

    await user.tab();
    expect(screen.getByRole("radio", { name: "Light" })).toHaveFocus();
    // Roving tabindex: Tab enters the group once, arrows move inside it.
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("tabindex", "-1");

    // Arrows move WITHIN the group — the behaviour that separates a radio group from a row of
    // toggle buttons, where every member is its own tab stop.
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("dark");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });

  it("disables one option without disabling the group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented
        aria-label="Theme"
        defaultValue="light"
        onValueChange={onValueChange}
        options={[
          ...THEME_OPTIONS.slice(0, 2),
          { value: "system", label: "System", disabled: true },
        ]}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "System" }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "Dark" }));
    expect(onValueChange).toHaveBeenCalledWith("dark");
  });

  it("renders the icon decoratively — the label carries the accessible name", () => {
    render(
      <Segmented
        aria-label="Theme"
        defaultValue="light"
        options={[
          { value: "light", label: "Light", icon: <svg data-testid="sun" /> },
          { value: "dark", label: "Dark" },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByTestId("sun").closest("[data-slot='segmented-item-icon']")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("takes its focus mark from the ONE source, never its own", () => {
    render(<Segmented aria-label="Theme" defaultValue="light" options={THEME_OPTIONS} />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveClass("ui-focus-ring");
    }
    // styles/focus-ring.css owns every outline/box-shadow the mark paints; nothing here may.
    const item = declarationsFor(controlStyles, ".ui-segmented-item");
    expect(item).not.toMatch(/outline:/);
    expect(item).not.toMatch(/box-shadow:\s*(?!var\(--segmented)/);
  });

  it("measures exactly one --control-height, so it sits level with an Input", () => {
    // label height = control height − track padding × 2, and the track adds that padding back.
    expect(segmentedTokens).toContain(
      "--segmented-item-height: calc(var(--control-height) - var(--segmented-track-padding) * 2);",
    );
    const track = declarationsFor(controlStyles, ".ui-segmented");
    expect(track).toMatch(/padding:\s*var\(--segmented-track-padding\);/);
    expect(declarationsFor(controlStyles, ".ui-segmented-item")).toMatch(
      /height:\s*var\(--segmented-item-height\);/,
    );
    // Every length is a knob — no literal may appear in either rule.
    expect(track).not.toMatch(/\d+(?:\.\d+)?(?:px|rem|em)/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Segmented aria-label="Theme" defaultValue="light" options={THEME_OPTIONS} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
