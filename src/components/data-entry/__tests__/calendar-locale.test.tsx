import { describe, expect, it } from "vitest";
import { AppProvider } from "@/app/app-provider";
import { render, screen } from "@testing-library/react";
import { Calendar } from "../calendar";

/**
 * The calendar used to be the ONE component that ignored `AppProvider`. It took `locale` only
 * through the spread, so with nothing passed react-day-picker's own en-US default won — a Japanese
 * page with English weekday headers inside an otherwise Japanese card, and no warning anywhere.
 */

const mount = (locale: "ja" | "en" | "vi", props: Record<string, unknown> = {}) =>
    render(
        <AppProvider defaultLocale={locale} persist={false}>
            <Calendar mode="single" month={new Date(2026, 0, 1)} {...props} />
        </AppProvider>,
    );

describe("Calendar follows the app locale", () => {
    /** The weekday row, read the way a screen reader does: each cell's own accessible name. */
    const weekdays = (container: HTMLElement) =>
        [...container.querySelectorAll("th")].map((cell) => cell.getAttribute("aria-label"));

    it("takes weekday names from the provider, with nothing passed", () => {
        const ja = mount("ja");
        expect(weekdays(ja.container)).toEqual([
            "日曜日",
            "月曜日",
            "火曜日",
            "水曜日",
            "木曜日",
            "金曜日",
            "土曜日",
        ]);
        ja.unmount();

        const en = mount("en");
        expect(weekdays(en.container)[0]).toBe("Sunday");
        en.unmount();

        // Vietnamese starts the week on MONDAY, so the locale moves more than the labels — the
        // grid's first column changes with it. That is the strongest evidence the provider is
        // actually reaching react-day-picker rather than the strings merely looking translated.
        const vi = mount("vi");
        expect(weekdays(vi.container)[0]).toBe("Thứ Hai");
        expect(weekdays(vi.container)).toHaveLength(7);
    });

    it("still lets a consumer pin its own locale — the provider is a default, not a lock", async () => {
        const { ja } = await import("react-day-picker/locale");
        const pinned = mount("en", { locale: ja });
        expect(weekdays(pinned.container)[0]).toBe("日曜日");
    });

    it("localizes the month-nav landmark, which was an English literal", () => {
        // Measured before the fix: `aria-label="Calendar navigation"` sat in a Japanese calendar
        // whose own previous/next buttons were already 前の月へ / 次の月へ.
        const { unmount } = mount("ja");
        expect(screen.getByLabelText("カレンダーのナビゲーション")).toBeInTheDocument();
        unmount();

        mount("vi");
        expect(screen.getByLabelText("Điều hướng Lịch")).toBeInTheDocument();
    });
});
