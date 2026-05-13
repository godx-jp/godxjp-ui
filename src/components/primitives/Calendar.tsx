import { DayPicker, type DayPickerProps } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "./cn"

/**
 * Calendar — react-day-picker grid themed with brand tokens via the
 * canonical `.calendar` class from tokens.css. Caller controls
 * mode/selected/onSelect through DayPicker's standard props.
 *
 * Locale + week-start are inherited from i18next / browser by default;
 * pass DayPickerProps explicitly to override (e.g. `weekStartsOn={1}`
 * for Monday-first).
 *
 * @example
 *   const [date, setDate] = useState<Date>()
 *   <Calendar mode="single" selected={date} onSelect={setDate} />
 */
export function Calendar({ className, showOutsideDays = true, ...rest }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("calendar", className)}
      {...rest}
    />
  )
}
