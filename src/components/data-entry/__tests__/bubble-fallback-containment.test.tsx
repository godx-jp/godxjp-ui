import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Radio } from "../radio";
import { Switch } from "../switch";

// gh#105: Radix rendered a hidden native form-fallback (BubbleSelect/BubbleInput) that was
// `position:absolute` with no top/left, so without a positioned ancestor it inflated
// `document.scrollHeight` → phantom empty scroll space. base.css still clamps
// `[aria-hidden="true"][tabindex="-1"]` to the top-left for any such node. None of the controls
// below emits one any more — each case says what it renders instead and why that cannot inflate
// the page. jsdom does no layout, so the cases assert the structure, not a scrollHeight.

describe("hidden form-fallback is clamp-targetable (gh#105)", () => {
  // react-aria DOES keep a native <select> as the form fallback (it is what browser autofill and
  // a native submit read), but it sits inside an aria-hidden container that is `position: fixed`
  // at the viewport origin and clipped to 1px. A fixed box never contributes to the document's
  // scroll size, which is the whole of gh#105 — so there is nothing for the clamp to catch. The
  // assertion is on the container's own inline style, the thing actually doing the containing.
  it("Select's native <select> fallback is fixed-position and clipped, not an un-positioned bubble", () => {
    renderWithUi(
      <form>
        <Select name="status" defaultValue="a">
          <SelectTrigger aria-label="状態">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectItem value="b">B</SelectItem>
          </SelectContent>
        </Select>
      </form>,
    );
    const native = document.querySelector<HTMLSelectElement>('select[name="status"]');
    expect(native?.value).toBe("a");
    expect(native).toHaveAttribute("tabindex", "-1");
    const container = native?.closest<HTMLElement>('[aria-hidden="true"]');
    expect(container?.style.position).toBe("fixed");
    expect(container?.style.overflow).toBe("hidden");
    expect(document.querySelector('select[aria-hidden="true"][tabindex="-1"]')).toBeNull();
  });

  // Checkbox has NO case here any more, and needs none: react-aria renders no hidden bubble at
  // all. Its `<input type="checkbox">` IS the form control the user operates — visually hidden by
  // a 1×1 clipped `<span>` that is in normal flow, not the un-positioned `position:absolute` node
  // gh#105 was about — so there is nothing left for the clamp to target.

  // RadioGroup, like Checkbox, no longer emits a bubble at all: react-aria's `<input type="radio">`
  // IS the form control, visually hidden by a 1x1 clipped `<span>` that sits in normal flow.
  it("RadioGroup renders no un-positioned hidden bubble", () => {
    renderWithUi(
      <form>
        <Radio.Root name="plan" defaultValue="x">
          <Radio.Item value="x" aria-label="X" />
          <Radio.Item value="y" aria-label="Y" />
        </Radio.Root>
      </form>,
    );
    expect(document.querySelector('input[aria-hidden="true"][tabindex="-1"]')).toBeNull();
  });

  // Switch has NO case here any more, for the same reason as Checkbox: react-aria renders no
  // hidden bubble. Its form value is the plain `<input type="hidden">` switch.tsx writes itself,
  // which is in normal flow and never inflated scrollHeight.
  it("Switch inside a form renders no un-positioned hidden bubble", () => {
    renderWithUi(
      <form>
        <Switch defaultChecked />
      </form>,
    );
    expect(document.querySelector('input[aria-hidden="true"][tabindex="-1"]')).toBeNull();
  });
});
