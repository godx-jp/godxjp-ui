import * as React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, renderWithUi, screen } from "@/test/render";

import { Input } from "../input";
import { Textarea } from "../textarea";

/**
 * antd's four affix slots and the character counter.
 *
 * The distinction the tests pin is the one antd's docs make in one line and every re-implementation
 * gets wrong: a `prefix`/`suffix` sits INSIDE the field's box (in its padding), an
 * `addonBefore`/`addonAfter` sits OUTSIDE it (its own surface, welded to the border).
 */
describe("Input — prefix / suffix", () => {
  it("puts prefix inside the field's own box, in the leading slot", () => {
    const { container } = renderWithUi(<Input aria-label="金額" prefix={<span>¥</span>} />);
    const wrapper = container.querySelector('[data-slot="input-affix-wrapper"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper!.querySelector('[data-slot="input-leading"]')).toHaveTextContent("¥");
    // Inside the box means inside the field's padding, so the field reserves room for it.
    expect(screen.getByLabelText("金額")).toHaveClass("ui-input--leading-affix");
  });

  it("puts suffix in the trailing slot and reserves room for it", () => {
    renderWithUi(<Input aria-label="割合" suffix={<span>%</span>} />);
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByLabelText("割合")).toHaveClass("ui-input--trailing-affix");
  });

  it("a prefix is NOT aria-hidden, unlike the decorative leadingIcon", () => {
    const { container, rerender } = renderWithUi(
      <Input aria-label="金額" prefix={<span>円</span>} />,
    );
    expect(container.querySelector('[data-slot="input-leading"]')).not.toHaveAttribute(
      "aria-hidden",
    );
    rerender(<Input aria-label="金額" leadingIcon={<span>円</span>} />);
    expect(container.querySelector('[data-slot="input-leading"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("the clear ✕ still replaces the suffix — one trailing node, never two", () => {
    renderWithUi(<Input aria-label="金額" suffix={<span>円</span>} allowClear value="1000" />);
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(screen.queryByText("円")).toBeNull();
  });
});

describe("Input — addonBefore / addonAfter", () => {
  it("renders addons OUTSIDE the field, as siblings of it inside a group", () => {
    const { container } = renderWithUi(
      <Input aria-label="URL" addonBefore="https://" addonAfter=".com" />,
    );
    const group = container.querySelector('[data-slot="input-group"]');
    expect(group).toBeTruthy();
    const before = group!.querySelector('[data-slot="input-addon-before"]');
    const after = group!.querySelector('[data-slot="input-addon-after"]');
    expect(before).toHaveTextContent("https://");
    expect(after).toHaveTextContent(".com");
    // OUTSIDE is the whole distinction: neither addon may be inside the field's affix wrapper.
    expect(before!.closest('[data-slot="input-affix-wrapper"]')).toBeNull();
    expect(after!.closest('[data-slot="input-affix-wrapper"]')).toBeNull();
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
  });

  it("renders no group at all when neither addon is given", () => {
    const { container } = renderWithUi(<Input aria-label="URL" />);
    expect(container.querySelector('[data-slot="input-group"]')).toBeNull();
  });

  it("carries the size tier onto the group, so the addon matches the field height", () => {
    const { container } = renderWithUi(<Input aria-label="URL" size="lg" addonBefore="https://" />);
    expect(container.querySelector('[data-slot="input-group"]')).toHaveAttribute("data-size", "lg");
  });
});

describe("Input — count (antd's character counter)", () => {
  it("counts the value and shows it against the max", () => {
    const { container } = renderWithUi(
      <Input aria-label="件名" defaultValue="hello" count={{ max: 10 }} />,
    );
    expect(container.querySelector('[data-slot="input-count"]')).toHaveTextContent("5 / 10");
  });

  it("follows typing", () => {
    const { container } = renderWithUi(<Input aria-label="件名" count={{ max: 10 }} />);
    fireEvent.change(screen.getByLabelText("件名"), { target: { value: "abc" } });
    expect(container.querySelector('[data-slot="input-count"]')).toHaveTextContent("3 / 10");
  });

  it("counts CODE POINTS, so one emoji and one 全角 kanji are each worth one", () => {
    const { container } = renderWithUi(
      // "東京" is 2 UTF-16 units and 2 code points; "🗼" is 2 UTF-16 units and ONE code point.
      <Input aria-label="件名" defaultValue="東京🗼" count={{ max: 10 }} />,
    );
    expect(container.querySelector('[data-slot="input-count"]')).toHaveTextContent("3 / 10");
  });

  it("reports an overrun instead of truncating the value", () => {
    const { container } = renderWithUi(
      <Input aria-label="件名" defaultValue="abcdef" count={{ max: 3 }} />,
    );
    const counter = container.querySelector('[data-slot="input-count"]')!;
    expect(counter).toHaveAttribute("data-exceeded", "true");
    // The user's text is untouched — truncating mid-conversion is what `exceedFormatter` does and
    // why it is deliberately not implemented here.
    expect(screen.getByLabelText("件名")).toHaveValue("abcdef");
  });

  it("honours a custom formatter and a custom strategy", () => {
    const { container } = renderWithUi(
      <Input
        aria-label="件名"
        defaultValue="東京🗼"
        count={{
          max: 10,
          strategy: (value) => value.length,
          formatter: ({ count, max }) => `残り ${(max ?? 0) - count}`,
        }}
      />,
    );
    // strategy = UTF-16 units → 4, so 10 − 4 = 6.
    expect(container.querySelector('[data-slot="input-count"]')).toHaveTextContent("残り 6");
  });

  it("show:false switches the counter off entirely", () => {
    const { container } = renderWithUi(
      <Input aria-label="件名" defaultValue="abc" count={{ max: 10, show: false }} />,
    );
    expect(container.querySelector('[data-slot="input-count"]')).toBeNull();
  });

  it("is aria-hidden — a per-keystroke number must not be announced", () => {
    const { container } = renderWithUi(<Input aria-label="件名" count={{ max: 10 }} />);
    expect(container.querySelector('[data-slot="input-count"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

describe("Textarea — count and autoSize", () => {
  it("counts the value in its own bottom-end slot", () => {
    const { container } = renderWithUi(
      <Textarea aria-label="備考" defaultValue="東京" count={{ max: 140 }} />,
    );
    expect(container.querySelector('[data-slot="textarea-count"]')).toHaveTextContent("2 / 140");
  });

  it("autoSize={true} is the boolean autoGrow", () => {
    const { container } = renderWithUi(<Textarea aria-label="備考" autoSize />);
    expect(container.querySelector('[data-slot="textarea-affix-wrapper"]')).toHaveClass(
      "ui-textarea-autogrow",
    );
  });

  it("autoSize={{minRows,maxRows}} carries the row bounds onto the same knobs autoGrow uses", () => {
    const { container } = renderWithUi(
      <Textarea aria-label="備考" autoSize={{ minRows: 2, maxRows: 6 }} />,
    );
    const wrapper = container.querySelector('[data-slot="textarea-affix-wrapper"]') as HTMLElement;
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-min-height-rows")).toBe("2");
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-max-height-rows")).toBe("6");
  });

  it("an explicit minRows/maxRows still wins over the autoSize object", () => {
    const { container } = renderWithUi(
      <Textarea aria-label="備考" autoSize={{ minRows: 2, maxRows: 6 }} minRows={4} />,
    );
    const wrapper = container.querySelector('[data-slot="textarea-affix-wrapper"]') as HTMLElement;
    expect(wrapper.style.getPropertyValue("--textarea-autogrow-min-height-rows")).toBe("4");
  });

  it("autoSize={false} does not grow", () => {
    const { container } = renderWithUi(<Textarea aria-label="備考" autoSize={false} />);
    expect(container.querySelector(".ui-textarea-autogrow")).toBeNull();
  });
});
