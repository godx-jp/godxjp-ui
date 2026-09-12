import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { DraggablePanel } from "../draggable-panel";

/*
 * gh#560 — nothing in the library could be MOVED by the person using it. Every assertion here is
 * on a role, a label, a `data-*` or a custom property; none is on a Tailwind utility
 * (`check:no-tailwind-class-assertions`).
 *
 * jsdom lays nothing out, so every case that clamps stubs the geometry it clamps against and says
 * so — the repo pattern from `slider-antd.test.tsx` and `tabs-active-visible-204.test.tsx`.
 */

const css = () => readFileSync(join(process.cwd(), "src/styles/layout.css"), "utf8");
const tokens = () =>
  readFileSync(join(process.cwd(), "src/tokens/components/draggable-panel.css"), "utf8");

function panel(): HTMLElement {
  return screen.getByRole("region", { name: "アシスタント" });
}

function handle(): HTMLElement {
  return document.querySelector('[data-slot="draggable-panel-handle"]') as HTMLElement;
}

/** Stub the panel's box AND the viewport, so a clamp has real numbers to clamp against. */
function stubGeometry(rect: { left: number; top: number; width: number; height: number }) {
  const node = panel();
  node.getBoundingClientRect = () => {
    const offsetX = Number(node.style.getPropertyValue("--draggable-panel-offset-x") || 0);
    const offsetY = Number(node.style.getPropertyValue("--draggable-panel-offset-y") || 0);
    const left = rect.left + offsetX;
    const top = rect.top + offsetY;
    return {
      left,
      top,
      width: rect.width,
      height: rect.height,
      right: left + rect.width,
      bottom: top + rect.height,
      x: left,
      y: top,
      toJSON: () => ({}),
    } as DOMRect;
  };
}

function press(target: Element, clientX: number, clientY: number) {
  fireEvent.pointerDown(target, { clientX, clientY, pointerId: 1, button: 0 });
}
function move(clientX: number, clientY: number) {
  fireEvent.pointerMove(window, { clientX, clientY, pointerId: 1 });
}
function release() {
  fireEvent.pointerUp(window, { pointerId: 1 });
}

function offset(node: HTMLElement) {
  return {
    x: Number(node.style.getPropertyValue("--draggable-panel-offset-x")),
    y: Number(node.style.getPropertyValue("--draggable-panel-offset-y")),
  };
}

describe("DraggablePanel — the surface", () => {
  it("is a named region with a handle, a title and its own body", () => {
    renderWithUi(
      <DraggablePanel title="アシスタント">
        <p>いらっしゃいませ</p>
      </DraggablePanel>,
    );

    const node = panel();
    expect(node).toHaveAttribute("data-slot", "draggable-panel");
    expect(node).toHaveAttribute("data-placement", "bottom-end");
    expect(node).toHaveAttribute("data-width", "md");
    expect(node).toContainElement(handle());
    expect(screen.getByText("いらっしゃいませ")).toBeInTheDocument();
  });

  it("rests at every one of the four logical corners", () => {
    const placements = ["top-start", "top-end", "bottom-start", "bottom-end"] as const;
    const { rerender } = renderWithUi(<DraggablePanel title="アシスタント" />);
    for (const placement of placements) {
      rerender(<DraggablePanel title="アシスタント" placement={placement} />);
      expect(panel()).toHaveAttribute("data-placement", placement);
    }
  });

  it("publishes every step of the width ladder as an attribute, not as a class", () => {
    const widths = ["sm", "md", "lg"] as const;
    const { rerender } = renderWithUi(<DraggablePanel title="アシスタント" />);
    for (const width of widths) {
      rerender(<DraggablePanel title="アシスタント" width={width} />);
      expect(panel()).toHaveAttribute("data-width", width);
    }
  });

  it("labels the handle in the active locale rather than leaving it to an icon", () => {
    renderWithUi(<DraggablePanel title="アシスタント" />);
    // The test locale is vi (see src/test/render.tsx).
    expect(handle()).toHaveAccessibleName(/Di chuyển bảng/);
  });

  it("renders the close control only when the consumer hands it a handler", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderWithUi(<DraggablePanel title="アシスタント" />);
    expect(document.querySelector('[data-slot="draggable-panel-close"]')).toBeNull();

    rerender(<DraggablePanel title="アシスタント" onClose={onClose} />);
    await user.click(document.querySelector('[data-slot="draggable-panel-close"]') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("DraggablePanel — pointer drag (not mouse: touch and pen move it too)", () => {
  it("moves by the pointer delta and reports the position without storing it anywhere", () => {
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel title="アシスタント" bounds="none" onPositionChange={onPositionChange} />,
    );

    press(handle(), 500, 400);
    move(460, 370);
    expect(offset(panel())).toEqual({ x: -40, y: -30 });
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: -40, y: -30 });

    move(420, 300);
    release();
    expect(offset(panel())).toEqual({ x: -80, y: -100 });

    // Nothing was persisted: the issue asks for the position to be REPORTED, not remembered.
    expect(Object.keys(window.localStorage)).toHaveLength(0);
  });

  it("ignores a pointer that is not the one that started the drag", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    press(handle(), 500, 400);
    fireEvent.pointerMove(window, { clientX: 100, clientY: 100, pointerId: 2 });
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });

  it("stops listening once the pointer is released, so a later move does not drag it", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    press(handle(), 500, 400);
    move(450, 400);
    release();
    move(100, 100);
    expect(offset(panel())).toEqual({ x: -50, y: 0 });
  });

  it("treats pointercancel as the end of the drag", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    press(handle(), 500, 400);
    move(450, 400);
    fireEvent.pointerCancel(window, { pointerId: 1 });
    move(100, 100);
    expect(offset(panel())).toEqual({ x: -50, y: 0 });
  });

  it("publishes data-dragging while the pointer is down, so CSS can drop the tween", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    expect(panel()).not.toHaveAttribute("data-dragging");
    press(handle(), 500, 400);
    expect(panel()).toHaveAttribute("data-dragging");
    release();
    expect(panel()).not.toHaveAttribute("data-dragging");
  });

  it("does not start a drag from the right button or a modifier gesture", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    fireEvent.pointerDown(handle(), { clientX: 500, clientY: 400, pointerId: 1, button: 2 });
    move(300, 200);
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });
});

describe("DraggablePanel — bounds, so it cannot be thrown off-screen and stranded", () => {
  it("clamps to the viewport by default", () => {
    renderWithUi(<DraggablePanel title="アシスタント" />);
    // Panel resting at 600,300 with a 320x400 box inside a 1024x768 viewport (jsdom's default).
    stubGeometry({ left: 600, top: 300, width: 320, height: 400 });

    press(handle(), 700, 400);
    move(-2000, -2000);
    // Left edge stops at 0 → offset -600; top edge stops at 0 → offset -300.
    expect(offset(panel())).toEqual({ x: -600, y: -300 });

    move(4000, 4000);
    // Right edge stops at 1024 → 1024-320-600 = 104; bottom at 768 → 768-400-300 = 68.
    expect(offset(panel())).toEqual({ x: 104, y: 68 });
    release();
  });

  it("lets it leave the viewport when the consumer asks for bounds=none", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    stubGeometry({ left: 600, top: 300, width: 320, height: 400 });
    press(handle(), 700, 400);
    move(-2000, -2000);
    expect(offset(panel())).toEqual({ x: -2700, y: -2400 });
    release();
  });

  it("clamps a panel taller than the viewport to the top edge instead of stranding it", () => {
    renderWithUi(<DraggablePanel title="アシスタント" />);
    stubGeometry({ left: 100, top: 0, width: 320, height: 2000 });
    press(handle(), 200, 100);
    move(200, 900);
    // maxTop (768-2000) is below minTop (0), so the clamp collapses onto the top edge.
    expect(offset(panel()).y).toBe(0);
    release();
  });

  it("re-clamps on viewport resize when bounds=viewport and fires onPositionChange with the new offset", () => {
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel
        title="アシスタント"
        defaultPosition={{ x: 104, y: 68 }}
        onPositionChange={onPositionChange}
      />,
    );
    // Resting box 600,300 + offset 104,68 → flush to 1024×768 (see clamp test above).
    stubGeometry({ left: 600, top: 300, width: 320, height: 400 });
    onPositionChange.mockClear();

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });
    fireEvent(window, new Event("resize"));

    // maxLeft at 800: 800-320-600 = -120; maxTop at 600: 600-400-300 = -100.
    expect(offset(panel())).toEqual({ x: -120, y: -100 });
    expect(onPositionChange).toHaveBeenCalledTimes(1);
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: -120, y: -100 });
  });

  it("does not attach a viewport resize listener when bounds=none", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    const resizeCalls = addSpy.mock.calls.filter(([type]) => type === "resize");
    expect(resizeCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it("does not re-clamp or report on viewport resize when bounds=none", () => {
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel
        title="アシスタント"
        bounds="none"
        defaultPosition={{ x: 104, y: 68 }}
        onPositionChange={onPositionChange}
      />,
    );
    stubGeometry({ left: 600, top: 300, width: 320, height: 400 });
    onPositionChange.mockClear();

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });
    fireEvent(window, new Event("resize"));

    expect(offset(panel())).toEqual({ x: 104, y: 68 });
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it("does not fire onPositionChange on resize when the clamped position is unchanged", () => {
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel
        title="アシスタント"
        defaultPosition={{ x: 0, y: 0 }}
        onPositionChange={onPositionChange}
      />,
    );
    stubGeometry({ left: 100, top: 100, width: 320, height: 400 });
    onPositionChange.mockClear();

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 900 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
    fireEvent(window, new Event("resize"));

    expect(offset(panel())).toEqual({ x: 0, y: 0 });
    expect(onPositionChange).not.toHaveBeenCalled();
  });
});

describe("DraggablePanel — the keyboard path (WCAG 2.1.1)", () => {
  it("nudges by one token step per arrow press and reports each one", async () => {
    const user = userEvent.setup();
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel title="アシスタント" bounds="none" onPositionChange={onPositionChange} />,
    );

    handle().focus();
    expect(document.activeElement).toBe(handle());

    // jsdom resolves no stylesheet, so getComputedStyle returns "" for the token and the
    // component falls back to the step the token declares. The token itself is asserted below.
    await user.keyboard("{ArrowRight}");
    const step = offset(panel()).x;
    expect(step).toBeGreaterThan(0);
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: step, y: 0 });

    await user.keyboard("{ArrowDown}");
    expect(offset(panel())).toEqual({ x: step, y: step });

    await user.keyboard("{ArrowLeft}{ArrowUp}");
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });

  it("takes a larger step with Shift held", async () => {
    const user = userEvent.setup();
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    handle().focus();

    await user.keyboard("{ArrowRight}");
    const small = offset(panel()).x;
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    const combined = offset(panel()).x;
    expect(combined - small).toBeGreaterThan(small);
  });

  it("leaves every other key alone, so the panel never swallows Tab or Enter", async () => {
    const user = userEvent.setup();
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" />);
    handle().focus();
    await user.keyboard("{Enter}");
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });
});

describe("DraggablePanel — axis, disabled and the controlled position (react-draggable's API)", () => {
  it("axis=x drops the block delta, axis=y drops the inline one", () => {
    const { rerender } = renderWithUi(
      <DraggablePanel title="アシスタント" bounds="none" axis="x" />,
    );
    press(handle(), 500, 400);
    move(440, 340);
    release();
    expect(offset(panel())).toEqual({ x: -60, y: 0 });

    rerender(<DraggablePanel title="アシスタント" bounds="none" axis="y" />);
    press(handle(), 500, 400);
    move(440, 340);
    release();
    // BOTH axes asserted, not just the moving one: checking only `y` here let a mutation that
    // deleted the inline-axis gate pass all 28 cases (the drag simply also moved sideways).
    expect(offset(panel())).toEqual({ x: 0, y: -60 });
  });

  it("axis=none pins it, and says so on the handle rather than only in CSS", () => {
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" axis="none" />);
    expect(handle()).toHaveAttribute("aria-disabled", "true");
    press(handle(), 500, 400);
    move(300, 200);
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });

  it("disabled stops the drag and the keyboard path together", async () => {
    const user = userEvent.setup();
    renderWithUi(<DraggablePanel title="アシスタント" bounds="none" disabled />);
    expect(handle()).toHaveAttribute("aria-disabled", "true");

    press(handle(), 500, 400);
    move(300, 200);
    expect(offset(panel())).toEqual({ x: 0, y: 0 });

    handle().focus();
    await user.keyboard("{ArrowRight}");
    expect(offset(panel())).toEqual({ x: 0, y: 0 });
  });

  it("starts from defaultPosition when uncontrolled", () => {
    renderWithUi(
      <DraggablePanel title="アシスタント" bounds="none" defaultPosition={{ x: -24, y: -48 }} />,
    );
    expect(offset(panel())).toEqual({ x: -24, y: -48 });
  });

  it("under a controlled position it reports and does NOT move itself", () => {
    const onPositionChange = vi.fn();
    renderWithUi(
      <DraggablePanel
        title="アシスタント"
        bounds="none"
        position={{ x: 10, y: 10 }}
        onPositionChange={onPositionChange}
      />,
    );
    expect(offset(panel())).toEqual({ x: 10, y: 10 });

    press(handle(), 500, 400);
    move(480, 400);
    release();
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: -10, y: 10 });
    // The consumer owns the value: without a re-render with a new prop, nothing moved.
    expect(offset(panel())).toEqual({ x: 10, y: 10 });
  });
});

describe("DraggablePanel — the stylesheet contract", () => {
  it("positions from LOGICAL properties, so the resting corner mirrors under RTL", () => {
    const sheet = css();
    expect(sheet).toMatch(/\[data-placement\$="start"\][\s\S]*?inset-inline-start/);
    expect(sheet).toMatch(/\[data-placement\$="end"\][\s\S]*?inset-inline-end/);
    // By NAME, not by value: the contract is that no physical inline property is ever declared on
    // any part of this component, which is what `check:rtl` holds for the whole file.
    expect(sheet).not.toMatch(
      /\.ui-draggable-panel[^{]*\{[^}]*(?:^|[\s;])(?:left|right|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    );
  });

  it("multiplies the two unitless offsets into one translate, keeping the literal out of the TSX", () => {
    expect(css()).toMatch(
      /translate:\s*calc\(var\(--draggable-panel-offset-x\) \* 1px\)\s*calc\(var\(--draggable-panel-offset-y\) \* 1px\)/,
    );
  });

  it("drops the tween while dragging so the surface tracks the finger", () => {
    expect(css()).toMatch(/\.ui-draggable-panel\[data-dragging\]\s*\{[^}]*transition:\s*none/);
  });

  it("honours prefers-reduced-motion, and does so OUTSIDE @layer where it can win", () => {
    const sheet = css();
    // layout.css already carries an unrelated reduced-motion block, so find OURS by its selector.
    const blocks = [...sheet.matchAll(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g)];
    const ours = blocks.find((match) => match[0].includes(".ui-draggable-panel"));
    expect(ours).toBeDefined();
    expect(ours?.[0]).toMatch(/transition:\s*none/);

    /*
     * Unlayered, and MEASURED rather than asserted: Tailwind v4 emits its utilities into
     * `@layer utilities`, which outranks anything inside `@layer components` at any specificity.
     * Counting braces before the block gives its nesting depth — 0 means it is a top-level author
     * rule, the only position from which it can actually stop the transition.
     */
    const before = sheet.slice(0, ours?.index ?? 0);
    const depth = (before.match(/\{/g)?.length ?? 0) - (before.match(/\}/g)?.length ?? 0);
    expect(depth).toBe(0);
  });

  it("gives the handle touch-action:none, which is what makes a touch drag possible at all", () => {
    expect(css()).toMatch(/\.ui-draggable-panel-handle\s*\{[^}]*touch-action:\s*none/);
  });

  it("declares both keyboard steps and the whole width ladder in the token tier", () => {
    for (const token of [
      "--draggable-panel-step-offset",
      "--draggable-panel-step-offset-lg",
      "--draggable-panel-width-sm",
      "--draggable-panel-width",
      "--draggable-panel-width-lg",
      "--draggable-panel-inset",
    ]) {
      expect(tokens()).toMatch(new RegExp(`${token}:\\s*[^;]+;`));
    }
  });
});
