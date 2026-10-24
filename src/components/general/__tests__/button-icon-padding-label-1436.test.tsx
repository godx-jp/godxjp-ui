/**
 * gh#1436 — a labelled Button with a glyph keeps the label padding; only an icon-only Button takes
 * the narrower icon padding. Before: `:has(> svg)` matched both, so "Start →" lost half its padding.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { ArrowRight, Search } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "../button";

const control = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

describe("Button icon padding vs a label (gh#1436)", () => {
  it("marks a labelled button (plain and asChild), never an icon-only one", () => {
    render(
      <>
        <Button>
          コレクションをはじめる
          <ArrowRight aria-hidden />
        </Button>
        <Button asChild>
          <a href="/collection/">
            Start
            <ArrowRight aria-hidden />
          </a>
        </Button>
        <Button aria-label="検索">
          <Search aria-hidden />
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "コレクションをはじめる" })).toHaveAttribute(
      "data-label",
    );
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("data-label");
    expect(screen.getByRole("button", { name: "検索" })).not.toHaveAttribute("data-label");
  });

  it("applies the icon padding only to unlabelled buttons, at every size", () => {
    for (const size of ["default-size", "md", "sm", "lg", "xs"]) {
      expect(control).toMatch(
        new RegExp(`\\.ui-button--${size}:has\\(> svg\\):not\\(\\[data-label\\]\\)`),
      );
      expect(control).not.toMatch(new RegExp(`\\.ui-button--${size}:has\\(> svg\\)\\s*[,{]`));
    }
  });
});
