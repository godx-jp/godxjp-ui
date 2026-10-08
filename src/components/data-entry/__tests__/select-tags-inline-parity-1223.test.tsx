import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Select } from "../select";

/**
 * v32 #1223 — TagInput folds into `<Select mode="tags" open={false}>`: antd's own spelling of a
 * tags field whose list never opens, rendered as the inline, no-popup chip field TagInput was.
 *
 * PARITY FIRST. This file was written against the retired `TagInput` and compared both, byte for
 * byte and gesture for gesture (`html(<Select mode="tags" open={false} …/>) === html(<TagInput
 * …/>)`, and the arrays each handed to `onValueChange` across Enter / separator / Backspace /
 * blur). All nine cases were red until Select routed the presentation, then green; only then was
 * `TagInput` deleted. The snapshots below are that proven output.
 */
const html = (ui: ReactElement) => renderWithUi(ui).container.innerHTML;

describe("TagInput → <Select mode='tags' open={false}> parity (#1223)", () => {
  const variants: Array<[string, Record<string, unknown>]> = [
    ["empty with placeholder", { placeholder: "Add", "aria-label": "Tags" }],
    ["held tags + name + clear", { defaultValue: ["a", "b"], name: "tags", allowClear: true }],
    ["disabled", { defaultValue: ["a"], disabled: true }],
    ["read-only", { defaultValue: ["a"], readOnly: true }],
    ["size/status/variant", { size: "sm", status: "error", variant: "filled", id: "t" }],
    [
      "maxTagCount + maxTagTextLength",
      { defaultValue: ["abcdef", "b", "c"], maxTagCount: 1, maxTagTextLength: 3 },
    ],
  ];

  it("DOM matches the retired TagInput for every presentation", () => {
    const out = Object.fromEntries(
      variants.map(([name, props]) => [name, html(<Select mode="tags" open={false} {...props} />)]),
    );
    expect(out).toMatchInlineSnapshot(`
      {
        "disabled": "<div data-slot="tag-input" aria-disabled="true" class="ui-tag-input ui-control-surface ui-tag-input-disabled"><ul role="list" class="ui-tag-input-list" data-slot="tag-input-list"><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-chip"><span class="ui-tag-input-chip-label">a</span></li></ul><input class="ui-tag-input-field" disabled="" aria-label="Thêm thẻ" type="text" value=""><span aria-live="polite" class="sr-only" data-slot="tag-input-status">1 thẻ</span></div>",
        "empty with placeholder": "<div data-slot="tag-input" class="ui-tag-input ui-control-surface"><input class="ui-tag-input-field" placeholder="Add" aria-label="Tags" type="text" value=""><span aria-live="polite" class="sr-only" data-slot="tag-input-status">0 thẻ</span></div>",
        "held tags + name + clear": "<div data-slot="tag-input" class="ui-tag-input ui-control-surface"><ul role="list" class="ui-tag-input-list" data-slot="tag-input-list"><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-chip"><span class="ui-tag-input-chip-label">a</span><button type="button" class="ui-tag-input-remove" aria-label="Xóa a"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></li><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-chip"><span class="ui-tag-input-chip-label">b</span><button type="button" class="ui-tag-input-remove" aria-label="Xóa b"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></li></ul><input class="ui-tag-input-field" aria-label="Thêm thẻ" type="text" value=""><button type="button" tabindex="-1" aria-label="Xóa" data-slot="tag-input-clear" class="ui-control-inline-affix-action ui-tag-input-clear"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x ui-control-inline-affix-icon" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button><span aria-live="polite" class="sr-only" data-slot="tag-input-status">2 thẻ</span><input type="hidden" value="a,b" name="tags"></div>",
        "maxTagCount + maxTagTextLength": "<div data-slot="tag-input" class="ui-tag-input ui-control-surface"><ul role="list" class="ui-tag-input-list" data-slot="tag-input-list"><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-chip"><span class="ui-tag-input-chip-label" title="abcdef">abc…</span><button type="button" class="ui-tag-input-remove" aria-label="Xóa abcdef"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></li><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-overflow" tabindex="0" title="b, c" aria-label="Thẻ đang ẩn: b, c">+2</li></ul><input class="ui-tag-input-field" aria-label="Thêm thẻ" type="text" value=""><span aria-live="polite" class="sr-only" data-slot="tag-input-status">3 thẻ</span></div>",
        "read-only": "<div data-slot="tag-input" aria-readonly="true" class="ui-tag-input ui-control-surface"><ul role="list" class="ui-tag-input-list" data-slot="tag-input-list"><li role="listitem" class="ui-tag-input-chip" data-slot="tag-input-chip"><span class="ui-tag-input-chip-label">a</span></li></ul><input class="ui-tag-input-field" readonly="" aria-label="Thêm thẻ" type="text" value=""><span aria-live="polite" class="sr-only" data-slot="tag-input-status">1 thẻ</span></div>",
        "size/status/variant": "<div data-slot="tag-input" data-variant="filled" data-status="error" data-size="sm" aria-invalid="true" class="ui-tag-input ui-control-surface"><input id="t" class="ui-tag-input-field" aria-label="Thêm thẻ" type="text" value=""><span aria-live="polite" class="sr-only" data-slot="tag-input-status">0 thẻ</span></div>",
      }
    `);
  });

  it("the gestures hand the values TagInput handed to onValueChange", async () => {
    const calls: string[][] = [];
    renderWithUi(
      <Select
        mode="tags"
        open={false}
        defaultValue={["a"]}
        maxCount={3}
        onValueChange={(v) => calls.push(v)}
      />,
    );
    const user = userEvent.setup();
    const field = screen.getByRole("textbox");
    await user.type(field, "x{Enter}y,");
    await user.type(field, "{Backspace}");
    await user.type(field, "z");
    field.blur();
    // Recorded from TagInput under the same gestures before it was deleted.
    expect(calls).toEqual([
      ["a", "x"],
      ["a", "x", "y"],
      ["a", "x"],
      ["a", "x", "z"],
    ]);
  });

  it("onValueChange receives exactly one argument, as TagInput's did", async () => {
    const onValueChange = vi.fn();
    renderWithUi(<Select mode="tags" open={false} onValueChange={onValueChange} />);
    await userEvent.setup().type(screen.getByRole("textbox"), "経費{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(["経費"]);
  });

  it("no popup: there is no combobox and no listbox", () => {
    renderWithUi(<Select mode="tags" open={false} aria-label="Tags" />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Tags" })).toBeInTheDocument();
  });

  it("without open={false} a tags Select is still the searchable popup (gh#1063 unchanged)", () => {
    renderWithUi(<Select mode="tags" aria-label="Tags" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
