import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Input } from "../input";
import { Textarea } from "../textarea";
import { NumberInput } from "../number-input";
import { SearchInput } from "../search-input";
import { PasswordInput } from "../password-input";
import { CONTROL_STATUS_CHROME_CLASS, CONTROL_VARIANT_CHROME_CLASS } from "../control-appearance";

/**
 * antd's two appearance axes on the text-field family — `status` and `variant`.
 *
 * The load-bearing half is NOT the paint: it is that `status="error"` also reports
 * `aria-invalid`, so the red boundary and what a screen reader hears are the same fact. A test
 * that only checked the data attribute would pass with that pairing deleted.
 */
describe("status — antd's validation axis", () => {
  it("Input: error paints the status AND reports aria-invalid", () => {
    renderWithUi(<Input aria-label="金額" status="error" />);
    const field = screen.getByLabelText("金額");
    expect(field).toHaveAttribute("data-status", "error");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("Input: warning paints the status but does NOT claim the field is invalid", () => {
    renderWithUi(<Input aria-label="金額" status="warning" />);
    const field = screen.getByLabelText("金額");
    expect(field).toHaveAttribute("data-status", "warning");
    expect(field).not.toHaveAttribute("aria-invalid");
  });

  it("Input: an explicit aria-invalid wins over status, so FormField is never overwritten", () => {
    renderWithUi(<Input aria-label="金額" status="error" aria-invalid={false} />);
    expect(screen.getByLabelText("金額")).toHaveAttribute("aria-invalid", "false");
  });

  /**
   * THE REGRESSION THIS EXISTS FOR. The status boundary was first written as
   * `.ui-control[data-status="warning"] { border-color: … }` in `@layer components`, and it
   * painted NOTHING: `border-input` is a utility, utilities are a later cascade layer, and a later
   * layer beats any specificity. Chromium measured the warned field at `rgb(144 135 127)` — the
   * resting border. jsdom has no cascade at all, so the only thing a unit test can pin is that the
   * field still carries the utilities that do the painting; the pixel proof is the browser
   * measurement recorded in control-appearance.ts.
   */
  it("Input: carries the status chrome utilities, in the same layer as the resting border", () => {
    renderWithUi(<Input aria-label="金額" status="warning" />);
    const classes = new Set(screen.getByLabelText("金額").className.split(/\s+/));
    for (const cls of CONTROL_STATUS_CHROME_CLASS.split(/\s+/)) {
      expect(classes.has(cls)).toBe(true);
    }
    // …and the outlined chrome it has to outrank is on the same element, in the same layer.
    for (const cls of CONTROL_VARIANT_CHROME_CLASS.outlined.split(/\s+/)) {
      expect(classes.has(cls)).toBe(true);
    }
  });

  it("Textarea: carries the same status chrome utilities", () => {
    renderWithUi(<Textarea aria-label="備考" status="warning" />);
    const classes = new Set(screen.getByLabelText("備考").className.split(/\s+/));
    for (const cls of CONTROL_STATUS_CHROME_CLASS.split(/\s+/)) {
      expect(classes.has(cls)).toBe(true);
    }
  });

  it("Input: no status leaves the field exactly as it was", () => {
    renderWithUi(<Input aria-label="金額" />);
    const field = screen.getByLabelText("金額");
    expect(field).not.toHaveAttribute("data-status");
    expect(field).not.toHaveAttribute("aria-invalid");
  });

  it("Textarea: error paints the status and reports aria-invalid", () => {
    renderWithUi(<Textarea aria-label="備考" status="error" />);
    const field = screen.getByLabelText("備考");
    expect(field).toHaveAttribute("data-status", "error");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("NumberInput: the status reaches BOTH the wrapper and the field it wraps", () => {
    const { container } = renderWithUi(<NumberInput aria-label="数量" status="warning" />);
    expect(container.querySelector('[data-slot="number-input"]')).toHaveAttribute(
      "data-status",
      "warning",
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute("data-status", "warning");
  });

  it("SearchInput: forwards the status onto the real input", () => {
    renderWithUi(<SearchInput ariaLabel="検索" status="error" />);
    expect(screen.getByRole("searchbox")).toHaveAttribute("data-status", "error");
  });

  it("PasswordInput: inherits the status through Input", () => {
    const { container } = renderWithUi(<PasswordInput aria-label="パスワード" status="error" />);
    expect(container.querySelector("input")).toHaveAttribute("data-status", "error");
  });
});

describe("variant — antd's chrome axis", () => {
  /** The classes an Input actually renders with, as a set. */
  function chromeOf(variant?: "outlined" | "filled" | "borderless"): Set<string> {
    const { unmount } = renderWithUi(<Input aria-label="氏名" variant={variant} />);
    const classes = new Set(screen.getByLabelText("氏名").className.split(/\s+/));
    unmount();
    return classes;
  }

  it("Input: outlined is the default", () => {
    renderWithUi(<Input aria-label="氏名" />);
    expect(screen.getByLabelText("氏名")).toHaveAttribute("data-variant", "outlined");
  });

  /**
   * THE LOAD-BEARING ASSERTION. A Tailwind utility sits in `@layer utilities` and outranks every
   * component-layer rule, so the outlined surface has to be ABSENT from the other two variants,
   * not merely overridden by them. Written against the exported chrome map rather than a class
   * literal, so it keeps holding when the utility behind `outlined` is renamed — and it goes red
   * the moment someone moves that chrome back into the unconditional base class list.
   */
  it("Input: filled and borderless carry NONE of the outlined chrome", () => {
    const outlinedChrome = CONTROL_VARIANT_CHROME_CLASS.outlined.split(/\s+/);
    expect(outlinedChrome.length).toBeGreaterThan(0);
    const outlined = chromeOf("outlined");
    const filled = chromeOf("filled");
    const borderless = chromeOf("borderless");
    for (const cls of outlinedChrome) {
      expect(outlined.has(cls)).toBe(true);
      expect(filled.has(cls)).toBe(false);
      expect(borderless.has(cls)).toBe(false);
    }
  });

  it("Input: filled takes the filled surface class", () => {
    renderWithUi(<Input aria-label="氏名" variant="filled" />);
    const field = screen.getByLabelText("氏名");
    expect(field).toHaveAttribute("data-variant", "filled");
    expect(field).toHaveClass("ui-control--filled");
  });

  it("Input: borderless takes the borderless surface class", () => {
    renderWithUi(<Input aria-label="氏名" variant="borderless" />);
    const field = screen.getByLabelText("氏名");
    expect(field).toHaveAttribute("data-variant", "borderless");
    expect(field).toHaveClass("ui-control--borderless");
  });

  it("Textarea: antd's `borderless` and this library's older `ghost` resolve to ONE axis value", () => {
    const { rerender } = renderWithUi(<Textarea aria-label="備考" variant="ghost" />);
    expect(screen.getByLabelText("備考")).toHaveAttribute("data-variant", "borderless");
    rerender(<Textarea aria-label="備考" variant="borderless" />);
    expect(screen.getByLabelText("備考")).toHaveAttribute("data-variant", "borderless");
  });

  it("Textarea: the older `default` resolves to antd's `outlined`", () => {
    renderWithUi(<Textarea aria-label="備考" variant="default" />);
    expect(screen.getByLabelText("備考")).toHaveAttribute("data-variant", "outlined");
  });

  it("Textarea: filled takes the filled multiline chrome, and none of the outlined chrome", () => {
    const { unmount } = renderWithUi(<Textarea aria-label="備考" variant="outlined" />);
    const outlinedClasses = new Set(screen.getByLabelText("備考").className.split(/\s+/));
    unmount();
    renderWithUi(<Textarea aria-label="備考" variant="filled" />);
    const field = screen.getByLabelText("備考");
    const filledClasses = new Set(field.className.split(/\s+/));
    expect(field).toHaveClass("ui-control--filled");
    // The outlined multiline list carries chrome utilities the filled list must not inherit —
    // same cascade-layer reasoning as Input.
    for (const cls of CONTROL_VARIANT_CHROME_CLASS.outlined.split(/\s+/)) {
      expect(outlinedClasses.has(cls)).toBe(true);
      expect(filledClasses.has(cls)).toBe(false);
    }
  });
});

describe("size — the tiers the two text fields were missing", () => {
  it("Input: lg lands as a data-size the control-height tier reads", () => {
    renderWithUi(<Input aria-label="氏名" size="lg" />);
    expect(screen.getByLabelText("氏名")).toHaveAttribute("data-size", "lg");
  });

  it("Textarea: size lands on the field", () => {
    renderWithUi(<Textarea aria-label="備考" size="sm" allowClear />);
    expect(screen.getByLabelText("備考")).toHaveAttribute("data-size", "sm");
  });
});
