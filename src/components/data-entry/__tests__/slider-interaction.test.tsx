import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Slider } from "../slider";

/**
 * Behavioral interaction tests for Slider (Radix Slider).
 * Codifies real keyboard/pointer behavior so future runs need NO browser MCP.
 *
 * Radix Slider exposes each thumb as role="slider" with
 * aria-valuemin/aria-valuemax/aria-valuenow. Value changes flow through
 * `onValueChange(number[])`. Keyboard nav (Arrow/Home/End/PageUp/PageDown)
 * moves the focused thumb; jsdom can't do pointer-drag geometry, so we drive
 * the documented keyboard path which is what users rely on for fine control.
 */
describe("Slider — interaction", () => {
  it("renders a thumb with the correct ARIA value range", () => {
    renderWithUi(<Slider defaultValue={[40]} min={0} max={100} aria-label="volume" />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "100");
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
  });

  it("renders one thumb per value (range slider)", () => {
    renderWithUi(<Slider defaultValue={[20, 80]} aria-label="price range" />);
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "20");
    expect(thumbs[1]).toHaveAttribute("aria-valuenow", "80");
  });

  it("Tab focuses the thumb", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[50]} aria-label="vol" />);
    await user.tab();
    expect(screen.getByRole("slider")).toHaveFocus();
  });

  it("ArrowRight increments by step and fires onValueChange (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Slider defaultValue={[50]} step={1} onValueChange={onValueChange} aria-label="vol" />,
    );
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith([51]);
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
  });

  it("ArrowLeft decrements by step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Slider defaultValue={[50]} step={1} onValueChange={onValueChange} aria-label="vol" />,
    );
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith([49]);
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
  });

  it("ArrowUp increments and ArrowDown decrements", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[10]} step={5} aria-label="vol" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "15");
    await user.keyboard("{ArrowDown}");
    expect(thumb).toHaveAttribute("aria-valuenow", "10");
  });

  it("respects a custom step size", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[0]} step={10} aria-label="vol" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "20");
  });

  it("Home jumps to min, End jumps to max", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[50]} min={0} max={100} aria-label="vol" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps at max — ArrowRight at the ceiling does not exceed max", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[100]} min={0} max={100} step={1} aria-label="vol" />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
  });

  it("controlled value sticks via onValueChange (freeze regression)", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState<number[]>([30]);
      return <Slider value={v} onValueChange={setV} step={1} aria-label="vol" />;
    }
    renderWithUi(<Controlled />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    // Without a synchronous onValueChange wiring the value would be frozen at 30.
    expect(thumb).toHaveAttribute("aria-valuenow", "33");
  });

  it("disabled blocks keyboard interaction and is not focusable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Slider defaultValue={[50]} disabled onValueChange={onValueChange} aria-label="vol" />,
    );
    const thumb = screen.getByRole("slider");
    await user.tab();
    expect(thumb).not.toHaveFocus();
    // Even if we force focus, arrow keys must not change the value.
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute("aria-valuenow", "50");
  });

  it("range thumbs cannot cross — left thumb clamps at the right thumb", async () => {
    const user = userEvent.setup();
    renderWithUi(<Slider defaultValue={[40, 41]} min={0} max={100} step={1} aria-label="range" />);
    const [left] = screen.getAllByRole("slider");
    left.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    // Left thumb cannot pass the right thumb (41).
    expect(left).toHaveAttribute("aria-valuenow", "41");
  });
});
