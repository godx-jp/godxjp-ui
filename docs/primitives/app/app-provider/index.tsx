import { AppProvider } from "@godxjp/ui/app";
import { Inline } from "@godxjp/ui/layout";
import {
  DateFormatPicker,
  LocalePicker,
  TimeFormatPicker,
  TimezonePicker,
} from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <AppProvider defaultLocale="vi" fallbackLocale="en" defaultTimezone="Asia/Ho_Chi_Minh">
      <Inline gap="sm">
        <LocalePicker />
        <TimezonePicker />
        <TimeFormatPicker />
        <DateFormatPicker />
      </Inline>
    </AppProvider>
  );
}
