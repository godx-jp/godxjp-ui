import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo, logoGlyphInk } from "../logo";

/**
 * gh#370 — the glyph's optical offset is chosen by CLASS, and the class is the (top edge, bottom
 * edge) of the UNION of the string's ink. Getting the union wrong is the way this goes wrong
 * silently: `"gX"` reads cap→descender, not `"g"`'s x-height→descender, and picking the class off
 * the first character alone would shift a two-letter lockup by a fifth of an em.
 */
describe("logoGlyphInk", () => {
  it.each([
    ["G", "cap-baseline"],
    ["GX", "cap-baseline"],
    ["TH", "cap-baseline"],
    ["8", "cap-baseline"],
    ["b", "cap-baseline"],
    ["kt", "cap-baseline"],
    ["J", "cap-baseline"],
    ["i", "cap-baseline"],
  ])("reads %s as %s — cap height or an ascender on the baseline", (glyph, ink) => {
    expect(logoGlyphInk(glyph)).toBe(ink);
  });

  it.each([
    ["神", "cap-baseline"],
    ["あ", "cap-baseline"],
    ["ン", "cap-baseline"],
    ["神A", "cap-baseline"],
    ["Aあ", "cap-baseline"],
  ])("reads %s as %s — the em box centres where a capital does", (glyph, ink) => {
    expect(logoGlyphInk(glyph)).toBe(ink);
  });

  it.each([
    ["x", "x-baseline"],
    ["o", "x-baseline"],
    ["xo", "x-baseline"],
    ["ae", "x-baseline"],
  ])("reads %s as %s — nothing above the x-height", (glyph, ink) => {
    expect(logoGlyphInk(glyph)).toBe(ink);
  });

  it.each([
    ["g", "x-descender"],
    ["y", "x-descender"],
    ["p", "x-descender"],
    ["go", "x-descender"],
  ])("reads %s as %s — an x-height top over a descender", (glyph, ink) => {
    expect(logoGlyphInk(glyph)).toBe(ink);
  });

  it.each([
    ["gX", "cap-descender"],
    ["Gy", "cap-descender"],
    ["Bp", "cap-descender"],
    ["hy", "cap-descender"],
    ["神g", "cap-descender"],
    ["gあ", "cap-descender"],
  ])("reads %s as %s — the UNION reaches cap height AND a descender", (glyph, ink) => {
    expect(logoGlyphInk(glyph)).toBe(ink);
  });

  it("leaves a non-string glyph unclassified rather than guessing", () => {
    expect(logoGlyphInk(<svg />)).toBeUndefined();
    expect(logoGlyphInk(undefined)).toBeUndefined();
    expect(logoGlyphInk(null)).toBeUndefined();
    expect(logoGlyphInk(42)).toBeUndefined();
  });

  it("leaves an empty or whitespace-only glyph unclassified", () => {
    expect(logoGlyphInk("")).toBeUndefined();
    expect(logoGlyphInk("   ")).toBeUndefined();
  });
});

describe("Logo glyph ink attribute", () => {
  it("emits the class on the glyph element, not on the box", () => {
    render(<Logo glyph="GX" label="mark" />);
    const glyph = screen.getByLabelText("mark").querySelector('[data-slot="logo-glyph"]');
    expect(glyph).toHaveAttribute("data-ink", "cap-baseline");
  });

  it("classifies the shipped default glyph `g` as a descender mark", () => {
    render(<Logo label="mark" />);
    expect(screen.getByLabelText("mark").querySelector('[data-slot="logo-glyph"]')).toHaveAttribute(
      "data-ink",
      "x-descender",
    );
  });

  it("omits the attribute for artwork, which has no text to centre", () => {
    render(<Logo glyph={<svg data-testid="art" />} label="mark" />);
    expect(
      screen.getByLabelText("mark").querySelector('[data-slot="logo-glyph"]'),
    ).not.toHaveAttribute("data-ink");
  });
});
