import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { FormField } from "../form-field";
import { Slider } from "../slider";

/**
 * THE RADIX-ERA CONTRACT, pinned before the base under it was swapped.
 *
 * Every case here was written and run green against `@radix-ui/react-slider` FIRST, then left
 * untouched while `Slider` moved to react-aria-components. They assert on what a user and a
 * screen reader get — role, name, `aria-valuenow`, the callback payload, what a native form
 * submits — never on which library drew it. No consumer used `Slider` when it moved (measured
 * across nine repos), but every prop below is public and each one had to keep meaning the same
 * thing.
 */
describe("Slider — the Radix-era contract survives the base swap", () => {
  it("number[] value + onValueChange(number[]) drive a controlled single thumb", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = React.useState<number[]>([10]);
      return (
        <Slider
          aria-label="税率"
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          min={0}
          max={10}
          step={2}
        />
      );
    }
    renderWithUi(<Controlled />);
    const thumb = screen.getByRole("slider", { name: "税率" });
    thumb.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith([8]);
    expect(thumb).toHaveAttribute("aria-valuenow", "8");
  });

  // Radix fired it TWICE for one key press (measured on the Radix base: 2 calls). Pinned here is
  // only what a caller can rely on — a commit arrives, carrying every thumb; the new base's
  // exactly-once is asserted in slider-antd.test.tsx.
  it("onValueCommit fires after a keyboard step, with the whole array", async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} onValueCommit={onValueCommit} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueCommit).toHaveBeenLastCalledWith([51]);
  });

  it("PageUp / PageDown move ten steps", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} step={2} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{PageUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "70");
    await user.keyboard("{PageDown}{PageDown}");
    expect(thumb).toHaveAttribute("aria-valuenow", "30");
  });

  it("Shift+Arrow moves ten steps too", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(thumb).toHaveAttribute("aria-valuenow", "60");
  });

  it("vertical orientation is announced on the thumb and ArrowUp increments", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} orientation="vertical" />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    thumb.focus();
    await user.keyboard("{ArrowUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
  });

  it('dir="rtl" makes ArrowLeft the increasing key', async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} dir="rtl" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
  });

  it("inverted (and its antd alias reverse) makes ArrowRight the decreasing key", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithUi(<Slider aria-label="音量" defaultValue={[50]} inverted />);
    let thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");

    rerender(<Slider key="reverse" aria-label="音量" defaultValue={[50]} reverse />);
    thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
  });

  it("vertical + inverted makes ArrowUp the decreasing key", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider aria-label="音量" defaultValue={[50]} orientation="vertical" inverted />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
  });

  it("minStepsBetweenThumbs keeps two thumbs that many steps apart", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Slider aria-label="金額" defaultValue={[40, 60]} step={10} minStepsBetweenThumbs={1} />,
    );
    const [low, high] = screen.getAllByRole("slider");
    low.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    expect(low).toHaveAttribute("aria-valuenow", "50");
    expect(high).toHaveAttribute("aria-valuenow", "60");
  });

  it("name submits one value per thumb — `name` for one, `name[]` for several", () => {
    const { container } = renderWithUi(
      <form>
        <Slider aria-label="税率" name="tax_rate" defaultValue={[8]} max={10} />
        <Slider aria-label="金額" name="amount" defaultValue={[20, 80]} />
      </form>,
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("tax_rate")).toEqual(["8"]);
    expect(data.getAll("amount[]")).toEqual(["20", "80"]);
  });

  it("with nothing given it is ONE thumb at min", () => {
    renderWithUi(<Slider aria-label="音量" min={5} max={50} />);
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "5");
  });

  it("inside a FormField the thumb is named by the field label", () => {
    renderWithUi(
      <FormField id="tax" label="消費税率">
        <Slider defaultValue={[10]} max={10} />
      </FormField>,
    );
    expect(screen.getByRole("slider", { name: "消費税率" })).toBeInTheDocument();
  });

  it("aria-labelledby names every thumb", () => {
    renderWithUi(
      <>
        <span id="vol-label">音量</span>
        <Slider aria-labelledby="vol-label" defaultValue={[10]} />
      </>,
    );
    expect(screen.getByRole("slider", { name: "音量" })).toBeInTheDocument();
  });

  it("disabled leaves the value alone under pointer input too", () => {
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Slider aria-label="音量" defaultValue={[50]} disabled onValueChange={onValueChange} />,
    );
    const root = container.querySelector('[data-slot="slider"]')!;
    fireEvent.pointerDown(root, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  });
});
