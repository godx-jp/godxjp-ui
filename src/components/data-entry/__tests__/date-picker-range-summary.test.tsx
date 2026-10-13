import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, userEvent, within } from "@/test/render";
import { AppProvider } from "../../../app/app-provider";
import { DatePicker } from "../date-picker";
import type { DatePickerProp } from "../../../props/components/data-entry.prop";
import enMessages from "../../../i18n/messages/en.json";
import jaMessages from "../../../i18n/messages/ja.json";

// gh#1244 — range mode tells the user what they have picked: a polite live summary under the
// calendar (the Intl `formatRange` of the two edges + an inclusive, plural-aware day count), and
// while only the start is held, the `to` edge asks for the end date.

const MARCH = new Date(2026, 2, 1);
const SUMMARY_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function renderRange(locale: "en" | "ja", props: Partial<DatePickerProp> = {}) {
  return render(
    <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
      <DatePicker range defaultPickerValue={MARCH} {...(props as object)} />
    </AppProvider>,
  );
}

const inputs = () => screen.getAllByRole("textbox"); // [from, to]
const summary = () => document.querySelector<HTMLElement>("[data-slot='date-picker-summary']");
/** The day button labelled `day` in the FIRST month grid (March 2026). */
const day = (n: number) => {
  const grid = screen.getAllByRole("grid")[0];
  return within(grid)
    .getAllByRole("button")
    .find((b) => b.textContent === String(n))!;
};

describe("DatePicker range — live summary (gh#1244)", () => {
  it("the live region is polite and present before any pick", async () => {
    const user = userEvent.setup();
    renderRange("en");
    await user.click(inputs()[0]);
    const region = summary();
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region!.textContent).toBe("");
  });

  it("one click: `to` asks for the end date and the summary holds only the start", async () => {
    const user = userEvent.setup();
    renderRange("en");
    await user.click(inputs()[0]);
    await user.click(day(1));
    expect(inputs()[1]).toHaveAttribute(
      "placeholder",
      enMessages.dataEntry.dateRangePicker.selectEnd,
    );
    const start = new Intl.DateTimeFormat("en", SUMMARY_FORMAT).format(new Date(2026, 2, 1));
    expect(summary()!.textContent).toBe(start);
  });

  it("two clicks: formatRange output and the INCLUSIVE day count (1 → 7 = 7 days)", async () => {
    const user = userEvent.setup();
    renderRange("en");
    await user.click(inputs()[0]);
    await user.click(day(1));
    await user.click(day(7));
    const range = new Intl.DateTimeFormat("en", SUMMARY_FORMAT).formatRange(
      new Date(2026, 2, 1),
      new Date(2026, 2, 7),
    );
    const text = summary()!.textContent!;
    expect(text).toContain(range);
    expect(text).toContain("7 days");
    // The prompt is gone once the range is complete.
    expect(inputs()[1]).not.toHaveAttribute(
      "placeholder",
      enMessages.dataEntry.dateRangePicker.selectEnd,
    );
  });

  it("a one-day range is singular: 1 day", async () => {
    const user = userEvent.setup();
    renderRange("en");
    await user.click(inputs()[0]);
    await user.click(day(5));
    await user.click(day(5));
    expect(summary()!.textContent).toContain("1 day");
    expect(summary()!.textContent).not.toContain("1 days");
  });

  it("resetOnSelect: a third click starts a new range and the summary returns to start-only", async () => {
    const user = userEvent.setup();
    renderRange("en");
    await user.click(inputs()[0]);
    await user.click(day(1));
    await user.click(day(7));
    await user.click(day(10));
    const start = new Intl.DateTimeFormat("en", SUMMARY_FORMAT).format(new Date(2026, 2, 10));
    expect(summary()!.textContent).toBe(start);
    expect(inputs()[1]).toHaveAttribute(
      "placeholder",
      enMessages.dataEntry.dateRangePicker.selectEnd,
    );
  });

  it("ja renders the count as 日間 and the range in Japanese", async () => {
    const user = userEvent.setup();
    renderRange("ja");
    await user.click(inputs()[0]);
    await user.click(day(1));
    expect(inputs()[1]).toHaveAttribute(
      "placeholder",
      jaMessages.dataEntry.dateRangePicker.selectEnd,
    );
    await user.click(day(7));
    const range = new Intl.DateTimeFormat("ja", SUMMARY_FORMAT).formatRange(
      new Date(2026, 2, 1),
      new Date(2026, 2, 7),
    );
    const text = summary()!.textContent!;
    expect(text).toContain(range);
    expect(text).toContain("7日間");
  });

  it("showSummary={false} renders no summary region", async () => {
    const user = userEvent.setup();
    renderRange("en", { showSummary: false } as Partial<DatePickerProp>);
    await user.click(inputs()[0]);
    await user.click(day(1));
    expect(summary()).toBeNull();
  });

  it("a single (non-range) DatePicker never renders the summary", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
        <DatePicker defaultPickerValue={MARCH} />
      </AppProvider>,
    );
    await user.click(screen.getByRole("combobox"));
    expect(summary()).toBeNull();
  });
});
