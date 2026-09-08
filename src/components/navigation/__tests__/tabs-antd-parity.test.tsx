import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoA11yViolations } from "@/test/a11y";

import { Tabs } from "../tabs";

const ITEMS = [
  { value: "a", label: "概要", content: "パネルA" },
  { value: "b", label: "詳細", content: "パネルB" },
];

/**
 * Ant Design 6.6.2 parity for the tab bar. Every case below is read off the INSTALLED antd types
 * (`antd/es/tabs/index.d.ts` + `@rc-component/tabs/es/interface.d.ts`), never off memory.
 */
const removeShortcuts = (container: HTMLElement) =>
  container.querySelectorAll('[data-slot="tabs-tab-remove"]');

describe('Tabs — antd `type="editable-card"` (shipped as variant)', () => {
  it("gives every closable item a remove shortcut that reports the item's own key", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    const removes = removeShortcuts(container);
    expect(removes).toHaveLength(2);

    await user.click(removes[1] as HTMLElement);
    expect(onEdit).toHaveBeenCalledWith("b", "remove");
  });

  it("removing a tab never switches to it on the way out", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    await user.click(removeShortcuts(container)[1] as HTMLElement);
    // Radix selects on MOUSEDOWN, so a stop that only ran on click would leave the doomed tab
    // selected for the frame in between — and, uncontrolled, permanently.
    expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
  });

  it("honours `closable: false` on one item without disarming the others (antd getRemovable)", () => {
    const { container } = render(
      <Tabs
        items={[{ ...ITEMS[0], closable: false }, ITEMS[1]]}
        variant="editable-card"
        onEdit={vi.fn()}
      />,
    );
    expect(removeShortcuts(container)).toHaveLength(1);
  });

  it("keeps the tablist owning nothing but tabs (axe aria-required-children)", () => {
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={vi.fn()} />);
    const tab = screen.getByRole("tab", { name: "概要" });
    // The × lives inside the tab and is NOT focusable, so neither aria-required-children (a button
    // owned by the tablist) nor nested-interactive (a focusable node inside role=tab) can fire.
    expect(tab.querySelector("button")).toBeNull();
    expect(tab.querySelector('[data-slot="tabs-tab-remove"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("announces the keyboard route on the tab itself", () => {
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Delete",
    );
  });

  it("removes the focused tab on Delete (WAI-ARIA APG tabs-with-deletion)", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    screen.getByRole("tab", { name: "概要" }).focus();
    await user.keyboard("{Delete}");
    expect(onEdit).toHaveBeenCalledWith("a", "remove");
  });

  it("renders the add button — a REAL, named button, because it sits outside the tablist", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Tabs items={ITEMS} variant="editable-card" onEdit={onEdit} />);

    const add = container.querySelector<HTMLButtonElement>('[data-slot="tabs-add"]');
    expect(add?.tagName).toBe("BUTTON");
    // Localized, so the exact string is not asserted — only that it HAS a name (WCAG 4.1.2).
    expect(add?.getAttribute("aria-label")).toBeTruthy();

    await user.click(add as HTMLButtonElement);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit.mock.calls[0][1]).toBe("add");
  });

  it("antd `hideAdd` keeps the remove shortcuts but drops the add button", () => {
    const { container } = render(
      <Tabs items={ITEMS} variant="editable-card" hideAdd onEdit={vi.fn()} />,
    );
    expect(container.querySelector('[data-slot="tabs-add"]')).toBeNull();
    expect(removeShortcuts(container)).toHaveLength(2);
  });

  it("a non-editable card bar grows neither affordance", () => {
    const { container } = render(<Tabs items={ITEMS} variant="card" onEdit={vi.fn()} />);
    expect(removeShortcuts(container)).toHaveLength(0);
    expect(container.querySelector('[data-slot="tabs-add"]')).toBeNull();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <Tabs items={ITEMS} variant="editable-card" onEdit={() => undefined} />,
    );
  });
});

describe("Tabs — antd `destroyOnHidden`", () => {
  it("unmounts the inactive panel by default (the library's, and Radix's, behaviour)", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.queryByText("パネルB")).toBeNull();
  });

  it("`false` keeps every panel MOUNTED and hides the inactive ones", () => {
    render(<Tabs items={ITEMS} destroyOnHidden={false} />);
    const inactive = screen.getByText("パネルB");
    expect(inactive).toBeInTheDocument();
    // Mounted is not enough — Radix computes `hidden: !(forceMount || isSelected)`, which is
    // always false under forceMount, so without the explicit attribute BOTH panels would paint.
    expect(inactive.closest('[data-slot="tabs-panel"]')).toHaveAttribute("hidden");
    expect(screen.getByText("パネルA").closest('[data-slot="tabs-panel"]')).not.toHaveAttribute(
      "hidden",
    );
  });

  it("moves the `hidden` attribute with the selection", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} destroyOnHidden={false} />);
    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(screen.getByText("パネルB").closest('[data-slot="tabs-panel"]')).not.toHaveAttribute(
      "hidden",
    );
    expect(screen.getByText("パネルA").closest('[data-slot="tabs-panel"]')).toHaveAttribute(
      "hidden",
    );
  });
});

describe("Tabs — antd `tabBarExtraContent` (shipped as `extra`)", () => {
  it("parks a bare node in the END slot, which is where antd puts a bare node", () => {
    const { container } = render(<Tabs items={ITEMS} extra={<span>右</span>} />);
    const slot = container.querySelector('[data-slot="tabs-extra"]');
    expect(slot).toHaveAttribute("data-side", "end");
    expect(slot).toHaveTextContent("右");
  });

  it("splits a { start, end } map across both slots on the LOGICAL axis", () => {
    const { container } = render(
      <Tabs items={ITEMS} extra={{ start: <span>先頭</span>, end: <span>末尾</span> }} />,
    );
    const slots = container.querySelectorAll('[data-slot="tabs-extra"]');
    expect(slots).toHaveLength(2);
    expect(slots[0]).toHaveAttribute("data-side", "start");
    expect(slots[1]).toHaveAttribute("data-side", "end");
  });

  it("does not add the bar row when nothing needs it", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    expect(container.querySelector('[data-slot="tabs-bar"]')).toBeNull();
  });
});

describe("Tabs — antd `tabPlacement` / `size` / `centered` / item `icon`", () => {
  it("an inline placement makes it a real VERTICAL tablist, not just a repaint", () => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement="start" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "start",
    );
    // Roving focus follows `orientation`, so the axis has to reach Radix too (APG: a vertical
    // tablist is Up/Down, a horizontal one Left/Right).
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("keeps a block placement horizontal", () => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement="bottom" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "bottom",
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it('a legacy `orientation="vertical"` still resolves to the `start` placement', () => {
    const { container } = render(<Tabs items={ITEMS} orientation="vertical" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-placement",
      "start",
    );
  });

  it.each([
    ["top", "horizontal"],
    ["bottom", "horizontal"],
    ["start", "vertical"],
    ["end", "vertical"],
  ] as const)("placement %s drives the %s axis", (tabPlacement, axis) => {
    const { container } = render(<Tabs items={ITEMS} tabPlacement={tabPlacement} />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-placement", tabPlacement);
    expect(root).toHaveAttribute("data-orientation", axis);
  });

  it.each(["sm", "md", "lg"] as const)("records the %s control tier", (size) => {
    const { container } = render(<Tabs items={ITEMS} size={size} />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-size", size);
  });

  it("records the size tier and the centered flag on the root", () => {
    const { container } = render(<Tabs items={ITEMS} size="lg" centered />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-centered", "true");
  });

  it("defaults the size tier to md and leaves `centered` unset", () => {
    const { container } = render(<Tabs items={ITEMS} />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).not.toHaveAttribute("data-centered");
  });

  it("renders an item `icon` inside its own trigger, hidden from assistive tech", () => {
    render(<Tabs items={[{ ...ITEMS[0], icon: <span data-testid="ic">★</span> }, ITEMS[1]]} />);
    const icon = screen.getByTestId("ic");
    expect(icon.closest('[data-slot="tabs-trigger-icon"]')).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("tab", { name: "概要" })).toContainElement(icon);
  });
});
