import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Text } from "../typography";

/**
 * `whitespace` exists because a plain-text note a person typed is content, not formatting: the
 * consumer that prompted it rendered `document.content` and lost every newline. These tests pin the
 * ATTRIBUTE contract — jsdom does not lay text out, so what is verifiable here is which of
 * `truncate` / `clamp` / `whitespace` reaches the DOM, which is exactly where the precedence lives.
 */
describe("Text — whitespace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const note = "一行目\n  二行目はインデント付き\n\n三行目";

  it("omits data-whitespace by default, leaving CSS's own `normal` in place", () => {
    render(<Text as="p">{note}</Text>);
    expect(screen.getByText(/一行目/)).not.toHaveAttribute("data-whitespace");
  });

  it('emits data-whitespace="pre-wrap" and keeps the raw text intact', () => {
    render(
      <Text as="p" whitespace="pre-wrap">
        {note}
      </Text>,
    );
    const text = screen.getByText(/一行目/);
    expect(text).toHaveAttribute("data-whitespace", "pre-wrap");
    // The newlines must survive into the DOM — the attribute is worthless if the text is normalised.
    expect(text.textContent).toBe(note);
  });

  it('omits data-whitespace for an explicit "normal" (the default is inert, not a rule)', () => {
    render(
      <Text as="p" whitespace="normal">
        {note}
      </Text>,
    );
    expect(screen.getByText(/一行目/)).not.toHaveAttribute("data-whitespace");
  });

  it("truncate wins over pre-wrap and warns in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text as="p" truncate whitespace="pre-wrap">
        {note}
      </Text>,
    );
    const text = screen.getByText(/一行目/);
    expect(text).toHaveAttribute("data-truncate", "");
    expect(text).not.toHaveAttribute("data-whitespace");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("mutually exclusive"));
  });

  it("clamp COMPOSES with pre-wrap — first N preserved lines, no warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text as="p" clamp={2} whitespace="pre-wrap">
        {note}
      </Text>,
    );
    const text = screen.getByText(/一行目/);
    expect(text).toHaveAttribute("data-whitespace", "pre-wrap");
    expect(text).toHaveAttribute("data-clamp", "");
    expect(text.style.getPropertyValue("--text-clamp")).toBe("2");
    expect(warn).not.toHaveBeenCalled();
  });

  it("keeps pre-wrap when clamp has already outranked truncate", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text as="p" truncate clamp={3} whitespace="pre-wrap">
        {note}
      </Text>,
    );
    const text = screen.getByText(/一行目/);
    expect(text).not.toHaveAttribute("data-truncate");
    expect(text).toHaveAttribute("data-whitespace", "pre-wrap");
  });

  it("carries pre-wrap onto the child under asChild", () => {
    render(
      <Text asChild whitespace="pre-wrap">
        <div>{note}</div>
      </Text>,
    );
    expect(screen.getByText(/一行目/).tagName).toBe("DIV");
    expect(screen.getByText(/一行目/)).toHaveAttribute("data-whitespace", "pre-wrap");
  });
});
