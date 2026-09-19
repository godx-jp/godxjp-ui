import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

/**
 * `ToggleGroup type="single"` — the emptiness rule DECIDES the role (gh#744).
 *
 * The defect: React Aria stamps `role="radiogroup"` on every single group and `role="radio"` +
 * `aria-checked` on every item of one, whether or not the group can be emptied — and this
 * library's single group CAN be emptied by pressing the selected item again. ARIA has no
 * "press again to deselect" for a radio: a radiogroup that has a selection always has exactly
 * one checked item, so a screen reader was handed a radiogroup with nothing checked immediately
 * after the user activated one of its radios. The library also contradicted itself about it —
 * the `Radio` and `Segmented` catalog entries both justify themselves by saying a ToggleGroup is
 * "a row of aria-pressed buttons" that "permits 'none chosen'", which it was not.
 *
 * MEASURED in Chromium (dev preview :6199, /isolate/data-entry-toggle-group, 1440px, 6 chips),
 * before and after, reading the live accessibility tree:
 *
 *   BEFORE, `type="single" variant="soft" shape="pill" wrap`, one chip selected
 *     radiogroup "ファセット絞り込み" → radio ×6, first [checked], every tabIndex 0
 *     click the checked chip again → radiogroup with 0 of 6 checked, `onValueChange("")`
 *     ArrowRight → focus moved, aria-checked unchanged (a radiogroup navigating as a toolbar)
 *
 *   AFTER, same markup, no new prop
 *     group "ファセット絞り込み" → button ×6, first [pressed], every tabIndex 0
 *     click the pressed chip again → 6 × aria-pressed="false", `onValueChange("")` — expressible
 *     ArrowRight → focus moves, pressed state unchanged; Space presses the focused chip
 *
 *   AFTER, `disallowEmptySelection`
 *     radiogroup "並び替え" → radio ×6, one [checked], tabIndex [0,-1,-1,-1,-1,-1]
 *     click the checked radio again → still checked, value unchanged
 *     ArrowRight → focus AND selection move together, the roving tab stop follows
 *     Tab → leaves the group and the selection does NOT move (RAC's toolbar Tab handler focuses
 *     the last item on the way out; selection-follows-focus is gated to arrow keys because of it)
 *
 *   `type="multiple"` is untouched: role="toolbar", no item role, aria-pressed per item.
 */
const TAGS = ["design", "runbook", "security", "onboarding", "incident", "contract"];

function Row(props: {
  type?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  defaultValue?: string;
  onValueChange?: (value: never) => void;
}) {
  const { type = "single", ...rest } = props;
  return (
    <ToggleGroup
      {...(type === "single"
        ? { type: "single" as const, defaultValue: props.defaultValue ?? "design" }
        : { type: "multiple" as const, defaultValue: ["design"] })}
      {...(rest as Record<string, unknown>)}
      variant="soft"
      shape="pill"
      wrap
      aria-label="Tags"
    >
      {TAGS.map((tag) => (
        <ToggleGroupItem key={tag} value={tag}>
          {tag}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

describe("ToggleGroup type=single — role follows the emptiness rule (gh#744)", () => {
  it("exposes role=group with aria-pressed items by default, never radio", () => {
    render(<Row />);

    const group = screen.getByRole("group", { name: "Tags" });
    expect(group).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);

    const items = screen.getAllByRole("button");
    expect(items).toHaveLength(6);
    expect(items.map((item) => item.getAttribute("aria-pressed"))).toEqual([
      "true",
      "false",
      "false",
      "false",
      "false",
      "false",
    ]);
    expect(items.every((item) => item.getAttribute("aria-checked") === null)).toBe(true);
  });

  it("drops aria-orientation with the role, which `group` does not take", () => {
    render(<Row />);
    expect(screen.getByRole("group", { name: "Tags" })).not.toHaveAttribute("aria-orientation");
  });

  it("clears on a second press and reports the empty value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row onValueChange={onValueChange as never} />);

    await user.click(screen.getByRole("button", { name: "design", pressed: true }));

    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(
      screen.getAllByRole("button").every((item) => item.getAttribute("aria-pressed") === "false"),
    ).toBe(true);
  });

  it("moves FOCUS, not the pressed state, with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Row />);

    const items = screen.getAllByRole("button");
    items[0].focus();
    await user.keyboard("{ArrowRight}");

    expect(items[1]).toHaveFocus();
    expect(items[0]).toHaveAttribute("aria-pressed", "true");
    expect(items[1]).toHaveAttribute("aria-pressed", "false");

    await user.keyboard(" ");
    expect(items[1]).toHaveAttribute("aria-pressed", "true");
    expect(items[0]).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ToggleGroup disallowEmptySelection — the radio reading becomes true (gh#744)", () => {
  it("exposes role=radiogroup with aria-checked radios", () => {
    render(<Row disallowEmptySelection />);

    expect(screen.getByRole("radiogroup", { name: "Tags" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(6);
    expect(radios.map((radio) => radio.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
      "false",
      "false",
      "false",
    ]);
    expect(radios.every((radio) => radio.getAttribute("aria-pressed") === null)).toBe(true);
  });

  it("puts ONE tab stop on the checked radio, as APG requires", () => {
    render(<Row disallowEmptySelection />);
    expect(screen.getAllByRole("radio").map((radio) => radio.tabIndex)).toEqual([
      0, -1, -1, -1, -1, -1,
    ]);
  });

  it("keeps the selection when the checked radio is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row disallowEmptySelection onValueChange={onValueChange as never} />);

    await user.click(screen.getByRole("radio", { name: "design", checked: true }));

    expect(screen.getByRole("radio", { name: "design" })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalledWith("");
  });

  it("moves the SELECTION with the arrow keys, and the tab stop with it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row disallowEmptySelection onValueChange={onValueChange as never} />);

    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.keyboard("{ArrowRight}");

    expect(radios[1]).toHaveFocus();
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("runbook");
    expect(radios.map((radio) => radio.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1]);

    await user.keyboard("{ArrowLeft}");
    expect(radios[0]).toBeChecked();
  });

  it("does not move the selection when Tab leaves the group", async () => {
    const user = userEvent.setup();
    render(<Row disallowEmptySelection />);

    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.tab();

    expect(radios[0]).toBeChecked();
    expect(radios[5]).not.toBeChecked();
  });
});

describe("ToggleGroup type=multiple — untouched by gh#744", () => {
  it("stays a toolbar of aria-pressed buttons", () => {
    render(<Row type="multiple" />);

    expect(screen.getByRole("toolbar", { name: "Tags" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    const items = screen.getAllByRole("button");
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveAttribute("aria-pressed", "true");
    expect(items.every((item) => item.getAttribute("aria-checked") === null)).toBe(true);
    expect(items.every((item) => item.tabIndex === 0)).toBe(true);
  });

  it("moves focus only with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Row type="multiple" />);

    const items = screen.getAllByRole("button");
    items[0].focus();
    await user.keyboard("{ArrowRight}");

    expect(items[1]).toHaveFocus();
    expect(items[1]).toHaveAttribute("aria-pressed", "false");
  });
});
