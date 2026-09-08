import { it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";
import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { TimePicker } from "../time-picker";
import { TimeRangePicker } from "../time-range-picker";

it("seconds and confirmation have named controls", async () => {
  await expectNoA11yViolations(
    <TimePicker aria-label="Cutoff" defaultOpen showSeconds needConfirm defaultValue="09:30:15" />,
  );
});
it("quarter panel keeps selection and navigation accessible", async () => {
  await expectNoA11yViolations(
    <DatePicker
      aria-label="Quarter"
      defaultOpen
      picker="quarter"
      defaultValue={new Date(2026, 8, 9)}
    />,
  );
});
it("multiple selection retains the calendar semantics", async () => {
  await expectNoA11yViolations(
    <DatePicker
      aria-label="Workdays"
      defaultOpen
      multiple
      needConfirm
      defaultValue={[new Date(2026, 8, 9)]}
    />,
  );
});
it("range endpoints retain distinct accessible names", async () => {
  await expectNoA11yViolations(
    <TimeRangePicker aria-label="Shift" defaultValue={["09:00", "17:00"]} />,
  );
});
it("date range validation does not put invalid ARIA on a group", async () => {
  await expectNoA11yViolations(<DateRangePicker aria-label="Period" status="error" />);
});
