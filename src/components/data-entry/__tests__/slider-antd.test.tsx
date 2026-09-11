import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { I18nProvider } from "react-aria-components";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Slider } from "../slider";
import { sliderValue } from "./slider-test-utils";

/**
 * antd 6 `Slider` parity on the react-aria base — one case per antd prop this component takes.
 * Assertions read what a user or a screen reader gets (role, name, accessible value, the payload a
 * callback receives, what a form submits); positions are read from the custom property the
 * stylesheet consumes, because jsdom lays nothing out.
 *
 * Pointer cases give the painted rail a real rect (jsdom's is all zeros): 100px wide from x=0, so
 * a press at clientX N is the value N on a 0–100 scale.
 */
function rail(container: HTMLElement, rect: Partial<DOMRect> = {}): HTMLElement {
  const element = container.querySelector('[data-slot="slider-track"]') as HTMLElement;
  const { left = 0, top = 0, width = 100, height = 100 } = rect;
  element.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
  return element;
}

function press(target: Element, clientX: number, clientY = 0) {
  fireEvent.pointerDown(target, { clientX, clientY, pointerId: 1, button: 0 });
}
function drag(clientX: number, clientY = 0) {
  fireEvent.pointerMove(window, { clientX, clientY, pointerId: 1 });
}
function release() {
  fireEvent.pointerUp(window, { pointerId: 1 });
}

const values = () => screen.getAllByRole("slider").map(sliderValue);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Slider — antd value / onChange / onChangeComplete", () => {
  it("takes a plain number and reports a plain number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Slider aria-label="音量" defaultValue={30} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(31);
    expect(values()).toEqual([31]);
  });

  it("a controlled number value follows its owner", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [volume, setVolume] = React.useState(40);
      return <Slider aria-label="音量" value={volume} onChange={setVolume} step={5} />;
    }
    renderWithUi(<Controlled />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(values()).toEqual([50]);
  });

  it("range reports [number, number]", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Slider aria-label="価格帯" range defaultValue={[20, 80]} onChange={onChange} />);
    screen.getAllByRole("slider")[1].focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith([20, 79]);
  });

  it("onChangeComplete / onValueCommit fire EXACTLY once per key press", async () => {
    const user = userEvent.setup();
    const onChangeComplete = vi.fn();
    const onValueCommit = vi.fn();
    renderWithUi(
      <Slider
        aria-label="音量"
        defaultValue={50}
        onChangeComplete={onChangeComplete}
        onValueCommit={onValueCommit}
      />,
    );
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenLastCalledWith(51);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenLastCalledWith([51]);
  });

  it("a drag reports onChange while moving and onChangeComplete once, on release", () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    const { container } = renderWithUi(
      <Slider
        aria-label="音量"
        defaultValue={10}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />,
    );
    rail(container);
    press(container.querySelector('[data-slot="slider-thumb"]')!, 10);
    drag(35);
    drag(60);
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(onChangeComplete).not.toHaveBeenCalled();
    release();
    expect(onChangeComplete).toHaveBeenCalledTimes(1);
    expect(onChangeComplete).toHaveBeenLastCalledWith(60);
    expect(values()).toEqual([60]);
  });

  it("a press on the rail moves the nearest thumb there", () => {
    const { container } = renderWithUi(
      <Slider aria-label="価格帯" range defaultValue={[20, 80]} />,
    );
    press(rail(container), 70);
    release();
    expect(values()).toEqual([20, 70]);
  });
});

describe("Slider — antd step / marks / dots / included", () => {
  const MARKS = { 0: "0°C", 26: "26°C", 37: "37°C", 100: "100°C" };

  it("step={null} lets the thumb rest ONLY on marks, min and max — by keyboard", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="温度" step={null} marks={MARKS} defaultValue={26} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(sliderValue(thumb)).toBe(37);
    await user.keyboard("{ArrowRight}");
    expect(sliderValue(thumb)).toBe(100);
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(sliderValue(thumb)).toBe(0);
  });

  it("step={null} snaps a pointer to the nearest mark", () => {
    const { container } = renderWithUi(
      <Slider aria-label="温度" step={null} marks={MARKS} defaultValue={0} />,
    );
    press(rail(container), 30);
    release();
    expect(values()).toEqual([26]);
  });

  it("a press on a mark label moves the thumb to exactly that mark", () => {
    const { container } = renderWithUi(<Slider aria-label="温度" marks={MARKS} defaultValue={0} />);
    rail(container);
    press(screen.getByText("37°C"), 999);
    release();
    expect(values()).toEqual([37]);
  });

  it("marks take antd's object form — label and per-mark style", () => {
    renderWithUi(
      <Slider
        aria-label="温度"
        marks={{ 0: "0°C", 100: { style: { fontWeight: 700 }, label: "100°C" } }}
      />,
    );
    const label = screen.getByText("100°C");
    expect(label.style.fontWeight).toBe("700");
    expect(label.closest('[data-slot="slider-mark"]')).toHaveStyle({
      "--slider-mark-offset-inline": "100%",
    });
  });

  it("dots follow the marks when step={null}, and only the included span is active", () => {
    const { container } = renderWithUi(
      <Slider aria-label="温度" step={null} marks={MARKS} dots range defaultValue={[26, 37]} />,
    );
    const dots = [...container.querySelectorAll('[data-slot="slider-dot"]')];
    expect(dots).toHaveLength(4);
    expect(dots.map((dot) => dot.getAttribute("data-active"))).toEqual([
      null,
      "true",
      "true",
      null,
    ]);
  });
});

describe("Slider — antd range object", () => {
  it("range.draggableTrack moves the whole span, keeping its width", () => {
    const onChange = vi.fn();
    const { container } = renderWithUi(
      <Slider
        aria-label="期間"
        range={{ draggableTrack: true }}
        defaultValue={[20, 50]}
        onChange={onChange}
      />,
    );
    rail(container);
    press(container.querySelector('[data-slot="slider-range"]')!, 30);
    drag(60);
    expect(values()).toEqual([50, 80]);
    drag(99);
    // Held inside the scale: the span stops when its end reaches max.
    expect(values()).toEqual([70, 100]);
    release();
    expect(onChange).toHaveBeenLastCalledWith([70, 100]);
  });

  it("without draggableTrack a press on the span moves the nearest thumb instead", () => {
    const { container } = renderWithUi(<Slider aria-label="期間" range defaultValue={[20, 50]} />);
    rail(container);
    press(container.querySelector('[data-slot="slider-range"]')!, 30);
    release();
    expect(values()).toEqual([30, 50]);
  });

  it("range.editable adds a thumb on a rail press, up to maxCount, and removes one on Delete, down to minCount", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderWithUi(
      <Slider
        aria-label="区切り"
        range={{ editable: true, minCount: 1, maxCount: 3 }}
        defaultValue={[20, 80]}
        onChange={onChange}
      />,
    );
    press(rail(container), 50);
    release();
    expect(values()).toEqual([20, 50, 80]);
    expect(onChange).toHaveBeenLastCalledWith([20, 50, 80]);
    // The new thumb takes focus, so Delete right away removes what was just added.
    expect(screen.getAllByRole("slider")[1]).toHaveFocus();

    press(rail(container), 60);
    release();
    // maxCount reached: the press moved the nearest thumb instead of adding a fourth.
    expect(values()).toEqual([20, 60, 80]);

    await user.keyboard("{Delete}");
    expect(values()).toEqual([20, 80]);
    screen.getAllByRole("slider")[0].focus();
    await user.keyboard("{Backspace}");
    expect(values()).toEqual([80]);
    screen.getByRole("slider").focus();
    await user.keyboard("{Delete}");
    // minCount: the last thumb stays.
    expect(values()).toEqual([80]);
  });

  it("editable switches off while any thumb is disabled, as antd's does", () => {
    const { container } = renderWithUi(
      <Slider
        aria-label="区切り"
        range={{ editable: true }}
        disabled={[true, false]}
        defaultValue={[20, 80]}
      />,
    );
    press(rail(container), 60);
    release();
    expect(values()).toEqual([20, 60]);
  });
});

describe("Slider — antd disabled / vertical / orientation / reverse", () => {
  it("disabled as an array locks one thumb and leaves the other operable", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Slider aria-label="期間" range disabled={[true, false]} defaultValue={[20, 80]} />,
    );
    const [low, high] = screen.getAllByRole("slider");
    expect(low).toBeDisabled();
    expect(high).toBeEnabled();
    high.focus();
    await user.keyboard("{ArrowRight}");
    expect(values()).toEqual([20, 81]);
  });

  it("vertical is announced, and an explicit orientation wins over it (antd 6)", () => {
    const { rerender } = renderWithUi(<Slider aria-label="音量" vertical />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
    rerender(<Slider aria-label="音量" vertical orientation="horizontal" />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("vertical reads a pointer from the bottom up", () => {
    const { container } = renderWithUi(<Slider aria-label="音量" vertical defaultValue={0} />);
    press(rail(container), 0, 25);
    release();
    expect(values()).toEqual([75]);
  });

  it("reverse mirrors the pointer, the thumb and the painted span", () => {
    const { container } = renderWithUi(<Slider aria-label="音量" reverse defaultValue={0} />);
    press(rail(container), 10);
    release();
    expect(values()).toEqual([90]);
    const thumb = container.querySelector('[data-slot="slider-thumb"]') as HTMLElement;
    expect(thumb.style.getPropertyValue("--slider-thumb-offset")).toBe("10%");
    const span = container.querySelector('[data-slot="slider-range"]') as HTMLElement;
    // min sits at the far end, so the "up to here" span runs from the thumb to that end.
    expect(span.style.getPropertyValue("--slider-range-start")).toBe("10%");
    expect(span.style.getPropertyValue("--slider-range-size")).toBe("90%");
  });
});

describe("Slider — RTL", () => {
  const rtl = (ui: React.ReactElement) => <I18nProvider locale="ar-AE">{ui}</I18nProvider>;

  it("an RTL locale makes ArrowLeft the increasing key and stamps dir on the slider", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(rtl(<Slider aria-label="音量" defaultValue={50} />));
    expect(container.querySelector('[data-slot="slider"]')).toHaveAttribute("dir", "rtl");
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowLeft}");
    expect(values()).toEqual([51]);
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(values()).toEqual([49]);
  });

  it("an RTL locale reads a pointer from the right", () => {
    const { container } = renderWithUi(rtl(<Slider aria-label="音量" defaultValue={0} />));
    press(rail(container), 10);
    release();
    expect(values()).toEqual([90]);
  });

  it('dir="ltr" pins one slider against an RTL page', async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      rtl(<Slider aria-label="音量" dir="ltr" defaultValue={50} />),
    );
    expect(container.querySelector('[data-slot="slider"]')).toHaveAttribute("dir", "ltr");
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(values()).toEqual([51]);
  });

  it("reverse under RTL runs left to right again", async () => {
    const user = userEvent.setup();
    renderWithUi(rtl(<Slider aria-label="音量" reverse defaultValue={50} />));
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(values()).toEqual([51]);
  });
});

describe("Slider — antd tooltip", () => {
  const bubble = (container: HTMLElement) =>
    container.querySelector('[data-slot="slider-tooltip"]') as HTMLElement | null;

  it("open forces the bubble on or off; unset it follows interaction", () => {
    const { container, rerender } = renderWithUi(
      <Slider aria-label="音量" defaultValue={40} tooltip={{ open: true }} />,
    );
    expect(bubble(container)).toHaveAttribute("data-open", "true");
    rerender(<Slider aria-label="音量" defaultValue={40} tooltip={{ open: false }} />);
    expect(bubble(container)).toHaveAttribute("data-open", "false");
    rerender(<Slider aria-label="音量" defaultValue={40} tooltip />);
    expect(bubble(container)).not.toHaveAttribute("data-open");
  });

  it("formatter={null} removes the bubble entirely", () => {
    const { container } = renderWithUi(
      <Slider aria-label="音量" defaultValue={40} tooltip={{ formatter: null }} />,
    );
    expect(bubble(container)).toBeNull();
  });

  it("placement picks the side; a vertical slider defaults to the inline end", () => {
    const { container, rerender } = renderWithUi(
      <Slider aria-label="音量" defaultValue={40} tooltip={{ placement: "bottom" }} />,
    );
    expect(bubble(container)).toHaveAttribute("data-placement", "bottom");
    rerender(<Slider aria-label="音量" defaultValue={40} tooltip vertical />);
    expect(bubble(container)).toHaveAttribute("data-placement", "right");
  });

  it("autoAdjustOverflow flips a bubble that has no room on its side — and stays put when off", () => {
    // The thumb sits against the top of the viewport; the bubble needs 30px above it.
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(30);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 16,
      left: 100,
      right: 116,
      width: 16,
      height: 16,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const { container, rerender } = renderWithUi(
      <Slider aria-label="音量" defaultValue={40} tooltip={{ open: true }} />,
    );
    expect(bubble(container)).toHaveAttribute("data-placement", "bottom");
    rerender(
      <Slider
        aria-label="音量"
        defaultValue={40}
        tooltip={{ open: true, autoAdjustOverflow: false }}
      />,
    );
    expect(bubble(container)).toHaveAttribute("data-placement", "top");
  });

  it("formatter is also the spoken value (aria-valuetext), and follows the value", async () => {
    const user = userEvent.setup();
    const yen = (value: number) => `¥${value * 1000}`;
    renderWithUi(<Slider aria-label="予算" defaultValue={40} tooltip={{ formatter: yen }} />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuetext", "¥40000");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuetext", "¥41000");
  });
});

describe("Slider — FormField contract on the focusable element", () => {
  it("aria-invalid / aria-required reach each thumb's input, not the group", () => {
    const { container } = renderWithUi(
      <Slider aria-label="期間" range defaultValue={[20, 80]} aria-invalid aria-required />,
    );
    for (const thumb of screen.getAllByRole("slider")) {
      expect(thumb).toHaveAttribute("aria-invalid", "true");
      expect(thumb).toHaveAttribute("aria-required", "true");
    }
    const group = container.querySelector('[data-slot="slider"]')!;
    expect(group).not.toHaveAttribute("aria-required");
  });
});
