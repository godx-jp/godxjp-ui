/**
 * gh#1555 — `RadioGroup optionType="card"`, `leading` / `extra`, and labelled sections.
 *
 * Card is PAINT over the same radiogroup: the roles stay `radiogroup` / `radio`, the whole row is
 * the radio's label, and sections are `role="group"`s INSIDE the one radiogroup, so the arrow keys
 * run across them.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { Badge } from "../../data-display/badge";
import { RadioGroup } from "../radio";

const SECTIONS = [
  {
    label: "Organizations · 2",
    options: [
      {
        value: "acme",
        label: "Acme",
        description: "Owner · 12 members",
        leading: <span data-testid="acme-mark">A</span>,
        extra: <Badge>Last used</Badge>,
      },
      { value: "globex", label: "Globex", description: "Member · 4 members" },
    ],
  },
  {
    label: "Personal",
    appearance: "muted" as const,
    options: [{ value: "me", label: "Personal workspace" }],
  },
];

describe("RadioGroup optionType=card (gh#1555)", () => {
  it("is paint: one radiogroup, a radio per option, data-option-type=card", () => {
    renderWithUi(
      <RadioGroup aria-label="Context" optionType="card" options={SECTIONS} defaultValue="acme" />,
    );
    const group = screen.getByRole("radiogroup", { name: "Context" });
    expect(group).toHaveAttribute("data-option-type", "card");
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(document.querySelectorAll('[data-slot="radio-card"]')).toHaveLength(3);
  });

  it("names a card by its label only; description and extra describe it; leading is hidden", () => {
    renderWithUi(
      <RadioGroup aria-label="Context" optionType="card" options={SECTIONS} defaultValue="acme" />,
    );
    const acme = screen.getByRole("radio", { name: "Acme" });
    expect(acme).toHaveAccessibleDescription(/Last used/);
    expect(acme).toHaveAccessibleDescription(/Owner · 12 members/);
    expect(screen.getByTestId("acme-mark").closest("[aria-hidden='true']")).not.toBeNull();
    // A card without description/extra has no description at all (no dangling ids).
    expect(screen.getByRole("radio", { name: "Globex" })).toHaveAccessibleDescription(
      "Member · 4 members",
    );
    expect(screen.getByRole("radio", { name: "Personal workspace" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("a press anywhere on the row selects it (the row is the label)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <RadioGroup
        aria-label="Context"
        optionType="card"
        options={SECTIONS}
        defaultValue="acme"
        onValueChange={onValueChange}
      />,
    );
    // Click the description text of Globex, not its dot.
    await user.click(screen.getByText("Member · 4 members"));
    expect(onValueChange).toHaveBeenCalledWith("globex");
    expect(screen.getByRole("radio", { name: "Globex" })).toBeChecked();
    const card = screen.getByRole("radio", { name: "Globex" }).closest('[data-slot="radio-card"]');
    expect(card).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByRole("radio", { name: "Acme" }).closest('[data-slot="radio-card"]'),
    ).toHaveAttribute("data-state", "unchecked");
  });

  it("each section is a labelled group inside the radiogroup; muted is exposed as data", () => {
    renderWithUi(
      <RadioGroup aria-label="Context" optionType="card" options={SECTIONS} defaultValue="acme" />,
    );
    const radiogroup = screen.getByRole("radiogroup");
    const org = within(radiogroup).getByRole("group", { name: "Organizations · 2" });
    const personal = within(radiogroup).getByRole("group", { name: "Personal" });
    expect(within(org).getAllByRole("radio")).toHaveLength(2);
    expect(within(personal).getAllByRole("radio")).toHaveLength(1);
    expect(personal).toHaveAttribute("data-appearance", "muted");
    expect(org).not.toHaveAttribute("data-appearance");
  });

  it("arrow keys cross section boundaries (one radiogroup), and wrap", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <RadioGroup
        aria-label="Context"
        optionType="card"
        options={SECTIONS}
        defaultValue="globex"
      />,
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "Globex" })).toHaveFocus();
    await user.keyboard("[ArrowDown]");
    expect(screen.getByRole("radio", { name: "Personal workspace" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Personal workspace" })).toBeChecked();
    await user.keyboard("[ArrowUp]");
    expect(screen.getByRole("radio", { name: "Globex" })).toBeChecked();
  });

  it("option ids stay unique across sections (one running index)", () => {
    renderWithUi(
      <RadioGroup
        aria-label="Context"
        optionType="card"
        options={[
          { label: "One", options: [{ value: "x", label: "X" }] },
          { label: "Two", options: [{ value: "y", label: "Y" }] },
        ]}
      />,
    );
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sections also work for the default dots; a button bar flattens them", () => {
    const { unmount } = renderWithUi(<RadioGroup aria-label="Dots" options={SECTIONS} />);
    expect(screen.getByRole("group", { name: "Personal" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    unmount();
    renderWithUi(<RadioGroup aria-label="Bar" optionType="button" options={SECTIONS} />);
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("a disabled card cannot be picked; leading/extra are ignored by the default dots", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <RadioGroup
        aria-label="Context"
        optionType="card"
        defaultValue="a"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true },
        ]}
      />,
    );
    await user.click(screen.getByText("B"));
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "B" }).closest('[data-slot="radio-card"]'),
    ).toHaveAttribute("data-disabled");
  });
});

describe("card stylesheet contract (gh#1555 / #1543)", () => {
  const css = readFileSync(resolve(__dirname, "../../../styles/control.css"), "utf8");

  it("the focus mark is drawn inside the card and drops its outer halo", () => {
    expect(css).toMatch(
      /\.ui-radio-card\[data-focus-visible\]\s*\{[^}]*--focus-ring-contained-offset:\s*var\(--focus-ring-inset-offset\)[^}]*--focus-field-shadow:\s*none/,
    );
  });

  it("selected is a ring on ::after (survives the focus box-shadow), not colour alone", () => {
    expect(css).toMatch(
      /\.ui-radio-card\[data-state="checked"\]::after\s*\{[^}]*box-shadow:\s*inset/,
    );
  });

  it("uses logical properties only", () => {
    const block = css.slice(css.indexOf(".ui-radio-card {"), css.indexOf("── SEGMENTED"));
    expect(block).not.toMatch(/(?:margin|padding|border)-(?:left|right)\b|\b(?:left|right):/);
  });
});
