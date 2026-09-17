import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  // a native submit read), inside an aria-hidden container clipped to 1px. react-aria pins that
  // container `position: fixed; top: 0; left: 0` INLINE; control.css overrides it to `absolute`
  // with auto insets (gh#708), because a fixed box lands at the corner of any `contain: paint` /
  // `transform` ancestor, and Chromium's drag image of a card holding a Select grew to reach it.
  // At its static position — beside the trigger — the clipped 1px box with its -1px margin still
  // adds no scrollable overflow (measured in Chromium and Firefox), which is what gh#105 needs.
  // jsdom neither lays out nor loads the stylesheet, so this asserts the node the rule keys on
  // and the rule itself; the geometry is measured by scripts/kanban-select-visual.mjs.
  it("Select's native <select> fallback is clipped, unfocusable and held inside the Select by the stylesheet", () => {
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
    expect(container?.style.overflow).toBe("hidden");
    // The exact node `.ui-select-root > [data-react-aria-prevent-focus][aria-hidden="true"]` hits.
    expect(container?.parentElement).toHaveClass("ui-select-root");
    expect(container).toHaveAttribute("data-react-aria-prevent-focus");
    expect(document.querySelector('select[aria-hidden="true"][tabindex="-1"]')).toBeNull();

    const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
    const rule = css.match(
      /\.ui-select-root > \[data-react-aria-prevent-focus\]\[aria-hidden="true"\]\s*\{[^}]*\}/,
    )?.[0];
    expect(rule).toMatch(/position:\s*absolute !important/);
    expect(rule).toMatch(/inset:\s*auto !important/);
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
