import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { Input } from "../input";
import { MonthPicker } from "../month-picker";
import { MonthRangePicker } from "../month-range-picker";
import { TimePicker } from "../time-picker";

/**
 * gh#308 — a picker must keep its trigger icon while it holds a value.
 *
 * `Input`'s `allowClear` REPLACES the configured `trailingIcon` with the ✕ (one trailing icon,
 * never two). Correct for a plain text field; wrong for a picker, where the calendar/clock icon
 * is the ONLY visual sign that the field opens a picker at all — a consumer measured a filled
 * DatePicker rendering just ["BUTTON:クリア", "svg:lucide-x"], so a user looking at a filled date
 * field could not tell it had a calendar (clicking the field still opened it — the affordance was
 * invisible, not gone). Pickers therefore render their own trailing cluster; `Input` is untouched.
 */

const clearBtn = () => screen.queryByRole("button", { name: "Xóa" });

describe("Pickers keep the trigger icon beside the clear ✕ (gh#308)", () => {
  it("DatePicker shows the calendar trigger AND the clear ✕ while filled", () => {
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} />);
    expect(screen.getByRole("button", { name: "Mở lịch" })).toBeInTheDocument();
    expect(clearBtn()).toBeInTheDocument();
  });

  it("DatePicker shows only the calendar trigger while empty", () => {
    renderWithUi(<DatePicker />);
    expect(screen.getByRole("button", { name: "Mở lịch" })).toBeInTheDocument();
    expect(clearBtn()).toBeNull();
  });

  it("MonthPicker shows the grid trigger AND the clear ✕ while filled", () => {
    renderWithUi(<MonthPicker defaultValue={new Date(2026, 5, 1)} />);
    expect(screen.getByRole("button", { name: "Mở chọn tháng" })).toBeInTheDocument();
    expect(clearBtn()).toBeInTheDocument();
  });

  it("DateRangePicker shows the calendar trigger AND the clear ✕ while filled", () => {
    renderWithUi(
      <DateRangePicker defaultValue={{ from: new Date(2026, 5, 15), to: new Date(2026, 5, 20) }} />,
    );
    expect(screen.getByRole("button", { name: "Mở lịch" })).toBeInTheDocument();
    expect(clearBtn()).toBeInTheDocument();
  });

  it("MonthRangePicker shows the grid trigger AND the clear ✕ while filled", () => {
    renderWithUi(
      <MonthRangePicker defaultValue={{ from: new Date(2026, 2, 1), to: new Date(2026, 5, 1) }} />,
    );
    expect(screen.getByRole("button", { name: "Mở chọn tháng" })).toBeInTheDocument();
    expect(clearBtn()).toBeInTheDocument();
  });

  it("TimePicker shows the clock trigger AND the clear ✕ while filled", () => {
    renderWithUi(<TimePicker defaultValue="09:30" />);
    expect(screen.getByRole("button", { name: "Mở chọn giờ" })).toBeInTheDocument();
    expect(clearBtn()).toBeInTheDocument();
  });

  it("allowClear={false} leaves the trigger alone and renders no ✕", () => {
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} allowClear={false} />);
    expect(screen.getByRole("button", { name: "Mở lịch" })).toBeInTheDocument();
    expect(clearBtn()).toBeNull();
  });

  // The one-icon rule is still right for a plain Input — this fix must not leak into it.
  it("plain Input still swaps its trailingIcon for the ✕ (rule unchanged)", () => {
    renderWithUi(
      <Input
        defaultValue="hello"
        allowClear
        aria-label="plain"
        trailingIcon={
          <button type="button" aria-label="Trailing affordance">
            <span aria-hidden="true">@</span>
          </button>
        }
      />,
    );
    expect(clearBtn()).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trailing affordance" })).toBeNull();
  });
});
