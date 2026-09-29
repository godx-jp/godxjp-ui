import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";

import { AppProvider } from "@/app/app-provider";
import type { AppLocale } from "@/app/types";
import { Progress } from "../progress";

const SEGMENTS = [
  { value: 2, tone: "destructive", label: "期限超過" },
  { value: 3, tone: "warning", label: "期限間近" },
  { value: 15, tone: "success", label: "対応済" },
] as const;

const renderIn = (locale: AppLocale, ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
        {children}
      </AppProvider>
    ),
  });

/**
 * `segments` — one whole split into its states, not three meters stacked.
 *
 * jsdom does no layout, so what is pinned here is the CONTRACT that produces the picture: the
 * share each slice is given, the role and name the bar answers to, and the stylesheet rules the
 * `data-breakdown` marker turns on. The geometry itself (22px block, --radius corner) lives in
 * the tokens, where `check:no-hardcoded-css-values` guards it.
 */
describe("Progress breakdown", () => {
  it("sizes each slice by its SHARE of the total, not by its raw value", () => {
    const { container } = render(<Progress segments={[...SEGMENTS]} />);
    const slices = container.querySelectorAll(".ui-progress-segment");

    // 2 + 3 + 15 = 20 → 10% / 15% / 75%.
    expect(slices).toHaveLength(3);
    expect(slices[0]).toHaveStyle({ inlineSize: "10%" });
    expect(slices[1]).toHaveStyle({ inlineSize: "15%" });
    expect(slices[2]).toHaveStyle({ inlineSize: "75%" });
  });

  it("keeps its tones in call order so a slice matches the key that explains it", () => {
    const { container } = render(<Progress segments={[...SEGMENTS]} />);
    const tones = [...container.querySelectorAll(".ui-progress-segment")].map((slice) =>
      slice.getAttribute("data-tone"),
    );

    expect(tones).toEqual(["destructive", "warning", "success"]);
  });

  /**
   * A breakdown is a PICTURE of data, so it names itself once. Three progressbars would claim
   * three independent 0–100 measurements, which is not what 2 · 3 · 15 of one total means — and
   * no ARIA value pattern models a partition at all.
   */
  it("is one image with every slice in its name, not a stack of progressbars", () => {
    render(<Progress segments={[...SEGMENTS]} />);

    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(screen.getByRole("img")).toHaveAccessibleName("期限超過 2, 期限間近 3, 対応済 15");
  });

  it("reads the slice separator from the catalogue, so ja does not list in commas", () => {
    renderIn("ja", <Progress segments={[...SEGMENTS]} />);

    expect(screen.getByRole("img")).toHaveAccessibleName("期限超過 2、期限間近 3、対応済 15");
  });

  /**
   * The row this was built for puts the company name in its own cell to the LEFT of the bar. The
   * bar must borrow that name instead of repeating it, or the screen reader hears the company
   * twice per row — and if it does not borrow it, six bars on the screen all announce the same
   * three words with nothing to tell them apart.
   */
  it("borrows a name that is already on screen via aria-labelledby", () => {
    render(
      <>
        <span id="co">株式会社山田製作所</span>
        <Progress segments={[...SEGMENTS]} aria-labelledby="co" />
      </>,
    );
    const bar = screen.getByRole("img");

    expect(bar).toHaveAttribute("aria-labelledby", "co");
    expect(bar).not.toHaveAttribute("aria-label");
  });

  it("prefixes a visible label onto the spoken breakdown when one is given", () => {
    render(<Progress segments={[...SEGMENTS]} label="株式会社山田製作所" />);

    expect(screen.getByText("株式会社山田製作所")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "株式会社山田製作所, 期限超過 2, 期限間近 3, 対応済 15",
    );
  });

  it("degrades an all-zero total to empty slices instead of NaN widths", () => {
    const { container } = render(
      <Progress
        segments={[
          { value: 0, tone: "destructive", label: "期限超過" },
          { value: 0, tone: "success", label: "対応済" },
        ]}
      />,
    );

    for (const slice of container.querySelectorAll(".ui-progress-segment")) {
      expect(slice).toHaveStyle({ inlineSize: "0%" });
    }
  });

  it("clamps a negative amount to zero rather than drawing a slice backwards", () => {
    const { container } = render(
      <Progress
        segments={[
          { value: -5, tone: "destructive", label: "期限超過" },
          { value: 10, tone: "success", label: "対応済" },
        ]}
      />,
    );
    const slices = container.querySelectorAll(".ui-progress-segment");

    expect(slices[0]).toHaveStyle({ inlineSize: "0%" });
    expect(slices[1]).toHaveStyle({ inlineSize: "100%" });
    expect(screen.getByRole("img")).toHaveAccessibleName("期限超過 0, 対応済 10");
  });

  /** The meter is untouched: same role, same aria, same single fill. */
  it("leaves the one-value meter exactly as it was", () => {
    const { container } = render(<Progress value={40} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    expect(container.querySelector(".ui-progress-bar")).toHaveStyle({ width: "40%" });
    expect(container.querySelector(".ui-progress")).not.toHaveAttribute("data-breakdown");
    expect(container.querySelector(".ui-progress-segment")).toBeNull();
  });

  /**
   * Read from the stylesheet, so deleting one of the three rules that make a partition a partition
   * cannot pass silently. The height/corner are the reason the ratios are comparable at all: three
   * abutting fills on the meter's 0.5rem pill read as a coloured hairline.
   */
  it("turns the track into the partition only under data-breakdown", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
    const scoped = css.match(/\.ui-progress\[data-breakdown\][^{]*\{[^}]*\}/g)?.join("\n") ?? "";

    expect(scoped).toMatch(/display:\s*flex/);
    expect(scoped).toMatch(/height:\s*var\(\s*--progress-breakdown-block-size\)/);
    expect(scoped).toMatch(/border-radius:\s*var\(\s*--progress-breakdown-radius/);

    // The un-marked track keeps the meter's pill, or every existing Progress changes shape.
    expect(css).toMatch(/\.ui-progress-track\s*\{[^}]*border-radius:\s*var\(\s*--radius-pill\)/);
  });
});

/**
 * gh#1047 — `total`: the slices are drawn against a WHOLE the caller names, and what they do not
 * claim stays the track (antd's `percent` model: the unfilled track IS the rest). Without it a
 * test run with 3 passed of 400 cases fills the whole bar green, because the whole was the sum.
 */
describe("Progress breakdown with total (gh#1047)", () => {
  const RESULTS = [
    { value: 3, tone: "success", label: "合格" },
    { value: 1, tone: "destructive", label: "失敗" },
  ] as const;

  it("draws each slice as its share of `total`, leaving the rest as track", () => {
    const { container } = renderIn("en", <Progress segments={[...RESULTS]} total={400} />);
    const slices = container.querySelectorAll(".ui-progress-segment");

    // 3/400 = 0.75%, 1/400 = 0.25% — not 75% / 25%.
    expect(slices).toHaveLength(2);
    expect(slices[0]).toHaveStyle({ inlineSize: "0.75%" });
    expect(slices[1]).toHaveStyle({ inlineSize: "0.25%" });
  });

  it("speaks the remainder, Intl-formatted, under the catalogue name", () => {
    renderIn(
      "en",
      <Progress
        segments={[
          { value: 1200, tone: "success", label: "Passed" },
          { value: 34, tone: "destructive", label: "Failed" },
        ]}
        total={5000}
      />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Passed 1,200, Failed 34, Remaining 3,766",
    );
  });

  it.each([
    ["ja", "合格 1,200、失敗 34、残り 3,766"],
    ["vi", "合格 1.200, 失敗 34, Còn lại 3.766"],
  ] as const)("localises the remainder name and number format in %s", (locale, expected) => {
    renderIn(
      locale,
      <Progress
        segments={[
          { value: 1200, tone: "success", label: "合格" },
          { value: 34, tone: "destructive", label: "失敗" },
        ]}
        total={5000}
      />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName(expected);
  });

  it("lets remainderLabel name the rest for the domain (未実施)", () => {
    renderIn(
      "en",
      <Progress segments={[...RESULTS]} total={400} remainderLabel="未実施" label="回帰テスト" />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName("回帰テスト, 合格 3, 失敗 1, 未実施 396");
  });

  it("lets the slices win when `total` is below their sum, so nothing overflows", () => {
    const { container } = renderIn("en", <Progress segments={[...RESULTS]} total={2} />);
    const slices = container.querySelectorAll(".ui-progress-segment");

    expect(slices[0]).toHaveStyle({ inlineSize: "75%" });
    expect(slices[1]).toHaveStyle({ inlineSize: "25%" });
    expect(screen.getByRole("img")).toHaveAccessibleName("合格 3, 失敗 1, Remaining 0");
  });

  it("changes nothing when `total` is absent — sum is the whole, no remainder spoken", () => {
    renderIn(
      "en",
      <Progress
        segments={[
          { value: 1200, tone: "success", label: "Passed" },
          { value: 34, tone: "destructive", label: "Failed" },
        ]}
      />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName("Passed 1200, Failed 34");
  });
});
