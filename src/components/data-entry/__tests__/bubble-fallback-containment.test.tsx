import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Checkbox } from "../checkbox";
import { Radio } from "../radio";
import { Switch } from "../switch";

// Radix renders a hidden native form-fallback (BubbleSelect/BubbleInput) for these controls. It is
// `position:absolute` with no top/left, so without a positioned ancestor it inflates
// `document.scrollHeight` → phantom empty scroll space (gh#105). jsdom does no layout, so we can't
// measure scrollHeight here; instead we assert each fallback carries the attributes our base-layer
// clamp targets (`[aria-hidden="true"][tabindex="-1"]`) so the CSS pins it to top-left. If Radix
// ever changes these attributes, this fails and tells us the clamp selector needs updating.
const clampTargetable = (el: Element | null) =>
  !!el && el.getAttribute("aria-hidden") === "true" && el.getAttribute("tabindex") === "-1";

describe("hidden form-fallback is clamp-targetable (gh#105)", () => {
  it("Select renders a clamp-targetable native <select> fallback", () => {
    renderWithUi(
      <form>
        <Select name="status" defaultValue="a">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectItem value="b">B</SelectItem>
          </SelectContent>
        </Select>
      </form>,
    );
    expect(clampTargetable(document.querySelector('select[aria-hidden="true"]'))).toBe(true);
  });

  it("Checkbox renders a clamp-targetable native <input> fallback", () => {
    renderWithUi(
      <form>
        <Checkbox name="agree" defaultChecked />
      </form>,
    );
    expect(clampTargetable(document.querySelector('input[aria-hidden="true"]'))).toBe(true);
  });

  it("RadioGroup renders a clamp-targetable native <input> fallback", () => {
    renderWithUi(
      <form>
        <Radio.Root name="plan" defaultValue="x">
          <Radio.Item value="x" />
          <Radio.Item value="y" />
        </Radio.Root>
      </form>,
    );
    expect(clampTargetable(document.querySelector('input[aria-hidden="true"]'))).toBe(true);
  });

  it("Switch inside a form renders a clamp-targetable native <input> fallback", () => {
    renderWithUi(
      <form>
        <Switch defaultChecked />
      </form>,
    );
    // Radix Switch only emits the bubble when it is a form control; pick the aria-hidden one.
    const bubble = Array.from(document.querySelectorAll('input[aria-hidden="true"]')).find(
      (el) => el.getAttribute("tabindex") === "-1",
    );
    expect(clampTargetable(bubble ?? null)).toBe(true);
  });
});
