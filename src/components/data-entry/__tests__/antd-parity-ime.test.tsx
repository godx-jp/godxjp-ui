import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderWithUi, screen, waitFor } from "@/test/render";

import { NumberInput } from "../number-input";
import { SearchInput } from "../search-input";
import { Textarea } from "../textarea";

/**
 * JAPANESE INPUT IS THE CASE THESE CONTROLS ARE FOR, and an IME breaks the assumption every
 * Latin-first field makes: that the text in the box is the user's answer. Between
 * `compositionstart` and `compositionend` it is a CANDIDATE — a reading being converted — and
 * every keystroke of it fires a real `input` event.
 *
 * Two defects follow from ignoring that, and both are gated here:
 *   1. Enter during a conversion is "confirm this candidate", not "commit this field".
 *   2. A debounced search fires one query per intermediate kana.
 *
 * A third gate covers 全角 (full-width) digits, which `Number()` parses only half-way: `Number`
 * reads `１２３` but not `１．５`, so a value typed in full-width mode used to clear itself on blur.
 */

/** Drive one IME conversion over a field: start → intermediate readings → confirmed text. */
function convert(field: HTMLElement, readings: string[], confirmed: string) {
  fireEvent.compositionStart(field);
  for (const reading of readings) {
    fireEvent.change(field, { target: { value: reading } });
  }
  fireEvent.change(field, { target: { value: confirmed } });
  fireEvent.compositionEnd(field, { data: confirmed });
}

describe("NumberInput — IME composition", () => {
  it("does not commit while a conversion is in flight, and commits once it is confirmed", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="数量" onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");

    fireEvent.focus(field);
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "1" } });
    fireEvent.change(field, { target: { value: "12" } });
    // Mid-conversion the box holds a candidate, so nothing may reach the form.
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(field, { target: { value: "12" } });
    fireEvent.compositionEnd(field, { data: "12" });
    expect(onValueChange).toHaveBeenCalledWith(12);
  });

  it("Enter that CONFIRMS a conversion does not reformat the field out from under it", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="数量" onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton") as HTMLInputElement;

    fireEvent.focus(field);
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "１２３" } });
    // The IME swallows this Enter to accept the candidate; the field must not treat it as a
    // commit, or the候補 the user was choosing is replaced by a formatted number.
    fireEvent.keyDown(field, { key: "Enter" });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveValue("１２３");
  });

  it("ArrowUp during a conversion walks the candidate list, it does not step the value", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="数量" defaultValue={5} onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");

    fireEvent.focus(field);
    fireEvent.compositionStart(field);
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(field, { data: "5" });
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenCalledWith(6);
  });
});

describe("NumberInput — 全角 (full-width) numerals", () => {
  it("commits a full-width decimal instead of clearing the field on blur", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="単価" step={0.1} onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");

    fireEvent.focus(field);
    // `Number("１．５")` is NaN — full-width digits parse, the full-width period does not.
    fireEvent.change(field, { target: { value: "１．５" } });
    fireEvent.blur(field);

    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
    // …and the field keeps the value rather than clearing itself, which is what NaN used to do.
    // The rendered text is the LOCALE's decimal mark, so the assertion is "not empty", not "1.5".
    expect(field).not.toHaveValue("");
  });

  it("reads a full-width minus sign", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="差額" min={-100} onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "－２０" } });
    fireEvent.blur(field);
    expect(onValueChange).toHaveBeenLastCalledWith(-20);
  });

  it("drops a thousands separator typed in either width", () => {
    const onValueChange = vi.fn();
    renderWithUi(<NumberInput aria-label="金額" onValueChange={onValueChange} />);
    const field = screen.getByRole("spinbutton");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "１，２３４" } });
    fireEvent.blur(field);
    expect(onValueChange).toHaveBeenLastCalledWith(1234);
  });
});

describe("SearchInput — IME composition", () => {
  it("does not query the intermediate readings of a conversion", async () => {
    vi.useFakeTimers();
    try {
      const onSearch = vi.fn();
      renderWithUi(<SearchInput ariaLabel="検索" debounce={10} onSearch={onSearch} />);
      const field = screen.getByRole("searchbox");

      // 「東京」 is typed as t-o-u-k-y-o-u and converted; each reading is a real input event.
      convert(field, ["と", "とう", "とうき", "とうきょ", "とうきょう"], "東京");
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Exactly one query, for the CONFIRMED text — not five for the readings.
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("東京");
    } finally {
      vi.useRealTimers();
    }
  });

  it("still debounces ordinary (non-composed) typing", async () => {
    const onSearch = vi.fn();
    renderWithUi(<SearchInput ariaLabel="検索" debounce={5} onSearch={onSearch} />);
    const field = screen.getByRole("searchbox");
    fireEvent.change(field, { target: { value: "INV-1" } });
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("INV-1");
    });
  });
});

describe("Textarea — IME composition (the guard that was already here, now pinned)", () => {
  it("holds the auto-grow mirror still during a conversion and re-syncs once at the end", () => {
    const { container } = renderWithUi(<Textarea aria-label="備考" autoGrow />);
    const field = screen.getByLabelText("備考");
    const wrapper = container.querySelector('[data-slot="textarea-affix-wrapper"]')!;

    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "とうきょう" } });
    // The mirror is what sizes the box; resizing per candidate dismisses the候補 window.
    expect(wrapper).toHaveAttribute("data-autogrow-value", "");

    fireEvent.change(field, { target: { value: "東京" } });
    fireEvent.compositionEnd(field, { data: "東京" });
    expect(wrapper).toHaveAttribute("data-autogrow-value", "東京");
  });
});
